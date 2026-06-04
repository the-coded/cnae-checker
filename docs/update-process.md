# Update Process — How to Keep CNAE Data Current

## Overview

```
┌─────────────┐     ┌───────────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐
│   Scrape     │ ──▶ │   Download    │ ──▶ │   Extract   │ ──▶ │   Validate   │ ──▶ │  Done!   │
│  (new URLs)  │     │  from IBGE    │     │  XLS → JSON │     │  (counts +   │     │          │
└─────────────┘     └───────────────┘     └─────────────┘     │   formats)   │     └──────────┘
                                                                └──────────────┘
```

The fastest path: `npm start` runs the entire pipeline end-to-end.

---

## Running the Full Pipeline

```bash
npm install      # First time only
npm start        # scrape → download → extract (classes + subclasses) → check → build viewer
```

To also regenerate embeddings (required after data changes):

```bash
npm start
npm run build:embeddings
```

---

## Manual Steps (Individual Scripts)

### Step 1: Check for new IBGE URLs

```bash
npm run scrape
```

Fetches the IBGE download page and compares all `.xls`/`.xlsx` links against the known URL list. Exits with code 1 if new URLs are found (also used by CI to trigger alerts).

### Step 2: Download the latest files

```bash
npm run download
```

Downloads the two primary files from IBGE with hash-based change detection:
- `data/CNAE20_EstruturaDetalhada.xls` — CNAE 2.0 Classes
- `data/CNAE_Subclasses_2_3_Estrutura_Detalhada.xlsx` — CNAE 2.3 Subclasses

### Step 3: Extract to JSON

```bash
npm run extract             # CNAE 2.0 classes → output/cnae-classes.json
npm run extract:subclasses  # CNAE 2.3 subclasses → output/cnae-subclasses.json
```

### Step 4: Validate

```bash
npm run check
```

Expected output:

```
=== CNAE CLASSES CHECK ===
{ secoes: 21, divisoes: 87, grupos: 285, classes: 673, total: 673 }
Duplicados: 0
Códigos inválidos: 0
✅ CLASSES VÁLIDAS

=== CNAE SUBCLASSES CHECK ===
{ subclasses: 1331, total: 1331 }
Duplicados: 0
Códigos inválidos: 0
✅ SUBCLASSES VÁLIDAS
```

### Step 5: Rebuild the viewer

```bash
npm run web
```

Regenerates `web/index.html` with the latest data.

### Step 6 (Optional): Regenerate embeddings

Only needed if CNAE data changed:

```bash
npm run build:embeddings
# Writes output/embeddings.json (~5.6MB, 2004 vectors)
# Then rebuild the viewer to pick up the new embeddings:
npm run web
```

---

## If Validation Fails

### "Wrong counts"

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Wrong section count (≠21) | New section added | Update expected count in `scripts/check.js` |
| Wrong division count (≠87) | Structure changed | Re-analyze XLS, update `check.js` |
| Wrong group count (≠285) | Structure changed | Re-analyze XLS, update `check.js` |
| Wrong class count (≠673) | New classes added | Update expected count, verify data |
| Wrong subclass count (≠1331) | New subclasses added | Update expected count, verify data |

### "Duplicates found"

Check row filtering logic in `scripts/extract.js` or `scripts/extract-subclasses.js`.

### "Invalid codes"

Check if the code format regex changed. Update in `scripts/check.js`:
- Classes: `/^\d{2}\.\d{2}-\d$/`
- Subclasses: `/^\d{4}-\d\/\d{2}$/`

### Download failures

```bash
# Check if URL is still valid
curl -I "https://cnae.ibge.gov.br/images/concla/downloads/revisao2007/PropCNAE20/CNAE20_EstruturaDetalhada.xls"

# If 404, look for updated URLs on the download page
curl -s "https://cnae.ibge.gov.br/classificacoes/download-concla.html" | grep -i "cnae.*\.xls"
```

---

## Adding a New CNAE Version

When IBGE releases a new version (e.g., CNAE 2.4):

1. **Check `docs/ibge-data-sources.md`** for new URLs
2. **Download the new file** and inspect its XLS structure (sheet name, column order)
3. **Update `scripts/download.js`** — add the new URL to the `FILES` array
4. **Update `scripts/scrape-urls.js`** — add the new URL to `KNOWN_URLS`
5. **Create a new extractor** (e.g., `scripts/extract-subclasses-24.js`) or update the existing one if format is identical
6. **Update `scripts/check.js`** — add validation rules for the new file
7. **Update `docs/ibge-data-sources.md`** and `docs/known-urls.md`
8. **Run the full pipeline:** `npm start`

---

## Handling New File Formats

### XLSX (already supported)

The `xlsx` library handles both `.xls` and `.xlsx` transparently.

### ZIP files

Some older CNAE files are in `.zip` format. To support:

```bash
npm install adm-zip
```

```javascript
const AdmZip = require('adm-zip');
const zip = new AdmZip('file.zip');
zip.extractAllTo('./temp/', true);
// Then parse the extracted XLS/XLSX as usual
```

### New formats

If IBGE publishes in CSV, ODS, or other formats:
1. Check if the `xlsx` library supports it (handles many formats)
2. If not, find a suitable parser
3. Update the appropriate `extract*.js` script to detect and handle the format

---

## Automated Monitoring (CI/CD)

The `cnae-monitor.yml` workflow (in `.github/workflows/`) can be triggered manually or on a schedule:

```yaml
# Enable monthly monitoring — uncomment in cnae-monitor.yml:
on:
  schedule:
    - cron: '0 3 1 * *'  # Monthly, 1st day at 3am UTC
  workflow_dispatch: {}
```

The workflow:
1. Runs `npm run scrape` — exits 1 if new IBGE URLs are found
2. Runs `npm run download` — skips if files unchanged (hash match)
3. Runs extract + check — fails if validation errors
4. Optionally sends a webhook alert (commented out, ready to enable)

**Recommendation:** A monthly check is sufficient — CNAE changes very rarely (major revisions roughly every 5-7 years).
