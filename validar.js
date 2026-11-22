#!/usr/bin/env node
// validar.js - valida o formato de dados.js localmente e tenta gerar um tabuleiro
const fs = require('fs');
const path = require('path');

const dadosPath = path.join(__dirname,'dados.js');
if(!fs.existsSync(dadosPath)){ console.error('dados.js não encontrado'); process.exit(2) }
const content = fs.readFileSync(dadosPath,'utf8');

// extrai a variável window.DADOS_CRUZADINHA de forma simples
const match = content.match(/window\.DADOS_CRUZADINHA\s*=\s*(\[([\s\S]*)\]);/);
if(!match){ console.error('Formato inesperado em dados.js'); process.exit(2) }
let arr;
try{
  arr = eval('(' + match[1] + ')');
}catch(e){ console.error('Não foi possível avaliar dados.js:',e.message); process.exit(2) }

if(!Array.isArray(arr)){ console.error('dados.js não contém um array'); process.exit(2) }

// checa regras básicas
let ok=true;
arr.forEach(it=>{
  if(!it.word || !it.clue){ console.error('Entrada inválida:',it); ok=false }
  // word must be uppercase letters A-Z
  if(!/^[A-Z]+$/.test(it.word)){
    console.error('Palavra deve ser MAIÚSCULA sem acentos nem espaços:', it.word); ok=false }
  // clue cannot contain the answer or parts: quick check
  const lowClue = it.clue.toUpperCase();
  if(lowClue.includes(it.word)){
    console.error('A pista não pode conter a resposta:', it.word); ok=false }
});
if(!ok) process.exit(2);

// tenta correr o gerador (reutiliza uma versão do algoritmo do browser)
function tryPlace(words){
  const GRID_SIZE=15; const EMPTY=null;
  const grid = Array.from({length:GRID_SIZE},()=>Array.from({length:GRID_SIZE},()=>EMPTY));
  const placements = [];
  function fitsAt(word,r,c,dir){
    const L=word.length; if(dir==='across'){ if(c+L>GRID_SIZE) return false; for(let i=0;i<L;i++){ const ch=grid[r][c+i]; if(ch!==EMPTY && ch!==word[i]) return false } return true }
    else{ if(r+L>GRID_SIZE) return false; for(let i=0;i<L;i++){ const ch=grid[r+i][c]; if(ch!==EMPTY && ch!==word[i]) return false } return true }
  }
  function setWord(word,r,c,dir){ const L=word.length; if(dir==='across'){ for(let i=0;i<L;i++) grid[r][c+i]=word[i] } else{ for(let i=0;i<L;i++) grid[r+i][c]=word[i] } placements.push({word,r,c,dir}) }

  const first=words[0]; const r0=Math.floor(GRID_SIZE/2); const c0=Math.max(0,Math.floor((GRID_SIZE-first.length)/2)); setWord(first,r0,c0,'across');
  for(let k=1;k<words.length;k++){ const w=words[k]; let placed=false;
    for(let i=0;i<w.length && !placed;i++){ const ch=w[i];
      for(let r=0;r<GRID_SIZE && !placed;r++) for(let c=0;c<GRID_SIZE && !placed;c++){
        if(grid[r][c]===ch){ const sc=c-i; if(sc>=0 && fitsAt(w,r,sc,'across')){ setWord(w,r,sc,'across'); placed=true; break }
          const sr=r-i; if(sr>=0 && fitsAt(w,sr,c,'down')){ setWord(w,sr,c,'down'); placed=true; break }
        }
      }
    }
    if(!placed){ outer: for(let r=0;r<GRID_SIZE && !placed;r++) for(let c=0;c<GRID_SIZE && !placed;c++){ if(fitsAt(w,r,c,'across')){ setWord(w,r,c,'across'); placed=true; break outer } if(fitsAt(w,r,c,'down')){ setWord(w,r,c,'down'); placed=true; break outer } } }
  }
  return {grid,placements};
}

const words = arr.map(a=>a.word);
const out = tryPlace(words);
console.log('Palavras solicitadas:',words.length);
console.log('Colocadas:', out.placements.length);
if(out.placements.length<12){ console.error('Aviso: menos de 12 palavras foram colocadas pelo gerador.'); process.exit(1) }
console.log('OK: validar.js terminou (colocadas >= 12).');
process.exit(0);
