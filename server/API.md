# Dynatrace IAM Policy Visualizer - API Documentation

## Overview

The backend API provides RESTful endpoints for managing Dynatrace IAM policies, users, groups, and permissions.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints require the Dynatrace API token to be configured in the server environment variables:
- `DYNATRACE_ENVIRONMENT_ID`
- `DYNATRACE_API_TOKEN`
- `DYNATRACE_API_URL`

## Endpoints

### Health & Status

#### Get Server Health
```
GET /health
```

**Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2025-12-16T10:30:00Z",
  "dynatraceConfigured": true,
  "apiVersion": "1.0.0"
}
```

---

### Policies

#### List Policies
```
GET /policies?levelType=account&levelId=<uuid>
```

**Query Parameters:**
- `levelType` (required): `account` or `environment`
- `levelId` (required): Account UUID or Environment ID

**Response:**
```json
{
  "policies": [
    {
      "uuid": "policy-uuid",
      "name": "Policy Name",
      "description": "Policy Description"
    }
  ]
}
```

#### Get Specific Policy
```
GET /policies/:policyUuid?levelType=account&levelId=<uuid>
```

**Response:**
```json
{
  "uuid": "policy-uuid",
  "name": "Policy Name",
  "description": "Description",
  "statementQuery": "resource \"service\" action \"read\"",
  "tags": ["tag1", "tag2"],
  "statements": [...]
}
```

#### Create Policy
```
POST /policies
Content-Type: application/json

{
  "levelType": "account",
  "levelId": "<uuid>",
  "name": "New Policy",
  "description": "Policy description",
  "statementQuery": "resource \"service\" action \"read\"",
  "tags": ["tag1"]
}
```

**Response:** `201 Created`

#### Update Policy
```
PUT /policies/:policyUuid
Content-Type: application/json

{
  "levelType": "account",
  "levelId": "<uuid>",
  "name": "Updated Policy",
  "description": "Updated description",
  "statementQuery": "resource \"service\" action \"read\" condition \"resourceId\" equals \"test\""
}
```

**Response:** `200 OK`

#### Delete Policy
```
DELETE /policies/:policyUuid?levelType=account&levelId=<uuid>&force=false
```

**Query Parameters:**
- `levelType`: `account` or `environment`
- `levelId`: Account UUID or Environment ID
- `force`: Set to `true` to delete policies in use

**Response:** `204 No Content`

#### Validate Policy
```
POST /policies/validate
Content-Type: application/json

{
  "levelType": "account",
  "levelId": "<uuid>",
  "name": "Policy Name",
  "description": "Description",
  "statementQuery": "resource \"service\" action \"read\""
}
```

**Response:**
```json
{
  "warnings": ["warning message"]
}
```

---

### Groups

#### List Groups
```
GET /groups
```

**Response:**
```json
{
  "count": 2,
  "items": [
    {
      "uuid": "group-uuid",
      "name": "Group Name",
      "description": "Group Description",
      "owner": "LOCAL",
      "createdAt": "2025-12-16T10:00:00Z",
      "updatedAt": "2025-12-16T10:00:00Z"
    }
  ]
}
```

#### Create Groups
```
POST /groups
Content-Type: application/json

[
  {
    "name": "New Group",
    "description": "Group description",
    "federatedAttributeValues": ["attr1", "attr2"]
  }
]
```

**Response:** `201 Created`

#### Get Group Users
```
GET /groups/:groupUuid/users
```

**Response:**
```json
{
  "count": 5,
  "items": [
    {
      "uid": "user-uuid",
      "email": "user@example.com",
      "name": "John",
      "surname": "Doe",
      "userStatus": "ACTIVE",
      "emergencyContact": false
    }
  ]
}
```

#### Update Group
```
PUT /groups/:groupUuid
Content-Type: application/json

{
  "name": "Updated Group",
  "description": "Updated description",
  "federatedAttributeValues": ["new-attr"]
}
```

**Response:** `204 No Content`

#### Delete Group
```
DELETE /groups/:groupUuid
```

**Response:** `204 No Content`

---

### Users

#### List Users
```
GET /users?serviceUsers=false
```

**Query Parameters:**
- `serviceUsers`: Include service users (default: `false`)

**Response:**
```json
{
  "count": 10,
  "items": [
    {
      "uid": "user-uuid",
      "email": "user@example.com",
      "name": "John",
      "surname": "Doe",
      "userStatus": "ACTIVE",
      "emergencyContact": false,
      "userLoginMetadata": {
        "successfulLoginCounter": 42,
        "failedLoginCounter": 2,
        "lastSuccessfulLogin": "2025-12-16T09:30:00Z",
        "lastFailedLogin": "2025-12-15T15:00:00Z",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-12-16T09:30:00Z"
      }
    }
  ]
}
```

#### Create User
```
POST /users
Content-Type: application/json

{
  "email": "newuser@example.com"
}
```

**Response:** `201 Created`

#### Get User Groups
```
GET /users/:email/groups
```

**Response:** List of groups the user belongs to

#### Add User to Groups
```
POST /users/:email/groups
Content-Type: application/json

["group-uuid-1", "group-uuid-2"]
```

**Response:** `201 Created`

#### Set User Groups (Replace)
```
PUT /users/:email/groups
Content-Type: application/json

["group-uuid-1", "group-uuid-2"]
```

**Response:** `200 OK`

#### Remove User
```
DELETE /users/:email
```

**Response:** `204 No Content`

---

### Bindings

#### Get Group Policies
```
GET /bindings/groups/:groupUuid?levelType=account&levelId=<uuid>
```

**Response:**
```json
{
  "policyUuids": ["policy-uuid-1", "policy-uuid-2"]
}
```

#### Update Group Policies
```
PUT /bindings/groups/:groupUuid
Content-Type: application/json

{
  "levelType": "account",
  "levelId": "<uuid>",
  "policyUuids": ["policy-uuid-1"]
}
```

**Response:** `204 No Content`

#### Get All Policy Bindings
```
GET /bindings?levelType=account&levelId=<uuid>
```

**Response:**
```json
{
  "levelType": "account",
  "levelId": "<uuid>",
  "policyBindings": [
    {
      "policyUuid": "policy-uuid",
      "groups": ["group-uuid-1", "group-uuid-2"],
      "parameters": {},
      "metadata": {},
      "boundaries": []
    }
  ]
}
```

---

### Permissions

#### Get Effective Permissions
```
GET /permissions/effective?levelType=account&levelId=<uuid>&entityId=<id>&entityType=user|group
```

**Query Parameters:**
- `levelType`: `account` or `environment`
- `levelId`: Account UUID or Environment ID
- `entityId`: User or Group ID
- `entityType`: `user` or `group`
- `services` (optional): Comma-separated list of services

**Response:**
```json
{
  "effectivePermissions": [
    {
      "permission": "service:read",
      "effects": [
        {
          "effect": "allow",
          "conditions": [],
          "effectivePolicies": [
            {
              "policy": {
                "uuid": "policy-uuid",
                "name": "Policy Name",
                "statementQuery": "...",
                "levelType": "account",
                "levelId": "<uuid>"
              },
              "binding": {
                "groupUuid": "group-uuid",
                "levelType": "account",
                "levelId": "<uuid>"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "timestamp": "2025-12-16T10:30:00Z"
}
```

### Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE/PUT request (no body)
- `400 Bad Request` - Invalid request parameters
- `503 Service Unavailable` - Dynatrace client not configured
- `500 Internal Server Error` - Server error

---

## Development

### Install Dependencies
```bash
npm install
```

### Run in Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

### Generate Types from OpenAPI Spec
```bash
npm run generate-types
```

---

## Environment Variables

Create a `.env` file in the server directory:

```env
DYNATRACE_ENVIRONMENT_ID=your_environment_id
DYNATRACE_API_TOKEN=your_api_token
DYNATRACE_API_URL=https://your-environment.live.dynatrace.com
PORT=5000
NODE_ENV=development
```

---

## Examples

### Create a Policy
```bash
curl -X POST http://localhost:5000/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "levelType": "account",
    "levelId": "account-uuid",
    "name": "Read Only Policy",
    "description": "Allows read-only access",
    "statementQuery": "resource \"dynatrace.com:*\" action \"read\""
  }'
```

### Get Effective Permissions
```bash
curl "http://localhost:5000/api/permissions/effective?levelType=account&levelId=account-uuid&entityId=user-uuid&entityType=user"
```

### List Groups
```bash
curl http://localhost:5000/api/groups
```
