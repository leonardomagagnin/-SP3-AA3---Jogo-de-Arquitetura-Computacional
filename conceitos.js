// Dados dos 16 conceitos utilizados na cruzadinha e na batalha
// id: identificador estável
// nome: nome de exibição
// resposta: string para preencher na cruzadinha (SEM acentos, maiúscula, sem espaços)
// pista: pista curta para cruzadinha (<=15 palavras) - validada por validar.js
// ataque: texto do ataque usado no jogo de batalha (não revela a resposta)
// explicacao: explicação curta mostrada após cada rodada
// naoMisturar: lista opcional de ids que não devem aparecer como distratoras neste ataque

const CONCEITOS = [
  {id:'cpu', nome:'CPU (Unidade Central de Processamento)', resposta:'CPU', pista:'Parte central que executa e coordena as instruções.', ataque:'Operações e controle central pararam; é preciso quem execute as instruções.', explicacao:'CPU executa instruções e coordena unidades (ULA, UC, registradores).', naoMisturar:['ula','uc','registradores']},
  {id:'ula', nome:'ULA (Unidade Lógica e Aritmética)', resposta:'ULA', pista:'Parte da CPU que faz as contas e operações lógicas.', ataque:'Cálculos e comparações travaram; alguém deve realizar operações aritméticas rápidas.', explicacao:'ULA executa operações aritméticas e lógicas para o processador.', naoMisturar:['cpu']},
  {id:'uc', nome:'UC (Unidade de Controle)', resposta:'UC', pista:'Gera sinais que coordenam sequência e execução de instruções.', ataque:'Sinais de comando não sincronizam periféricos; precisa-se de um controlador de sequência.', explicacao:'UC gera sinais de controle e coordena fluxo de instruções.', naoMisturar:['cpu']},
  {id:'registradores', nome:'Registradores', resposta:'REGISTRADORES', pista:'Pequenos armazenamentos internos para operandos imediatos.', ataque:'Valores intermediários não estão disponíveis rapidamente para a ULA.', explicacao:'Registradores guardam operandos de acesso ultrarrápido.'},
  {id:'ram', nome:'RAM', resposta:'RAM', pista:'Memória de leitura e escrita descartada ao desligar.', ataque:'Dados temporários somem após reinício; precisa-se de memória de trabalho volátil.', explicacao:'RAM é volátil e usada para dados em execução.'},
  {id:'rom', nome:'ROM', resposta:'ROM', pista:'Armazena código ou dados que não mudam com frequência.', ataque:'Rotina de inicialização não foi encontrada no armazenamento fixo.', explicacao:'ROM é não volátil, usada para firmware e tabelas estáticas.'},
  {id:'eeprom', nome:'EEPROM', resposta:'EEPROM', pista:'Memória que pode ser regravada eletricamente em pequenas partes.', ataque:'Parâmetros persistentes precisam ser atualizados sem apagar todo o bloco.', explicacao:'EEPROM permite regravação elétrica por célula.'},
  {id:'flash', nome:'Flash', resposta:'FLASH', pista:'Memória não volátil normalmente apagada e gravada por blocos.', ataque:'Imagem de firmware grande precisa ser regravada por blocos.', explicacao:'Flash é similar à EEPROM, otimizada por blocos.'},
  {id:'cache', nome:'Cache', resposta:'CACHE', pista:'Armazena cópias de dados frequentemente acessados para acelerar.', ataque:'Atrasos repetidos indicam falta de camada rápida para dados quentes.', explicacao:'Cache reduz latência mantendo cópias de dados/instruções.'},
  {id:'memoria-de-massa', nome:'Memória de massa (Armazenamento)', resposta:'MEMORIADEMASSA', pista:'Armazenamento de grande capacidade e persistência.', ataque:'Precisa guardar grandes arquivos e logs de forma persistente.', explicacao:'Memória de massa oferece grande capacidade persistente (HD/SSD).'},
  {id:'dma', nome:'DMA', resposta:'DMA', pista:'Controlador que move blocos sem intervenção contínua da CPU.', ataque:'Transferências grandes bloqueiam a CPU; precisa-se de um controlador dedicado.', explicacao:'DMA realiza transferências com mínima supervisão da CPU.'},
  {id:'addressbus', nome:'Address Bus (Barramento de Endereço)', resposta:'ADDRESSBUS', pista:'Transporta endereços indicando onde ler ou escrever.', ataque:'Endereços incorretos impedem a localização dos dados na memória.', explicacao:'Address Bus carrega endereços entre CPU e memória.'},
  {id:'databus', nome:'Data Bus (Barramento de Dados)', resposta:'DATABUS', pista:'Carrega os próprios dados entre componentes do sistema.', ataque:'Dados não chegam ao destino; o barramento de dados pode estar falhando.', explicacao:'Data Bus transporta bits e valores entre módulos.'},
  {id:'microcontrolador', nome:'Microcontrolador', resposta:'MICROCONTROLADOR', pista:'Integra CPU, memória e periféricos em um único chip.', ataque:'Dispositivo embarcado precisa de solução com CPU, memória e I/O integrados.', explicacao:'Microcontrolador reúne CPU, memória e periféricos em um CI.'},
  {id:'dualcore', nome:'Dual Core', resposta:'DUALCORE', pista:'Processador com dois núcleos para trabalho paralelo.', ataque:'Tarefas paralelas precisam ser distribuídas entre dois núcleos.', explicacao:'Dual Core tem dois núcleos, ajudando em paralelismo.', naoMisturar:['cpu','ula','uc','registradores']},
  {id:'quadcore', nome:'Quad Core', resposta:'QUADCORE', pista:'Processador com quatro núcleos, para maior paralelismo.', ataque:'Alto paralelismo exigido; múltiplos núcleos facilitam o processamento.', explicacao:'Quad Core possui quatro núcleos; ganhos dependem do software.'}
];
