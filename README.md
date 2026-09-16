# web3-suite-payments-backend

> Express.js REST API for Stellar/Soroban payment streams, invoices, and subscriptions

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Issues](https://img.shields.io/github/issues/sudo-robi/web3-suite-payments-backend)](https://github.com/sudo-robi/web3-suite-payments-backend/issues)
[![Stars](https://img.shields.io/github/stars/sudo-robi/web3-suite-payments-backend)](https://github.com/sudo-robi/web3-suite-payments-backend/stargazers)

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [API Info](#api-info)
  - [Streams API](#streams-api)
  - [Invoices API](#invoices-api)
  - [Subscriptions API](#subscriptions-api)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running](#running)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Overview

Building Web3 payment features requires bridging frontend applications with on-chain smart contracts. Direct Soroban RPC interaction from browsers exposes private keys and lacks server-side validation. Developers need a secure, validated API layer that handles transaction construction, network communication, and error handling while keeping client credentials safe.

**web3-suite-payments-backend** provides that bridge:

- **Secure Transaction Construction** — Server builds Soroban transactions; client signs via Freighter
- **Input Validation** — Zod schemas validate all requests before they reach contract logic
- **Network Abstraction** — Seamless switching between testnet, futurenet, and mainnet
- **Production Security** — Helmet, CORS, rate limiting, structured logging out of the box

### Target Audience

- Frontend developers building payment dApps who need a reliable API backend
- Teams integrating Stellar/Soroban contracts into existing Node.js applications
- DevOps engineers deploying payment infrastructure on Stellar

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
│                    Port 5173                              │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (proxied)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Express.js Backend                        │
│                    Port 3000                              │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Stream   │  │ Invoice  │  │  Sub     │  Routes      │
│  │  Routes   │  │  Routes  │  │  Routes  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                     │
│  ┌────▼──────────────▼──────────────▼─────┐             │
│  │           Validation Middleware         │             │
│  │         (Zod Schema Validation)         │             │
│  └────────────────┬───────────────────────┘             │
│                   │                                      │
│  ┌────────────────▼───────────────────────┐             │
│  │          ContractService                │             │
│  │    (Stellar SDK + Soroban RPC)          │             │
│  └────────────────┬───────────────────────┘             │
│                   │                                      │
│  ┌────────────────▼───────────────────────┐             │
│  │          StellarService                 │             │
│  │    (Network Config + RPC Client)        │             │
│  └────────────────────────────────────────┘             │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Morgan   │  │ Winston  │  │ Helmet   │  Middleware   │
│  │ Logging  │  │ Logger   │  │ Security │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────────────────────────┬──────────────────────────────┘
                           │ Soroban RPC
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Stellar Network (Testnet/Mainnet)           │
└─────────────────────────────────────────────────────────┘
```

### Request Lifecycle

1. **Client** sends HTTP request to `/api/*`
2. **Rate Limiter** checks request count (100 per 15-min window)
3. **Helmet** applies security headers
4. **Morgan** logs the request
5. **Zod Validator** validates request body against schema
6. **Route Handler** constructs Soroban transaction via `ContractService`
7. **StellarService** submits transaction to Stellar RPC
8. **Response** returns transaction hash or data to client

## Features

1. **Payment Streams API** — Create, query, pause, resume, stop, and withdraw from payment streams
2. **Invoices API** — Create invoices with line items, send, pay, and cancel
3. **Subscriptions API** — Create plans, subscribe, process billing, and cancel subscriptions
4. **Zod Validation** — Type-safe request validation with descriptive error messages
5. **Multi-Network Support** — Seamless switching between testnet, futurenet, and mainnet
6. **Rate Limiting** — 100 requests per 15-minute window (configurable)
7. **Security Headers** — Helmet middleware for CSP, HSTS, X-Frame-Options, etc.
8. **CORS Configuration** — Configurable origin with credentials support
9. **Structured Logging** — Winston logger with JSON and console transports
10. **Request Logging** — Morgan HTTP logging integrated with Winston
11. **Error Handling** — Global error handler with Zod error formatting
12. **Docker Ready** — Multi-stage Dockerfile with health checks
13. **Docker Compose** — Full stack deployment (backend + frontend)
14. **TypeScript** — Full type safety with strict mode and declaration maps

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | >= 18.0.0 |
| Language | TypeScript | 5.3.x |
| Framework | Express.js | 4.18.x |
| Validation | Zod | 3.22.x |
| Stellar SDK | @stellar/stellar-sdk | 12.x |
| Logging | Winston | 3.11.x |
| HTTP Logging | Morgan | 1.10.x |
| Security | Helmet | 7.1.x |
| CORS | cors | 2.8.x |
| Rate Limiting | express-rate-limit | 7.1.x |
| Testing | Vitest | 1.0.x |
| Bundler | tsx | 4.6.x |
| Linting | ESLint + @typescript-eslint | 8.54.x / 6.13.x |
| Container | Docker (node:20-alpine) | — |
| License | MIT | — |

## Project Structure

```
backend/
├── package.json                  # Dependencies, scripts, metadata
├── tsconfig.json                 # TypeScript config (strict, NodeNext)
├── Dockerfile                    # Multi-stage production build
├── docker-compose.yml            # Full stack (backend + frontend)
├── .env.example                  # Environment variable template
├── .gitignore
├── LICENSE
├── README.md
└── src/
    ├── index.ts                  # Express app setup, middleware, routes (118 lines)
    ├── types/
    │   └── index.ts              # Zod schemas + TypeScript interfaces (130 lines)
    ├── routes/
    │   ├── streams.ts            # Stream CRUD + withdraw/pause/resume/stop (146 lines)
    │   ├── invoices.ts           # Invoice CRUD + send/pay/cancel (105 lines)
    │   └── subscriptions.ts      # Plan CRUD + subscribe/billing/cancel (125 lines)
    ├── services/
    │   ├── contracts.ts          # Stellar SDK contract interaction layer (230 lines)
    │   └── stellar.ts            # StellarService singleton (93 lines)
    ├── middleware/
    │   └── validation.ts         # Zod validate() + errorHandler + requestLogger (56 lines)
    └── utils/
        └── logger.ts             # Winston logger config (27 lines)
```

## API Reference

All endpoints are prefixed with `/api`. Responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": []
}
```

---

### Health Check

#### `GET /health`

Returns server health status.

**Response (200):**

```json
{
  "status": "healthy",
  "timestamp": "2026-09-15T12:00:00.000Z",
  "version": "0.1.0",
  "network": "testnet"
}
```

**cURL:**

```bash
curl http://localhost:3000/health
```

---

### API Info

#### `GET /api`

Returns all available endpoints.

**Response (200):**

```json
{
  "name": "web3-suite-payments-backend",
  "version": "0.1.0",
  "description": "Payment API for Stellar/Soroban web3-suite",
  "endpoints": {
    "streams": { ... },
    "invoices": { ... },
    "subscriptions": { ... }
  }
}
```

**cURL:**

```bash
curl http://localhost:3000/api
```

---

### Streams API

#### `GET /api/streams/:id`

Get stream details by ID.

**Parameters:**

| Param | Type | Location | Description |
|-------|------|----------|-------------|
| `id` | string | path | Stream ID |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "sender": "GABC...",
    "receiver": "GDEF...",
    "amountPerSecond": "1000000",
    "startTime": 1726300000,
    "endTime": 1726386400,
    "totalStreamed": "50000000",
    "withdrawn": "30000000",
    "isActive": true,
    "isPaused": false,
    "pauseTime": null,
    "cumulativePauseDuration": 0,
    "createdAt": 1726300000
  }
}
```

**cURL:**

```bash
curl http://localhost:3000/api/streams/1
```

---

#### `POST /api/streams`

Create a new payment stream.

**Request Body:**

```json
{
  "sender": "GABC...",
  "receiver": "GDEF...",
  "amountPerSecond": "1000000",
  "startTime": 1726300000,
  "endTime": 1726386400
}
```

**Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `sender` | string | yes | Must start with `G` (Stellar public key) |
| `receiver` | string | yes | Must start with `G` |
| `amountPerSecond` | string | yes | Positive integer string |
| `startTime` | number | yes | Positive integer |
| `endTime` | number | yes | Positive integer |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "transactionHash": "abc123..."
  },
  "message": "Payment stream created successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/streams \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "GABC...",
    "receiver": "GDEF...",
    "amountPerSecond": "1000000",
    "startTime": 1726300000,
    "endTime": 1726386400
  }'
```

---

#### `POST /api/streams/:id/withdraw`

Withdraw accrued funds from a stream.

**Request Body:**

```json
{
  "amount": "5000000"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | string | no | Amount in stroops; omit to withdraw all |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "transactionHash": "def456..."
  },
  "message": "Withdrawal successful"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/streams/1/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amount": "5000000"}'
```

---

#### `POST /api/streams/:id/pause`

Pause an active stream.

**Response (200):**

```json
{
  "success": true,
  "message": "Stream paused successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/streams/1/pause
```

---

#### `POST /api/streams/:id/resume`

Resume a paused stream.

**Response (200):**

```json
{
  "success": true,
  "message": "Stream resumed successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/streams/1/resume
```

---

#### `POST /api/streams/:id/stop`

Permanently stop a stream.

**Response (200):**

```json
{
  "success": true,
  "message": "Stream stopped successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/streams/1/stop
```

---

#### `GET /api/streams/:id/withdrawable`

Get the current withdrawable amount.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "amount": "50000000"
  }
}
```

**cURL:**

```bash
curl http://localhost:3000/api/streams/1/withdrawable
```

---

### Invoices API

#### `GET /api/invoices/:id`

Get invoice details by ID.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "issuer": "GABC...",
    "recipient": "GDEF...",
    "items": [
      { "description": "Web Development", "amount": "5000", "quantity": 1 },
      { "description": "Design Review", "amount": "2000", "quantity": 2 }
    ],
    "totalAmount": "9000",
    "dueDate": 1728896000,
    "issuedDate": 1726300000,
    "status": "sent",
    "notes": "Payment terms: Net 30",
    "paidAt": null,
    "paymentTx": null
  }
}
```

**cURL:**

```bash
curl http://localhost:3000/api/invoices/1
```

---

#### `POST /api/invoices`

Create a new invoice with line items.

**Request Body:**

```json
{
  "issuer": "GABC...",
  "recipient": "GDEF...",
  "items": [
    { "description": "Web Development", "amount": "5000", "quantity": 1 },
    { "description": "Design Review", "amount": "2000", "quantity": 2 }
  ],
  "dueDate": 1728896000,
  "notes": "Payment terms: Net 30"
}
```

**Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `issuer` | string | yes | Must start with `G` |
| `recipient` | string | yes | Must start with `G` |
| `items` | array | yes | 1-50 items |
| `items[].description` | string | yes | 1-500 chars |
| `items[].amount` | string | yes | Positive integer string |
| `items[].quantity` | number | yes | 1-10000 |
| `dueDate` | number | yes | Positive integer (unix timestamp) |
| `notes` | string | no | Max 2000 chars |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "transactionHash": "ghi789..."
  },
  "message": "Invoice created successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "issuer": "GABC...",
    "recipient": "GDEF...",
    "items": [
      { "description": "Web Development", "amount": "5000", "quantity": 1 }
    ],
    "dueDate": 1728896000
  }'
```

---

#### `POST /api/invoices/:id/send`

Send a draft invoice (transitions Draft → Sent).

**Response (200):**

```json
{
  "success": true,
  "message": "Invoice sent successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/invoices/1/send
```

---

#### `POST /api/invoices/:id/pay`

Pay an invoice (transitions Sent/Overdue → Paid).

**Response (200):**

```json
{
  "success": true,
  "message": "Invoice paid successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/invoices/1/pay
```

---

#### `POST /api/invoices/:id/cancel`

Cancel an invoice (cannot cancel paid or already cancelled).

**Response (200):**

```json
{
  "success": true,
  "message": "Invoice cancelled successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/invoices/1/cancel
```

---

### Subscriptions API

#### `GET /api/subscriptions/plans/:id`

Get plan details by ID.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Pro Plan",
    "description": "Monthly Pro subscription",
    "amount": "2500",
    "billingInterval": "monthly",
    "intervalCount": 1,
    "maxSubscribers": 100,
    "currentSubscribers": 15,
    "creator": "GABC...",
    "isActive": true,
    "createdAt": 1726300000
  }
}
```

**cURL:**

```bash
curl http://localhost:3000/api/subscriptions/plans/1
```

---

#### `POST /api/subscriptions/plans`

Create a new subscription plan.

**Request Body:**

```json
{
  "creator": "GABC...",
  "name": "Pro Plan",
  "description": "Monthly Pro subscription",
  "amount": "2500",
  "billingInterval": "monthly",
  "intervalCount": 1,
  "maxSubscribers": 100
}
```

**Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `creator` | string | yes | Must start with `G` |
| `name` | string | yes | 1-100 chars |
| `description` | string | yes | 1-1000 chars |
| `amount` | string | yes | Positive integer string |
| `billingInterval` | enum | yes | `daily`, `weekly`, `monthly`, `quarterly`, `yearly` |
| `intervalCount` | number | yes | 1-12 |
| `maxSubscribers` | number | no | Positive integer |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "transactionHash": "jkl012..."
  },
  "message": "Subscription plan created successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/subscriptions/plans \
  -H "Content-Type: application/json" \
  -d '{
    "creator": "GABC...",
    "name": "Pro Plan",
    "description": "Monthly Pro subscription",
    "amount": "2500",
    "billingInterval": "monthly",
    "intervalCount": 1
  }'
```

---

#### `POST /api/subscriptions/subscribe`

Subscribe to a plan.

**Request Body:**

```json
{
  "planId": "1",
  "subscriber": "GDEF..."
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "transactionHash": "mno345..."
  },
  "message": "Subscription created successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -d '{"planId": "1", "subscriber": "GDEF..."}'
```

---

#### `POST /api/subscriptions/:id/billing`

Process billing for a subscription.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "transactionHash": "pqr678..."
  },
  "message": "Billing processed successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/subscriptions/1/billing
```

---

#### `POST /api/subscriptions/:id/cancel`

Cancel a subscription.

**Response (200):**

```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/subscriptions/1/cancel
```

---

#### `GET /api/subscriptions/:id`

Get subscription details.

**Response (200):**

```json
{
  "success": true,
  "data": { "id": "1" }
}
```

**cURL:**

```bash
curl http://localhost:3000/api/subscriptions/1
```

---

### Error Responses

#### 400 — Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "sender",
      "message": "Must be a valid Stellar public key"
    }
  ]
}
```

#### 404 — Not Found

```json
{
  "success": false,
  "error": "Endpoint not found"
}
```

#### 429 — Rate Limit Exceeded

```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

#### 500 — Server Error

```json
{
  "success": false,
  "error": "Failed to create payment stream"
}
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- npm or yarn
- [Stellar testnet account](https://laboratory.stellar.org/#account-creator) with XLM balance
- Deployed Soroban contracts (see [contracts README](../contracts/README.md))

### Installation

```bash
# Clone the repository
git clone https://github.com/sudo-robi/web3-suite-payments-backend.git
cd web3-suite-payments-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Configuration

Edit `.env` with your settings:

```bash
# Stellar Configuration
STELLAR_NETWORK=testnet
STREAM_CONTRACT_ID=C...  # Your deployed stream contract ID
INVOICE_CONTRACT_ID=C... # Your deployed invoice contract ID
SUBSCRIPTION_CONTRACT_ID=C... # Your deployed subscription contract ID

# Server
PORT=3000
NODE_ENV=development

# CORS (match frontend origin)
CORS_ORIGIN=http://localhost:5173

# Admin keypair for server-side transactions
ADMIN_SECRET_KEY=S...
```

### Running

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start

# Docker
docker compose up
```

The server starts at `http://localhost:3000`.

### Testing

```bash
# Run tests
npm test

# Run tests once
npm run test:run

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

## Deployment

### Docker

```bash
# Build image
docker build -t web3-suite-payments-backend .

# Run container
docker run -p 3000:3000 --env-file .env web3-suite-payments-backend
```

### Docker Compose (Full Stack)

```bash
docker compose up -d
```

This starts:
- Backend on port 3000
- Frontend on port 5173 (nginx, proxied to backend)

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `ADMIN_SECRET_KEY` (not testnet)
- [ ] Set `STELLAR_NETWORK=mainnet`
- [ ] Configure `CORS_ORIGIN` to your frontend domain
- [ ] Set up SSL/TLS termination (nginx, cloudflare, etc.)
- [ ] Configure log rotation for `logs/` directory
- [ ] Set appropriate rate limits for your use case

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STELLAR_NETWORK` | yes | `testnet` | Stellar network: `testnet`, `mainnet`, `futurenet` |
| `STREAM_CONTRACT_ID` | yes | — | Deployed payment stream contract address |
| `INVOICE_CONTRACT_ID` | yes | — | Deployed invoice contract address |
| `SUBSCRIPTION_CONTRACT_ID` | yes | — | Deployed subscription contract address |
| `PORT` | no | `3000` | Server port |
| `NODE_ENV` | no | `development` | Environment: `development`, `production` |
| `LOG_LEVEL` | no | `info` | Winston log level |
| `CORS_ORIGIN` | no | `http://localhost:5173` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | no | `900000` | Rate limit window (ms) — 15 minutes |
| `RATE_LIMIT_MAX` | no | `100` | Max requests per window |
| `ADMIN_SECRET_KEY` | no | — | Stellar secret key for server-side transactions |

## Contributing

### Branch Naming

```
feat/batch-withdraw
fix/validation-error-message
docs/api-reference
refactor/stellar-service-singleton
test/stream-routes
```

### Commit Conventions

```
feat: add batch withdraw endpoint for streams
fix: correct invoice total calculation for large quantities
docs: add cURL examples for all endpoints
test: add integration tests for subscription billing
refactor: extract StellarService into singleton pattern
```

### Pull Request Process

1. Create a feature branch from `main`
2. Write tests for new endpoints
3. Run `npm run typecheck && npm run lint && npm test`
4. Update API documentation if endpoints change
5. Submit PR with clear description
6. Address review feedback
7. Merge after approval

### Code Standards

- Use Zod schemas for all request validation
- Keep route handlers thin — business logic goes in services
- Use `logger.error()` with context objects, not string concatenation
- All errors should return consistent `{ success: false, error: string }` format
- TypeScript strict mode — no `any` types

## License

MIT License — see [LICENSE](LICENSE) for details.

## Related Repositories

- [web3-suite-payments-contracts](https://github.com/sudo-robi/web3-suite-payments-contracts) — Soroban smart contracts
- [web3-suite-payments-frontend](https://github.com/sudo-robi/web3-suite-payments-frontend) — React + Tailwind UI
