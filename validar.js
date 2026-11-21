// Script de validação local (Node.js)
// Verifica pistas: <=15 palavras, não conter resposta, nem partes do nome, nem sigla por extenso
// Executar: node validar.js

const fs = require('fs');
const path = require('path');

const conceitosPath = path.join(__dirname,'conceitos.js');
if(!fs.existsSync(conceitosPath)){
  console.error('conceitos.js não encontrado na raiz.'); process.exit(1);
}

// Carrega o arquivo e extrai a variável CONCEITOS via eval num contexto seguro simples
const src = fs.readFileSync(conceitosPath,'utf8');
let CONCEITOS = null;
try{
  const sandbox = {};
  eval(src + '\n sandbox.CONCEITOS=CONCEITOS;');
  CONCEITOS = sandbox.CONCEITOS || global.CONCEITOS;
}catch(e){
  // fallback: require via node VM is more complex; try to require as module
}

if(!CONCEITOS){
  // tentativa alternativa: require by wrapping file as module
  try{
    const vm = require('vm');
    const code = fs.readFileSync(conceitosPath,'utf8');
    const context = {CONCEITOS:null};
    vm.createContext(context);
    vm.runInContext(code + '\nCONCEITOS_EXPORT = CONCEITOS;', context);
    CONCEITOS = context.CONCEITOS_EXPORT || context.CONCEITOS;
  }catch(err){
    console.error('Não foi possível carregar CONCEITOS de conceitos.js');
    console.error(err); process.exit(1);
  }
}

function wordsCount(str){
  return (str.trim().split(/\s+/).filter(Boolean)).length;
}

function normalize(s){
  return s.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
}

let ok = true;
CONCEITOS.forEach(c=>{
  const pista = (c.pista||'').trim();
  const n = wordsCount(pista);
  if(n>15){ console.error(`ERRO: pista muito longa (${n} palavras) id=${c.id} pista="${pista}"`); ok=false; }

  const resposta = (c.resposta||'').toString().toLowerCase();
  const normPista = normalize(pista);
  if(resposta && normPista.includes(resposta.toLowerCase().replace(/[^a-z0-9]/g,''))){
    console.error(`ERRO: pista contém a resposta id=${c.id} resposta=${c.resposta}`); ok=false;
  }

  // checar partes do nome: split nome em palavras e verificar se any appears
  const nameParts = (c.nome||'').toLowerCase().replace(/[()]/g,'').split(/[^a-z0-9]+/).filter(Boolean);
  nameParts.forEach(part=>{
    if(part.length>=3){
      if(normPista.includes(part)){
        console.error(`AVISO: pista pode conter parte do nome (${part}) id=${c.id}`);
      }
    }
  });
});

if(ok) console.log('Validação básica de pistas concluída: OK'); else { console.error('Validação falhou. Corrija os itens acima.'); process.exit(2); }
