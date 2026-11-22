#!/usr/bin/env node
// validar.js - valida dados.js (palavras, pistas e LAYOUT fixo do tabuleiro)
// Uso: node validar.js
const fs = require('fs');
const path = require('path');

const codigo = fs.readFileSync(path.join(__dirname, 'dados.js'), 'utf8');
const win = {};
new Function('window', codigo)(win);
const palavras = win.DADOS_CRUZADINHA;
const layout = win.LAYOUT_CRUZADINHA;

let erros = 0, avisos = 0;
const erro = (m) => { console.error('ERRO:  ' + m); erros++; };
const aviso = (m) => { console.warn('AVISO: ' + m); avisos++; };
const norm = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// ---------- 1) palavras e pistas ----------
// palavras que NÃO podem aparecer na pista (partes do nome ou da sigla por extenso)
const proibidas = {
  ULA: ['unidade', 'aritmetica'],
  UC: ['unidade', 'controle'],
  RAM: ['random', 'acesso aleatorio'],
  ROM: ['read only', 'somente leitura'],
  MEMORIADEMASSA: ['memoria', 'massa'],
  DATABUS: ['data', 'bus', 'barramento de dados'],
  ADDRESSBUS: ['address', 'bus', 'barramento de endereco'],
  DUALCORE: ['dual', 'core'],
  QUADCORE: ['quad', 'core']
};
palavras.forEach((p) => {
  if (!/^[A-Z]+$/.test(p.word)) erro(`${p.word}: use MAIÚSCULAS, sem acento e sem espaço`);
  const n = p.clue.trim().split(/\s+/).length;
  if (n > 15) erro(`${p.word}: pista com ${n} palavras (máximo 15)`);
  // siglas curtas (UC, RAM...) só contam como palavra inteira; as demais, em qualquer parte
  const contem = p.word.length <= 3
    ? new RegExp('\\b' + norm(p.word) + '\\b').test(norm(p.clue))
    : norm(p.clue).includes(norm(p.word));
  if (contem) erro(`${p.word}: a pista contém a resposta`);
  (proibidas[p.word] || []).forEach((t) => {
    if (norm(p.clue).includes(t)) aviso(`${p.word}: a pista contém "${t}" (parte do nome/sigla por extenso)`);
  });
});

// ---------- 2) layout ----------
const N = 14;
const grade = Array.from({ length: N }, () => Array(N).fill(null));
const colocadas = [];
layout.forEach(([w, r, c, d]) => {
  if (!palavras.some((p) => p.word === w)) erro(`${w}: está no layout mas não em DADOS_CRUZADINHA`);
  for (let i = 0; i < w.length; i++) {
    const rr = d === 'across' ? r : r + i, cc = d === 'across' ? c + i : c;
    if (rr >= N || cc >= N) { erro(`${w}: sai da grade ${N}x${N}`); return; }
    if (grade[rr][cc] && grade[rr][cc] !== w[i]) erro(`${w}: conflito de letra em (${rr},${cc})`);
    grade[rr][cc] = w[i];
  }
  colocadas.push({ w, r, c, d });
});
console.log(`Palavras no layout: ${colocadas.length} (mínimo 12)`);
if (colocadas.length < 12) erro('menos de 12 palavras no tabuleiro');

// toda sequência de 2+ letras tem que ser exatamente uma palavra do layout (sem palavras coladas)
const conj = new Set(colocadas.map((p) => `${p.d}|${p.r}|${p.c}|${p.w}`));
for (let r = 0; r < N; r++) {
  for (let c = 0; c < N;) {
    if (!grade[r][c]) { c++; continue; }
    const ini = c; let s = '';
    while (c < N && grade[r][c]) s += grade[r][c++];
    if (s.length > 1 && !conj.has(`across|${r}|${ini}|${s}`)) erro(`sequência horizontal inválida "${s}" na linha ${r}`);
  }
}
for (let c = 0; c < N; c++) {
  for (let r = 0; r < N;) {
    if (!grade[r][c]) { r++; continue; }
    const ini = r; let s = '';
    while (r < N && grade[r][c]) s += grade[r++][c];
    if (s.length > 1 && !conj.has(`down|${ini}|${c}|${s}`)) erro(`sequência vertical inválida "${s}" na coluna ${c}`);
  }
}

// cada palavra cruza com pelo menos outra
colocadas.forEach((p) => {
  let cruza = false;
  for (let i = 0; i < p.w.length; i++) {
    const rr = p.d === 'across' ? p.r : p.r + i, cc = p.d === 'across' ? p.c + i : p.c;
    const viz = p.d === 'across' ? [[rr - 1, cc], [rr + 1, cc]] : [[rr, cc - 1], [rr, cc + 1]];
    if (viz.some(([a, b]) => grade[a] && grade[a][b])) cruza = true;
  }
  if (!cruza) erro(`${p.w}: não cruza com nenhuma outra palavra`);
});

// tabuleiro conectado
const celulas = [];
grade.forEach((l, r) => l.forEach((v, c) => { if (v) celulas.push([r, c]); }));
const vis = new Set([celulas[0].join()]), pilha = [celulas[0]];
while (pilha.length) {
  const [r, c] = pilha.pop();
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => {
    const k = [r + a, c + b].join();
    if (grade[r + a] && grade[r + a][c + b] && !vis.has(k)) { vis.add(k); pilha.push([r + a, c + b]); }
  });
}
if (vis.size !== celulas.length) erro('o tabuleiro não está conectado');

console.log(grade.map((l) => l.map((v) => v || '.').join('')).join('\n'));
console.log(`\n${erros} erro(s), ${avisos} aviso(s).`);
process.exit(erros ? 1 : 0);