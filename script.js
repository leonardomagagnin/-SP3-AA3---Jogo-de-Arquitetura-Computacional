// script.js - gera o tabuleiro a partir de window.DADOS_CRUZADINHA
// Implementa colocação gulosa: tenta cruzar palavras em letras coincidentes
(function(){
  const WORDS = window.DADOS_CRUZADINHA.map(w=>({id:w.id,word:w.word,clue:w.clue}));
  const GRID_SIZE = 15; // quadrado
  const EMPTY = null;

  // grid: rows x cols
  function createGrid(n){
    const g = Array.from({length:n},()=>Array.from({length:n},()=>EMPTY));
    return g;
  }

  // placed words: {word, row, col, dir:'across'|'down'} where row/col are 0-based start
  function placeWords(words){
    const n = GRID_SIZE;
    const grid = createGrid(n);
    const placements = [];

    function fitsAt(word, r, c, dir){
      const L = word.length;
      if(dir==='across'){
        if(c+L>n) return false;
        for(let i=0;i<L;i++){
          const ch = grid[r][c+i];
          if(ch!==EMPTY && ch!==word[i]) return false;
          // check neighbor conflicts: left/right adjacent letters cannot create unintended two-letter words
        }
        return true;
      } else {
        if(r+L>n) return false;
        for(let i=0;i<L;i++){
          const ch = grid[r+i][c];
          if(ch!==EMPTY && ch!==word[i]) return false;
        }
        return true;
      }
    }

    function setWord(word, r, c, dir){
      const L = word.length;
      if(dir==='across'){
        for(let i=0;i<L;i++) grid[r][c+i]=word[i];
      } else {
        for(let i=0;i<L;i++) grid[r+i][c]=word[i];
      }
      placements.push({word, row:r, col:c, dir});
    }

    // place first word in center horizontally
    const first = words[0].word;
    const r0 = Math.floor(n/2);
    const c0 = Math.max(0, Math.floor((n-first.length)/2));
    setWord(first, r0, c0, 'across');

    // try placing others by finding a matching letter with already placed words
    for(let k=1;k<words.length;k++){
      const w = words[k].word;
      let placed=false;
      // try all letters in w
      for(let i=0;i<w.length && !placed;i++){
        const ch = w[i];
        // scan grid for same letter
        for(let r=0;r<n && !placed;r++){
          for(let c=0;c<n && !placed;c++){
            if(grid[r][c]===ch){
              // try place w crossing at this grid cell: either across (so grid cell is w[i]) meaning word across with start col = c-i
              const startC = c - i;
              if(startC>=0){
                if(fitsAt(w, r, startC, 'across')){
                  setWord(w, r, startC, 'across'); placed=true; break;
                }
              }
              // try down
              const startR = r - i;
              if(startR>=0){
                if(fitsAt(w, startR, c, 'down')){
                  setWord(w, startR, c, 'down'); placed=true; break;
                }
              }
            }
          }
        }
      }
      // if couldn't place by crossing, try to place anywhere free (scan positions)
      if(!placed){
        outer: for(let r=0;r<n && !placed;r++){
          for(let c=0;c<n && !placed;c++){
            if(fitsAt(w,r,c,'across')){ setWord(w,r,c,'across'); placed=true; break outer }
            if(fitsAt(w,r,c,'down')){ setWord(w,r,c,'down'); placed=true; break outer }
          }
        }
      }
    }

    return {grid,placements};
  }

  const result = placeWords(WORDS);
  const grid = result.grid;
  const placements = result.placements; // array of {word, row, col, dir}

  // Build UI
  const board = document.getElementById('board');
  const n = GRID_SIZE;
  board.style.gridTemplateColumns = `repeat(${n}, 44px)`;

  // build a cell map and numbering
  const cellInfo = Array.from({length:n},()=>Array.from({length:n},()=>({block:true})));
  for(let r=0;r<n;r++){
    for(let c=0;c<n;c++){
      const ch = grid[r][c];
      if(ch!==EMPTY){
        cellInfo[r][c].block=false;
        cellInfo[r][c].letter=ch;
      }
    }
  }

  // compute numbers: number a cell if it is the start of an across or down word
  let numbering=0;
  const numbers = Array.from({length:n},()=>Array.from({length:n},()=>0));
  for(let r=0;r<n;r++){
    for(let c=0;c<n;c++){
      if(cellInfo[r][c].block) continue;
      const isStartAcross = (c===0 || cellInfo[r][c-1].block) && (c+1<n && !cellInfo[r][c+1].block);
      const isStartDown = (r===0 || cellInfo[r-1][c].block) && (r+1<n && !cellInfo[r+1][c].block);
      if(isStartAcross || isStartDown){ numbering++; numbers[r][c]=numbering }
    }
  }

  // render board cells
  const inputs = {};
  for(let r=0;r<n;r++){
    for(let c=0;c<n;c++){
      const cell = document.createElement('div');
      cell.className = 'cell' + (cellInfo[r][c].block? ' block':'');
      if(!cellInfo[r][c].block){
        const num = numbers[r][c];
        if(num) {
          const span = document.createElement('span'); span.className='num'; span.textContent=num; cell.appendChild(span);
        }
        const input = document.createElement('input');
        input.maxLength=1; input.autocomplete='off'; input.spellcheck=false;
        input.dataset.r=r; input.dataset.c=c;
        input.addEventListener('input', onInput);
        input.addEventListener('keydown', onKeyDown);
        cell.appendChild(input);
        inputs[`${r},${c}`]=input;
      }
      board.appendChild(cell);
    }
  }

  function onInput(e){
    const el = e.target; let v = el.value.toUpperCase();
    v = v.replace(/[^A-Z]/g,'');
    el.value = v;
    // move focus forward
    if(v){
      const r = +el.dataset.r, c=+el.dataset.c;
      // try move to next cell in row then down
      for(let nc=c+1;nc<n;nc++){
        const key = `${r},${nc}`; if(inputs[key]){ inputs[key].focus(); return } }
      for(let nr=r+1;nr<n;nr++){
        const key = `${nr},${0}`; if(inputs[key]){ inputs[key].focus(); return } }
    }
  }
  function onKeyDown(e){
    const el = e.target; const r=+el.dataset.r,c=+el.dataset.c;
    if(e.key==='Backspace' && !el.value){
      // move left
      for(let nc=c-1;nc>=0;nc--){ const key=`${r},${nc}`; if(inputs[key]){ inputs[key].focus(); break } }
    }
  }

  // build clues lists from placements
  const acrossList = [];
  const downList = [];

  // map each placement to a number and collect clue text
  for(const p of placements){
    const r=p.row, c=p.col, dir=p.dir;
    // numbering at start
    const num = numbers[r][c]||0;
    const entry = {num, word:p.word, clue:WORDS.find(x=>x.word===p.word).clue, placed:p};
    if(dir==='across') acrossList.push(entry); else downList.push(entry);
  }

  // sort lists by number
  acrossList.sort((a,b)=>a.num-b.num);
  downList.sort((a,b)=>a.num-b.num);

  const acrossOl = document.getElementById('across');
  const downOl = document.getElementById('down');
  acrossList.forEach(it=>{
    const li=document.createElement('li'); li.id = `across-${it.num}`; li.innerHTML = `<strong>${it.num}.</strong> ${it.clue}`; acrossOl.appendChild(li);
  });
  downList.forEach(it=>{
    const li=document.createElement('li'); li.id = `down-${it.num}`; li.innerHTML = `<strong>${it.num}.</strong> ${it.clue}`; downOl.appendChild(li);
  });

  // helpers to read a placed word from inputs
  function readPlacedWord(p){
    const L = p.word.length; let s='';
    if(p.dir==='across'){
      for(let i=0;i<L;i++){ const key=`${p.row},${p.col+i}`; s += (inputs[key].value||' '); }
    } else {
      for(let i=0;i<L;i++){ const key=`${p.row+i},${p.col}`; s += (inputs[key].value||' '); }
    }
    return s;
  }

  function checkAll(){
    let correctCount=0; let total=placements.length;
    // clear classes
    document.querySelectorAll('.cell').forEach(el=>el.classList.remove('correct','wrong'));
    placements.forEach(p=>{
      const typed = readPlacedWord(p).replace(/ /g,'');
      const expected = p.word;
      const isCorrect = typed===expected;
      if(isCorrect) correctCount++;
      // mark cells
      if(p.dir==='across'){
        for(let i=0;i<p.word.length;i++){ const key=`${p.row},${p.col+i}`; const input=inputs[key]; if(input){ const parent=input.parentElement; parent.classList.add(isCorrect? 'correct':'wrong') } }
      } else {
        for(let i=0;i<p.word.length;i++){ const key=`${p.row+i},${p.col}`; const input=inputs[key]; if(input){ const parent=input.parentElement; parent.classList.add(isCorrect? 'correct':'wrong') } }
      }
    });
    document.getElementById('score').textContent = `${correctCount} de ${total} palavras`;
    const message = document.getElementById('message');
    if(correctCount===total){ message.innerHTML = `<strong>Parabéns!</strong> Você completou todas as palavras corretamente.`; }
    else { message.textContent = '' }
  }

  function restart(){
    Object.values(inputs).forEach(i=>i.value='');
    document.querySelectorAll('.cell').forEach(el=>el.classList.remove('correct','wrong'));
    document.getElementById('message').textContent='';
    document.getElementById('score').textContent = `0 de ${placements.length} palavras`;
  }

  document.getElementById('check').addEventListener('click', checkAll);
  document.getElementById('restart').addEventListener('click', restart);
  // initial score
  document.getElementById('score').textContent = `0 de ${placements.length} palavras`;

  // expose some data for debugging
  window.__CRUZADINHA = {grid,placements,numbers,inputs};

})();
