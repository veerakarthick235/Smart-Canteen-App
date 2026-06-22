# 🍽️ Smart Canteen & Stationery Management System

A production-ready web application that allows college students to order food and stationery online, pay securely via Razorpay, and collect items using QR codes — eliminating physical queues.

![Smart Canteen Banner](https://img.shields.io/badge/Status-Production%20Ready-16A34A?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-2563EB?style=for-the-badge&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-1E293B?style=for-the-badge&logo=flask)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-16A34A?style=for-the-badge&logo=mongodb)

---

## ✨ Features

### Student
- 📱 Mobile-friendly product browsing
- 🔍 Search & filter by category
- 🛒 Cart management
- 💳 Secure Razorpay payment
- 📦 QR code generation post-payment
- 📋 Order history tracking
- 👤 Profile management

### Admin
- 📊 Revenue analytics dashboard
- 📦 Product CRUD management
- 📋 Order lifecycle management
- 📷 QR scanner for item collection
- 📈 Charts: Revenue, Top Products, Category Sales

### Security
- 🔐 JWT authentication
- 🔒 bcrypt password hashing
- ✅ Razorpay HMAC-SHA256 verification
- 🛡️ QR one-time-use (atomic MongoDB update)
- 🚫 Role-based access control

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Python Flask 3.0 |
| Database | MongoDB Atlas |
| Auth | JWT (flask-jwt-extended) |
| Payments | Razorpay |
| QR | qrcode (Python) + html5-qrcode (React) |

---

## 📁 Project Structure

```
smart-canteen/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── api/               # Axios instance
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth & Cart contexts
│   │   ├── pages/
│   │   │   ├── student/       # Student-facing pages
│   │   │   └── admin/         # Admin dashboard pages
│   │   └── utils/             # Helper functions
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                   # Flask REST API
│   ├── app.py                 # Flask factory
│   ├── config.py              # Configuration
│   ├── routes/                # API blueprints
│   ├── models/                # MongoDB models
│   ├── middleware/            # JWT & RBAC middleware
│   ├── utils/                 # Password, QR, Razorpay utils
│   └── requirements.txt
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB Atlas account
- Razorpay account (test mode works)

### 1. Clone and Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
copy .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Razorpay keys

# Run development server
python app.py
```

Backend runs on: http://localhost:5000

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
copy .env.example .env
# Edit .env with your Razorpay key ID

# Run development server
npm run dev
```

Frontend runs on: http://localhost:5173

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_canteen
JWT_SECRET_KEY=your-super-secret-jwt-key-minimum-32-chars
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
FLASK_ENV=development
FLASK_DEBUG=True
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
```

---

## 🗄️ MongoDB Setup

### 1. Create Atlas Cluster
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user
4. Whitelist your IP (or 0.0.0.0/0 for development)
5. Copy the connection string to `MONGO_URI`

### 2. Database Indexes (Auto-created on first run)
```javascript
// users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ studentId: 1 }, { unique: true })

// orders collection
db.orders.createIndex({ qrToken: 1 }, { unique: true, sparse: true })
db.orders.createIndex({ userId: 1 })

// products collection
db.products.createIndex({ category: 1 })
db.products.createIndex({ name: "text", description: "text" })
```

### 3. Seed Admin User
```bash
cd backend
python seed_admin.py
# Creates admin: admin@canteen.com / Admin@123
```

---

## 💳 Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Go to Dashboard → Settings → API Keys
3. Generate Test API keys
4. Add `Key ID` to both `.env` files
5. Add `Key Secret` to backend `.env` only

**Test card:** 4111 1111 1111 1111 | Any future expiry | Any CVV

---

## 🔐 Default Admin Account

After seeding:
- **Email:** admin@canteen.com
- **Password:** Admin@123

---

## 📡 API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Student registration |
| POST | /api/auth/login | Login (student + admin) |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/me | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List products (public) |
| GET | /api/products/:id | Get product |
| POST | /api/products | Create product (admin) |
| PUT | /api/products/:id | Update product (admin) |
| DELETE | /api/products/:id | Delete product (admin) |

### Payments & Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment + generate QR |
| GET | /api/orders/my-orders | Student's orders |
| GET | /api/orders/:id | Order detail with QR |

### QR & Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/qr/scan | Scan QR (admin) |
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/orders | All orders |
| GET | /api/admin/analytics/revenue | Revenue data |
| GET | /api/admin/analytics/products | Top products |
| GET | /api/admin/analytics/categories | Category sales |

---

## 🛡️ QR Security Flow

```
Payment Verified (HMAC-SHA256)
         ↓
Generate UUID v4 Token
         ↓
Store in orders.qrToken (unique index)
         ↓
Generate QR PNG (base64)
         ↓
Student shows QR at counter
         ↓
Admin scans QR
         ↓
MongoDB findOneAndUpdate({qrToken, status:'paid'})
         ↓
Atomic: status → 'completed', collectedAt → now
         ↓
If already collected → ALREADY_COLLECTED error
```

---

## 🚢 Production Deployment

### Backend (Gunicorn + Nginx)

```bash
# Install gunicorn (already in requirements.txt)
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Or with systemd service (recommended)
```

**systemd service file** (`/etc/systemd/system/smart-canteen-api.service`):
```ini
[Unit]
Description=Smart Canteen Flask API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/smart-canteen/backend
Environment="PATH=/var/www/smart-canteen/backend/venv/bin"
ExecStart=/var/www/smart-canteen/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

### Frontend (Build + Nginx)

```bash
# Build production bundle
npm run build

# Output in dist/ folder
# Serve with Nginx
```

**Nginx config** (`/etc/nginx/sites-available/smart-canteen`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/smart-canteen/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL (Let's Encrypt)
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 📱 Mobile Deployment

The frontend is fully responsive. For a mobile-first experience:
- Deploy frontend to Vercel/Netlify
- Deploy backend to Railway/Render
- Update CORS_ORIGIN and VITE_API_URL accordingly

---

## 🧪 Testing

```bash
# Backend API testing with curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@canteen.com", "password": "Admin@123"}'

# Run with Postman collection (see docs/postman_collection.json)
```

---

## 📞 Support

For issues or feature requests, raise a GitHub issue.

---

## 📄 License

MIT License — Free for educational and commercial use.
