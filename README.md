# 🏦 Himakeu Finance Backend

Backend system untuk manajemen keuangan HIMAKEU dengan architecture dual database.

## 🏗️ Architecture

- **PostgreSQL** (`himakeu_master`): Master data, users, members, authentication
- **MySQL** (`himakeu_transactions`): Transaction data, payments, categories
- **Node.js + Express**: REST API server
- **Session-based Authentication**: Secure user sessions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MySQL 8.0+
- PostgreSQL 13+

### 1. Clone & Install
```bash
git clone <repository-url>
cd backend
npm install
npm install pg  # PostgreSQL client
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

#### MySQL Setup (Transaction Database)
```sql
-- 1. Create database and user
CREATE DATABASE himakeu_transactions;
CREATE USER 'himakeu_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON himakeu_transactions.* TO 'himakeu_user'@'localhost';
FLUSH PRIVILEGES;

-- 2. Import tables
mysql -u himakeu_user -p himakeu_transactions < sql/mysql/transactions.sql
```

#### PostgreSQL Setup (Master Database)  
```sql
-- 1. Create user and database
CREATE USER himakeu_user WITH PASSWORD 'your_password';
CREATE DATABASE himakeu_master OWNER himakeu_user;
GRANT ALL PRIVILEGES ON DATABASE himakeu_master TO himakeu_user;

-- 2. Import tables
psql -U himakeu_user -d himakeu_master -f sql/postgresql/master.sql
```

### 4. Start Server
```bash
npm run dev
```

Expected output:
```
✅ MySQL connected successfully (Transactions Database)
✅ PostgreSQL connected successfully (Master Data Database) 
✅ All database connections established
🏗️  Architecture: MySQL (Transactions) + PostgreSQL (Master Data)
🚀 Himakeu Finance Backend Server Started
📍 Server running on: http://localhost:3000
```

### 5. Test Installation
```bash
# Health check
curl http://localhost:3000/api/health

# Admin login (default credentials)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🧪 API Testing

Import `test/api-requests.http` to VS Code REST Client or use the requests below:

### Authentication
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Registration
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "nim": "202310110001",
  "fullName": "Test User",
  "email": "test@himakeu.com",
  "phone": "081234567890",
  "department": "Teknik Informatika",
  "yearJoined": 2023,
  "username": "testuser",
  "password": "test123"
}
```

## 📊 Database Schema

### PostgreSQL (himakeu_master)
- `members`: Member master data
- `users`: Authentication data
- `user_sessions`: Active sessions
- `audit_logs`: System audit trail

### MySQL (himakeu_transactions)  
- `transactions`: Financial transactions
- `member_dues`: Member dues tracking
- `categories`: Transaction categories
- `transaction_logs`: Transaction audit

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 3000 |
| `MYSQL_*` | MySQL connection | - |
| `POSTGRES_*` | PostgreSQL connection | - |
| `SESSION_SECRET` | Session encryption key | - |

### Default Users
| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| `admin` | `admin123` | admin | System administrator |
| `testmember` | `admin123` | member | Testing member functions |

## 📁 Project Structure
```
backend/
├── config/
│   └── database.js          # Database connections
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── memberController.js  # Member operations
│   └── adminController.js   # Admin operations
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation
├── routes/
│   ├── auth.js             # Auth routes
│   ├── member.js           # Member routes
│   └── admin.js            # Admin routes
├── sql/
│   ├── mysql/
│   │   └── transactions.sql # MySQL schema
│   └── postgresql/
│       └── master.sql      # PostgreSQL schema
├── test/
│   └── api-requests.http   # API test requests
├── uploads/                # File uploads
├── .env.example           # Environment template
├── server.js              # Main server file
└── package.json
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u himakeu_user -p himakeu_transactions -e "SELECT 1;"

# Test PostgreSQL connection  
psql -U himakeu_user -d himakeu_master -c "SELECT 1;"
```

### Common Errors
- **Error 28P01**: PostgreSQL password authentication failed
  - Check username/password in .env
  - Ensure user has database access privileges

- **Error ER_ACCESS_DENIED_ERROR**: MySQL access denied
  - Verify MySQL user credentials
  - Check GRANT privileges

### Reset Admin Password
```sql
-- PostgreSQL
UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE username = 'admin';
-- Password reset to: admin123
```

## 🔒 Security Notes

1. **Change default passwords** in production
2. **Update SESSION_SECRET** with random string
3. **Configure CORS** for production frontend URL
4. **Use HTTPS** in production
5. **Regular database backups**

## 📞 Support

- Backend Developer: Malikaaaa77
- Created: June 12, 2025
- Architecture: Dual Database (MySQL + PostgreSQL)

## 🎯 Next Steps for Frontend Developer

1. Clone this repository
2. Follow setup instructions above
3. Server will run on `http://localhost:3000`
4. Frontend should connect to this URL
5. Use provided API endpoints
6. Test with `test/api-requests.http`

Happy coding! 🚀