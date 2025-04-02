# MCP Server - Archi Track

Este repositório contém um servidor baseado no **Model Context Protocol (MCP)** que fornece uma API para consultar informações sobre aplicações registradas. O código está configurado para rodar via **Cloud Desktop** e **n8n**, e pode ser buildado para produção.

## Requisitos
- **Node.js** (v18+ recomendado)
- **npm** ou **yarn**
- **Docker** (caso queira rodar em container)

---
## Configuração

O projeto usa variáveis de ambiente para configuração. Crie um arquivo **`.env`** na raiz do projeto e adicione:

```ini
NWS_API_BASE=http://archi-track.lmlabs.com.br
USER_AGENT=archi-track-app/1.0
TOKEN=SEU_TOKEN_AQUI
SERVER_NAME=archi-track
SERVER_VERSION=1.0.0
```

---
## Como Rodar

### 1️⃣ Rodando Localmente (Cloud Desktop ou CLI)

1. Instale as dependências:
   ```sh
   npm install
   ```
2. Inicie o servidor:
   ```sh
   npm start
   ```
   ou
   ```sh
   node index.js
   ```

---
### 2️⃣ Rodando no **n8n**

1. Crie um novo **workflow** no n8n.
2. Adicione um **Webhook Node** e configure o endpoint.
3. Adicione um **Execute Command Node** e use o seguinte comando:
   ```sh
   node /caminho/do/projeto/index.js
   ```
4. Passe as variáveis de ambiente no campo "Environment Variables".
5. Salve e execute o workflow.

---
### 3️⃣ Rodando com Docker

1. Construa a imagem:
   ```sh
   docker build -t archi-track .
   ```
2. Rode o container:
   ```sh
   docker run --env-file .env -p 3000:3000 archi-track
   ```

---
## Build para Produção

Se você estiver usando **TypeScript**, primeiro compile o projeto:
```sh
npm run build
```
Isso criará uma pasta `build/`. Para rodar a versão buildada:
```sh
node build/index.js
```
Se precisar copiar as variáveis de ambiente, use:
```sh
cp .env build/
```

Agora o projeto está pronto para rodar em produção! 🚀

