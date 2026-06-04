<div align="center">

# CNAE Checker

> Extractor, validator and interactive viewer for CNAE (Classificação Nacional de Atividades Econômicas) data from IBGE/CONCLA.

[![Demo](https://img.shields.io/badge/🌐_Demo-GitHub_Pages-blue?style=flat-square)](https://the-coded.github.io/cnae-checker/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)]()
[![Deploy](https://img.shields.io/github/actions/workflow/status/the-coded/cnae-checker/deploy-pages.yml?style=flat-square&label=deploy)](https://github.com/the-coded/cnae-checker/actions/workflows/deploy-pages.yml)

[![CNAE 2.0 Classes](https://img.shields.io/badge/CNAE_2.0_Classes-673-orange?style=flat-square)]()
[![CNAE 2.3 Subclasses](https://img.shields.io/badge/CNAE_2.3_Subclasses-1331-orange?style=flat-square)]()

</div>

## Overview

Downloads, parses, and validates the official CNAE structure from the Brazilian government, generating structured JSON files with hierarchical data ready for search, embedding, and classification tasks. Includes an interactive web viewer with real-time text search, **semantic search via embeddings**, and pagination — deployable to GitHub Pages.

## Quick Start

```bash
# Install dependencies
npm install

# Run full pipeline: scrape → download → extract → validate → build viewer
npm start
```

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `npm start` | Full pipeline — scrape, download, extract all, validate, build viewer |
| `scrape` | `npm run scrape` | Check IBGE for new download URLs |
| `download` | `npm run download` | Download XLS/XLSX from IBGE (with hash change detection) |
| `extract` | `npm run extract` | Parse CNAE 2.0 classes XLS → `output/cnae-classes.json` |
| `extract:subclasses` | `npm run extract:subclasses` | Parse CNAE 2.3 subclasses XLSX → `output/cnae-subclasses.json` |
| `check` | `npm run check` | Validate both extractions (counts, duplicates, code format) |
| `web` | `npm run web` | Build interactive web viewer → `web/index.html` |
| `build:embeddings` | `npm run build:embeddings` | Pre-compute semantic embeddings → `output/embeddings.json` |

Each script is independent and can be run standalone. `npm start` orchestrates them all in order.

## Web Viewer

The interactive viewer (`npm run web`) generates a self-contained `web/index.html` with:

- **Text search** across all 2004 records (classes + subclasses) with real-time results
- **Normalized code search** — `85.99-6-03` matches `8599-6/03`
- **Semantic search** (🧠 Semântica) — natural language search powered by local embeddings and cosine similarity
- **Tabs** — Todos · Classes · Subclasses
- **Pagination** — 100 items per page across all 2004 records
- **Expandable rows** — click any item to see full hierarchy, related records, embedding text, and tokens
- **No server required** — opens directly in the browser

The viewer is also automatically deployed to **GitHub Pages** on pushes to `main` (see CI/CD below).

### Semantic Search

The 🧠 **Semântica** tab uses pre-computed multilingual embeddings to find CNAE activities by natural language description (e.g., "clínica veterinária" or "desenvolvimento de software"). The model (`paraphrase-multilingual-MiniLM-L12-v2`) runs entirely in the browser via the [Transformers.js](https://huggingface.co/docs/transformers.js) CDN — no server needed.

To regenerate embeddings after updating CNAE data:

```bash
npm run build:embeddings
# Generates output/embeddings.json (~5.6MB, 2004 vectors)
```

> **Note:** `output/embeddings.json` (~5.6MB) is committed to the repo so the viewer works immediately after cloning, without needing to re-run the embedding step.

## Current Data

### Classes (CNAE 2.0)

| Level | Count | Code Format | Example |
|-------|-------|-------------|---------|
| Seções | 21 | A-U | `A` |
| Divisões | 87 | XX | `01` |
| Grupos | 285 | XX.X | `01.1` |
| Classes | 673 | XX.XX-X | `01.11-3` |

### Subclasses (CNAE 2.3)

| Level | Count | Code Format | Example |
|-------|-------|-------------|---------|
| Subclasses | 1331 | XXXX-X/XX | `0111-3/01` |

**Sources:**
- [CNAE 2.0 Classes](https://cnae.ibge.gov.br/images/concla/downloads/revisao2007/PropCNAE20/CNAE20_EstruturaDetalhada.xls) (IBGE/CONCLA)
- [CNAE 2.3 Subclasses](https://cnae.ibge.gov.br/images/concla/documentacao/CNAE_Subclasses_2_3_Estrutura_Detalhada.xlsx) (IBGE/CONCLA)

## Output Format

### Classes (`output/cnae-classes.json`)

```json
{
  "codigo": "01.11-3",
  "titulo": "Cultivo de cereais",
  "secao_codigo": "A",
  "secao_descricao": "AGRICULTURA, PECUÁRIA, PRODUÇÃO FLORESTAL, PESCA E AQÜICULTURA",
  "divisao_codigo": "01",
  "grupo_codigo": "01.1",
  "classe_codigo": "01.11-3",
  "hierarchy": ["Seção desc", "Divisão desc", "Grupo desc", "Classe desc"],
  "texto_embedding": "Cultivo de cereais. Produção de lavouras temporárias. ...",
  "tokens": ["cultivo", "cereais", "producao", "..."]
}
```

### Subclasses (`output/cnae-subclasses.json`)

```json
{
  "codigo": "0111-3/01",
  "titulo": "Cultivo de arroz",
  "secao_codigo": "A",
  "divisao_codigo": "01",
  "grupo_codigo": "01.1",
  "classe_codigo": "01.11-3",
  "subclasse_codigo": "0111-3/01",
  "hierarchy": ["Seção", "Divisão", "Grupo", "Classe", "Subclasse"],
  "texto_embedding": "Cultivo de arroz. Cultivo de cereais. ...",
  "tokens": ["cultivo", "arroz", "cereais", "..."]
}
```

### Embeddings (`output/embeddings.json`)

```json
[
  {
    "codigo": "01.11-3",
    "titulo": "Cultivo de cereais",
    "type": "classe",
    "embedding": [0.021, -0.043, "..."]
  }
]
```

See [Data Schema](docs/data-schema.md) for full field reference.

## Project Structure

```
cnae-checker/
├── .github/
│   └── workflows/
│       ├── cnae-monitor.yml        # Monitor IBGE for data changes (manual/scheduled)
│       └── deploy-pages.yml        # Build & deploy viewer to GitHub Pages
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── scripts/
│   ├── start.js                    # Full pipeline orchestrator
│   ├── scrape-urls.js              # Discover new URLs on IBGE
│   ├── download.js                 # Download with hash tracking
│   ├── extract.js                  # CNAE 2.0 classes parser
│   ├── extract-subclasses.js       # CNAE 2.3 subclasses parser
│   ├── check.js                    # Validation for both
│   ├── build-web.js                # Interactive web viewer generator
│   └── build-embeddings.js         # Multilingual embedding pre-computation
├── data/
│   ├── CNAE20_EstruturaDetalhada.xls
│   └── CNAE_Subclasses_2_3_Estrutura_Detalhada.xlsx
├── output/
│   ├── cnae-classes.json           # 673 classes
│   ├── cnae-subclasses.json        # 1331 subclasses
│   └── embeddings.json             # 2004 vectors (~5.6MB, committed)
├── web/
│   └── index.html                  # Generated viewer (git-ignored)
└── docs/
    ├── cnae-structure.md           # What is CNAE, hierarchy, versions
    ├── ibge-data-sources.md        # IBGE download URLs, formats
    ├── known-urls.md               # Complete inventory of tracked URLs
    ├── update-process.md           # How to update data
    ├── data-schema.md              # JSON schema reference for all outputs
    └── semantic-search.md          # Embedding model and semantic search docs
```

## CI/CD

### `cnae-monitor.yml` — Data Monitor

- **Trigger:** `workflow_dispatch` (or enable `schedule` for monthly runs)
- Scrapes IBGE for new URLs, downloads files, extracts and validates data
- Warns on new URLs or changed source files
- Webhook alert support (commented, ready to enable)

### `deploy-pages.yml` — GitHub Pages

- **Trigger:** `workflow_dispatch` or push to `main` affecting output/scripts
- Runs full pipeline + generates embeddings, deploys `web/index.html` to `gh-pages` orphan branch
- Enable in repo **Settings → Pages → Branch: gh-pages → / (root)**
- **Viewer URL:** `https://the-coded.github.io/cnae-checker/`

## Documentation

- **[CNAE Structure](docs/cnae-structure.md)** — What is CNAE, hierarchy levels, versions
- **[IBGE Data Sources](docs/ibge-data-sources.md)** — Download URLs, file formats, scraping guide
- **[Known URLs](docs/known-urls.md)** — Complete inventory of all tracked IBGE URLs
- **[Update Process](docs/update-process.md)** — How to download and update CNAE data
- **[Data Schema](docs/data-schema.md)** — Complete JSON schema reference for all outputs
- **[Semantic Search](docs/semantic-search.md)** — Embedding model, cosine similarity, browser inference

## License

MIT — see [LICENSE](LICENSE)

## Dependencies

| Package | Purpose |
|---------|---------|
| [`xlsx`](https://www.npmjs.com/package/xlsx) | Excel file parser (XLS/XLSX) |
| [`@xenova/transformers`](https://www.npmjs.com/package/@xenova/transformers) | Multilingual embedding model (dev — build time only) |
