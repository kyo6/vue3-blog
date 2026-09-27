# AGENTS.md

## Project overview

This repository is a Vue 3 + Vite personal blog and frontend showcase. The site contains:

- Blog listing and Markdown articles under `src/blogs/`.
- Documentation/examples under `src/views/docs/` and `src/components/100days/`.
- Works and interactive demos under `src/views/works/` and `public/works/`.
- Shared layout, theme, navigation, and Markdown rendering components under `src/components/`, `src/layout/`, and `src/composables/`.

## Agent skills

### Issue tracker

Issues are tracked in the GitHub repository `kyo6/vue3-blog`; use GitHub Issues and the `gh` CLI when issue-tracker operations are requested. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository: use a root `CONTEXT.md` when one is added and architectural decisions in `docs/adr/`. See `docs/agents/domain.md`.

## Working agreements

- Use pnpm. Keep changes compatible with the package manager version declared in `package.json`.
- Use Vue 3 Composition API and `<script setup>` for new or substantially edited components.
- Keep route definitions in `src/router/index.js`; add pages in the matching `src/views/` area.
- Keep site navigation and content metadata in `src/config/`. Do not hard-code blog lists in view components.
- Blog source files are Markdown in `src/blogs/`. Preserve their front matter (`tag`, `date`, `column`, and optional `detail`) when editing articles.
- Keep tag spellings and topic relationships consistent with `docs/agents/tag-taxonomy.md`.
- If blog metadata or article files change, run `pnpm gen:content` and review the generated `src/config/content.json` diff. **The `id` of every existing article must not change** — see "Article IDs" below.
- To unpublish an article without deleting it, move the file into `src/blogs/_archive/`. That directory is outside both the generation scan and the runtime glob, so it is excluded from the list and from the bundle. Never reuse its `id`.
- Prefer Tailwind utilities for local styling and the existing SCSS files for global/theme styles. Preserve the class-based dark-mode behavior.
- Use the `@` alias for imports from `src/`.
- Reuse existing shared components such as `MarkdownViewer`, `ArticleToc`, theme controls, and layout components before creating duplicates.
- Treat files under `public/works/` as standalone browser demos: keep them self-contained and verify their asset paths when modifying them.
- Do not overwrite unrelated working-tree changes. In particular, inspect `git status` before editing and keep user-created blog/demo files intact.

## Blog content pipeline

`src/blogs/` is the source directory for blog articles; it is not itself generated. Add or edit one Markdown file per article in that directory. The filename becomes the article title and is also stored as `filename` in the generated index.

Each article may begin with YAML-like front matter between two `---` lines:

```markdown
---
tag: ['Vue3', '前端']
date: 2026-08-26
column: 技术研究
detail: '可选的列表摘要'
---

# 文章正文
```

`tag` and `column` are two independent axes and neither replaces the other:

- `tag` — subject axis, multi-valued, free-form.
- `column` — genre axis, single-valued, must be one of the six names defined in `src/config/columns.js`. Values are validated at generation time; an unknown value produces a warning and drops the article out of every column tab.

Run `pnpm gen:content` to execute `src/cli/genDocContent.js`. The script scans `src/blogs/*.md`, parses `tag`, `date`, `column`, and optional `detail`, generates a summary from the first meaningful Markdown line when `detail` is absent, sorts entries by date descending (articles without a date go last), resolves IDs from the frozen map described below, and writes `src/config/content.json`.

### Article IDs

IDs are **stable identities, not positions**. `src/config/id-map.json` holds the permanent `filename → id` mapping and must be committed:

- An article that already has an ID keeps it forever, no matter how the sort order changes.
- A new article gets `max(existing id) + 1`.
- A removed article keeps its entry, and **its ID is never recycled** — recycling would silently point old links at an unrelated article, which is worse than a 404.

Because IDs no longer track the sort order, `content.json` may contain gaps. This is expected: `Article.vue` computes prev/next from the array index rather than by adding or subtracting 1 from the ID.

Two things must never be done: renumbering IDs to make them contiguous, and regenerating `id-map.json` from scratch. Both break every previously shared `/blog/:id` link. If `id-map.json` fails to parse, the generator aborts by design rather than silently rebuilding it.

At runtime, `src/views/blog/List.vue` reads `src/config/content.json` and `src/config/columns.json` (column metadata plus live counts, also generated) to render the list and the column tabs. Filtering is client-side via query parameters: `/?column=howto` and `/?tag=CSS` compose, and both are applied to the already-loaded list. `src/views/blog/Article.vue` uses the generated numeric ID and filename, then Vite's `import.meta.glob('../../blogs/*.md', { query: '?raw', import: 'default' })` to load the matching Markdown source. The front matter is removed before rendering through `MarkdownViewer`.

When adding an article, use a unique `.md` filename, add front matter where possible, run `pnpm gen:content`, and verify both `/` and `/blog/:id`. Do not hand-edit the generated JSON files unless correcting a diff is explicitly intended; regenerate them from the Markdown source instead.

### Adding or renaming a column

Editing article front matter is a one-step operation: change the file, then run `pnpm gen:content`. That regenerates `content.json`, `columns.json`, and any newly assigned IDs together.

Renaming or removing a column is a **two-step** operation, because article files store the column name as a literal string while `columns.js` owns the list of valid names. The generator compares them exactly, so renaming `技术研究` to `技术` in `columns.js` alone makes every article still carrying the old name fail validation:

1. Update `COLUMNS` in `src/config/columns.js`.
2. Replace the old value across `src/blogs/*.md`, then run `pnpm gen:content`.

Skipping step 2 does not fail silently — the generator warns that the value is not in the valid column table — but the affected articles drop out of every column tab while still appearing under "全部" with the stale name on their card. Adding a column needs no migration: a new tab appears on the next generation even when its count is 0.

`src/config/columns.json` is a generated file and is what the tabs read for their counts, so editing article front matter without regenerating leaves the counts stale while the list itself (which reads `content.json` directly) updates.

Judge every run by its last line. The invariant is `sum of tab counts = total articles - unclassified`, and the generator prints the balance whenever it is non-zero:

```
📚 栏目分布：技术研究 7 · 教程 11 · … · 未分类 0
```

`未分类` counts both articles with no `column` and articles with an unrecognized value, so a non-zero number always means some article is missing from every tab. When it is non-zero the generator also breaks the number down and prints `页签计数合计 N / 总数 M` — if those two do not add up with `未分类`, the reporting itself is broken.

## Common commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm gen:content
```

`pnpm lint` applies ESLint fixes. Run it deliberately and inspect the resulting diff. There is currently no test script in `package.json`; at minimum, validate changed routes/content with `pnpm build` and manually exercise the affected page.

## Change checklist

1. Identify whether the change belongs to blog content, docs/examples, works demos, shared UI, routing, or configuration.
2. Preserve existing URL compatibility redirects in `src/router/index.js`.
3. For Markdown/content changes, regenerate `src/config/content.json` and verify article loading, tags, dates, columns, and summaries. Check that no existing `id` moved.
4. Run the narrowest useful checks, then `pnpm build` for production-facing changes. If the sandbox blocks vite from emptying `dist/`, add `--emptyOutDir=false` rather than treating it as a code failure.
5. Summarize generated-file changes and any manual browser checks in the handoff.
