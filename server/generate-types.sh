#!/bin/bash
# Script to generate TypeScript types from OpenAPI spec

echo "Generating TypeScript types from OpenAPI spec..."

# Check if openapi-typescript is installed
if ! command -v openapi-typescript &> /dev/null; then
    echo "Installing openapi-typescript..."
    npm install --save-dev openapi-typescript
fi

# Generate types
openapi-typescript ../DT-Account-MGMT-API.json -o src/generated-types.ts

echo "✅ Types generated successfully in src/generated-types.ts"
echo ""
echo "To use generated types, import them:"
echo "  import type { paths, components } from './generated-types';"
