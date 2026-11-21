/* Lógica inicial da cruzadinha
 * Arquivo criado como esqueleto. A implementação completa será feita na Fase 1.
 * Este script carrega CONCEITOS e renderiza um tabuleiro definido em COORDS.
 */

// Exemplo de definição de palavras no tabuleiro. Cada item: {id, palavra, row, col, dir}
// dir: 'across' ou 'down'
const COORDS = [
  // Usaremos 12 palavras para a fase 1; coordenadas de exemplo (serão validadas)
  {id:'cpu', palavra: 'CPU', row:2, col:2, dir:'across'},
  {id:'ula', palavra: 'ULA', row:4, col:2, dir:'across'},
  {id:'uc', palavra: 'UC', row:6, col:2, dir:'across'},
  {id:'registradores', palavra: 'REGISTRADORES', row:2, col:6, dir:'down'},
  {id:'ram', palavra: 'RAM', row:8, col:2, dir:'across'},
  {id:'rom', palavra: 'ROM', row:10, col:2, dir:'across'},
  {id:'flash', palavra: 'FLASH', row:12, col:2, dir:'across'},
  {id:'cache', palavra: 'CACHE', row:4, col:6, dir:'down'},
  {id:'dma', palavra: 'DMA', row:6, col:6, dir:'down'},
  {id:'addressbus', palavra: 'ADDRESSBUS', row:8, col:6, dir:'down'},
  {id:'databus', palavra: 'DATABUS', row:2, col:10, dir:'down'},
  {id:'microcontrolador', palavra: 'MICROCONTROLADOR', row:2, col:14, dir:'down'}
];

// grid dimensions: compute from COORDS
function computeGrid(coords){
  let maxR=0,maxC=0;
  coords.forEach(w=>{
    if(w.dir==='across'){
      maxR = Math.max(maxR, w.row);
      maxC = Math.max(maxC, w.col + w.palavra.length -1);
    } else {
      maxR = Math.max(maxR, w.row + w.palavra.length -1);
      maxC = Math.max(maxC, w.col);
    }
  });
  return {rows: maxR+2, cols: maxC+2};
}

function buildEmptyGrid(rows,cols){
  const grid = [];
  for(let r=0;r<rows;r++){
    const row=[];
    for(let c=0;c<cols;c++) row.push(null);
    grid.push(row);
  }
  return grid;
}

function placeWords(grid, coords){
  coords.forEach(w=>{
    const word = w.palavra.toUpperCase();
    let r = w.row, c = w.col;
    for(let i=0;i<word.length;i++){
      if(!grid[r]) return; // safety
      const ch = word[i];
      if(!grid[r][c]) grid[r][c]={char:ch, cells:[]};
      // store reference
      grid[r][c].cells.push({wordId:w.id, index:i});
      if(w.dir==='across') c++; else r++;
    }
  });
}

function renderBoard(coords){
  const dims = computeGrid(coords);
  const grid = buildEmptyGrid(dims.rows,dims.cols);
  placeWords(grid, coords);

  const board = document.getElementById('board');
  board.innerHTML = '';
  const table = document.createElement('div');
  table.className = 'grid';
  for(let r=0;r<dims.rows;r++){
    const rowEl = document.createElement('div'); rowEl.className='row';
    for(let c=0;c<dims.cols;c++){
      const cell = document.createElement('div');
      if(!grid[r][c]){ cell.className='cell block'; }
      else { cell.className='cell';
        const input = document.createElement('input');
        input.maxLength = 1;
        input.dataset.row = r; input.dataset.col = c;
        input.addEventListener('input', (e)=>{ e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g,''); });
        cell.appendChild(input);
      }
      rowEl.appendChild(cell);
    }
    table.appendChild(rowEl);
  }
  board.appendChild(table);
}

document.addEventListener('DOMContentLoaded', ()=>{
  // render inicial do tabuleiro (coordenação e validação serão feitas posteriormente)
  renderBoard(COORDS);
  // preencher listas de pistas a partir de COORDS e CONCEITOS
  const across = document.getElementById('clues-across');
  const down = document.getElementById('clues-down');
  COORDS.forEach((w,idx)=>{
    const conceito = CONCEITOS.find(c=> c.id===w.id) || {};
    const li = document.createElement('li');
    li.textContent = conceito.pista || '';
    if(w.dir==='across') across.appendChild(li); else down.appendChild(li);
  });
  // contador
  const counter = document.getElementById('counter');
  counter.textContent = `${COORDS.length} de ${COORDS.length}`;
});
