# MINE!!! — Illustrated Encyclopedia

A Next.js App Router / React / strict TypeScript / Tailwind encyclopedia, integrated with the MINE!!! arcade adventure. The catalog pins **Java 1.21.4**. It is not a latest-version guide.

## Run

With Node.js 22+ and npm:

```powershell
cd minecraft-encyclopedia
npm ci
npm run dev
```

Open http://127.0.0.1:3000. On this machine, a portable runtime is in `../.validation/minecraft-tools`; add that directory to PATH if Node/npm are not installed globally.

```powershell
npm run data
npm run lint
npm run typecheck
npm test
node scripts/validate.mjs
npm run build
npm run test:browser
npm run test:skill
```

`npm run build` emits the static Next.js site in `out/`, block and chapter routes, and **out/offline/index.html** that opens directly without a server. The offline export bundles React, data and styles into HTML; images and downloads are adjacent local files. LocalStorage support under file URLs depends on the browser; session-only fallback is explicit. No remote fonts or textures are needed. Source links require internet.

## Interface

Search names, namespaced IDs and descriptions; browse 19 chapters; filter by category, researched dimension/biome, tool, rarity, obtainability, version and edition. Unknown locations do not match a dimension filter. The empty Bedrock state is intentional. Open cards for properties, sources and selectable recipe variants. Compare up to four blocks, mark entries learned, and save the survival checklist. Themes, mobile navigation, print styling, reduced motion, keyboard dialogs and image failure fallbacks are supported.

## Coverage

**1,095 / 1,095 registry IDs; 4 sourced editorial examples; 1,091 entries awaiting editorial research; 0 verified Bedrock entries; 0 authentic textures.** Original CC0 schematic placeholders illustrate every entry; they do not depict authentic textures or every silhouette. Registry coverage includes air, fluids and technical states, not just collectible block items.

Identity, hardness, blast resistance, engine transparency/light, harvest tools and baseline drops are imported. Most generation locations, appearance, acquisition, conditional drops, rarity, uses, Fortune, edition differences, introduction versions and advanced mechanics remain visibly unverified. Crafting data covers shaped/shapeless recipes, plus sourced editorial smelting examples. This is not a complete furnace, stonecutting or smithing inventory. Categories are editorial heuristics. Related links mean the same chapter, not recipe interchangeability.

See `public/qa-report.md` for coverage and `VALIDATION.md` for executed checks. `public/encyclopedia.md` is the generated chapter source/sample. Records link sources and their supported scope. Upstream README declares MIT while noting extracted data may have additional source terms. No Mojang textures are copied.

## Update pipeline

Vendored files in `data/upstream/` pin commit `9b995542ab4a17837dee785439954e43d031b33e` of PrismarineJS/minecraft-data. Registry, items and recipes come from data/pc/1.21.4. `commit.json` and README preserve provenance.

For updates, choose a version and immutable commit; obtain matching registry/items/recipes; change version metadata in generator and validator together; reconcile IDs and recipes; research additions individually. Never relabel Java as Bedrock. Add evidence-backed notes in `data/researched.json`; unknown facts remain null. Run generation, validation, tests and build. The build refreshes the skill’s frozen template; editing blocks.json alone does not update embedded browser data. Review coverage before distributing.

The validator checks unique IDs, registry reconciliation, related links, local image provenance, exact shaped-grid totals, ingredients and output counts. The importer excludes the zero-count air recipe sentinel.

## Reusable Codex skill

Installed at `../.agents/skills/minecraft-encyclopedia/SKILL.md`, with references, generator, validator and self-contained offline template. Invoke `$minecraft-encyclopedia` in this repository. To reuse elsewhere, copy that directory into the destination `.agents/skills/`. To generate:

```powershell
node ../.agents/skills/minecraft-encyclopedia/scripts/generate.mjs ./my-field-guide --chapter stone
node ../.agents/skills/minecraft-encyclopedia/scripts/validate.mjs ./my-field-guide
```

The generator requires a new output directory. The template is Java 1.21.4 and reports its research gaps. Use --data path/to/blocks.json to regenerate browser data, Markdown and gap reports from an edited canonical dataset. Unofficial fan-made reference; not affiliated with Mojang or Microsoft.

## Play and research in MINE!!!

Run `npm run play` after a production build. Open http://127.0.0.1:8810/mine.html and select Guide (G). The game pauses while the searchable illustrated encyclopedia is open. The standalone reference is at http://127.0.0.1:8810/encyclopedia/index.html. Its offline HTML also opens directly; the bundled 3D game requires HTTP and WebGL.

See IMPLEMENTATION.md for requirement mapping. public/missing-block-data.json identifies unverified fields per block; public/missing-images.json identifies missing authentic images. All 1,095 entries retain at least one unknown field. The version-diff export compares the actual Java 1.21.3 and 1.21.4 registries (11 added IDs, zero removed). Authentic image importing is documented in data/MEDIA.md. The source contracts are preserved under their requested filenames at the repository root and in the skill references.
