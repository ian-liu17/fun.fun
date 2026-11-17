# MINE!!! and the arcade update

MINE!!! is an original first-person 3D voxel adventure: gather wood, craft a pickaxe, explore the crystal cave, craft a beacon and place it to win. Continue building after the quest. Grass, soil, stone, bark, end grain, leaves, crystals and planks have original procedural textures. Lighting includes soft sun shadows, fog, a cave lantern, reflective water and a beacon beam. Three.js r180 is bundled locally under its MIT license in `vendor/three/LICENSE`; no Minecraft textures or music are bundled.

Open `mine.html` through an HTTP server. WASD moves; mouse capture or dragging looks; Space jumps; Shift runs; E/left-click mines; Q/right-click places. Escape releases mouse capture and can pause. Use the side crafting bench with the cursor released. Arrow keys move/turn and Page Up/Down looks vertically. Touch has a directional pad, jump and mine/place buttons.

The suggested MINE!!! card and recently played box appear on `index.html` and `fun.fun.html`. History and progress use local browser storage and fall back to the current session if saving is unavailable. MINE!!! uses a separate 3D save key; old Blockhaven saves are not modified. Blockhaven's page, stylesheet, script and arcade cards are removed.

## Soundtracks

- MINE!!!: **Meadow Lanterns**, an original generative ambient composition with meadow and underground variants (`block-quest-music.js`).
- Pac-Man: **Corner Chase**, an original lively square-wave chase loop (`arcade-music.js`). Existing optional sound effects remain independently controllable.
- Snake Arena: **Neon Noodles**, an original electronic bass-and-arpeggio track (`arcade-music.js`).

Music starts only following user interaction, has a persisted mute control, and fades when the game pauses or its tab is hidden. No external audio service, audio files, or copyrighted game soundtrack is required.

## Validation

The Playwright integration suite at `tests/mine-browser.cjs` verifies WebGL geometry/textures/shadows, first-person movement and collision, crystal tool requirements, exact recipe costs, beacon crafting and placement, saved expeditions, music toggles and pause sync, mobile overflow and controls, suggestions/history, Blockhaven removal, and both existing games' soundtrack integration. Test contexts are isolated from the user's browser saves. The test uses locally installed Edge and the workspace's Playwright dependency.

```powershell
npm install --no-save playwright
node tests/mine-browser.cjs
```

The game needs WebGL and displays a clear compatibility message if a context cannot be created. Core assets are local; the pre-existing ranked leaderboards and online Snake features retain their existing network requirements.
