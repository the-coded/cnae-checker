/**
 * build-embeddings.js
 *
 * Generates dense vector embeddings for all CNAE classes and subclasses
 * using @xenova/transformers (Xenova/paraphrase-multilingual-MiniLM-L12-v2, 384 dims).
 *
 * Output: output/embeddings.json
 *
 * Decoupling note: the output format {id, type, vector} matches the contract
 * expected by the client-side searchSimilar() function and any future API.
 */

const { pipeline } = require('@xenova/transformers');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const EMBEDDINGS_FILE = path.join(OUTPUT_DIR, 'embeddings.json');

// Multilingual model — significantly better for Portuguese queries
// 384 dims, ~65MB quantized. Upgrade path: see @todo/SIMILARITY-SEARCH/FUTURE.md
const MODEL_NAME = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
const BATCH_SIZE = 32;

async function generateEmbeddings() {
    // Load data
    const classesFile = path.join(OUTPUT_DIR, 'cnae-classes.json');
    const subclassesFile = path.join(OUTPUT_DIR, 'cnae-subclasses.json');

    if (!fs.existsSync(classesFile)) {
        console.error('❌ Missing: output/cnae-classes.json — run "npm run extract" first');
        process.exit(1);
    }
    if (!fs.existsSync(subclassesFile)) {
        console.error('❌ Missing: output/cnae-subclasses.json — run "npm run extract:subclasses" first');
        process.exit(1);
    }

    const classes = JSON.parse(fs.readFileSync(classesFile, 'utf8'));
    const subclasses = JSON.parse(fs.readFileSync(subclassesFile, 'utf8'));

    const items = [
        ...classes.map(c => ({ id: c.codigo, type: 'class', text: c.texto_embedding })),
        ...subclasses.map(s => ({ id: s.codigo, type: 'subclass', text: s.texto_embedding }))
    ];

    console.log(`\n🔢 Generating embeddings for ${items.length} CNAE items`);
    console.log(`   Model: ${MODEL_NAME}`);
    console.log(`   Batch size: ${BATCH_SIZE}\n`);

    // Load model (downloads ~30MB on first run, then cached)
    console.log('📦 Loading model (first run downloads ~30MB)...');
    const extractor = await pipeline('feature-extraction', MODEL_NAME, {
        quantized: true  // use quantized model (~30MB instead of ~90MB)
    });
    console.log('✅ Model loaded\n');

    // Process in batches
    const results = [];
    const total = items.length;
    const batches = Math.ceil(total / BATCH_SIZE);

    for (let b = 0; b < batches; b++) {
        const start = b * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, total);
        const batch = items.slice(start, end);

        process.stdout.write(`   Batch ${b + 1}/${batches} (${start + 1}-${end}/${total})...`);

        for (const item of batch) {
            const output = await extractor(item.text, { pooling: 'mean', normalize: true });
            // Float32Array → regular Array with 4-decimal precision (reduces file size ~30%)
            const vector = Array.from(output.data).map(v => Math.round(v * 10000) / 10000);
            results.push({ id: item.id, type: item.type, vector });
        }

        process.stdout.write(` ✅\n`);
    }

    // Save output
    const output = {
        model: MODEL_NAME,
        dims: 384,
        generated: new Date().toISOString(),
        count: results.length,
        items: results
    };

    fs.writeFileSync(EMBEDDINGS_FILE, JSON.stringify(output), 'utf8');

    const sizeKB = Math.round(fs.statSync(EMBEDDINGS_FILE).size / 1024);
    console.log(`\n✅ Embeddings saved → output/embeddings.json`);
    console.log(`   Items: ${results.length} | Size: ${sizeKB}KB`);
}

generateEmbeddings().catch(err => {
    console.error('❌ Build embeddings failed:', err.message);
    process.exit(1);
});
