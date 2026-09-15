# web3-suite-payments-backend

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Stellar](https://img.shields.io/badge/Network-Stellar-08B5E5?logo=stellar)](https://stellar.org)

Backend API service for the **web3-suite** payments ecosystem. Provides RESTful endpoints for managing payment streams, invoices, and subscriptions on Stellar/Soroban, with full wallet integration and transaction signing.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client Applications                        │
│                    (React Frontend, Mobile, CLI)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js API Server                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Middleware   │  │   Routes     │  │     Validation       │  │
│  │  • Helmet    │  │  • /streams  │  │     (Zod Schemas)    │  │
│  │  • CORS      │  │  • /invoices │  │                      │  │
│  │  • RateLimit │  │  • /subscr.  │  │                      │  │
│  │  • Logging   │  │              │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         └─────────────────┼──────────────────────┘              │
│                           │                                     │
│                    ┌──────▼──────┐                              │
│                    │  Services   │                              │
│                    ├─────────────┤                              │
│                    │  Stellar    │◄── RPC Client                │
│                    │  Contracts  │◄── Contract Calls            │
│                    └──────┬──────┘                              │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │ Stellar RPC
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Stellar / Soroban Network                     │
│                  (Payment Stream, Invoice,                      │
│                   Subscription Contracts)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Payment Streams

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/api/streams/:id` | Get stream details | — |
| `POST` | `/api/streams` | Create a new payment stream | `CreateStreamInput` |
| `POST` | `/api/streams/:id/withdraw` | Withdraw available funds | `{ amount? }` |
| `POST` | `/api/streams/:id/pause` | Pause a stream | — |
| `POST` | `/api/streams/:id/resume` | Resume a paused stream | — |
| `POST` | `/api/streams/:id/stop` | Stop a stream | — |
| `GET` | `/api/streams/:id/withdrawable` | Get withdrawable amount | — |

### Invoices

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/api/invoices/:id` | Get invoice details | — |
| `POST` | `/api/invoices` | Create a new invoice | `CreateInvoiceInput` |
| `POST` | `/api/invoices/:id/send` | Send invoice to recipient | — |
| `POST` | `/api/invoices/:id/pay` | Pay an invoice | — |
| `POST` | `/api/invoices/:id/cancel` | Cancel an invoice | — |

### Subscriptions

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/api/subscriptions/plans/:id` | Get plan details | — |
| `POST` | `/api/subscriptions/plans` | Create subscription plan | `CreatePlanInput` |
| `POST` | `/api/subscriptions/subscribe` | Subscribe to a plan | `SubscribeInput` |
| `POST` | `/api/subscriptions/:id/billing` | Process billing cycle | — |
| `POST` | `/api/subscriptions/:id/cancel` | Cancel subscription | — |
| `GET` | `/api/subscriptions/:id` | Get subscription details | — |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check with network info |
| `GET` | `/api` | API documentation |

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0.0
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (optional)

### Local Development

```bash
# Clone the repository
git clone https://github.com/sudo-robi/web3-suite-payments-backend.git
cd web3-suite-payments-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# (contract IDs, admin secret key, etc.)

# Start development server
npm run dev

# The API will be available at http://localhost:3000
```

### Build & Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build Docker image
docker build -t web3-suite-payments-backend .

# Run container
docker run -p 3000:3000 --env-file .env web3-suite-payments-backend

# Or use docker-compose (create docker-compose.yml first)
docker-compose up -d
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `STELLAR_NETWORK` | No | `testnet` | Stellar network (`testnet`, `mainnet`, `futurenet`) |
| `STREAM_CONTRACT_ID` | Yes | — | Deployed payment stream contract address |
| `INVOICE_CONTRACT_ID` | Yes | — | Deployed invoice contract address |
| `SUBSCRIPTION_CONTRACT_ID` | Yes | — | Deployed subscription contract address |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `LOG_LEVEL` | No | `info` | Logging level (`error`, `warn`, `info`, `debug`) |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `ADMIN_SECRET_KEY` | Yes | — | Admin keypair secret for server-side transactions |

---

## Request/Response Examples

### Create a Payment Stream

```bash
curl -X POST http://localhost:3000/api/streams \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "GXXXXXXX...",
    "receiver": "GYYYYYYY...",
    "amountPerSecond": "1000000",
    "startTime": 1700000000,
    "endTime": 1700086400
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "abc123..."
  },
  "message": "Payment stream created successfully"
}
```

### Create an Invoice

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "issuer": "GXXXXXXX...",
    "recipient": "GYYYYYYY...",
    "items": [
      { "description": "Web Development", "amount": "5000000", "quantity": 1 },
      { "description": "Design Review", "amount": "2000000", "quantity": 2 }
    ],
    "dueDate": 1700086400
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "def456..."
  },
  "message": "Invoice created successfully"
}
```

---

## Project Structure

```
web3-suite-payments-backend/
├── src/
│   ├── index.ts                    # Express server entry point
│   ├── routes/
│   │   ├── streams.ts              # Payment stream endpoints
│   │   ├── invoices.ts             # Invoice endpoints
│   │   └── subscriptions.ts        # Subscription endpoints
│   ├── services/
│   │   ├── stellar.ts              # Stellar RPC client service
│   │   └── contracts.ts            # Smart contract interaction service
│   ├── types/
│   │   └── index.ts                # TypeScript types and Zod schemas
│   ├── middleware/
│   │   └── validation.ts           # Request validation middleware
│   └── utils/
│       └── logger.ts               # Winston logger configuration
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## Security Features

- **Helmet** — Sets secure HTTP headers
- **CORS** — Configurable cross-origin resource sharing
- **Rate Limiting** — Prevents abuse (100 requests / 15 minutes)
- **Input Validation** — Zod schemas validate all request bodies
- **Structured Logging** — Winston with JSON output for production
- **Docker** — Non-root user, health checks, multi-stage build

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Use TypeScript strict mode
- Write tests for new endpoints
- Follow RESTful conventions
- Validate all inputs with Zod
- Run `npm run lint` and `npm run typecheck` before committing
- Keep functions focused and under 30 lines

---

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
