Cruzadinha - Arquitetura Computacional

Projeto minimal de cruzadinha (HTML/CSS/JS puros) para treinar termos básicos de arquitetura computacional.

Como usar

Abra index.html diretamente no navegador (funciona no GitHub Pages).
A interface está em português do Brasil.

Arquivos

index.html — aplicação principal (na raiz)
style.css — estilos
script.js — lógica do jogo: gera o tabuleiro a partir de dados.js e monta a interface
dados.js — lista das palavras (MAIÚSCULAS, sem acentos, sem espaços) e pistas
validar.js — script para rodar localmente com Node para validar pistas e layout do tabuleiro

Requisitos do sistema

Navegador moderno (Chrome, Firefox, Edge) ou GitHub Pages
Node.js (opcional) para rodar node validar.js

Notas técnicas

O tabuleiro usa um layout fixo (LAYOUT_CRUZADINHA em dados.js), conferido pelo validar.js (cruzamentos, sem palavras coladas, tabuleiro conectado).
O arquivo dados.js contém as 12 palavras usadas no tabuleiro, as pistas em PT-BR e as coordenadas do layout.