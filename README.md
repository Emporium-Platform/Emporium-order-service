# Emporium Order Service

The Order Service is a core backend component of the Emporium platform, responsible for processing book purchase requests. It communicates with the Catalog Service to verify availability and pricing, updates inventory, logs each transaction to a persistent CSV file, and supports replication to a secondary order instance.
## Features

- Handles book purchase transactions
- Communicates with the Catalog Service to retrieve and update book info
- Supports replication between order service instances
- Health check endpoint
- Error handling and logging
- Docker support

## Tech Stack

- Node.js
- Axios for HTTP requests
- Docker support

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Emporium-Platform/Emporium-order-service.git
```

2. Install dependencies:
```bash
npm install
```

3. Start the service:
```bash

# Production mode
npm start
```

## Environment Variables

The service can be configured using the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port number for the order service | 4000 |
| CATALOG_SERVICE_URL | URL of the catalog service | http://localhost:5000 |
| GATEWAY_SERVICE_URL | URL of the gateway service | http://localhost:3000 |
| REPLICA_URL | URL of the other order replica | http://localhost:4001 |


## API Endpoints

### Health Check
```
GET /health
```
Returns the health status of the service.

**Response**:
```json
{
  "status": "Order Service healthy"
}

```

### Purchase Book
```
POST /purchase/:itemId
```
Searches for books based on the provided topic.

**Parameters**:
- `itemId ` (path parameter):  The unique identifier of the book to purchase

**Response**: 
```json
{
  "status": "success",
  "message": "bought book <title>"
}
```
### Replicate Purchase
```
POST /replicate
```
Used internally to replicate a purchase log entry from another order instance.

**Response**:
```json
{
  "status": "replicated",
  "message": "Purchase replicated successfully"
}


```



## Running with Docker Compose

The order service is part of a multi-service Docker Compose setup that includes the gateway-service and catalog-service.

### Step 1: Start the Services
To build and run all services together, navigate to the root directory containing the docker-compose.yml file and run:

```bash
docker-compose up --build
```

This command will:
- Build fresh images for emporium-gateway-service, emporium-catalog-service, and emporium-order-service
- Start each service in its own container and connect them over a shared network
- Expose the gateway service on port 3000, the catalog service on port 5000, and the order service on port 4000

## Error Handling

The service includes robust error handling:

- Validates inventory before processing a purchase
- Gracefully handles missing items or catalog service errors
- Logs unexpected failures with appropriate error messages
- Returns meaningful HTTP status codes


## Development

To run the service in development mode with hot-reload:
```bash
npm start
```

The service will automatically restart when changes are detected in the source code.
