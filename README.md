
# IP Lookup Service

A NestJS-based REST API for looking up IP address information using the [ipwhois.io API](https://ipwhois.io/documentation). The service caches results using Redis for 60 seconds to optimize performance and stores data in MongoDB for persistent storage.

---

## Features

- **IP Lookup**: Fetch detailed information about an IP address (country, region, city, ISP, timezone, etc.).
- **Caching**: Uses Redis to cache results for 60 seconds to reduce external API calls.
- **Persistent Storage**: Stores lookup results in MongoDB for historical records.
- **Deletion**: Allows deletion of cached results by IP.
- **TTL (Time-to-Live)**: Ensures cached data is auto-removed after 60 seconds.
- **E2E Tested**: Includes comprehensive end-to-end tests.
- **Dockerized**: Fully containerized for seamless deployment.
- **CI/CD**: Automated testing pipeline using GitHub Actions.

---

## Requirements

- **Node.js**: >=18.x
- **MongoDB**: >=6.0
- **Redis**: >=6.2
- **Docker** (optional): To run the service in containers.

---

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/HlibDerbenov/ip-lookup-service.git
   cd ip-lookup-service
   ```

2. Install dependencies:
   ```
   npm install
   ```
   There's a possibility to have an issue related to `mongodb` package. Use this command instead:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure environment variables:
   Create a `.env` file in the project root and specify the following variables:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   MONGODB_URI=mongodb://localhost:27017/ip-lookup
   ```

4. Start the services:
   - **With Docker**:
     ```
     docker-compose up --build
     ```
   - **Without Docker**:
     Ensure Redis and MongoDB are running locally, then start the application:
     ```
     npm run start:dev
     ```

---

## API Endpoints

### **POST** `/lookup`
Fetches and caches IP information.

#### Request Body
```json
{
  "ip": "8.8.8.8"
}
```

#### Response
```json
{
  "ip": "8.8.8.8",
  "country": "USA",
  "region": "California",
  "city": "Mountain View",
  "isp": "Google LLC",
  "timezone": "America/Los_Angeles",
  "createdAt": "2025-01-12T12:00:00Z"
}
```

#### Errors
- **400**: Invalid IP format.
- **503**: Service unavailable.

---

### **GET** `/lookup/:ip`
Retrieves cached or stored IP information.

#### Response
```json
{
  "ip": "8.8.8.8",
  "country": "USA",
  "region": "California",
  "city": "Mountain View",
  "isp": "Google LLC",
  "timezone": "America/Los_Angeles",
  "createdAt": "2025-01-12T12:00:00Z"
}
```

#### Errors
- **404**: IP not found in cache or database.
- **503**: Service unavailable.

---

### **DELETE** `/lookup/:ip`
Deletes cached IP information for a specific address.

#### Response
```json
{
  "message": "IP 8.8.8.8 successfully deleted"
}
```

#### Errors
- **404**: IP not found in cache.

---

## Tests

The project includes tests.

### Run tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

---

## Docker Setup

### Build and Run with Docker Compose
To run the service and dependencies (Redis and MongoDB) in containers:
```bash
docker-compose up --build
```

### Stopping and Cleaning Up
```bash
docker-compose down
```

---

## CI/CD Pipeline

The project includes a GitHub Actions workflow for automated testing on every push and pull request.

### Workflow Features
- **Linting**: Ensures code quality using ESLint.
- **Testing**: Runs unit, integration, and E2E tests in isolated environments.

### Triggered Events
- Pushes to the `master` branch.
- Pull requests targeting the `master` branch.

---

## Project Structure

```
ip-lookup-service/
├── src/
│   ├── app.module.ts 
│   ├── main.ts
│   ├── lookup/
│   │   ├── lookup.controller.ts
│   │   ├── lookup.service.ts
│   │   ├── lookup.entity.ts
│   │   ├── dto/
│   ├── cache/
│   │   ├── cache.module.ts
│   │   ├── cache.service.ts
│   ├── database/
│   │   ├── database.module.ts
├── test/
│   ├── e2e/
│   ├── lookup/
├── docker-compose.yml
├── .github/workflows/ci.yml
├── package.json
├── tsconfig.json
├── README.md
```

---

## License

This project is licensed under the [MIT License](LICENSE).
