# Authentic block images

No authentic Minecraft textures are currently bundled. All default illustrations are original CC0 schematic placeholders.

To add images you are authorized to use, place local files under `data/media/` and add records to `image-manifest.json`:

```json
[{"id":"minecraft:stone","edition":"Java","version":"1.21.4","file":"stone.png","alt":"Stone block in Java 1.21.4, showing its gray mottled faces","license":"Your verified license or permission statement","source":"Your precise asset source","creator":"Asset creator","authorized":true}]
```

Run `npm run data`, then tests and `npm run build`. The importer checks registry IDs, version/edition, local file containment, supported extensions, duplicate assignments and attribution. It does not establish legal permission on your behalf. The manifest must describe the actual block image, not a generic cube. Copyrighted game assets are not automatically authorized by a download or by owning the game. Keep assets local unless their rights permit redistribution.
