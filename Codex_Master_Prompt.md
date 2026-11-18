
You are a senior full-stack engineer, Minecraft technical researcher, UI/UX designer, and Codex skill architect.

MISSION:
Build a complete, reusable Minecraft Illustrated Encyclopedia skill and an interactive website that reproduces the detailed, illustrated Minecraft encyclopedia experience specified below.

Read Minecraft_Encyclopedia_PRD.md if present. Treat it as the product specification, and use this prompt as the implementation contract.

1. PRODUCT
Create a professional Minecraft encyclopedia containing every Minecraft block, with exact names, appearances, locations, obtaining methods, mining requirements, crafting recipes, uses, variants, special mechanics, edition differences, and version availability.

The product must support Minecraft Java and Bedrock, with version-aware information. Never invent missing data. Mark unknown or unverified facts clearly.

2. CODEX SKILL
Create .agents/skills/minecraft-encyclopedia/SKILL.md and all necessary references, scripts, assets, and tests. Follow the current Codex skill format. The skill must be reusable and activate for Minecraft encyclopedia, block research, crafting, biomes, tools, mobs, Nether, End, and survival progression requests.

3. WEBSITE
Build a complete responsive website using Next.js, React, TypeScript, Tailwind CSS, and accessible UI components. Use a clean modern Minecraft-inspired visual design. Include dark mode, mobile navigation, search, filters, chapter navigation, block cards, detailed block pages, crafting recipe grids, image galleries, comparison tables, interactive checklists, and progress tracking.

4. CONTENT STRUCTURE
Create detailed chapters for:
- Minecraft fundamentals and game modes
- Natural ground blocks
- Stone and deepslate families
- Ores and mineral storage blocks
- Wood types and complete wood families
- Sandstone, bricks, terracotta, concrete
- Glass, ice, and transparent blocks
- Plants, flowers, crops, and natural decorations
- Ocean and underwater blocks
- Amethyst geodes
- Nether terrain, building, portal, and functional blocks
- End blocks, End cities, and portal mechanics
- Crafting and workstation blocks
- Storage and container blocks
- Redstone and automation blocks
- Lighting and decorative blocks
- Transportation and utility blocks
- Dangerous, rare, and unobtainable blocks
- Version-specific and edition-specific blocks

5. BLOCK DATA MODEL
Every block record should contain:
id, name, namespace, category, subcategory, description, appearance, texture/image references, variants, natural generation locations, biomes, dimensions, structures, Y-levels when relevant, obtain methods, required tools, minimum mining tier, Silk Touch behavior, Fortune behavior, drops, crafting recipes, smelting recipes, stonecutting recipes, hardness, blast resistance, light level, transparency, gravity, flammability, waterlogging, redstone behavior, uses, special mechanics, Java/Bedrock differences, introduced version, removed version if applicable, verification sources, and confidence/status.

All fields must be typed and optional where the information is not applicable. Do not fabricate values.

6. IMAGES
Use appropriately licensed Minecraft textures or official permitted assets. Include attribution where required. Provide an image for each block when available, with meaningful alt text and graceful fallbacks. Never pretend an illustration is an exact texture if it is not.

7. INTERACTIVE FEATURES
Implement:
- Full-text block search
- Filtering by category, dimension, biome, mining tool, rarity, version, and edition
- Sorting and comparison
- Block detail pages
- Interactive 3x3 crafting recipe viewer
- Recipe ingredient and output quantities
- Mining and drop information
- Biome and dimension browsing
- Nether and End progression guides
- Interactive survival checklist
- Local progress persistence
- Related blocks and recipes
- Accessible keyboard navigation

8. CONTENT QUALITY
Provide detailed beginner-friendly explanations and advanced mechanics. Clearly distinguish block items, placed blocks, entities, and non-obtainable technical blocks. Distinguish generated structures from craftable blocks. Explain exceptions and edition differences.

9. DESIGN
Use a spacious, polished, responsive layout with clear headings, attractive cards, image grids, tables, expandable technical details, and restrained Minecraft-inspired colors. Avoid overcrowding. Support desktop, tablet, and mobile.

10. TECHNICAL IMPLEMENTATION
Use Next.js App Router, TypeScript strict mode, Tailwind CSS, reusable components, validated structured data, and deterministic tests. Prefer local structured datasets and a documented data update process. Avoid scraping copyrighted or prohibited assets. Implement SEO metadata and accessible semantic markup.

11. DELIVERABLES
Create:
- Complete application source code
- .agents/skills/minecraft-encyclopedia/SKILL.md
- Skill references and scripts
- Structured block database
- Asset attribution manifest
- Search and filter system
- Recipe renderer
- Chapter pages and block detail pages
- Automated tests
- README with installation and usage
- Data provenance and version update documentation
- Sample generated encyclopedia chapter

12. TESTING
Run linting, type checking, unit tests, integration tests, and a production build. Test crafting recipes, mining requirements, block filters, image fallbacks, edition/version logic, and accessibility. Fix all failures before declaring completion.

13. ACCEPTANCE CRITERIA
The website must launch successfully, display working block pages and images, provide functional search and filters, render crafting recipes correctly, and include usable progression checklists. The skill must be discoverable and reusable by Codex. Data completeness must be measurable, with missing entries explicitly reported.

14. EXECUTION
First inspect the repository and available tools. Create a clear implementation plan, then implement it. Do not stop at scaffolding, mockups, or a written proposal. Build and test the actual product. If the full block catalog cannot be verified in one pass, implement the complete data architecture and UI, populate verified entries, and provide an explicit coverage report and next steps. Do not claim complete coverage without verification.

FINAL RESPONSE:
Report what was built, where the skill is installed, how to run the website, tests executed and results, block catalog coverage, remaining gaps, and exact commands for continuing development.
  