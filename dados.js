// dados.js
// Layout FIXO do tabuleiro: [palavra, linha, coluna, direção] (linha/coluna começam em 0)
// Grade de 14 x 14. Validado com `node validar.js` (cruzamentos, sem palavras coladas).
window.LAYOUT_CRUZADINHA = [
  ["MEMORIADEMASSA", 6, 0, "across"],
  ["REGISTRADORES", 0, 4, "down"],
  ["DATABUS", 3, 13, "down"],
  ["DMA", 4, 6, "down"],
  ["FLASH", 12, 1, "across"],
  ["EEPROM", 10, 1, "across"],
  ["CACHE", 2, 8, "down"],
  ["CPU", 8, 11, "across"],
  ["RAM", 4, 0, "down"],
  ["ROM", 8, 6, "down"],
  ["UC", 2, 7, "across"],
  ["ULA", 4, 11, "across"]
];

// Lista de palavras (CASES = maiúsculas sem acento e sem espaço), pistas em PT-BR
// Cada item: { id, word, clue }
window.DADOS_CRUZADINHA = [
  { id: 1, word: "CPU", clue: "Componente que executa instruções e coordena operações do sistema." },
  { id: 2, word: "ULA", clue: "Parte da CPU que realiza cálculos e operações lógicas." },
  { id: 3, word: "UC", clue: "Módulo que controla a sequência de execução das instruções." },
  { id: 4, word: "REGISTRADORES", clue: "Pequenas áreas de armazenamento dentro da CPU para dados temporários." },
  { id: 5, word: "RAM", clue: "Memória volátil usada para guardar dados e instruções em execução." },
  { id: 6, word: "ROM", clue: "Memória não volátil que normalmente armazena código fixo de inicialização." },
  { id: 7, word: "EEPROM", clue: "Memória não volátil que pode ser regravada eletricamente, byte a byte." },
  { id: 8, word: "FLASH", clue: "Memória não volátil regravável em blocos, comum em dispositivos modernos." },
  { id: 9, word: "CACHE", clue: "Memória rápida entre a CPU e a principal para acelerar acessos repetidos." },
  { id:10, word: "MEMORIADEMASSA", clue: "Armazenamento persistente para arquivos e grande volume de dados." },
  { id:11, word: "DMA", clue: "Mecanismo que move dados diretamente entre dispositivos, sem ocupar a CPU." },
  { id:13, word: "DATABUS", clue: "Conjunto que transporta os bits entre componentes para leitura e escrita." }
];
