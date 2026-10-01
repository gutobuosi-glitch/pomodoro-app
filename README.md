# 🍅 Pomodoro Cyberpunk (PWA)

Um temporizador Pomodoro minimalista com estética Cyberpunk / Tron, desenvolvido em HTML, CSS e JavaScript puro.

## 🚀 Funcionalidades
- **Suporte a PWA Standalone:** Pode ser instalado como aplicativo na tela inicial do celular/desktop.
- **Precisão de Tempo em Segundo Plano:** Utiliza cálculo de tempo absoluto (`Date.now()`), evitando que o relógio atrase quando a tela for bloqueada ou o app for minimizado.
- **Alarme Digital Estridente:** Sistema de áudio sintetizado em alto volume via Web Audio API, dispensando o carregamento de arquivos externos.
- **Exportação de Notas:** Permite baixar as anotações da sessão diretamente em formato `.txt`.
- **Ajustes Personalizados:** Altere a duração do Pomodoro, Pausa Curta e Pausa Longa.

## 💻 Como rodar / Deploy no Netlify
1. Crie um novo repositório no GitHub.
2. Adicione os arquivos `index.html`, `styles.css`, `script.js`, `manifest.json` e `README.md`.
3. Conecte o repositório ao Netlify para publicar online em segundos.