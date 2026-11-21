# Architect Wars — Cruzadinha e Batalha (Arquitetura Computacional)

Este repositório contém dois exercícios interativos sobre conceitos de Arquitetura Computacional: uma cruzadinha (página inicial) e um jogo de batalha contra um bot.

Como está organizado
- index.html — cruzadinha (página inicial)
- batalha.html — jogo de batalha
- style.css — estilos compartilhados
- conceitos.js — dados dos 16 conceitos (usados em ambas as páginas)
- script.js — lógica da cruzadinha (fase 1)
- batalha.js — lógica da batalha (esqueleto para fase 2)
- validar.js — script Node para validar pistas (local)

Como testar localmente
1. Abra index.html diretamente no seu navegador ou sirva a pasta com um servidor estático:
   - `python3 -m http.server 8000` e abra http://localhost:8000
2. Abra a cruzadinha (index.html) e a página de batalha (batalha.html).

Validação de pistas (local)
1. No terminal, execute `node validar.js` para checar as pistas (<=15 palavras e checagens simples).

Palavras e pistas
Veja os conceitos em `conceitos.js`. As respostas para a cruzadinha (no tabuleiro) são:

CPU (CPU)
ULA (ULA)
UC (UC)
REGISTRADORES (REGISTRADORES)
RAM (RAM)
ROM (ROM)
EEPROM (EEPROM)
FLASH (FLASH)
CACHE (CACHE)
MEMORIADEMASSA (MEMORIADE M ASSA)
DMA (DMA)
ADDRESSBUS (ADDRESSBUS)
DATABUS (DATABUS)
MICROCONTROLADOR (MICROCONTROLADOR)
DUALCORE (DUALCORE)
QUADCORE (QUADCORE)

Publicação
Após verificar localmente, você pode publicar no GitHub Pages.
Link sugerido: https://SEU-USUARIO.github.io/arqcomp-cruzadinha/ (substitua SEU-USUARIO)

Fases
- Fase 1: estrutura de arquivos, dados dos conceitos, validação e a cruzadinha funcional (12 palavras bem validadas).
- Fase 2: implementação do jogo de batalha, polimento visual e README final.
