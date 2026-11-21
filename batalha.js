/* Lógica inicial da batalha - esqueleto
 * Implementação completa será feita na Fase 2
 */

let battleState = {
  playerLife: 100,
  botLife: 100,
  round: 0,
  deck: [], // ataques embaralhados
  used: []
};

function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}

function startBattle(){
  battleState.playerLife = 100; battleState.botLife=100; battleState.round=0;
  battleState.deck = shuffle(CONCEITOS.map(c=>c.id));
  battleState.used = [];
  renderBattle();
  nextAttack();
}

function renderBattle(){
  document.getElementById('player-life').value = battleState.playerLife;
  document.getElementById('bot-life').value = battleState.botLife;
  document.getElementById('player-life-val').textContent = battleState.playerLife;
  document.getElementById('bot-life-val').textContent = battleState.botLife;
  document.getElementById('round-info').textContent = `Rodada ${battleState.round}`;
}

function nextAttack(){
  // escolha próxima id do deck
  if(battleState.deck.length===0){ battleState.deck = shuffle(CONCEITOS.map(c=>c.id)); battleState.used = []; }
  const id = battleState.deck.pop();
  battleState.used.push(id);
  battleState.round++;
  const conceito = CONCEITOS.find(c=> c.id===id);
  document.getElementById('attack-area').textContent = conceito? conceito.ataque : '...';
  // gerar 4 cartas (1 correta + 3 distratoras) - implementação completa na Fase 2
  renderBattle();
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('restart-battle').addEventListener('click', ()=> startBattle());
  startBattle();
});
