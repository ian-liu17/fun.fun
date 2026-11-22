# MINE!!! — survival adventure on fun.fun

MINE!!! is an original browser voxel game hosted on GitHub Pages. It has an 80 × 80 field, rounded stepped hills, first-person mining/building, survival crafting, hunger, cooking, Creative flight, Overworld/Nether/End travel, and a dragon encounter. It is a simplified original game; it does not implement every Minecraft block, mob, recipe, biome or mechanic. The separate encyclopedia is a reference and does not define implemented gameplay.

## Start and controls

Open mine.html through HTTP. WASD moves; drag to look. Double-click the world to capture the mouse; Escape releases it for the sidebar. Space jumps, Shift runs, E / left-click mines or attacks, Q / right-click places, R greets animals or attacks monsters, F finds a nearby mob, N skips Overworld day/night, H eats and V fires the crystal bow. Slots 1–7 select building blocks. Touch has movement, jump, Mine, Place, Attack and Bow buttons. The sidebar has food, recipes, travel and the Survival/Creative selector.

Creative grants unlimited blocks, no hunger or damage, and flight (hold Space up, C down). Its block picker includes Overworld, Nether and End materials. Switching back to Survival restores resource requirements. Modes are local game settings, with no connection to ranked arcade scores.

## First tools and food

1. Mine logs. One log makes 4 planks.
2. Make a crafting table from 4 planks; make 4 sticks from 2 planks.
3. Select the table in slot 5 and place it using Q / Place. Stand within 4 blocks.
4. Craft a wooden pickaxe (3 planks + 2 sticks) and wooden sword (2 planks + 1 stick). The sword equips automatically and appears in your hand.
5. Mine stone with a pickaxe. Make a stone pickaxe (3 stone + 2 sticks) and furnace (8 stone) beside the table.
6. Left-click / Attack hunts animals, adding raw meat. R still greets them. Place a furnace in slot 6 and stand beside it; cook one raw meat with one plank as fuel.
7. H / Eat uses cooked meat first, then apples, then raw meat. Cooked meat restores 8 hunger units, apples 4 and raw meat 3, up to 20. Food is not consumed when full. High hunger regenerates hearts; empty hunger slowly reduces health to one heart. Pausing freezes survival simulation.

Apples use an original curved SVG icon and a rounded 3D model with two red lobes, a stem and a green leaf. Fruit hangs on trees and can be picked at close range. Mining leaves also supplies apples. Food is collected directly into the local inventory; there is no general Minecraft item-entity inventory simulation.

Recipe grids show arrangements and ingredient counts. Buttons state whether materials or a placed station are missing. This is a recipe-book interface; there is no drag-and-drop inventory grid. Basic wood/stone recipe quantities follow the familiar progression. Fuel use, food, equipment, health and damage are simplified MINE!!! mechanics.

## Living world

Up to 24 sheep, cows, pigs and chickens populate the field, including animals far from camp. Wandering uses elapsed time rather than a turn per rendering frame. Blocked animals pause and choose a new direction instead of continuously spinning.

Up to 10 Overworld night monsters include zombies, slimes, skeletons, Endermen, spiders and creepers. They spawn at dispersed positions, at least 9 blocks from the player. Dead monsters are replaced elsewhere after a six-second delay while the night continues. Skeletons fire visible arrows; melee creatures cause contact damage; Endermen hit harder and creepers explode after a close-range fuse. Damage changes the actual hearts and flashes the screen. Solid terrain blocks projectiles. A 1.5-second damage cooldown prevents immediate repeated hits. Daylight removes Overworld monsters.

The Overworld cycle remains 6 minutes: 3:00 day, 0:30 sunset, 2:00 night, 0:30 sunrise. The Nether and End have no daylight cycle. Friendly mob kills yield meat; Endermen yield pearls, blazes rods and spiders string. Species are represented by original procedural models, not authentic Minecraft textures or a verified match to unavailable reference pictures.

## Nether and End

- Craft obsidian at a placed table: 4 stone + 1 crystal → 4 obsidian. This is an explicitly labeled MINE!!! shortcut, not the Minecraft lava/water method.
- With 10 obsidian, Build Nether portal creates and lights a frame east of camp, at 22, 33. Walk through the purple opening, or use Enter while beside it. The Nether has netherrack, glowstone, soul sand, lava and piglins, blazes, magma cubes and ghasts. Lava and fireballs cause damage. The return portal is near the center.
- One blaze rod makes 2 blaze powder. One powder plus one Ender pearl makes an eye. Bring 12 eyes to the End gate northeast at 60, 20. Activate it and walk onto its surface. This fixed surface gate replaces Minecraft stronghold generation and searching.
- Craft a crystal bow at a table with 3 planks, 2 sticks and 1 crystal. V / Bow fires unlimited crystal shots. This is an original weapon, not Minecraft bow/ammunition mechanics.
- The End contains an island, Endermen, four obsidian towers, four healing crystals and an original dragon. Destroy the crystals with the bow; they heal and protect the dragon while alive. The dragon circles, periodically perches, fires damaging breath shots, and takes sword or bow damage. Defeating it opens a return portal and enables the Return button.
- The optional original beacon quest remains available. Extra crystal ore supports the beacon, portal and bow progression together.

## Saving and assets

Worlds, edits, inventory, game mode, hunger, mobs, portals, picked fruit and dragon progress save on this device. Each dimension keeps its own terrain, player return position and mobs. Older 48-block saves expand to the new field: untouched terrain is upgraded using a reconstruction of the old baseline, while changed cells and inventory are retained. A New expedition replaces this local expedition after its existing confirmation dialog.

All meshes, procedural textures, item artwork and music are original. Three.js r180 is bundled under vendor/three/LICENSE. No reference images were available among the supplied local attachments, which contain text files. An exact visual match requires the actual image attachments.

The in-game Guide / G and standalone encyclopedia remain available. The arcade suggests MINE!!! and remembers recent games; Blockhaven remains removed. Music: Meadow Lanterns (MINE!!!, meadow/night/cave themes), Corner Chase (Pac-Man), Neon Noodles (Snake). Music starts after interaction and pauses with play.

## Validation

Run from the repository root with Node and the existing Playwright dependency:

    node --test tests/mine-world.test.mjs tests/mine-survival.test.mjs
    node tests/mine-survival-browser.cjs
    node tests/mine-browser.cjs

The browser suites use local Edge, isolated temporary browser contexts and local HTTP servers. Arcade regression checks mock Firebase SDK network calls; real Firestore authorization is covered separately by the leaderboard emulator suite. No test changes production Firestore data or rules.

Coverage includes frame-rate-independent wandering, melee and ranged damage, animal drops, delayed replacements, station requirements and ingredient consumption, food/hunger, Creative flight and placement, dimension round trips/reloads, all four crystals, a completed dragon fight, legacy-save preservation, cave reachability, mobile overflow, the embedded encyclopedia and the other games' music.
