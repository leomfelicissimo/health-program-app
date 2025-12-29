# PROTOCOLO 7em30 - Aplicação de Acompanhamento

Aplicação React para acompanhamento de um programa de saúde e fitness de 30 dias.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Ícones modernos

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse a aplicação em `http://localhost:5173`

## 🏗️ Build para Produção

Para gerar uma build otimizada para produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`. Você pode visualizar a build com:

```bash
npm run preview
```

## 💾 Persistência de Dados

Todos os dados do usuário são salvos automaticamente no **localStorage** do navegador:

- ✅ Itens marcados na checklist diária
- 📅 Semana e aba ativa
- ⚖️ Pesos registrados nos checkpoints
- 📊 Status dos checkpoints (Cumprida, Esperado, Focar)

Os dados persistem mesmo após fechar o navegador e são carregados automaticamente ao reabrir a aplicação.

## 📱 Funcionalidades

- **Cronograma**: Visualização semanal do programa com checklist diária
- **Treinos**: Detalhes dos treinos A e B com progressão por semana
- **Checkpoints**: Acompanhamento de progresso com registro de peso e status

## 🎨 Estrutura do Projeto

```
health-program-app/
├── src/
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Ponto de entrada
│   └── index.css        # Estilos globais com Tailwind
├── index.html           # HTML base
├── package.json         # Dependências e scripts
├── vite.config.js       # Configuração do Vite
├── tailwind.config.js   # Configuração do Tailwind
└── postcss.config.js    # Configuração do PostCSS
```

## 📄 Licença

Este projeto é de uso pessoal.

