# 🌿 E-Farmers — MERN Full-Stack Agricultural Marketplace

A modern, full-stack **MERN (MongoDB, Express, React, Node.js)** platform that connects farmers directly with buyers. Farmers upload their harvest schedules with dates and prices, while buyers pre-order fresh produce directly, track orders through an interactive timeline, post custom produce requests, and coordinate via secure in-app messaging.

---

## 🏗️ Architecture & Technologies

- **MongoDB**: NoSQL database with Mongoose schemas for `Users`, `Products`, `Orders`, `BuyerRequests`, `Reviews`, `Messages`, and `Notifications`.
- **Express.js & Node.js**: RESTful API server with JWT authentication, role-based protection (`farmer` vs `buyer`), atomic stock management, and automatic notifications.
- **React 18 & Vite**: Fast, responsive frontend preserving the rich agricultural green & amber visual aesthetic with modern CSS, live state management, and real-time updates.

---

## 📁 Project Structure

```
e-farmers-mern/
├── server/                      # Node.js + Express backend
│   ├── config/
│   │   └── db.js                # MongoDB connection handler
│   ├── middleware/
│   │   └── auth.js              # JWT verification & role middleware
│   ├── models/                  # Mongoose models
│   │   ├── User.js              # Farmer and Buyer accounts
│   │   ├── Product.js           # Produce listings with harvest dates & stock
│   │   ├── Order.js             # Pre-orders with status & delivery details
│   │   ├── BuyerRequest.js      # Custom produce requests
│   │   ├── Review.js            # Star ratings & comments
│   │   ├── Message.js           # Chat messages between users
│   │   └── Notification.js      # In-app alerts
│   ├── routes/                  # Express API routes
│   │   ├── authRoutes.js        # Register, login, current user
│   │   ├── productRoutes.js     # Search, filter, CRUD listings
│   │   ├── orderRoutes.js       # Pre-order creation & status stepper
│   │   ├── requestRoutes.js     # Community supply requests
│   │   ├── reviewRoutes.js      # Post & fetch ratings
│   │   ├── messageRoutes.js     # Direct messaging & contacts
│   │   ├── notificationRoutes.js# Notification feeds & read markers
│   │   └── statsRoutes.js       # Home stats & role dashboard metrics
│   ├── scripts/
│   │   └── seed.js              # Database seeder script
│   ├── .env.example             # Environment variable template
│   ├── .env                     # Local configuration
│   ├── package.json
│   └── server.js                # API entry point
│
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── Navbar.jsx       # Header, role badges & notification bell
│   │   │   ├── Footer.jsx       # Platform info & links
│   │   │   ├── Modal.jsx        # Dialog popups
│   │   │   ├── Timeline.jsx     # 4-stage order stepper
│   │   │   └── StarRating.jsx   # 1-5 star input & display
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # User session & JWT handler
│   │   │   ├── NotificationContext.jsx # Alert feeds & polling
│   │   │   └── ToastContext.jsx # Toast alerts
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Hero banner & platform metrics
│   │   │   ├── Marketplace.jsx  # Produce search, filter & sort
│   │   │   ├── ProductDetail.jsx# Harvest details, reviews & pre-order
│   │   │   ├── Checkout.jsx     # Delivery & payment selection
│   │   │   ├── Dashboard.jsx    # Role-tailored user dashboard
│   │   │   ├── ListingForm.jsx  # Add/Edit produce listings
│   │   │   ├── Orders.jsx       # Order tracking & review submission
│   │   │   ├── BuyerRequests.jsx# Produce request feed & supply offers
│   │   │   ├── Messages.jsx     # In-app secure chat
│   │   │   └── Auth.jsx         # Login & account creation
│   │   ├── utils/
│   │   │   └── constants.js     # Currency, categories, date helpers
│   │   ├── App.jsx              # Main router & state manager
│   │   ├── index.css            # Custom responsive design system
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── MONGODB_SETUP.md             # Detailed MongoDB configuration instructions
├── package.json                 # Root script runner (concurrently)
└── README.md
```

---

## ⚡ Quick Start

### 1. MongoDB Configuration
Make sure your MongoDB is configured in `server/.env`.
- For **Local MongoDB**: `mongodb://127.0.0.1:27017/efarmers`
- For **MongoDB Atlas (Free Cloud)**: See [MONGODB_SETUP.md](file:///c:/Users/User/Documents/WebProjects/Efarmers/MONGODB_SETUP.md) for a step-by-step setup guide.

### 2. Populate Demo Data
```powershell
npm run seed
```

### 3. Launch App (Backend + Frontend)
```powershell
npm run dev
```

Open your browser at **http://localhost:5173**!

---

## 👥 Demo Logins

- **Farmer Account**: `juan@farm.com` / `123456`
- **Buyer Account**: `maria@market.com` / `123456`
- **Highland Farmer**: `pedro@farm.com` / `123456`
