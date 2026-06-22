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

## 💳 Razorpay Setup

1. Create account at [razorpay.com](https://razorpay.com)
2. Go to Dashboard → Settings → API Keys
3. Generate Test API keys
4. Add `Key ID` to both `.env` files
5. Add `Key Secret` to backend `.env` only

**Test card:** 4111 1111 1111 1111 | Any future expiry | Any CVV

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

## 📱 Mobile Deployment

The frontend is fully responsive. For a mobile-first experience:
- Deploy frontend to Vercel/Netlify
- Deploy backend to Railway/Render
- Update CORS_ORIGIN and VITE_API_URL accordingly

---

## 📄 License

MIT License — Free for educational and commercial use.
