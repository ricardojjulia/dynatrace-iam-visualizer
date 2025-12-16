# Dynatrace IAM Policy Visualizer

A web-based application that connects to Dynatrace tenants to visualize and evaluate IAM policies through API calls.

## Features

- Connect to Dynatrace tenant via API
- Visualize IAM policies in an interactive dashboard
- Evaluate and analyze policy configurations
- Real-time policy data retrieval and display

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Package Manager**: npm (with workspaces)

## Project Structure

```
dynatrace-iam-visualizer/
├── client/                 # React frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Express backend application
│   ├── src/
│   └── package.json
├── package.json           # Root workspace configuration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Dynatrace tenant access with API credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dynatrace-iam-visualizer.git
cd dynatrace-iam-visualizer
```

2. Install dependencies for all workspaces:
```bash
npm run install-all
```

### Configuration

1. Create environment files:

**Server (`server/.env`)**:
```
DYNATRACE_ENVIRONMENT_ID=your_environment_id
DYNATRACE_API_TOKEN=your_api_token
PORT=5000
```

**Client (`client/.env.local`)**:
```
REACT_APP_API_URL=http://localhost:5000
```

### Development

Start both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Building for Production

```bash
npm run build
```

### Running Production Build

```bash
npm start
```

## API Integration

The application uses the Dynatrace API to retrieve IAM policy information. Ensure your API token has the necessary permissions to read policy data.

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.
