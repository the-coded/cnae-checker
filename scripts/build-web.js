const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const WEB_DIR = path.join(__dirname, '..', 'web');
const OUT_FILE = path.join(WEB_DIR, 'index.html');

const CLASSES_FILE = path.join(OUTPUT_DIR, 'cnae-classes.json');
const SUBCLASSES_FILE = path.join(OUTPUT_DIR, 'cnae-subclasses.json');

if (!fs.existsSync(CLASSES_FILE)) {
    console.error(`❌ Missing: ${CLASSES_FILE}\nRun "npm start" first.`);
    process.exit(1);
}

if (!fs.existsSync(SUBCLASSES_FILE)) {
    console.error(`❌ Missing: ${SUBCLASSES_FILE}\nRun "npm start" first.`);
    process.exit(1);
}

const classes = JSON.parse(fs.readFileSync(CLASSES_FILE, 'utf8'));
const subclasses = JSON.parse(fs.readFileSync(SUBCLASSES_FILE, 'utf8'));

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CNAE Checker — Viewer</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0f1117;
      --surface: #1a1d27;
      --border: #2a2d3a;
      --accent: #6366f1;
      --accent-dim: #3730a3;
      --text: #e2e8f0;
      --text-dim: #64748b;
      --green: #22c55e;
      --tag-bg: #1e293b;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      min-height: 100vh;
    }

    header {
      padding: 24px 32px 16px;
      border-bottom: 1px solid var(--border);
    }

    header h1 {
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 4px;
    }

    header p {
      color: var(--text-dim);
      font-size: 13px;
    }

    .stats {
      display: flex;
      gap: 24px;
      margin-top: 12px;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-dim);
    }

    .stat strong {
      color: var(--green);
      font-weight: 600;
    }

    .controls {
      padding: 16px 32px;
      display: flex;
      gap: 12px;
      align-items: center;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }

    .search-wrap {
      position: relative;
      flex: 1;
      min-width: 240px;
    }

    .search-wrap svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: var(--text-dim);
      pointer-events: none;
    }

    input[type="text"] {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      padding: 8px 12px 8px 36px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s;
    }

    input[type="text"]:focus {
      border-color: var(--accent);
    }

    input[type="text"]::placeholder {
      color: var(--text-dim);
    }

    .tabs {
      display: flex;
      gap: 4px;
    }

    .tab {
      padding: 7px 16px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-dim);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .tab:hover { color: var(--text); border-color: var(--accent-dim); }
    .tab.active { background: var(--accent); border-color: var(--accent); color: #fff; }

    .result-bar {
      padding: 8px 32px;
      font-size: 12px;
      color: var(--text-dim);
      border-bottom: 1px solid var(--border);
    }

    .table-wrap {
      padding: 0 32px 32px;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 13px;
    }

    thead th {
      text-align: left;
      padding: 8px 12px;
      color: var(--text-dim);
      font-weight: 500;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    tbody tr {
      border-bottom: 1px solid var(--border);
      transition: background 0.1s;
    }

    tbody tr:hover { background: var(--surface); }

    tbody td {
      padding: 10px 12px;
      vertical-align: top;
    }

    .code {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12px;
      background: var(--tag-bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 2px 6px;
      white-space: nowrap;
      color: var(--accent);
    }

    .titulo { font-weight: 500; color: var(--text); }

    .breadcrumb {
      color: var(--text-dim);
      font-size: 12px;
      margin-top: 3px;
    }

    .breadcrumb span + span::before {
      content: ' › ';
      color: var(--border);
    }

    .empty {
      text-align: center;
      padding: 64px 32px;
      color: var(--text-dim);
    }

    .empty svg { width: 40px; height: 40px; margin: 0 auto 12px; display: block; opacity: 0.3; }

    mark {
      background: var(--accent-dim);
      color: var(--text);
      border-radius: 2px;
      padding: 0 1px;
    }

    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      padding: 1px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .badge-classe { background: #1e3a5f; color: #60a5fa; border: 1px solid #2563eb44; }
    .badge-subclasse { background: #1a3a2a; color: #4ade80; border: 1px solid #16a34a44; }

    .expandable { cursor: pointer; }
    .chevron {
      display: inline-block;
      width: 14px;
      font-size: 10px;
      color: var(--text-dim);
      transition: transform 0.2s;
      vertical-align: middle;
      line-height: 1;
    }
    .chevron.open { transform: rotate(90deg); }

    .sub-rows td { background: #0c0e16; }
    .sub-rows table { border-collapse: collapse; width: 100%; }
    .sub-rows tr { border-bottom: 1px solid #1e2130; }
    .sub-rows td:first-child { white-space: nowrap; }

    .sub-code-sub { color: #a78bfa; background: #1e1b35; border-color: #6d28d944; }
    .sub-code-cls { color: #fb923c; background: #2a1a0e; border-color: #c2410c44; }
    .sub-label { font-size: 11px; color: var(--text-dim); margin-left: 6px; }

    /* Detail card */
    .detail-card { padding: 16px 24px; background: #0c0e16; border-top: 1px solid #1e2130; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .detail-section { }
    .detail-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-dim); margin-bottom: 8px; }
    .detail-full { grid-column: 1 / -1; }

    .hier-row { display: flex; align-items: baseline; gap: 8px; padding: 3px 0; }
    .hier-level { font-size: 10px; color: var(--text-dim); width: 58px; flex-shrink: 0; text-align: right; }
    .hier-code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; color: var(--accent); background: var(--tag-bg); padding: 1px 5px; border-radius: 3px; border: 1px solid var(--border); flex-shrink: 0; }
    .hier-desc { color: var(--text-dim); font-size: 12px; }
    .hier-active .hier-code { color: #e2e8f0; background: #1e3a5f; border-color: #2563eb; }
    .hier-active .hier-desc { color: var(--text); font-weight: 500; }

    .related-row { display: flex; align-items: center; gap: 8px; padding: 3px 0; font-size: 12px; }
    .related-title { color: var(--text-dim); }

    .detail-text { font-size: 12px; color: var(--text-dim); line-height: 1.6; background: #111420; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); max-height: 72px; overflow: hidden; text-overflow: ellipsis; }
    .tokens-wrap { display: flex; flex-wrap: wrap; gap: 4px; max-height: 72px; overflow: hidden; }
    .token { font-size: 10px; background: #1e2130; color: var(--text-dim); padding: 2px 6px; border-radius: 10px; border: 1px solid var(--border); font-family: 'SF Mono', 'Fira Code', monospace; }
  </style>
</head>
<body>

<header>
  <h1>CNAE Checker — Viewer</h1>
  <p>Validação dos dados extraídos de IBGE/CONCLA</p>
  <div class="stats">
    <div class="stat">Classes: <strong>${classes.length}</strong></div>
    <div class="stat">Subclasses: <strong>${subclasses.length}</strong></div>
    <div class="stat" id="result-stat"></div>
  </div>
</header>

<div class="controls">
  <div class="search-wrap">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input type="text" id="search" placeholder="Buscar por código, título, seção, divisão..." autofocus />
  </div>
  <div class="tabs">
    <button class="tab active" data-tab="all">Todos (${classes.length + subclasses.length})</button>
    <button class="tab" data-tab="classes">Classes (${classes.length})</button>
    <button class="tab" data-tab="subclasses">Subclasses (${subclasses.length})</button>
  </div>
</div>

<div class="result-bar" id="result-bar">Mostrando todos os registros</div>

<div class="table-wrap">
  <div id="content"></div>
</div>

<script>
const CLASSES = ${JSON.stringify(classes)};
const SUBCLASSES = ${JSON.stringify(subclasses)};

const MAX_DISPLAY = 200;

// Lookups for related data
const CLASS_MAP = {};
CLASSES.forEach(c => { CLASS_MAP[c.codigo] = c; });
const SUBCLASS_MAP = {};
SUBCLASSES.forEach(s => { SUBCLASS_MAP[s.codigo] = s; });
const SUBS_BY_CLASS = {};
SUBCLASSES.forEach(s => {
  if (!SUBS_BY_CLASS[s.classe_codigo]) SUBS_BY_CLASS[s.classe_codigo] = [];
  SUBS_BY_CLASS[s.classe_codigo].push(s);
});

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildDetailCard(item, type) {
  const isSub = type === 'subclass';

  // Hierarquia
  let hier = '<div class="detail-section"><div class="detail-label">Hierarquia</div>';
  hier += '<div class="hier-row"><span class="hier-level">Seção</span><span class="hier-code">' + esc(item.secao_codigo) + '</span><span class="hier-desc">' + esc(item.secao_descricao) + '</span></div>';
  hier += '<div class="hier-row"><span class="hier-level">Divisão</span><span class="hier-code">' + esc(item.divisao_codigo) + '</span><span class="hier-desc">' + esc(item.divisao_descricao) + '</span></div>';
  hier += '<div class="hier-row"><span class="hier-level">Grupo</span><span class="hier-code">' + esc(item.grupo_codigo) + '</span><span class="hier-desc">' + esc(item.grupo_descricao) + '</span></div>';
  hier += '<div class="hier-row' + (!isSub ? ' hier-active' : '') + '"><span class="hier-level">Classe</span><span class="hier-code">' + esc(item.classe_codigo) + '</span><span class="hier-desc">' + esc(item.classe_descricao) + '</span></div>';
  if (isSub) {
    hier += '<div class="hier-row hier-active"><span class="hier-level">Subclasse</span><span class="hier-code">' + esc(item.subclasse_codigo) + '</span><span class="hier-desc">' + esc(item.subclasse_descricao) + '</span></div>';
  }
  hier += '</div>';

  // Relacionados
  let related = '';
  if (!isSub) {
    const subs = SUBS_BY_CLASS[item.codigo] || [];
    related = '<div class="detail-section"><div class="detail-label">Subclasses (' + subs.length + ')</div>';
    if (subs.length === 0) {
      related += '<div style="font-size:12px;color:var(--text-dim);font-style:italic">Nenhuma subclasse</div>';
    } else {
      related += subs.map(s =>
        '<div class="related-row"><span class="code sub-code-sub">' + esc(s.codigo) + '</span><span class="related-title">' + esc(s.titulo) + '</span></div>'
      ).join('');
    }
    related += '</div>';
  } else {
    const cls = CLASS_MAP[item.classe_codigo];
    const siblings = (SUBS_BY_CLASS[item.classe_codigo] || []).length;
    related = '<div class="detail-section"><div class="detail-label">Classe Pai</div>';
    if (cls) {
      related += '<div class="related-row"><span class="code sub-code-cls">' + esc(cls.codigo) + '</span><span class="related-title">' + esc(cls.titulo) + '</span><span class="sub-label">(' + siblings + ' subclasses)</span></div>';
    }
    related += '</div>';
  }

  // Embedding
  const embed = '<div class="detail-section detail-full"><div class="detail-label">Texto de Embedding</div><div class="detail-text">' + esc(item.texto_embedding) + '</div></div>';

  // Tokens
  const toks = '<div class="detail-section detail-full"><div class="detail-label">Tokens (' + (item.tokens ? item.tokens.length : 0) + ')</div><div class="tokens-wrap">' +
    (item.tokens || []).map(t => '<span class="token">' + esc(t) + '</span>').join('') +
    '</div></div>';

  return '<div class="detail-card">' + hier + related + embed + toks + '</div>';
}

function toggleExpand(tr) {
  const chevron = tr.querySelector('.chevron');
  const existing = tr.nextElementSibling;
  if (existing && existing.classList.contains('sub-rows')) {
    existing.remove();
    if (chevron) chevron.classList.remove('open');
    return;
  }
  if (chevron) chevron.classList.add('open');

  const codigo = tr.dataset.codigo;
  const type = tr.dataset.type;
  const item = type === 'class' ? CLASS_MAP[codigo] : SUBCLASS_MAP[codigo];

  const expandRow = document.createElement('tr');
  expandRow.className = 'sub-rows';
  expandRow.innerHTML = '<td colspan="2" style="padding:0">' +
    (item ? buildDetailCard(item, type) : '<div style="padding:16px;color:var(--text-dim)">Item não encontrado</div>') +
    '</td>';
  tr.after(expandRow);
}

let currentTab = 'all';
let currentQuery = '';
let debounceTimer = null;

function highlight(text, query) {
  if (!query || !text) return text || '';
  const str = String(text);
  const lower = str.toLowerCase();
  const q = query.toLowerCase();
  let result = '';
  let i = 0;
  let idx;
  while ((idx = lower.indexOf(q, i)) !== -1) {
    result += str.slice(i, idx) + '<mark>' + str.slice(idx, idx + q.length) + '</mark>';
    i = idx + q.length;
  }
  return result + str.slice(i);
}

function normalizeCode(str) {
  return str ? str.replace(/[^a-z0-9]/gi, '').toLowerCase() : '';
}

function matches(item, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const qNorm = normalizeCode(q);

  // Normalized code match (handles e.g. "85.99-6-03" matching "8599-6/03")
  if (qNorm.length >= 3) {
    const codeNorm = normalizeCode(item.codigo || '');
    if (codeNorm.includes(qNorm)) return true;
  }

  return (
    (item.codigo && item.codigo.toLowerCase().includes(q)) ||
    (item.titulo && item.titulo.toLowerCase().includes(q)) ||
    (item.secao_descricao && item.secao_descricao.toLowerCase().includes(q)) ||
    (item.divisao_descricao && item.divisao_descricao.toLowerCase().includes(q)) ||
    (item.grupo_descricao && item.grupo_descricao.toLowerCase().includes(q)) ||
    (item.classe_descricao && item.classe_descricao.toLowerCase().includes(q)) ||
    (item.subclasse_descricao && item.subclasse_descricao.toLowerCase().includes(q))
  );
}

function renderClasses(data, query) {
  if (data.length === 0) return renderEmpty(query);

  const rows = data.slice(0, MAX_DISPLAY).map(item => \`
    <tr class="expandable" data-type="class" data-rel="\${item.codigo}" data-codigo="\${item.codigo}" onclick="toggleExpand(this)">
      <td><span class="chevron">▶</span> <span class="code">\${highlight(item.codigo, query)}</span></td>
      <td>
        <div class="titulo">\${highlight(item.titulo, query)}</div>
        <div class="breadcrumb">
          <span>\${highlight(item.secao_descricao, query)}</span>
          <span>\${highlight(item.divisao_descricao, query)}</span>
          <span>\${highlight(item.grupo_descricao, query)}</span>
        </div>
      </td>
    </tr>
  \`).join('');

  return \`
    <table>
      <thead>
        <tr>
          <th style="width:140px">Código</th>
          <th>Classe / Hierarquia</th>
        </tr>
      </thead>
      <tbody>\${rows}</tbody>
    </table>
  \`;
}

function renderSubclasses(data, query) {
  if (data.length === 0) return renderEmpty(query);

  const rows = data.slice(0, MAX_DISPLAY).map(item => \`
    <tr class="expandable" data-type="subclass" data-rel="\${item.classe_codigo}" data-codigo="\${item.codigo}" onclick="toggleExpand(this)">
      <td><span class="chevron">▶</span> <span class="code">\${highlight(item.codigo, query)}</span></td>
      <td>
        <div class="titulo">\${highlight(item.titulo, query)}</div>
        <div class="breadcrumb">
          <span>\${highlight(item.secao_descricao, query)}</span>
          <span>\${highlight(item.divisao_descricao, query)}</span>
          <span>\${highlight(item.grupo_descricao, query)}</span>
          <span>\${highlight(item.classe_descricao, query)}</span>
        </div>
      </td>
    </tr>
  \`).join('');

  return \`
    <table>
      <thead>
        <tr>
          <th style="width:140px">Código</th>
          <th>Subclasse / Hierarquia</th>
        </tr>
      </thead>
      <tbody>\${rows}</tbody>
    </table>
  \`;
}

function renderAll(data, query) {
  if (data.length === 0) return renderEmpty(query);

  const rows = data.slice(0, MAX_DISPLAY).map(item => {
    const isSubclass = !!item.subclasse_codigo;
    const dataType = isSubclass ? 'subclass' : 'class';
    const relKey = isSubclass ? item.classe_codigo : item.codigo;
    const badge = isSubclass
      ? '<span class="badge badge-subclasse">subclasse</span>'
      : '<span class="badge badge-classe">classe</span>';
    const breadcrumb = isSubclass
      ? \`<span>\${highlight(item.secao_descricao, query)}</span><span>\${highlight(item.divisao_descricao, query)}</span><span>\${highlight(item.grupo_descricao, query)}</span><span>\${highlight(item.classe_descricao, query)}</span>\`
      : \`<span>\${highlight(item.secao_descricao, query)}</span><span>\${highlight(item.divisao_descricao, query)}</span><span>\${highlight(item.grupo_descricao, query)}</span>\`;
    return \`
      <tr class="expandable" data-type="\${dataType}" data-rel="\${relKey}" data-codigo="\${item.codigo}" onclick="toggleExpand(this)">
        <td><span class="chevron">▶</span> <span class="code">\${highlight(item.codigo, query)}</span></td>
        <td>
          <div class="titulo">\${highlight(item.titulo, query)} \${badge}</div>
          <div class="breadcrumb">\${breadcrumb}</div>
        </td>
      </tr>
    \`;
  }).join('');

  return \`
    <table>
      <thead>
        <tr>
          <th style="width:140px">Código</th>
          <th>Denominação / Hierarquia</th>
        </tr>
      </thead>
      <tbody>\${rows}</tbody>
    </table>
  \`;
}

function renderEmpty(query) {
  return \`
    <div class="empty">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
      </svg>
      Nenhum resultado para <strong>"\${query}"</strong>
    </div>
  \`;
}

function render() {
  const data = currentTab === 'all'
    ? [...CLASSES, ...SUBCLASSES]
    : currentTab === 'classes' ? CLASSES : SUBCLASSES;
  const query = currentQuery.trim();
  const filtered = query ? data.filter(item => matches(item, query)) : data;
  const total = filtered.length;

  const bar = document.getElementById('result-bar');
  const stat = document.getElementById('result-stat');

  if (!query) {
    bar.textContent = \`Mostrando todos os \${total} registros\`;
    stat.innerHTML = '';
  } else {
    const showing = Math.min(total, MAX_DISPLAY);
    bar.textContent = total === 0
      ? 'Nenhum resultado'
      : showing < total
        ? \`Mostrando \${showing} de \${total} resultados para "\${query}"\`
        : \`\${total} resultado\${total !== 1 ? 's' : ''} para "\${query}"\`;
    stat.innerHTML = \`Resultados: <strong>\${total}</strong>\`;
  }

  document.getElementById('content').innerHTML =
    currentTab === 'all'
      ? renderAll(filtered, query)
      : currentTab === 'classes'
        ? renderClasses(filtered, query)
        : renderSubclasses(filtered, query);
}

// Events
document.getElementById('search').addEventListener('input', e => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentQuery = e.target.value;
    render();
  }, 150);
});

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    render();
  });
});

// Initial render
render();
</script>
</body>
</html>`;

fs.mkdirSync(WEB_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, html, 'utf8');

console.log(`✅ Web viewer generated → ${OUT_FILE}`);

// Open in browser
try {
    execSync(`open "${OUT_FILE}"`);
    console.log('🌐 Opening in browser...');
} catch (e) {
    console.log(`Open manually: ${OUT_FILE}`);
}
