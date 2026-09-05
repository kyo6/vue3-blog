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
- Blog source files are Markdown in `src/blogs/`. Preserve their front matter (`tag`, `date`, and optional `detail`) when editing articles.
- If blog metadata or article files change, run `pnpm gen:content` and review the generated `src/config/content.json` diff.
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
date: 2026-08-26
tag: ['Vue3', '前端']
detail: '可选的列表摘要'
---

# 文章正文
```

Run `pnpm gen:content` to execute `src/cli/genDocContent.js`. The script scans `src/blogs/*.md`, parses `date`, `tag`, and optional `detail`, generates a summary from the first meaningful Markdown line when `detail` is absent, sorts entries by date descending, assigns sequential numeric IDs, and writes `src/config/content.json`.

At runtime, `src/views/blog/List.vue` reads `src/config/content.json` to render the list. `src/views/blog/Article.vue` uses the generated numeric ID and filename, then Vite's `import.meta.glob('../../blogs/*.md', { query: '?raw', import: 'default' })` to load the matching Markdown source. The front matter is removed before rendering through `MarkdownViewer`.

When adding an article, use a unique `.md` filename, add front matter where possible, run `pnpm gen:content`, and verify both `/` and `/blog/:id`. Do not hand-edit `src/config/content.json` unless correcting a generated diff is explicitly intended; regenerate it from the Markdown source instead.

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
3. For Markdown/content changes, regenerate `src/config/content.json` and verify article loading, tags, dates, and summaries.
4. Run the narrowest useful checks, then `pnpm build` for production-facing changes.
5. Summarize generated-file changes and any manual browser checks in the handoff.
