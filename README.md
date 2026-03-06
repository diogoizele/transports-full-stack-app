# Full Stack App (Offline-First) - React Native + Node.js + MySQL

App mobile com suporte offline-first usando WatermelonDB, sincronização com backend Node.js e banco MySQL.

## Estrutura do projeto

```
/
├── app/          # React Native (WatermelonDB, sincronização offline)
├── backend/      # API REST Node.js
├── docker-compose.yml
└── README.md
```

---

## Requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [Node.js](https://nodejs.org/) 18+ (apenas se rodar o backend fora do Docker)
- [Bun](https://bun.sh/) (opcional, alternativa ao npm/yarn no backend)
- [React Native CLI](https://reactnative.dev/docs/environment-setup) configurado
- Xcode (iOS) ou Android Studio (Android)
- Yarn

---

## Backend

### Subindo com Docker (recomendado)

Sobe a API, o MySQL e o phpMyAdmin em conjunto:

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

Serviços disponíveis após o comando:

| Serviço    | Endereço              |
| ---------- | --------------------- |
| API        | http://localhost:3000 |
| phpMyAdmin | http://localhost:8080 |
| MySQL      | localhost:3306        |

O banco já é inicializado automaticamente via `backend/database/init.sql`, incluindo as tabelas e os dados iniciais (2 empresas, 2 usuários).

Utilize algum destes para fazer o login:

- **Usuário:** carlos.souza | **Senha:** 123456
- **Usuário:** mariana.lima | **Senha:** 1234567

---

## App React Native

### Configuração da variável de ambiente

O app usa o arquivo `.env` na raiz de `app/` para definir o endereço da API:

```properties
API_URL=http://localhost:3000
```

**Atenção conforme plataforma:**

| Plataforma         | Valor de `API_URL`                  |
| ------------------ | ----------------------------------- |
| Simulador iOS      | `http://localhost:3000`             |
| Emulador Android   | `http://<IP_LOCAL_DA_MÁQUINA>:3000` |
| Dispositivo físico | `http://<IP_LOCAL_DA_MÁQUINA>:3000` |

Para descobrir seu IP local: `ipconfig` (Windows) ou `ifconfig` / `ip a` (macOS/Linux).

---

### Instalando dependências

```bash
cd app
yarn
```

---

### Rodando no iOS

```bash
yarn react-native run-ios
```

---

### Rodando no Android

```bash
yarn react-native run-android
```

---

## Funcionalidades

- **Login** com validação contra o banco MySQL. Sessão persistida localmente — ao reabrir o app com sessão ativa, o login é pulado.
- **Isolamento por empresa** — cada usuário vê e insere apenas dados da sua própria empresa.
- **Cadastro de lançamentos** com tipo (Compra/Venda), data/hora, descrição e fotos (câmera ou galeria, múltiplas por registro).
- **Offline-first** — todos os dados são gravados localmente via WatermelonDB. O app funciona sem conexão.
- **Sincronização** automática ao recuperar conexão ou manual via botão "Sincronizar".
- **Lista de registros** com indicação visual de status de sincronização.

---

## Credenciais de teste

Definidas no `init.sql`:

| Usuário      | Senha   | Empresa                         |
| ------------ | ------- | ------------------------------- |
| carlos.souza | 123456  | Alfa Mais Alimentos Ltd         |
| mariana.lima | 1234567 | Beta Comandos - Tecnologia Ltda |

> Verifique os valores exatos em `backend/database/init.sql`.

---

## Testando offline/online

1. Faça login e crie um ou mais registros **com o dispositivo sem conexão** (modo avião).
2. Os registros aparecerão na lista marcados como **não sincronizados**.
3. Restaure a conexão — a sincronização ocorre automaticamente, ou use o botão **"Online"** com o símbolo do wi-fi.
4. Os registros passam a aparecer como sincronizados e ficam disponíveis no banco remoto.

---

### Instruções adicionais

#### Rodando o backend localmente (opcional)

Útil para acompanhar logs em tempo real ou desenvolver a API.

1. Pare o container da API (mantendo o MySQL rodando):

```bash
docker compose stop api
```

2. Navegue até a pasta do backend:

```bash
cd backend
```

3. Instale as dependências e rode em modo dev:

```bash
# com npm
npm install && npm run dev

# com yarn
yarn && yarn dev

# com bun
bun install && bun run dev
```

A API ficará disponível em `http://localhost:3000`.

---

#### phpMyAdmin

Acesse `http://localhost:8080` para visualizar e gerenciar o banco via interface gráfica. Login já pré-configurado pelo Docker Compose.

---
