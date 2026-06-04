# Data Schema — Output Files Reference

> Covers all three output files: `cnae-classes.json`, `cnae-subclasses.json`, and `embeddings.json`.

## Overview

| File | Records | Description |
|------|---------|-------------|
| `output/cnae-classes.json` | 673 | CNAE 2.0 Class-level entries with full hierarchy |
| `output/cnae-subclasses.json` | 1331 | CNAE 2.3 Subclass-level entries with full hierarchy |
| `output/embeddings.json` | 2004 | Pre-computed multilingual embeddings for all records |

---

## `output/cnae-classes.json`

Array of 673 entries. Each entry represents one CNAE class with its full hierarchical context.

### TypeScript Interface

```typescript
interface CNAEClass {
  // Primary identification
  codigo: string            // Class code — e.g., "01.11-3"
  titulo: string            // Class title — e.g., "Cultivo de cereais"

  // Flat hierarchy fields
  secao_codigo: string      // Section code (A-U) — e.g., "A"
  secao_descricao: string   // Section description
  divisao_codigo: string    // Division code (01-99) — e.g., "01"
  divisao_descricao: string // Division description
  grupo_codigo: string      // Group code (XX.X) — e.g., "01.1"
  grupo_descricao: string   // Group description
  classe_codigo: string     // Same as `codigo`
  classe_descricao: string  // Same as `titulo`

  // Derived fields
  hierarchy: string[]       // Breadcrumb: [section, division, group, class]
  texto_embedding: string   // Concatenated text optimized for semantic search
  tokens: string[]          // Normalized, deduplicated, stopword-filtered tokens

  // Structured hierarchy
  raw_hierarchy: {
    secao:   { codigo: string; descricao: string }
    divisao: { codigo: string; descricao: string }
    grupo:   { codigo: string; descricao: string }
    classe:  { codigo: string; descricao: string }
  }
}
```

### Full Example

```json
{
  "codigo": "01.11-3",
  "titulo": "Cultivo de cereais",
  "secao_codigo": "A",
  "secao_descricao": "AGRICULTURA, PECUÁRIA, PRODUÇÃO FLORESTAL, PESCA E AQÜICULTURA",
  "divisao_codigo": "01",
  "divisao_descricao": "AGRICULTURA, PECUÁRIA E SERVIÇOS RELACIONADOS",
  "grupo_codigo": "01.1",
  "grupo_descricao": "Produção de lavouras temporárias",
  "classe_codigo": "01.11-3",
  "classe_descricao": "Cultivo de cereais",
  "hierarchy": [
    "AGRICULTURA, PECUÁRIA, PRODUÇÃO FLORESTAL, PESCA E AQÜICULTURA",
    "AGRICULTURA, PECUÁRIA E SERVIÇOS RELACIONADOS",
    "Produção de lavouras temporárias",
    "Cultivo de cereais"
  ],
  "texto_embedding": "Cultivo de cereais. Produção de lavouras temporárias. AGRICULTURA, PECUÁRIA E SERVIÇOS RELACIONADOS. AGRICULTURA, PECUÁRIA, PRODUÇÃO FLORESTAL, PESCA E AQÜICULTURA. CNAE 01.11-3",
  "tokens": ["cultivo", "cereais", "producao", "lavouras", "temporarias", "agricultura", "pecuaria"],
  "raw_hierarchy": {
    "secao":   { "codigo": "A",      "descricao": "AGRICULTURA, PECUÁRIA..." },
    "divisao": { "codigo": "01",     "descricao": "AGRICULTURA, PECUÁRIA E SERVIÇOS RELACIONADOS" },
    "grupo":   { "codigo": "01.1",   "descricao": "Produção de lavouras temporárias" },
    "classe":  { "codigo": "01.11-3","descricao": "Cultivo de cereais" }
  }
}
```

### Code Formats

| Field | Format | Regex | Example |
|-------|--------|-------|---------|
| `secao_codigo` | Single letter | `/^[A-U]$/` | `"A"` |
| `divisao_codigo` | 2 digits | `/^\d{2}$/` | `"01"` |
| `grupo_codigo` | XX.X | `/^\d{2}\.\d$/` | `"01.1"` |
| `codigo` / `classe_codigo` | XX.XX-X | `/^\d{2}\.\d{2}-\d$/` | `"01.11-3"` |

### `texto_embedding` Format

Built most-specific-first to bias embedding models toward the leaf node:

```
"{class}. {group}. {division}. {section}. CNAE {code}"
```

### `tokens` Processing Pipeline

1. Concatenate all hierarchy descriptions
2. Normalize — remove accents via NFD decomposition
3. Lowercase
4. Split into words
5. Remove words ≤ 2 characters
6. Remove Portuguese stopwords (`de`, `da`, `do`, `e`, `em`, `a`, `o`, `para`, `com`, `por`, `na`, `no`, etc.)
7. Deduplicate

### Validation Rules

| Check | Expected |
|-------|---------|
| Total entries | 673 |
| Unique sections | 21 |
| Unique divisions | 87 |
| Unique groups | 285 |
| Unique classes | 673 |
| Duplicates | 0 |
| Invalid codes | 0 |

---

## `output/cnae-subclasses.json`

Array of 1331 entries. Each entry is a CNAE 2.3 subclass — the most granular level, used by Receita Federal for CNPJ registration.

### TypeScript Interface

```typescript
interface CNAESubclass {
  // Primary identification
  codigo: string              // Subclass code — e.g., "0111-3/01"
  titulo: string              // Subclass title — e.g., "Cultivo de arroz"

  // Flat hierarchy fields
  secao_codigo: string
  secao_descricao: string
  divisao_codigo: string
  divisao_descricao: string
  grupo_codigo: string
  grupo_descricao: string
  classe_codigo: string       // Parent class code — e.g., "01.11-3"
  classe_descricao: string
  subclasse_codigo: string    // Same as `codigo`
  subclasse_descricao: string // Same as `titulo`

  // Derived fields
  hierarchy: string[]         // Breadcrumb: [section, division, group, class, subclass]
  texto_embedding: string     // Concatenated text optimized for semantic search
  tokens: string[]            // Normalized, deduplicated, stopword-filtered tokens
}
```

### Full Example

```json
{
  "codigo": "0111-3/01",
  "titulo": "Cultivo de arroz",
  "secao_codigo": "A",
  "secao_descricao": "AGRICULTURA, PECUÁRIA, PRODUÇÃO FLORESTAL, PESCA E AQÜICULTURA",
  "divisao_codigo": "01",
  "divisao_descricao": "AGRICULTURA, PECUÁRIA E SERVIÇOS RELACIONADOS",
  "grupo_codigo": "01.1",
  "grupo_descricao": "Produção de lavouras temporárias",
  "classe_codigo": "01.11-3",
  "classe_descricao": "Cultivo de cereais",
  "subclasse_codigo": "0111-3/01",
  "subclasse_descricao": "Cultivo de arroz",
  "hierarchy": [
    "AGRICULTURA, PECUÁRIA, PRODUÇÃO FLORESTAL, PESCA E AQÜICULTURA",
    "AGRICULTURA, PECUÁRIA E SERVIÇOS RELACIONADOS",
    "Produção de lavouras temporárias",
    "Cultivo de cereais",
    "Cultivo de arroz"
  ],
  "texto_embedding": "Cultivo de arroz. Cultivo de cereais. Produção de lavouras temporárias. AGRICULTURA, PECUÁRIA E SERVIÇOS RELACIONADOS. AGRICULTURA, PECUÁRIA, PRODUÇÃO FLORESTAL, PESCA E AQÜICULTURA. CNAE 0111-3/01",
  "tokens": ["cultivo", "arroz", "cereais", "producao", "lavouras", "temporarias", "agricultura"]
}
```

### Code Format

| Field | Format | Regex | Example |
|-------|--------|-------|---------|
| `codigo` / `subclasse_codigo` | XXXX-X/XX | `/^\d{4}-\d\/\d{2}$/` | `"0111-3/01"` |

### Validation Rules

| Check | Expected |
|-------|---------|
| Total entries | 1331 |
| Duplicates | 0 |
| Invalid codes | 0 |

---

## `output/embeddings.json`

Array of 2004 entries (673 classes + 1331 subclasses). Each entry contains the pre-computed vector representation of its `texto_embedding` field.

### TypeScript Interface

```typescript
interface CNAEEmbedding {
  codigo: string      // CNAE code — e.g., "01.11-3" or "0111-3/01"
  titulo: string      // Activity title
  type: 'classe' | 'subclasse'
  embedding: number[] // 384-dimensional float32 vector
}
```

### Example

```json
{
  "codigo": "01.11-3",
  "titulo": "Cultivo de cereais",
  "type": "classe",
  "embedding": [0.0213, -0.0431, 0.1102, "..."]
}
```

### Model Details

| Property | Value |
|----------|-------|
| Model | `Xenova/paraphrase-multilingual-MiniLM-L12-v2` |
| Dimensions | 384 |
| Language | Multilingual (Portuguese supported) |
| Runtime | Node.js (build time) + Browser (query time) |
| Source | HuggingFace via `@xenova/transformers` |

> **File size:** ~5.6MB. Committed to the repo so the viewer works immediately after cloning.

### How It's Used

1. **Build time** (`npm run build:embeddings`): All 2004 `texto_embedding` strings are encoded using the local model. Results saved to `output/embeddings.json`.
2. **Viewer build** (`npm run web`): `embeddings.json` is inlined into `web/index.html` as a JavaScript variable.
3. **Query time** (browser): The user's search query is embedded using the same model loaded from CDN. Cosine similarity is computed in-browser between the query vector and all 2004 stored vectors. Top results are ranked and displayed.

---

## Usage Examples

### Find class by code

```javascript
const classes = require('./output/cnae-classes.json');
const entry = classes.find(c => c.codigo === '62.01-5');
// → "Desenvolvimento de programas de computador sob encomenda"
```

### Find all subclasses under a class

```javascript
const subclasses = require('./output/cnae-subclasses.json');
const results = subclasses.filter(s => s.classe_codigo === '62.01-5');
```

### Find by section

```javascript
const techClasses = classes.filter(c => c.secao_codigo === 'J');
// → All "Informação e comunicação" classes
```

### Text search

```javascript
const results = classes.filter(c =>
  c.texto_embedding.toLowerCase().includes('software')
);
```

### Token-based matching

```javascript
const results = classes.filter(c =>
  c.tokens.includes('software') || c.tokens.includes('computador')
);
```
