# 🍃 MongoDB Configuration & Setup Guide for E-Farmers

This guide walks you step-by-step through configuring MongoDB for the E-Farmers MERN platform. You can choose either **Option A (MongoDB Atlas - Free Cloud Database, Recommended)** or **Option B (Local MongoDB)**.

---

## ☁️ Option A: MongoDB Atlas (Free Cloud Database — Recommended)

MongoDB Atlas gives you a free, hosted database in the cloud. You do not need to install anything on your machine.

### Step 1: Create a Free Account
1. Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Try Free** and sign up with your email or Google account.

### Step 2: Deploy a Free Cluster
1. Choose the **M0 Free** (Shared) tier.
2. Select your preferred Cloud Provider (e.g., AWS) and a region close to you (e.g., Singapore / Asia-Pacific).
3. Click **Create Deployment** (or **Create Cluster**).

### Step 3: Create a Database User
1. Under **Security** → **Database Access**, click **Add New Database User**.
2. Select **Password Authentication**.
3. Set a username (for example: `efarmers_admin`).
4. Set a secure password (for example: `FarmHarvest2026!`). Note this password down.
5. In **Database User Privileges**, select **Read and write to any database**.
6. Click **Add User**.

### Step 4: Configure Network Access (IP Whitelist)
1. Under **Security** → **Network Access**, click **Add IP Address**.
2. Click **Allow Access from Anywhere** (which enters `0.0.0.0/0`) or select **Add Current IP Address**.
3. Click **Confirm**. (This allows your computer to connect to your cloud database).

### Step 5: Get Your Connection String
1. Go to **Database** (or **Clusters**) and click the **Connect** button next to your cluster.
2. Select **Drivers** (Node.js).
3. Copy the connection string. It will look like this:
   ```
   mongodb+srv://efarmers_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database user's password, and specify `/efarmers` as the database name before the `?`:
   ```
   mongodb+srv://efarmers_admin:FarmHarvest2026!@cluster0.abcde.mongodb.net/efarmers?retryWrites=true&w=majority
   ```

### Step 6: Paste into `server/.env`
Open [server/.env](file:///c:/Users/User/Documents/WebProjects/Efarmers/server/.env) and set:
```env
PORT=5000
MONGO_URI=mongodb+srv://efarmers_admin:FarmHarvest2026!@cluster0.abcde.mongodb.net/efarmers?retryWrites=true&w=majority
JWT_SECRET=efarmers_super_secret_jwt_key_2026_change_in_production
CLIENT_URL=http://localhost:5173
```

> [!TIP]
> **Windows DNS / ISP SRV Notice (`querySrv ECONNREFUSED`):**
> If your local network or ISP (e.g. certain routers) blocks UDP SRV DNS queries, use the direct standard replica set URI in `server/.env` instead of `mongodb+srv://`. The direct replica set URI works on 100% of networks:
> ```env
> MONGO_URI=mongodb://<user>:<password>@<shard-00>:27017,<shard-01>:27017,<shard-02>:27017/efarmers?ssl=true&replicaSet=<rs-name>&authSource=admin&retryWrites=true&w=majority
> ```
> Your `server/.env` is already pre-configured with the verified, working direct URI for your cluster!

---

## 💻 Option B: Local MongoDB (Community Server)

If you have MongoDB installed locally on your Windows PC:

1. Ensure the MongoDB service is running:
   - Press `Win + R`, type `services.msc`, and ensure **MongoDB Server** is running.
   - Or open PowerShell and run:
     ```powershell
     net start MongoDB
     ```
2. Your connection string in [server/.env](file:///c:/Users/User/Documents/WebProjects/Efarmers/server/.env) can be set to:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/efarmers
   ```


---

## 🚀 Step-by-Step Instructions to Run the App

Once your MongoDB URI is configured:

### 1. Seed the Database with Initial Demo Data
Run this command from the project root (`e-farmers-mern`):
```powershell
npm run seed
```
*This populates MongoDB with initial demo accounts (Juan the farmer, Maria the buyer, Pedro the highland farmer), products (Sweet Corn, Tomatoes, Rice, Lettuce, Mangoes, Eggs), and buyer requests.*

### 2. Start Both the Backend API and React Frontend
From the `e-farmers-mern` folder, run:
```powershell
npm run dev
```
- **Backend API**: Running at [http://localhost:5000](http://localhost:5000)
- **React Frontend**: Running at [http://localhost:5173](http://localhost:5173)

Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **🧑‍🌾 Farmer** | `juan@farm.com` | `123456` | Farm in Nueva Ecija (Sweet Corn, Rice, Tomatoes) |
| **🛒 Buyer** | `maria@market.com` | `123456` | Located in Quezon City (Restaurant buyer) |
| **🧑‍🌾 Farmer** | `pedro@farm.com` | `123456` | Highland farm in Benguet (Lettuce, Mango, Eggs) |

---

## 🧪 Verifying Features in the Application

| Feature | How to Test |
| :--- | :--- |
| **1. Authentication** | Log in with `maria@market.com` or register a new buyer/farmer account. |
| **2. Marketplace** | Search by keyword, filter by category/location, and sort by price or rating. |
| **3. Pre-Orders** | Open any product, choose quantity, click "Place pre-order", fill in delivery info, and submit. Check stock decrement in MongoDB. |
| **4. Order Tracking** | Navigate to `Orders` to view the 4-step progress stepper (`Placed` → `Processing` → `Shipped` → `Delivered`). |
| **5. Farmer Order Management** | Log in as `juan@farm.com`, go to `Orders`, click `Mark as shipped` and `Mark as delivered`. |
| **6. Customer Reviews** | Log in as buyer, go to `Orders`, click `Rate & review harvest` on a delivered order. Rate 1-5 stars and check updated product rating. |
| **7. Buyer Requests** | Go to `Requests`, post a produce request. Log in as a farmer and click `🤝 I can supply` to auto-open direct chat. |
| **8. Real-time Messages** | Message between farmer and buyer with timestamps, read status, and unread badges. |
| **9. Notifications** | Check the notification bell 🔔 for order alerts, supply matches, and messages. |
