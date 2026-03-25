# tg-bot

Telegram bot for a game platform with Web3 integration. Users can purchase tickets for ongoing rounds, withdraw funds to blockchain addresses, and manage their wallet balance.

## Features

- Browse and purchase tickets for ongoing game rounds
- View wallet balance and ticket prizes
- Withdraw funds to blockchain addresses
- Multi-step interactive flows with inline keyboards

## Requirements

- Node.js
- yarn

## Install

```bash
yarn install
```

## Configuration

Create a `.env` file in the project root:

```env
BOT_TOKEN=your_telegram_bot_token
BACKEND_URL=https://your-backend-api-url
```

- `BOT_TOKEN` — obtain from [@BotFather](https://t.me/BotFather)
- `BACKEND_URL` — base URL of the backend API

## Run

```bash
# Development (with auto-reload)
yarn dev

# Production
yarn start
```

## Tests

```bash
yarn test
```
