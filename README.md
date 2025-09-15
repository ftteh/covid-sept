# Developer
Teh Fook Tin

# Health Declaration System

A production-ready full-stack health declaration management system built with modern technologies for COVID-19 health screening and monitoring.

# Live Demo
https://covid-front-production.up.railway.app


## 🏗️ System Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: MySQL with Sequelize TypeScript ORM

## 📋 API Endpoints

### Health Declarations API

#### Core CRUD Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/health-declarations` | Create new health declaration |
| `GET` | `/api/health-declarations` | Get paginated declarations with filtering |
| `GET` | `/api/health-declarations/:id` | Get specific declaration by ID |
| `PATCH` | `/api/health-declarations/:id` | Update declaration (status changes) |
| `DELETE` | `/api/health-declarations/:id` | Delete declaration |

#### Analytics & System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health-declarations/stats` | Get dashboard statistics |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api` | API information |
| `GET` | `/api/docs` | Interactive Swagger documentation |

### Query Parameters (GET /api/health-declarations)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (`createdAt` | `name` | `temperature`)
- `sortOrder`: Sort direction (`ASC` | `DESC`)
- `status`: Filter by status (`pending` | `approved` | `rejected`)
- `search`: Search in name, symptoms, or contact details

### Example API Requests

#### Create Health Declaration
```bash
curl -X POST http://localhost:3001/api/health-declarations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "temperature": 36.5,
    "hasSymptoms": false,
    "symptoms": null,
    "hasContact": false,
    "contactDetails": null
  }'
```

## 🗄️ Database Schema

### Health Declarations Table
```sql
CREATE TABLE health_declarations (
  id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
  name VARCHAR(100) NOT NULL,
  temperature DECIMAL(4,2) NOT NULL,
  hasSymptoms BOOLEAN NOT NULL DEFAULT FALSE,
  symptoms TEXT NULL,
  hasContact BOOLEAN NOT NULL DEFAULT FALSE,
  contactDetails TEXT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  ipAddress VARCHAR(45) NULL,
  userAgent TEXT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_created_at (createdAt),
  INDEX idx_name (name),
  INDEX idx_status (status),
  INDEX idx_temperature (temperature)
);
```

### Database Features
- **UUID Primary Keys**: Globally unique identifiers
- **Audit Fields**: IP address and user agent tracking for compliance
- **Optimized Indexes**: Performance indexes on commonly queried fields
- **Data Integrity**: Appropriate constraints and data types
- **Full Unicode Support**: UTF8MB4 character set

## 🛠️ Development Setup

### Prerequisites
- **Node.js 18+** with pnpm package manager
- **MySQL 8.0+** database server

### Quick Start (Local Development)

1. **Clone Repository**
   ```bash
   git clone https://github.com/ftteh/covid
   cd covid
   ```

2. **Backend Setup**
   ```bash
   cd backend

   # Install dependencies
   pnpm install

   # Environment setup
   # Configure .env file

   # Database setup (if running on new db)
   # pnpm run db:migrate
   # pnpm run db:seed:all

   # Start backend server
   pnpm run start:dev
   # Backend runs at http://localhost:3001
   ```

3. **Frontend Setup**
   ```bash
   cd frontend

   # Install dependencies
   pnpm install

   # Environment setup
   # Change NEXT_PUBLIC_API_URL to http://localhost:3001/api to point to backend if running locally

   # Start frontend server
   pnpm run dev
   # Frontend runs at http://localhost:3000
   ```

4. **Access Application**
   - **Frontend UI**: http://localhost:3000
   - **Backend API**: http://localhost:3001/api
   - **API Documentation**: http://localhost:3001/api/docs
   - **Health Check**: http://localhost:3001/api/health

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Unit tests
pnpm run test
```

### Frontend Testing
```bash
cd frontend

# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Build test
pnpm run build
```


