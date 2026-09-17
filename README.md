# Dynatrace IAM Visualizer

Dynatrace IAM Visualizer is a TypeScript monorepo with:

- a React client (`/client`) that displays IAM policies
- an Express server (`/server`) that proxies Dynatrace Account Management APIs

The app is intended to help inspect IAM policy data and related account IAM objects without exposing API tokens to the browser.

## Architecture

- **Client**: React 18 + TypeScript (`react-scripts`)
- **Server**: Express + TypeScript
- **Data source**: Dynatrace Account Management APIs (`/iam/v1/...`) and environment listing endpoint (`/env/v2/...`)
- **Repository layout**:

```text
dynatrace-iam-visualizer/
├── client/                 # UI
├── server/                 # API proxy/backend
├── DT-Account-MGMT-API.json # Local OpenAPI snapshot used for type generation
└── package.json            # npm workspaces + orchestration scripts
```

## IAM policy visualization workflow

1. The UI calls `GET /api/policies` on the local server.
2. The server uses configured Dynatrace account credentials (`DYNATRACE_*`) to call Dynatrace IAM endpoints.
3. The response is returned to the UI and rendered as a policy list + policy details pane.
4. Additional backend routes expose groups, users, bindings, and effective permissions for IAM analysis workflows.

## API integration

The backend exposes routes under `/api` (see `/server/src/routes.ts` and `/server/API.md`), including:

- `GET /api/health`
- `GET /api/spec` (Dynatrace OpenAPI spec proxy/cache)
- `GET/POST/PUT/DELETE /api/policies`
- `GET/POST/PUT/DELETE /api/groups` and group-user mapping routes
- `GET/POST/PUT/DELETE /api/users` and membership routes
- `GET/PUT /api/bindings`
- `GET /api/permissions/effective`

## Required Dynatrace permissions

The exact scopes depend on which endpoints you use. For policy visualization and broader IAM operations implemented by this server, API specs in `DT-Account-MGMT-API.json` reference scopes such as:

- `iam:policies:read`, `iam:policies:write`, `iam-policies-management`
- `iam:bindings:read`, `iam:bindings:write`
- `iam:effective-permissions:read`
- `iam:limits:read`, `sso-idm:account-limits:read`
- `account-idm-read`, `account-idm-write`

Use least privilege and grant only scopes needed for the routes you plan to call.

## Security and token handling

- Keep Dynatrace credentials in **server-side environment variables only**.
- Do **not** place `DYNATRACE_API_TOKEN` in client `.env` files.
- `.env` files are ignored by git (`.gitignore`) and should never be committed.
- The browser should only call the local backend (`REACT_APP_API_URL`), not Dynatrace APIs directly.

## Environment variables

### Server (`/server/.env`)

Use `/server/.env.example` as a template:

```env
DYNATRACE_ENVIRONMENT_ID=<account-uuid>
DYNATRACE_API_TOKEN=<dynatrace-token>
DYNATRACE_API_URL=https://api.dynatrace.com
DYNATRACE_SPEC_URL=https://api.dynatrace.com/spec-json
PORT=5002
NODE_ENV=development
```

### Client (`/client/.env.local`)

Use `/client/.env.example` as a template:

```env
REACT_APP_API_URL=http://localhost:5002
```

## Local development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
git clone https://github.com/ricardojjulia/dynatrace-iam-visualizer.git
cd dynatrace-iam-visualizer
npm run install-all
```

### Run both apps

```bash
npm run dev
```

Default URLs:

- Client: `http://localhost:3000`
- Server: `http://localhost:5002`

## Production build and run

```bash
npm run build
npm start
```

`npm start` launches the compiled server from `/server/dist`.

## API type generation

A local OpenAPI snapshot is available at `/DT-Account-MGMT-API.json`.

Generate TypeScript types in the server workspace:

```bash
npm run generate-types --workspace=server
```

Or use the helper script:

```bash
cd server
./generate-types.sh
```

## Troubleshooting

- **`Dynatrace client not configured` (503):** verify server `.env` values and restart the server.
- **Client cannot reach API:** ensure `REACT_APP_API_URL` points to the running server port.
- **Auth/permission failures from Dynatrace:** validate token scopes for the specific route.
- **`/api/spec` fetch issues:** check outbound network access and `DYNATRACE_SPEC_URL`.

## Testing and linting

Run available checks from repo root:

```bash
npm run build
npm run lint --workspace=server
CI=true npm run test --workspace=client -- --watch=false --passWithNoTests
```

## Contribution workflow

1. Create a feature/fix branch.
2. Keep changes focused and small.
3. Run build/lint/tests relevant to your changes.
4. Open a pull request with a clear description and validation notes.

## License status

No `LICENSE` file is currently present in this repository.

Because no explicit license decision is documented in-repo, this README does **not** assume or invent a legal license. Repository owners should add an explicit license file if they want to grant reuse rights.
