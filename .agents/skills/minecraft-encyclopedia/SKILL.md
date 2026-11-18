---
name: minecraft-encyclopedia
description: Generate the MINE!!! illustrated Minecraft encyclopedia with searchable HTML, recipes, structured data, progression checklists and coverage reports. Use for Minecraft encyclopedia requests, blocks, crafting, biomes, tools, mobs, Nether/End guides and survival learning materials; obtain separate sources when a request exceeds the bundled block dataset.
---

Produce an exportable reference, preserving the distinction between registry coverage and researched mechanics. Read [references/data-quality.md](references/data-quality.md) when adding or updating facts. The product contract is preserved in [references/PRD.md](references/PRD.md) and [references/master-prompt.md](references/master-prompt.md).

MINE!!! is the product name. Its encyclopedia is available inside the 3D adventure and as a standalone website. Gameplay uses custom rules; encyclopedia entries document Minecraft Java data.

The bundled template is an offline React interface with Java 1.21.4 registry data, four sourced editorial examples, labeled schematic images, and visibly unverified fields. It is a baseline, not a current-version or Bedrock-complete encyclopedia.

To generate a reference using this pinned baseline, run:

```powershell
node <skill-directory>/scripts/generate.mjs <new-output-directory> [--data blocks.json] [--chapter stone]
node <skill-directory>/scripts/validate.mjs <new-output-directory>
```

Open output `index.html` directly. Deliver `encyclopedia.md`, `blocks.json`, `qa-report.md/json`, `missing-block-data.json`, `missing-images.json`, chapter Markdown, `asset-attribution.json`, and `assets/` alongside it. The generator refuses to overwrite an existing directory.

For updates, select an exact edition/version first. Reconcile a new registry by namespaced IDs; never infer Bedrock parity or call historical data latest. Regenerate HTML together with JSON so the embedded interface and downloads agree. In the source application use `scripts/build-data.mjs` and `npm run build`, documented in its README. The generator embeds the supplied validated records into the HTML, regenerates Markdown by chapter, and recalculates gap reports. Inputs must reconcile to the pinned registry. Use the application importer/build for new image assets; the skill exporter accepts only packaged local images.

For individual research requests, consult the linked primary source per entry; do not expand an imported baseline property into an unsupported mechanic. Explain acquisition, visual identity, collection conditions, recipe quantities, uses and hazards, labeling unknowns. For biome, mob or tool research beyond this block dataset, obtain separate authoritative data rather than implying coverage.

Default images are original CC0 schematic placeholders; an authorized local image importer is documented in the source project data/MEDIA.md. Retain that label unless replacing an image with a rights-cleared asset that depicts its block. Report registry identities, editorial coverage, image authenticity, edition coverage and remaining gaps separately.
