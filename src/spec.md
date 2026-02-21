# Specification

## Summary
**Goal:** Implement three modular game modes (Classic, Quick, and Master) with distinct rules, board layouts, and ranked/unranked variants.

**Planned changes:**
- Extend backend GameMode enum to include Classic, Quick, and Master variants
- Implement Classic Mode with traditional Ludo rules, 2-4 players, no power-ups, and ranked/unranked tracking
- Implement Quick Mode with shortened board paths (30-40% shorter), faster dice mechanics, 30-45 second turn timers, and ranked/unranked variants
- Implement Master Mode with skill-based dice choice system (2-3 options per turn) and advanced move validation
- Add mode selector UI in GameLobby.tsx displaying three mode options with descriptions and characteristics
- Update GameBoard.tsx to render mode-specific board layouts: standard board for Classic, shortened board with turn timer for Quick, and dice choice UI for Master
- Add ranked/unranked toggle in GameLobby.tsx for Classic and Quick modes
- Optimize Quick Mode UI for mobile devices with responsive touch controls and prominent turn timer

**User-visible outcome:** Users can select between Classic Mode (traditional rules), Quick Mode (faster gameplay optimized for mobile), or Master Mode (skill-based dice choices) when creating games. Classic and Quick modes support both ranked games (affecting leaderboards) and unranked practice games. The game board adapts its layout and controls based on the selected mode.
