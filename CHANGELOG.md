# Changelog

All notable changes to this project are documented here.

## [0.2.0] — 2026-06

### Added
- **CNAE 2.3 Subclasses support** — 1331 subclasses extracted and validated (`output/cnae-subclasses.json`)
- **`scripts/extract-subclasses.js`** — parser for CNAE 2.3 XLSX format
- **Semantic search** — 🧠 Semântica tab in the web viewer using multilingual embeddings and cosine similarity
- **`scripts/build-embeddings.js`** — pre-computes 384-dimensional vectors for all 2004 records using `paraphrase-multilingual-MiniLM-L12-v2` via `@xenova/transformers`
- **`output/embeddings.json`** — pre-computed embeddings committed to the repo (~5.6MB, 2004 vectors)
- **Pagination** — web viewer now shows 100 items per page (was a fixed cap of 200)
- **`scripts/download.js`** — automated download with SHA-256 hash change detection
- **`scripts/scrape-urls.js`** — scrapes IBGE download page to detect new/changed URLs
- **`scripts/check.js`** — unified validator for both classes and subclasses
- **GitHub Actions workflows**:
  - `deploy-pages.yml` — builds and deploys viewer to GitHub Pages
  - `cnae-monitor.yml` — monitors IBGE for data changes
- **`docs/semantic-search.md`** — documentation for the embedding model and search architecture
- **README badges** — Demo, License, Node.js, Deploy, CNAE data counts

### Changed
- Web viewer now covers **all 2004 records** (classes + subclasses) instead of classes only
- `output/cnae-classes.json` replaces the old `cnae.json` (same schema, new path)
- `scripts/check.js` replaces `scripts/check-extraction.js` with expanded validation
- Project restructured: outputs go to `output/`, downloaded data goes to `data/`
- README fully rewritten with accurate scripts table, schema examples, and CI/CD docs

### Dependencies
- Added `@xenova/transformers@^2.17.2` (devDependency) for embedding generation

---

## [0.1.0] — 2026-03

### Added
- Initial release
- CNAE 2.0 Classes extraction from `CNAE20_EstruturaDetalhada.xls`
- 673 classes with full hierarchy (section → division → group → class)
- `texto_embedding` and `tokens` derived fields
- `scripts/extract.js` — XLS parser
- `scripts/check-extraction.js` — validation script
- Basic web viewer (single HTML file, no server required)
- Documentation: `docs/cnae-structure.md`, `docs/ibge-data-sources.md`, `docs/known-urls.md`, `docs/data-schema.md`, `docs/update-process.md`
