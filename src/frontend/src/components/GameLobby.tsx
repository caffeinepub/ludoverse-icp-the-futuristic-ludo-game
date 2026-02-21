import React, { useState } from 'react';
import { useGetCallerUserProfile, useGetPlayerWallet, useCreateGame, useGetAvailableGames, useGetAvailableBots } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { ArrowLeft, Plus, Users, Loader2, Gamepad2, Sparkles, Zap, Trophy, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';
import { GameMode, RankedStatus } from '../backend';

interface GameLobbyProps {
  onStartGame: (gameId: string, gameMode: GameMode) => void;
  onBack: () => void;
}

const GAME_MODES = [
  { 
    value: 'classic' as GameMode, 
    label: 'Classic Mode', 
    description: 'Traditional Ludo rules',
    details: '2-4 players • No power-ups • Ranked & unranked',
    icon: Gamepad2,
    supportsRanked: true,
  },
  { 
    value: 'quick' as GameMode, 
    label: 'Quick Mode', 
    description: 'Shortened paths, faster dice',
    details: 'Time-limited turns • Mobile-optimized • Ranked & unranked',
    icon: Zap,
    supportsRanked: true,
  },
  { 
    value: 'master' as GameMode, 
    label: 'Master Mode', 
    description: 'Skill-heavy rules',
    details: 'Dice choice options • Advanced strategy',
    icon: Target,
    supportsRanked: false,
  },
];

export default function GameLobby({ onStartGame, onBack }: GameLobbyProps) {
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: wallet } = useGetPlayerWallet();
  const createGame = useCreateGame();
  const { data: availableGames, isLoading: gamesLoading } = useGetAvailableGames();
  const { data: availableBots, isLoading: botsLoading } = useGetAvailableBots();

  const [gameType, setGameType] = useState<'live' | 'demo'>('demo');
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic' as GameMode);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isRanked, setIsRanked] = useState<boolean>(true);
  const [virtualBalance] = useState(10000);

  const selectedModeInfo = GAME_MODES.find(m => m.value === selectedMode);

  const handleCreateGame = async () => {
    const amount = parseFloat(betAmount);
    const isDemo = gameType === 'demo';
    
    if (isNaN(amount) || amount < 1) {
      toast.error('Invalid Bet Amount', {
        description: 'Minimum bet is 1 ICP',
      });
      return;
    }
    
    if (amount > 1000000) {
      toast.error('Invalid Bet Amount', {
        description: 'Maximum bet is 1,000,000 ICP',
      });
      return;
    }

    if (!isDemo) {
      if (wallet && amount > wallet.balance) {
        toast.error('Insufficient Balance', {
          description: `You need ${amount.toFixed(2)} ICP but only have ${wallet.balance.toFixed(2)} ICP`,
        });
        return;
      }
    } else {
      if (amount > virtualBalance) {
        toast.error('Insufficient Virtual Balance', {
          description: `You need ${amount.toFixed(2)} virtual ICP but only have ${virtualBalance.toFixed(2)} virtual ICP`,
        });
        return;
      }
    }

    try {
      const modeLabel = isDemo ? 'Demo' : 'Live';
      const rankedLabel = isRanked && !isDemo && selectedModeInfo?.supportsRanked ? 'Ranked' : 'Unranked';
      
      toast.info(`Creating ${modeLabel} Game...`, {
        description: `Setting up ${selectedModeInfo?.label || selectedMode} (${rankedLabel})`,
        duration: 2000,
      });

      const rankedStatus: RankedStatus = (isRanked && !isDemo && selectedModeInfo?.supportsRanked) 
        ? 'ranked' as RankedStatus 
        : 'unranked' as RankedStatus;

      const gameId = await createGame.mutateAsync({
        gameMode: selectedMode,
        rankedStatus: rankedStatus,
        betAmount: amount,
        isDemo: isDemo,
      });

      toast.success(`${modeLabel} Game Created Successfully!`, {
        description: `Starting ${selectedModeInfo?.label || selectedMode} (${rankedLabel})`,
        duration: 3000,
      });

      setTimeout(() => {
        onStartGame(gameId.toString(), selectedMode);
      }, 500);
    } catch (error: any) {
      console.error('Create game error:', error);
      const errorMessage = error.message || 'An error occurred while creating the game.';
      toast.error('Failed to Create Game', {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const handlePlayNow = () => {
    const defaultBet = 10;
    const isDemo = gameType === 'demo';
    
    if (!isDemo && wallet && defaultBet > wallet.balance) {
      toast.error('Insufficient Balance', {
        description: `You need ${defaultBet} ICP to play. Please deposit funds first.`,
      });
      return;
    }

    const modeLabel = isDemo ? 'Demo' : 'Live';
    toast.info(`Starting Quick ${modeLabel} Match...`, {
      description: 'Finding players for you',
      duration: 2000,
    });

    const rankedStatus: RankedStatus = (isRanked && !isDemo) 
      ? 'ranked' as RankedStatus 
      : 'unranked' as RankedStatus;

    createGame.mutateAsync({
      gameMode: 'classic' as GameMode,
      rankedStatus: rankedStatus,
      betAmount: defaultBet,
      isDemo: isDemo,
    }).then((gameId) => {
      toast.success('Match Found!', {
        description: 'Entering game now...',
        duration: 2000,
      });
      setTimeout(() => {
        onStartGame(gameId.toString(), 'classic' as GameMode);
      }, 500);
    }).catch((error: any) => {
      console.error('Quick play error:', error);
      toast.error('Failed to Start Game', {
        description: error.message || 'Please try again.',
        duration: 5000,
      });
    });
  };

  const filteredGames = availableGames?.filter(game => 
    gameType === 'demo' ? game.isDemo : !game.isDemo
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Game Lobby
        </h2>
      </div>

      <Tabs value={gameType} onValueChange={(v) => setGameType(v as 'live' | 'demo')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="demo" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Demo Practice
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2">
            <Gamepad2 className="w-4 h-4" />
            Live Betting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-400" />
                Demo Practice Mode
              </CardTitle>
              <CardDescription>
                Practice with virtual currency. Perfect for learning the game without risking real ICP!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-4">
                <p className="text-sm font-medium text-blue-300">Virtual Balance</p>
                <p className="text-2xl font-bold text-blue-400">{virtualBalance.toFixed(2)} Virtual ICP</p>
                <p className="text-xs text-muted-foreground mt-1">For practice only - cannot be withdrawn</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-6">
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-yellow-400" />
                Live Betting Mode
              </CardTitle>
              <CardDescription>
                Play with real ICP. Winner takes the pot minus 5% platform fee!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-4">
                <p className="text-sm font-medium text-yellow-300">Your Balance</p>
                <p className="text-2xl font-bold text-yellow-400">{(wallet?.balance ?? 0).toFixed(2)} ICP</p>
                <p className="text-xs text-muted-foreground mt-1">Real ICP for betting</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Game Mode Selection Cards */}
      <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
        <CardHeader>
          <CardTitle>Select Game Mode</CardTitle>
          <CardDescription>Choose your preferred style of play</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {GAME_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.value;
              return (
                <div
                  key={mode.value}
                  className={`p-6 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-500 shadow-glow-purple'
                      : 'bg-black/20 border-gray-700/30 hover:border-purple-500/50'
                  }`}
                  onClick={() => setSelectedMode(mode.value)}
                >
                  <Icon className={`w-10 h-10 mb-3 ${isSelected ? 'text-purple-300' : 'text-purple-400'}`} />
                  <h3 className="font-bold text-lg mb-2">{mode.label}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{mode.description}</p>
                  <p className="text-xs text-muted-foreground">{mode.details}</p>
                  {isSelected && (
                    <Badge className="mt-3 bg-purple-500/50">Selected</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-black/40 backdrop-blur-xl border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-purple-400" />
              Quick Play
            </CardTitle>
            <CardDescription>
              Jump into a {gameType === 'live' ? 'live betting' : 'practice'} game instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handlePlayNow}
              disabled={createGame.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-glow-purple"
              size="lg"
            >
              {createGame.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Play Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-xl border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-6 h-6 text-cyan-400" />
              Create Custom Game
            </CardTitle>
            <CardDescription>
              Set your own rules and bet amount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bet-amount">Bet Amount ({gameType === 'demo' ? 'Virtual ' : ''}ICP)</Label>
              <Input
                id="bet-amount"
                type="number"
                min="1"
                max="1000000"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-black/40 border-cyan-500/30"
                placeholder="Enter bet amount"
              />
            </div>

            {selectedModeInfo?.supportsRanked && gameType === 'live' && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex-1">
                  <Label htmlFor="ranked-toggle" className="text-sm font-medium cursor-pointer">
                    Ranked Match
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRanked ? 'Affects stats & leaderboard' : 'Practice mode - no stats'}
                  </p>
                </div>
                <Switch
                  id="ranked-toggle"
                  checked={isRanked}
                  onCheckedChange={setIsRanked}
                />
              </div>
            )}

            {!selectedModeInfo?.supportsRanked && (
              <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/30">
                <p className="text-xs text-muted-foreground">
                  Master Mode does not support ranked play
                </p>
              </div>
            )}

            <Button
              onClick={handleCreateGame}
              disabled={createGame.isPending}
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 shadow-glow-cyan"
              size="lg"
            >
              {createGame.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Game
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Available Games */}
      <Card className="bg-black/40 backdrop-blur-xl border-pink-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-400" />
            Available Games
          </CardTitle>
          <CardDescription>
            Join an existing {gameType === 'live' ? 'live betting' : 'practice'} game
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gamesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No available games at the moment</p>
              <p className="text-sm">Create a new game to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGames.map((game) => {
                const gameModeInfo = GAME_MODES.find(m => m.value === game.mode);
                return (
                  <div
                    key={game.id.toString()}
                    className="p-4 rounded-lg bg-black/20 border border-pink-500/30 hover:border-pink-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {gameModeInfo?.label || game.mode.charAt(0).toUpperCase() + game.mode.slice(1)}
                          </p>
                          {game.rankedStatus === 'ranked' && !game.isDemo && (
                            <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">
                              Ranked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Bet: {game.betAmount.toFixed(2)} {game.isDemo ? 'Virtual ' : ''}ICP
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Players: {game.players.length}/4
                        </p>
                      </div>
                      <Button
                        onClick={() => onStartGame(game.id.toString(), game.mode)}
                        variant="outline"
                        className="border-pink-500/50 hover:bg-pink-500/20"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
