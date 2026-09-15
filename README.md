# web3-suite Payments Backend

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Express](https://img.shields.io/badge/Express-4.18-green.svg)
![Stellar SDK](https://img.shields.io/badge/Stellar%20SDK-12.0-purple.svg)
![Node.js](https://img.shields.io/badge/Node.js-≥18-brightgreen.svg)

REST API backend for web3-suite payments. Bridges HTTP clients to Soroban smart contracts on the Stellar network with validation, rate limiting, and structured logging.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Client Layer                        │
│         (Frontend React App / Third-party API)           │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼─────────────────────────────────┐
│                    Express Server                        │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────────┐  │
│  │ Helmet  │  │   CORS   │  │   Rate Limiter         │  │
│  │ (Sec)   │  │          │  │   (100 req / 15 min)   │  │
│  └─────────┘  └──────────┘  └────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │               Route Handlers                     │    │
│  │  /api/streams    /api/invoices    /api/subs      │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                  │
│  ┌────────────────────▼─────────────────────────────┐    │
│  │            Zod Validation Layer                   │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                  │
│  ┌────────────────────▼─────────────────────────────┐    │
│  │           ContractService                        │    │
│  │   (Builds Soroban transactions, signs & sends)   │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                  │
│  ┌────────────────────▼─────────────────────────────┐    │
│  │           StellarService                         │    │
│  │   (Soroban RPC client, tx simulation & submit)   │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   Stellar Network   │
              │   (Soroban RPC)     │
              └─────────────────────┘
```

## API Endpoints

### Health & Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api` | API documentation |

### Streams

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/streams/:id` | Get stream details | - |
| POST | `/api/streams` | Create payment stream | `{ sender, receiver, amountPerSecond, startTime, endTime }` |
| POST | `/api/streams/:id/withdraw` | Withdraw from stream | `{ amount? }` |
| POST | `/api/streams/:id/pause` | Pause stream | - |
| POST | `/api/streams/:id/resume` | Resume stream | - |
| POST | `/api/streams/:id/stop` | Stop stream | - |
| GET | `/api/streams/:id/withdrawable` | Get withdrawable amount | - |

### Invoices

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/invoices/:id` | Get invoice details | - |
| POST | `/api/invoices` | Create invoice | `{ issuer, recipient, items, dueDate, notes? }` |
| POST | `/api/invoices/:id/send` | Send invoice | - |
| POST | `/api/invoices/:id/pay` | Pay invoice | - |
| POST | `/api/invoices/:id/cancel` | Cancel invoice | - |

### Subscriptions

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/subscriptions/plans/:id` | Get plan details | - |
| POST | `/api/subscriptions/plans` | Create plan | `{ creator, name, description, amount, billingInterval, intervalCount, maxSubscribers? }` |
| POST | `/api/subscriptions/subscribe` | Subscribe to plan | `{ planId, subscriber }` |
| POST | `/api/subscriptions/:id/billing` | Process billing | - |
| POST | `/api/subscriptions/:id/cancel` | Cancel subscription | - |
| GET | `/api/subscriptions/:id` | Get subscription details | - |

## Setup

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- Stellar testnet account with XLM

### Install

```bash
npm install
```

### Configure

```bash
cp .env.example .env
# Edit .env with your contract IDs and admin key
```

### Development

```bash
npm run dev          # Start with hot-reload
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Type-check without emit
npm test             # Run tests
```

### Docker

```bash
# Build and run with docker-compose
docker-compose up -d

# Or build manually
docker build -t web3-suite-payments-backend .
docker run -p 3000:3000 --env-file .env web3-suite-payments-backend
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `STELLAR_NETWORK` | No | `testnet` | Stellar network (testnet/mainnet/futurenet) |
| `STREAM_CONTRACT_ID` | Yes | - | Deployed stream contract address |
| `INVOICE_CONTRACT_ID` | Yes | - | Deployed invoice contract address |
| `SUBSCRIPTION_CONTRACT_ID` | Yes | - | Deployed subscription contract address |
| `ADMIN_SECRET_KEY` | Yes | - | Admin keypair secret for server-side transactions |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `LOG_LEVEL` | No | `info` | Winston log level |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |

## Request Validation

All mutating endpoints use Zod schemas for request validation:

```typescript
// Example: CreateStreamSchema
{
  sender: string (starts with 'G', valid Stellar key),
  receiver: string (starts with 'G', valid Stellar key),
  amountPerSecond: string (positive integer),
  startTime: number (positive integer),
  endTime: number (positive integer)
}
```

Validation errors return `400` with structured error details:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "receiver", "message": "Must be a valid Stellar public key" }
  ]
}
```

## Error Handling

All errors return structured JSON:

```json
{
  "success": false,
  "error": "Error message"
}
```

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express server entry
│   ├── config.ts             # Environment configuration
│   ├── routes/
│   │   ├── streams.ts        # Stream endpoints
│   │   ├── invoices.ts       # Invoice endpoints
│   │   └── subscriptions.ts  # Subscription endpoints
│   ├── services/
│   │   ├── stellar.ts        # Stellar RPC client wrapper
│   │   └── contracts.ts      # Soroban contract interaction
│   ├── types/
│   │   └── index.ts          # Zod schemas + TypeScript types
│   ├── middleware/
│   │   └── validation.ts     # Zod validation middleware
│   └── utils/
│       └── logger.ts         # Winston logger
├── Dockerfile                # Multi-stage Docker build
├── docker-compose.yml        # Docker Compose config
├── .env.example              # Environment template
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── README.md                 # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new endpoints
- Use Zod schemas for all input validation
- Follow TypeScript strict mode conventions
- Use structured logging (Winston) for all operations
- Handle errors gracefully with proper HTTP status codes

## License

MIT License - see [LICENSE](../LICENSE) for details.
