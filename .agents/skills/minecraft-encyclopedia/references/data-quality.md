# Data quality and update contract

The template pins Java 1.21.4 to PrismarineJS minecraft-data commit `9b995542ab4a17837dee785439954e43d031b33e`. Its README declares MIT and notes some extracted sources may have additional terms. Preserve source attribution. Access date: 2026-11-15.

Registry fields establish IDs, names, engine physical properties, allowed harvest tools and baseline drops. They do not establish natural generation, conditional drop quantities, Silk Touch, Fortune, full appearance, renewable status or edition parity. Light emission and transparency may need block-state context. Do not infer mechanics from another family member.

Only four entries have editorial examples, supported by historical official Block of the Week articles. Those articles are not blanket version audits. The air/count-zero upstream recipe is a sentinel and must be excluded. Shaped crafting diagrams preserve row/column order and holes; counts must equal populated grid cells. Shapeless recipes use ingredient lists. A missing recipe is not evidence of unobtainability.

For a version update:

1. Download blocks, items and recipes at one immutable upstream commit. Confirm files correspond to the same game version.
2. Reconcile missing, extra and duplicate namespaced IDs. Include air/fluids/technical states while explaining that registry coverage differs from inventory items.
3. Keep edition data separate. Bedrock without a loaded registry must return no verified matches.
4. Research special mechanics individually using official or reputable version-specific references. Store source URL, access date and supported scope. Unverified values stay null and display as “Not verified for this version.”
5. Validate recipes against item IDs, counts and workstation; audit placeholders or sentinels. Do not infer furnace/stonecutting/smithing recipes from crafting data.
6. Rebuild data, tests, HTML and Markdown. Check mobile layout, keyboard dialog behavior, progress persistence, offline images and downloads. Update the bundled template only after outputs agree.

Canonical record structure: [block-schema.json](block-schema.json). The source application also uses strict TypeScript and runtime reconciliation. Reports distinguish registry identity, full editorial research, authentic images and edition parity.
