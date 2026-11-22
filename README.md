Cruzadinha - Arquitetura Computacional

Projeto minimal de cruzadinha (HTML/CSS/JS puros) para treinar termos básicos de arquitetura computacional.

Como usar
- Abra `index.html` diretamente no navegador (funciona no GitHub Pages).
- A interface está em português do Brasil.

Arquivos
- index.html — aplicação principal (na raiz)
- style.css — estilos
- script.js — lógica do jogo: gera o tabuleiro a partir de `dados.js` e monta a interface
- dados.js — lista das palavras (MAIÚSCULAS, sem acentos, sem espaços) e pistas
- validar.js — script para rodar localmente com Node para validar `dados.js` e tentar montar o tabuleiro

Requisitos do sistema
- Navegador moderno (Chrome, Firefox, Edge) ou GitHub Pages
- Node.js (opcional) para rodar `node validar.js`

Notas técnicas
- O gerador usa um algoritmo guloso que tenta cruzar palavras por letras coincidentes.
- O arquivo `dados.js` contém as 16 palavras pedidas e pistas curtas em PT-BR.
