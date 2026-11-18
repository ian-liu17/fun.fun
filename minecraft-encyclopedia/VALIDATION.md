# MINE!!! validation record

Executed November 17, 2026 with workspace-local Node.js 22.16.0 and Microsoft Edge headless through Playwright.

| Check | Result |
| --- | --- |
| `npm run build` | Passed: 1,118 static Next.js pages, standalone offline encyclopedia, bundled 3D adventure, skill assets and root arcade encyclopedia export. |
| `npm run lint` | Passed without warnings. Generated copies of game files, unmodified third-party engine files, build output and Next declarations are excluded. |
| `npm run typecheck` | Passed in strict TypeScript mode. |
| `npm test` | 20 unit/schema tests passed. Includes all record schemas, exact recipe quantities, registry coverage, reports, image import authorization/containment, harvest tiers, actual version changes and waterlogging state evidence. |
| `npm run test:browser` | 13 encyclopedia browser checks passed, including harvest-tier filtering, version additions and gap-report downloads. |
| `node ../tests/mine-browser.cjs` | 10 game integration checks passed, including the in-game encyclopedia, pause/resume, 3D graphics, movement, cave reachability, crafting/win, saves, mobile layout and all game music. |
| `npm run test:skill` | 7 exporter checks passed: supplied-data regeneration, chapter focus, matching HTML/JSON, overwrite refusal, incomplete registry rejection, unsafe asset rejection, safe edited-record rendering and stale-output detection. |
| `node scripts/validate.mjs` | 1,095 / 1,095 registry IDs, no missing/extra IDs, invalid recipes, broken relationships or missing local image files. |
| Skill standalone validator | Validated embedded website data against JSON, schema, registry, recipe counts and packaged assets. |
| Accessibility | Zero automated axe WCAG A/AA violations in light and dark catalog views. Keyboard dialog focus stays inside and returns to the opener. |
| Responsive/offline | No page overflow at 375, 768 and 1440 pixels. Offline HTML searches and renders recipes/images through a file URL. The 3D game requires HTTP and WebGL. |

The skill's frontmatter and supporting resources are tested. The Python skill-creator checker could not run because Python is unavailable; the repository's dependency-free schema/export validators were executed instead. Test screenshots and browser/axe results are in ignored `test-results/` and `.validation/` directories.

Software validation is not content certification. All 1,095 selected registry identities are present, but every entry retains at least one unverified field; four have historical official-source editorial examples. Bedrock has no loaded verified registry. All default block illustrations are labeled original schematic placeholders, not authentic textures. Exact field and image gaps appear in `public/missing-block-data.json` and `public/missing-images.json`.
