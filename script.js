// script.js - gera o tabuleiro a partir de window.DADOS_CRUZADINHA
// O tabuleiro usa o LAYOUT fixo de dados.js (window.LAYOUT_CRUZADINHA)
(function(){
  const WORDS = window.DADOS_CRUZADINHA.map(w=>({id:w.id,word:w.word,clue:w.clue}));
  const GRID_SIZE = 14; // quadrado (o layout ocupa 13 x 14)
  const EMPTY = null;

  // grid: rows x cols
  function createGrid(n){
    const g = Array.from({length:n},()=>Array.from({length:n},()=>EMPTY));
    return g;
  }

  // monta a grade a partir do LAYOUT fixo definido em dados.js
  function montarLayout(){
    const grid = createGrid(GRID_SIZE);
    const placements = [];
    for(const [word,row,col,dir] of window.LAYOUT_CRUZADINHA){
      for(let i=0;i<word.length;i++){
        if(dir==='across') grid[row][col+i] = word[i];
        else grid[row+i][col] = word[i];
      }
      placements.push({word,row,col,dir});
    }
    return {grid,placements};
  }

  const result = montarLayout();
  const grid = result.grid;
  const placements = result.placements; // array of {word, row, col, dir}

  // Build UI
  const board = document.getElementById('board');
  const n = GRID_SIZE;
  board.style.gridTemplateColumns = `repeat(${n}, var(--tam-casa))`;

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
        // accessibility: identify cell position
        input.setAttribute('aria-label', `linha ${r+1}, coluna ${c+1}`);
        input.dataset.baseAria = `linha ${r+1}, coluna ${c+1}`;
        input.title = `linha ${r+1}, coluna ${c+1}`;
        input.addEventListener('input', onInput);
        input.addEventListener('keydown', onKeyDown);
        input.addEventListener('focus', onFocus);
        cell.appendChild(input);
        inputs[`${r},${c}`]=input;
      }
      board.appendChild(cell);
    }
  }

  // create contour element for active word highlight
  const boardWrap = document.getElementById('board-wrap');
  const contour = document.createElement('div'); contour.className='contorno-palavra'; boardWrap.appendChild(contour);

  // sizing: compute --tam-casa to fit container without horizontal scroll
  function updateCellSize(){
    const gap = 4; // matches CSS gap
    const wrapStyles = getComputedStyle(boardWrap);
    const padLeft = parseFloat(wrapStyles.paddingLeft)||0;
    const padRight = parseFloat(wrapStyles.paddingRight)||0;
    const available = boardWrap.clientWidth - padLeft - padRight - (n-1)*gap - 4; // small safety
    let tam = Math.floor(available / n);
    if(tam > 44) tam = 44;
    if(tam < 20) tam = 20;
    board.style.setProperty('--tam-casa', `${tam}px`);
    board.style.gridTemplateColumns = `repeat(${n}, ${tam}px)`;
    // update contour position if active
    updateContour();
  }

  // map cells to placements for quick lookup
  const placementsByCell = {};
  function addCellPlacement(pr){
    const p = pr.placed || pr; // support both shapes
    const L = p.word.length;
    if(p.dir==='across'){
      for(let i=0;i<L;i++){ const key=`${p.row},${p.col+i}`; placementsByCell[key]=placementsByCell[key]||[]; placementsByCell[key].push(p); }
    } else {
      for(let i=0;i<L;i++){ const key=`${p.row+i},${p.col}`; placementsByCell[key]=placementsByCell[key]||[]; placementsByCell[key].push(p); }
    }
  }
  placements.forEach(p=>addCellPlacement(p));

  let activeDirection = 'across';
  let activePlacement = null; // currently active word
  let lastFocusedKey = null;

  function getPlacementForCellDir(r,c,dir){
    const key = `${r},${c}`; const arr = placementsByCell[key]||[];
    for(const p of arr) if(p.dir===dir) return p;
    return null;
  }

  function onFocus(e){
    const el = e.target; const r=+el.dataset.r, c=+el.dataset.c;
    // marca a casa focada (destaque ciano)
    document.querySelectorAll('.casa-foco').forEach(x=>x.classList.remove('casa-foco'));
    el.parentElement.classList.add('casa-foco');
    el.select(); // ao clicar numa casa preenchida, a próxima letra substitui a atual
    const key = `${r},${c}`; const arr = placementsByCell[key]||[];
    // Determine active direction and placement following rules:
    if(arr.length===0){ activePlacement=null; updateContour(); lastFocusedKey=key; return }
    if(arr.length===1){ activeDirection = arr[0].dir; activePlacement = arr[0]; setActivePlacement(activePlacement); lastFocusedKey=key; return }
    // crossing
    if(lastFocusedKey === key){ // toggle direction
      activeDirection = (activeDirection==='across') ? 'down' : 'across';
    } else {
      // keep current if available here, else choose first
      if(!arr.some(p=>p.dir===activeDirection)) activeDirection = arr[0].dir;
    }
    const p = arr.find(p=>p.dir===activeDirection) || arr[0];
    activePlacement = p; setActivePlacement(activePlacement);
    lastFocusedKey = key;
  }

  function setActivePlacement(p){
    // remove old highlights
    document.querySelectorAll('.palavra-ativa').forEach(el=>el.classList.remove('palavra-ativa'));
    document.querySelectorAll('.pista-ativa').forEach(li=>li.classList.remove('pista-ativa'));
    if(!p){ activePlacement=null; updateContour(); return }
    activePlacement = p;
    // add class to cells of p
    const L = p.word.length;
    for(let i=0;i<L;i++){
      const key = p.dir==='across' ? `${p.row},${p.col+i}` : `${p.row+i},${p.col}`;
      const input = inputs[key]; if(!input) continue; input.parentElement.classList.add('palavra-ativa');
    }
    // highlight corresponding clue li(s)
    const num = numbers[p.row][p.col] || 0; const selector = `[data-row="${p.row}"][data-col="${p.col}"][data-dir="${p.dir}"]`;
    document.querySelectorAll(selector).forEach(el=>el.classList.add('pista-ativa'));
    updateContour();
  }

  function updateContour(){
    if(!activePlacement){ contour.style.display='none'; return }
    // find first and last cell elements
    const p = activePlacement; const L = p.word.length;
    const firstKey = p.dir==='across' ? `${p.row},${p.col}` : `${p.row},${p.col}`;
    const lastKey = p.dir==='across' ? `${p.row},${p.col+L-1}` : `${p.row+L-1},${p.col}`;
    const firstInput = inputs[firstKey]; const lastInput = inputs[lastKey];
    if(!firstInput || !lastInput){ contour.style.display='none'; return }
    const wrapRect = boardWrap.getBoundingClientRect(); const bx = boardWrap.clientLeft, by = boardWrap.clientTop;
    const fRect = firstInput.parentElement.getBoundingClientRect();
    const lRect = lastInput.parentElement.getBoundingClientRect();
    const left = Math.min(fRect.left, lRect.left) - wrapRect.left - bx - 3 + board.scrollLeft;
    const top = Math.min(fRect.top, lRect.top) - wrapRect.top - by - 3 + board.scrollTop;
    const right = Math.max(fRect.right, lRect.right) - wrapRect.left - bx + 3 + board.scrollLeft;
    const bottom = Math.max(fRect.bottom, lRect.bottom) - wrapRect.top - by + 3 + board.scrollTop;
    contour.style.display='block';
    contour.style.left = `${left}px`; contour.style.top = `${top}px`;
    contour.style.width = `${Math.max(24, right-left)}px`;
    contour.style.height = `${Math.max(24, bottom-top)}px`;
  }

  function focusNextInDirection(r,c,dir){
    const p = getPlacementForCellDir(r,c,dir) || (dir==='across' ? getPlacementForCellDir(r,c,'down') : getPlacementForCellDir(r,c,'across'));
    if(!p) return false;
    if(p.dir==='across'){
      const idx = c - p.col; const next = idx+1;
      if(next < p.word.length){
        // find next editable (skip readonly cells)
        for(let i=next;i<p.word.length;i++){ const key = `${p.row},${p.col+i}`; const inp = inputs[key]; if(inp){ if(!inp.readOnly) { inp.focus(); return true } else continue } }
        // if none editable, focus last cell
        const key = `${p.row},${p.col+p.word.length-1}`; if(inputs[key]){ inputs[key].focus(); return true }
      }
    } else {
      const idx = r - p.row; const next = idx+1;
      if(next < p.word.length){
        for(let i=next;i<p.word.length;i++){ const key = `${p.row+i},${p.col}`; const inp = inputs[key]; if(inp){ if(!inp.readOnly){ inp.focus(); return true } else continue } }
        const key = `${p.row+p.word.length-1},${p.col}`; if(inputs[key]){ inputs[key].focus(); return true }
      }
    }
    return false;
  }

  function focusPrevInDirection(r,c,dir){
    const p = getPlacementForCellDir(r,c,dir) || (dir==='across' ? getPlacementForCellDir(r,c,'down') : getPlacementForCellDir(r,c,'across'));
    if(!p) return false;
    if(p.dir==='across'){
      const idx = c - p.col; const prev = idx-1;
      if(prev >= 0){
        for(let i=prev;i>=0;i--){ const key=`${p.row},${p.col+i}`; const inp = inputs[key]; if(inp){ if(!inp.readOnly){ inp.focus(); return true } else { inp.focus(); return true } } }
      }
    } else {
      const idx = r - p.row; const prev = idx-1;
      if(prev >= 0){
        for(let i=prev;i>=0;i--){ const key=`${p.row+i},${p.col}`; const inp = inputs[key]; if(inp){ if(!inp.readOnly){ inp.focus(); return true } else { inp.focus(); return true } } }
      }
    }
    return false;
  }

  function onInput(e){
    const el = e.target; let v = el.value.toUpperCase();
    v = v.replace(/[^A-Z]/g,'');
    el.value = v;
    // when user edits a cell, remove any previous evaluation color/state on that cell
    const parent = el.parentElement;
    parent.classList.remove('casa-verde','casa-amarela','casa-vermelha');
    // remove aria-label status suffix if present
    if(el.dataset.baseAria) el.setAttribute('aria-label', el.dataset.baseAria);
    else el.removeAttribute('aria-label');
    const r = +el.dataset.r, c = +el.dataset.c;
    // after typing, move forward along activeDirection
    if(v){
      if(!focusNextInDirection(r,c,activeDirection)){
        // fallback: try the other direction
        const other = activeDirection==='across' ? 'down' : 'across';
        focusNextInDirection(r,c,other);
      }
    }
  }

  function onKeyDown(e){
    const el = e.target; const r=+el.dataset.r,c=+el.dataset.c;
    if(e.key==='Backspace'){
      if(el.value){ return } // just delete (browser will clear)
      // move to previous cell in active direction and clear it
      let moved = focusPrevInDirection(r,c,activeDirection);
      if(!moved){ const other = activeDirection==='across' ? 'down' : 'across'; moved = focusPrevInDirection(r,c,other); }
      if(moved){ const cur = document.activeElement; if(cur && cur.tagName==='INPUT'){ cur.value=''; const parent=cur.parentElement; parent.classList.remove('casa-verde','casa-amarela','casa-vermelha'); } }
    } else if(e.key==='ArrowLeft'){
      // move physically left if exists
      e.preventDefault();
      const dest = findNeighborCell(r,c,0,-1);
      if(dest){ focusCell(dest.r,dest.c); activeDirection='across'; }
    } else if(e.key==='ArrowRight'){
      e.preventDefault();
      const dest = findNeighborCell(r,c,0,1);
      if(dest){ focusCell(dest.r,dest.c); activeDirection='across'; }
    } else if(e.key==='ArrowUp'){
      e.preventDefault();
      const dest = findNeighborCell(r,c,-1,0);
      if(dest){ focusCell(dest.r,dest.c); activeDirection='down'; }
    } else if(e.key==='ArrowDown'){
      e.preventDefault();
      const dest = findNeighborCell(r,c,1,0);
      if(dest){ focusCell(dest.r,dest.c); activeDirection='down'; }
    }
    else if(e.key==='Enter' || e.key===' '){
      // toggle direction on crossing
      const key = `${r},${c}`; const arr = placementsByCell[key]||[];
      if(arr.length>1){ e.preventDefault(); activeDirection = (activeDirection==='across')?'down':'across'; const p = arr.find(p=>p.dir===activeDirection)||arr[0]; setActivePlacement(p); }
    }
  }

  // find physical neighbor (dr,dc) ignoring empty cells
  function findNeighborCell(r,c,dr,dc){
    const nr = r+dr; const nc = c+dc;
    const key = `${nr},${nc}`; if(inputs[key]) return {r:nr,c:nc};
    // search outward until boundary
    let steps = 1;
    while(true){ const rr = r + dr*steps; const cc = c + dc*steps; if(rr<0||cc<0||rr>=n||cc>=n) break; const k = `${rr},${cc}`; if(inputs[k]) return {r:rr,c:cc}; steps++; }
    return null;
  }

  function focusCell(r,c){
    const key = `${r},${c}`; const inp = inputs[key]; if(!inp) return false; inp.focus();
    // set active direction based on available placements in that cell
    const arr = placementsByCell[key]||[];
    if(arr.length===1){ activeDirection = arr[0].dir; activePlacement = arr[0]; setActivePlacement(activePlacement); }
    else if(arr.length>1){ if(arr.some(p=>p.dir===activeDirection)) activePlacement = arr.find(p=>p.dir===activeDirection); else activePlacement = arr[0]; setActivePlacement(activePlacement); }
    else { activePlacement=null; updateContour(); }
    // mark focused cell
    document.querySelectorAll('.casa-foco').forEach(el=>el.classList.remove('casa-foco'));
    inp.parentElement.classList.add('casa-foco');
    return true;
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
    const li=document.createElement('li'); li.id = `across-${it.num}`; li.dataset.row = it.placed.row; li.dataset.col = it.placed.col; li.dataset.dir = 'across'; li.innerHTML = `<span class="clue-num">${it.num}.</span> ${it.clue}<span class="status"></span>`; li.addEventListener('click', onClueClick); acrossOl.appendChild(li);
    // also append a copy to board lists if present
    const boardAcross = document.getElementById('across-board');
    if(boardAcross){ const c = li.cloneNode(true); c.removeAttribute('id'); c.addEventListener('click', onClueClick); boardAcross.appendChild(c); }
  });
  downList.forEach(it=>{
    const li=document.createElement('li'); li.id = `down-${it.num}`; li.dataset.row = it.placed.row; li.dataset.col = it.placed.col; li.dataset.dir = 'down'; li.innerHTML = `<span class="clue-num">${it.num}.</span> ${it.clue}<span class="status"></span>`; li.addEventListener('click', onClueClick); downOl.appendChild(li);
    const boardDown = document.getElementById('down-board');
    if(boardDown){ const c = li.cloneNode(true); c.removeAttribute('id'); c.addEventListener('click', onClueClick); boardDown.appendChild(c); }
  });

  function onClueClick(e){
    const li = e.currentTarget; const r=Number(li.dataset.row); const c=Number(li.dataset.col); const dir = li.dataset.dir;
    // set direction
    activeDirection = (dir==='across') ? 'across' : 'down';
    // find placement object at this coord and dir
    const p = placements.find(x=>x.row===r && x.col===c && x.dir===activeDirection);
    if(!p) return;
    setActivePlacement(p);
    // focus first empty cell in that word
    const L = p.word.length; let focused=false;
    for(let i=0;i<L;i++){
      const key = p.dir==='across' ? `${p.row},${p.col+i}` : `${p.row+i},${p.col}`;
      const inp = inputs[key]; if(!inp) continue; if(!inp.value){ inp.focus(); focused=true; break }
    }
    if(!focused){ // focus first cell
      const key = p.dir==='across' ? `${p.row},${p.col}` : `${p.row},${p.col}`; if(inputs[key]) inputs[key].focus();
    }
  }

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

  function createStatusSpan(li){
    const s = document.createElement('span'); s.className='status'; s.setAttribute('aria-hidden','true'); li.appendChild(s); return s;
  }

  // Game state: lives
  let lives = 3;
  const maxLives = 3;
  const statusEl = document.getElementById('status');
  const messageEl = document.getElementById('message');

  function setLivesDisplay(){
    const el = document.getElementById('lives');
    if(!el) return;
    // build label and hearts
    el.innerHTML = '';
    const label = document.createElement('div'); label.textContent='VIDAS'; label.style.fontFamily='"JetBrains Mono",monospace'; label.style.fontSize='12px'; label.style.color='var(--texto-suave)'; label.style.letterSpacing='.1em';
    const hearts = document.createElement('div'); hearts.style.display='flex'; hearts.style.gap='6px';
    for(let i=0;i<maxLives;i++){
      const span = document.createElement('span'); span.className='vida'; span.innerText='♥';
      if(i<lives) span.classList.add('ativa'); else span.classList.add('perdida');
      hearts.appendChild(span);
    }
    el.appendChild(label); el.appendChild(hearts);
    el.setAttribute('aria-label', `${lives} vidas restantes`);
  }
  setLivesDisplay();

  // remove evaluation classes from all cells
  function clearAllEvaluations(){
    document.querySelectorAll('.cell').forEach(el=>el.classList.remove('casa-verde','casa-amarela','casa-vermelha','palavra-ativa','casa-foco'));
    // clear aria labels on inputs (restore base if present)
    Object.values(inputs).forEach(inp=>{ if(inp.dataset.baseAria) inp.setAttribute('aria-label', inp.dataset.baseAria); else inp.removeAttribute('aria-label'); });
    // clear clue marks
    document.querySelectorAll('.clue-list li').forEach(li=>{ li.classList.remove('correct','wrong','pista-ativa'); const s = li.querySelector('.status'); if(s) s.textContent=''; });
  }

  // evaluate all words and cells using Wordle-like rules
  function checkAll(){
    // per-cell collected marks from all words
    const perCellMarks = {}; // key -> array of 'green'|'yellow'|'red'
    const wordInfo = []; // {p, typedAny, allGreen}

    // helper to get typed char at position i of placement p
    function typedAt(p,i){
      const key = p.dir==='across' ? `${p.row},${p.col+i}` : `${p.row+i},${p.col}`;
      return (inputs[key].value||'').toUpperCase();
    }

    // evaluate each placement
    for(const p of placements){
      const L = p.word.length;
      const expected = p.word.split('');
      const typed = Array.from({length:L},(_,i)=>typedAt(p,i));
      const marks = Array(L).fill(null);
      let typedAny = false;
      // counts of letters
      const counts = {};
      expected.forEach(ch=> counts[ch]=(counts[ch]||0)+1);
      // first pass: greens
      for(let i=0;i<L;i++){
        if(typed[i]) typedAny = true;
        if(typed[i] && typed[i]===expected[i]){ marks[i]='green'; counts[typed[i]]--; }
      }
      // second pass: yellows/reds for remaining typed positions
      for(let i=0;i<L;i++){
        if(!typed[i] || marks[i]) continue;
        const c = typed[i];
        if(counts[c] && counts[c]>0){ marks[i]='yellow'; counts[c]--; }
        else { marks[i]='red'; }
      }
      // collect into perCellMarks
      for(let i=0;i<L;i++){
        if(!typed[i]) continue; // only evaluate filled cells
        const key = p.dir==='across' ? `${p.row},${p.col+i}` : `${p.row+i},${p.col}`;
        perCellMarks[key]=perCellMarks[key]||[];
        perCellMarks[key].push(marks[i]);
      }
      wordInfo.push({p,typedAny,marks});
    }

    // determine final per-cell status combining crosses
    const finalStatus = {}; // key -> 'green'|'yellow'|'red'
    for(const key in perCellMarks){
      const arr = perCellMarks[key];
      if(arr.includes('green')) finalStatus[key]='green';
      else if(arr.includes('yellow')) finalStatus[key]='yellow';
      else finalStatus[key]='red';
    }

    // apply styles to cells
    clearAllEvaluations();
    let anyRed = false;
    for(const key in finalStatus){
      const st = finalStatus[key];
      const input = inputs[key]; if(!input) continue;
      const parent = input.parentElement;
      if(st==='green'){ parent.classList.add('casa-verde'); input.setAttribute('aria-label', `${input.value.toUpperCase()}, certa`); }
      else if(st==='yellow'){ parent.classList.add('casa-amarela'); input.setAttribute('aria-label', `${input.value.toUpperCase()}, na palavra em outra posição`); }
      else if(st==='red'){ parent.classList.add('casa-vermelha'); input.setAttribute('aria-label', `${input.value.toUpperCase()}, errada`); anyRed = true; }
      // store base aria for edit clearing
    }

    // update word correctness and clue list
    let correctCount = 0;
    for(const info of wordInfo){
      const p = info.p; const L = p.word.length;
      const num = numbers[p.row][p.col] || 0;
      const liId = (p.dir==='across' ? `across-${num}` : `down-${num}`);
      const li = document.getElementById(liId);
      if(!li) continue;
      if(!info.typedAny){ // untouched, clear marks
        li.classList.remove('correct','wrong');
        const s = li.querySelector('.status'); if(s) s.textContent='';
        continue;
      }
      // check all letters green
      let allGreen = true;
      for(let i=0;i<L;i++){
        const key = p.dir==='across' ? `${p.row},${p.col+i}` : `${p.row+i},${p.col}`;
        if(finalStatus[key] !== 'green'){ allGreen = false; break }
      }
      // update all matching clue elements (side and board copies)
      const selector = `[data-row="${p.row}"][data-col="${p.col}"][data-dir="${p.dir}"]`;
      document.querySelectorAll(selector).forEach(liEl=>{
        if(allGreen){ liEl.classList.add('correct'); liEl.classList.remove('wrong'); const s=liEl.querySelector('.status')||createStatusSpan(liEl); s.textContent='✔'; s.setAttribute('aria-hidden','false'); }
        else { liEl.classList.add('wrong'); liEl.classList.remove('correct'); const s=liEl.querySelector('.status')||createStatusSpan(liEl); s.textContent='✖'; s.setAttribute('aria-hidden','false'); }
      });
      if(allGreen) correctCount++;
    }

    document.getElementById('score').textContent = `${correctCount} de ${placements.length} palavras`;

    // lives handling: lose one life if any red present among typed cells
    if(anyRed){
      // only decrement if game not already over
      if(lives>0){ lives--; setLivesDisplay(); statusEl.textContent = `> Você perdeu 1 vida. Restam ${lives}.`; statusEl.classList.remove('vitoria','derrota'); }
    } else {
      statusEl.textContent = `> Nenhuma letra errada. Continue!`;
      statusEl.classList.remove('vitoria','derrota');
    }

    // check for end states
    if(correctCount===placements.length){
      // victory
      statusEl.textContent = `> Parabéns! Você completou todas as palavras corretamente.`;
      statusEl.classList.add('vitoria');
      document.getElementById('check').disabled = true;
      Object.values(inputs).forEach(i=>i.readOnly=true);
      setActivePlacement(null);
      return;
    }

    if(lives<=0){
      // game over
      statusEl.textContent = `> Fim de jogo: suas vidas acabaram. Clique em Reiniciar para tentar de novo.`;
      statusEl.classList.add('derrota');
      document.getElementById('check').disabled = true;
      Object.values(inputs).forEach(i=>i.readOnly=true);
      setActivePlacement(null);
      return;
    }
  }

  function restart(){
    Object.values(inputs).forEach(i=>{ i.value=''; i.readOnly=false; i.removeAttribute('aria-label'); delete i.dataset.baseAria; });
    clearAllEvaluations();
    lives = maxLives; setLivesDisplay();
    messageEl.textContent=''; statusEl.textContent='';
    document.getElementById('score').textContent = `0 de ${placements.length} palavras`;
    document.getElementById('check').disabled = false;
  }

  document.getElementById('check').addEventListener('click', checkAll);
  document.getElementById('restart').addEventListener('click', restart);
  // initial score
  document.getElementById('score').textContent = `0 de ${placements.length} palavras`;

  // dimensiona o tabuleiro SÓ AGORA: updateCellSize() usa variáveis declaradas acima
  window.addEventListener('resize', ()=>{ updateCellSize(); });
  updateCellSize();

  // expose some data for debugging
  window.__CRUZADINHA = {grid,placements,numbers,inputs};

})();