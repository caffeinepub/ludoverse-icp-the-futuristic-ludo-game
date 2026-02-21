import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";

module {
  type OldBotConfig = {
    principal : Principal;
    difficulty : { #easy; #medium; #hard };
    isPremium : Bool;
    balance : Float;
  };

  type OldGameMode = {
    #classic;
    #quick;
    #advanced;
    #team;
    #challenge;
    #demo;
    #superLudo;
    #bonus;
    #timed;
    #twoVsTwo;
    #practice;
    #experimental;
    #custom;
    #tournament;
    #copyFast;
    #copyClassic;
  };

  type OldGameStatus = { #waiting; #active; #completed };

  type OldPlayer = {
    principal : Principal;
    name : Text;
    color : Text;
    isPremium : Bool;
    icpBalance : Float;
    gamesPlayed : Float;
    wins : Float;
    losses : Float;
    draws : Float;
    currentGame : ?Principal;
    createdAt : Int;
    lastActive : Int;
  };

  type OldUserProfile = {
    name : Text;
    color : Text;
    isPremium : Bool;
    icpBalance : Float;
    gamesPlayed : Float;
    wins : Float;
    losses : Float;
    draws : Float;
    currentGame : ?Principal;
    createdAt : Int;
    lastActive : Int;
  };

  type OldWallet = {
    id : Principal;
    balance : Float;
    createdAt : Int;
    lastActive : Int;
  };

  type OldGameSession = {
    id : Principal;
    mode : OldGameMode;
    betAmount : Float;
    players : [Principal];
    status : OldGameStatus;
    winner : ?Principal;
    createdAt : Int;
    isDemo : Bool;
  };

  type OldActor = {
    players : Map.Map<Principal, OldPlayer>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    wallets : Map.Map<Principal, OldWallet>;
    games : Map.Map<Principal, OldGameSession>;
    bots : Map.Map<Principal, OldBotConfig>;
    ceoPrincipal : Principal;
  };

  type NewBotConfig = {
    principal : Principal;
    difficulty : { #easy; #medium; #hard };
    isPremium : Bool;
    balance : Float;
  };

  type NewGameMode = {
    #classic;
    #quick;
    #master;
    #advanced;
    #team;
    #challenge;
    #demo;
    #superLudo;
    #bonus;
    #timed;
    #twoVsTwo;
    #practice;
    #experimental;
    #custom;
    #tournament;
    #copyFast;
    #copyClassic;
  };

  type NewGameStatus = { #waiting; #active; #completed };
  type RankedStatus = { #ranked; #unranked };

  type NewPlayer = {
    principal : Principal;
    name : Text;
    color : Text;
    isPremium : Bool;
    icpBalance : Float;
    gamesPlayed : Float;
    wins : Float;
    losses : Float;
    draws : Float;
    currentGame : ?Principal;
    createdAt : Int;
    lastActive : Int;
  };

  type NewUserProfile = {
    name : Text;
    color : Text;
    isPremium : Bool;
    icpBalance : Float;
    gamesPlayed : Float;
    wins : Float;
    losses : Float;
    draws : Float;
    currentGame : ?Principal;
    createdAt : Int;
    lastActive : Int;
  };

  type NewWallet = {
    id : Principal;
    balance : Float;
    createdAt : Int;
    lastActive : Int;
  };

  type NewGameSession = {
    id : Principal;
    mode : NewGameMode;
    rankedStatus : RankedStatus;
    betAmount : Float;
    players : [Principal];
    status : NewGameStatus;
    winner : ?Principal;
    createdAt : Int;
    isDemo : Bool;
  };

  type NewActor = {
    players : Map.Map<Principal, NewPlayer>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    wallets : Map.Map<Principal, NewWallet>;
    games : Map.Map<Principal, NewGameSession>;
    bots : Map.Map<Principal, NewBotConfig>;
    ceoPrincipal : Principal;
  };

  public func run(old : OldActor) : NewActor {
    let newGames = old.games.map<Principal, OldGameSession, NewGameSession>(
      func(_gameId, oldGame) {
        let rankedStatus : RankedStatus = switch (oldGame.mode) {
          case (#classic) { #ranked };
          case (#quick) { #unranked };
          case (_) { #unranked };
        };
        {
          oldGame with
          rankedStatus;
          mode = switch (oldGame.mode) {
            case (#classic) { #classic };
            case (#quick) { #quick };
            case (#advanced) { #advanced };
            case (#team) { #team };
            case (#challenge) { #challenge };
            case (#demo) { #demo };
            case (#superLudo) { #superLudo };
            case (#bonus) { #bonus };
            case (#timed) { #timed };
            case (#twoVsTwo) { #twoVsTwo };
            case (#practice) { #practice };
            case (#experimental) { #experimental };
            case (#custom) { #custom };
            case (#tournament) { #tournament };
            case (#copyFast) { #copyFast };
            case (#copyClassic) { #copyClassic };
          };
        };
      }
    );
    {
      old with
      games = newGames;
    };
  };
};
