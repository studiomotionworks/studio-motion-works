# Unused script and source file report

Reviewed: 26 October 2026.

## Findings

**27 source files appear unused by the current application and its configured tooling. All 5 files in `scripts/` have a configured or documented use.** No source files were deleted or modified for this review.

This report describes the current working tree, including existing uncommitted changes. “Unused” means no reachable reference was found in the repository; it does not establish whether a file will be needed for future work or invoked outside this repository.

## Files in `scripts/`: keep

| File | Evidence of use |
| --- | --- |
| [`patch-payload-ui.mjs`](../scripts/patch-payload-ui.mjs) | `package.json` runs it through `postinstall`. |
| [`test-media-image-processing.mjs`](../scripts/test-media-image-processing.mjs) | `package.json` exposes it as `test:media`. |
| [`test-media-folders.mjs`](../scripts/test-media-folders.mjs) | `package.json` exposes it as `test:media-folders`. |
| [`test-media-move.mjs`](../scripts/test-media-move.mjs) | `package.json` exposes it as `test:media-move`. |
| [`test-content-revalidation.mjs`](../scripts/test-content-revalidation.mjs) | `docs/media-uploads.md`, under “Public page refresh”, explicitly documents running `node scripts/test-content-revalidation.mjs`. It has no package script but is still a documented manual test. |

## Apparently unused source files

### Unreferenced project component tree: 13 files

The active gallery client, `app/(frontend)/gallery-motions/ProjectsPageClient.tsx`, imports from `components/design/projects/`. No active entry point imports the separate `components/projects/` tree below. Some of these files import one another, but that does not make the tree reachable from the application.

| File | Reference evidence |
| --- | --- |
| [`components/projects/ProjectsHero.tsx`](../components/projects/ProjectsHero.tsx) | No incoming source import. |
| [`components/projects/HorizontalGallery.tsx`](../components/projects/HorizontalGallery.tsx) | No incoming source import; imports the unused `ProjectCard`. |
| [`components/projects/ProjectCard.tsx`](../components/projects/ProjectCard.tsx) | Imported only by the unused `HorizontalGallery`. |
| [`components/projects/ProjectList.tsx`](../components/projects/ProjectList.tsx) | No incoming source import. |
| [`components/projects/ProjectModal.tsx`](../components/projects/ProjectModal.tsx) | No incoming source import; imports the two unused models below. |
| [`components/projects/SharedCanvas.tsx`](../components/projects/SharedCanvas.tsx) | No incoming source import. |
| [`components/projects/EmptyState.tsx`](../components/projects/EmptyState.tsx) | No incoming source import. |
| [`components/projects/previews/HelixPreview.tsx`](../components/projects/previews/HelixPreview.tsx) | Imported only by the unused `ProjectCard`. |
| [`components/projects/previews/OrbitPreview.tsx`](../components/projects/previews/OrbitPreview.tsx) | Imported only by the unused `ProjectCard`. |
| [`components/projects/previews/TidePreview.tsx`](../components/projects/previews/TidePreview.tsx) | Imported only by the unused `ProjectCard`. |
| [`components/projects/previews/PulsePreview.tsx`](../components/projects/previews/PulsePreview.tsx) | Imported only by the unused `ProjectCard`. |
| [`components/projects/models/HelixModel.tsx`](../components/projects/models/HelixModel.tsx) | Imported only by the unused `ProjectModal`. |
| [`components/projects/models/PulseModel.tsx`](../components/projects/models/PulseModel.tsx) | Imported only by the unused `ProjectModal`. |

### Unreferenced canvas components: 5 files

| File | Reference evidence |
| --- | --- |
| [`components/canvas/KineticHero.tsx`](../components/canvas/KineticHero.tsx) | No incoming source import. |
| [`components/canvas/KineticHeroWithModal.tsx`](../components/canvas/KineticHeroWithModal.tsx) | No incoming source import; imports `KineticModel` and `KineticLoader`. |
| [`components/canvas/KineticModel.tsx`](../components/canvas/KineticModel.tsx) | Imported only by the unused `KineticHeroWithModal`. |
| [`components/canvas/KineticLoader.tsx`](../components/canvas/KineticLoader.tsx) | Imported only by the unused `KineticHeroWithModal`. |
| [`components/canvas/ProgressiveKineticModel.tsx`](../components/canvas/ProgressiveKineticModel.tsx) | No incoming source import. |

The home page currently renders `components/design/HeroSection.tsx`.

### Unreferenced files within the active design area: 7 files

| File | Reference evidence |
| --- | --- |
| [`components/design/IntroSection.tsx`](../components/design/IntroSection.tsx) | No incoming source import. Its JSX in the home page is commented out. |
| [`components/design/projects/SharedCanvas.tsx`](../components/design/projects/SharedCanvas.tsx) | No incoming source import. |
| [`components/design/projects/EmptyState.tsx`](../components/design/projects/EmptyState.tsx) | No incoming source import. The gallery client renders an inline empty state. |
| [`components/design/projects/previews/HelixPreview.tsx`](../components/design/projects/previews/HelixPreview.tsx) | No incoming source import. |
| [`components/design/projects/previews/OrbitPreview.tsx`](../components/design/projects/previews/OrbitPreview.tsx) | No incoming source import. |
| [`components/design/projects/previews/TidePreview.tsx`](../components/design/projects/previews/TidePreview.tsx) | No incoming source import. |
| [`components/design/projects/previews/PulsePreview.tsx`](../components/design/projects/previews/PulsePreview.tsx) | No incoming source import. |

The active design `ProjectCard` uses image/video previews. Keep the other files in `components/design/projects/`, including its models: the active `ProjectModal` imports those models.

### Other unreferenced files: 2 files

| File | Reference evidence |
| --- | --- |
| [`components/icons/LinkedIn.tsx`](../components/icons/LinkedIn.tsx) | No incoming source import. LinkedIn text in contact/share data does not reference this icon component. |
| [`lib/sections.ts`](../lib/sections.ts) | No incoming source import; its `navItems` and `projects` exports have no detected file consumers. |

## Method and limits

- Scanned 134 JavaScript/TypeScript source and configuration files using the installed TypeScript parser. Excluded declaration files, dependencies, Git internals, and Next.js build output.
- Followed static imports, re-exports, type references, literal dynamic imports, and literal `require`/`tsImport` calls. Resolved relative paths and the aliases configured in `tsconfig.json`.
- Treated Next.js route/layout/error conventions, tool configuration files, Payload configuration, `migrations/index.ts`, `lib/seed.ts`, and the five operational/test scripts as entry points. Consulted the installed Next.js project-structure and page-file guides before interpreting framework entry points.
- Cross-checked suspect names and paths with repository text searches, and inspected the active home page, gallery client, and design project card. Comments and social labels were not counted as executable references.
- Preserved migration files, generated Payload types/import maps, configuration, seed data, and admin components reachable through the Payload import map. Files without direct page imports can still serve these purposes.
- The only unresolved relative import in the source graph was `../globals.css`, which is a stylesheet outside this script audit.
- This was a static file-usage review. It did not run application tests, a production build, database operations, uploads, or scripts with side effects. Computed runtime paths and external/manual invocation cannot be conclusively ruled out. Public images, SVG assets, unused exports within otherwise used files, and unused packages were outside scope.

## Recommended follow-up

Review the 27 candidates against planned features before removing them. If cleanup is desired, remove unused component groups together, then run lint, TypeScript checking, and a production build; smoke-test the home, gallery/modal, about, blog, events, contact, and Payload admin flows. Keep all five operational scripts.
