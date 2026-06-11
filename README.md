# 💸 SpendWise

<div align="center">

# 🚀 SpendWise – AI Powered Expense Tracker

### Track Expenses • Manage Budgets • Analyze Spending • AI Receipt Scanning

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render)
![License](https://img.shields.io/badge/License-MIT-purple)

</div>

---

## ✨ Features

### 📊 Expense Management
- ➕ Add expenses & income
- ✏️ Edit transactions
- 🗑️ Delete transactions
- 🏷️ Category-based tracking
- 📅 Date-wise filtering

### 🤖 AI Features
- 📸 AI Receipt Scanner
- 🧠 Smart Spending Forecast
- 💡 AI Insights & Analytics

### 💰 Budget Management
- Monthly budgets
- Budget progress tracking
- Overspending alerts

### 🔄 Subscription Tracking
- Netflix, Spotify, Gym etc.
- Monthly commitment calculator
- Upcoming renewal reminders

### 📈 Analytics
- Pie charts
- Spending trends
- Category analysis
- Financial insights

### 🔐 Authentication
- Email & Password Login
- Google Authentication
- Forgot Password
- Reset Password via Email
- JWT Security

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React
- 🎨 Tailwind CSS
- 🎭 Framer Motion
- 📊 Recharts
- 🔗 Axios

### Backend
- 🟢 Node.js
- 🚂 Express.js
- 🔑 JWT Authentication
- 📧 Nodemailer

### Database
- 🍃 MongoDB Atlas

---

## 📂 Project Structure

```bash
SpendWise/
├── frontend/
├── backend/
├── README.md
└── package.json
```

---

## ⚙️ Local Setup

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd SpendWise
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5003
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
```

Run:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Frontend Deployment (Vercel)

1. Push project to GitHub
2. Import project in Vercel
3. Select frontend folder
4. Deploy

Environment Variables:

```env
VITE_API_URL=https://your-render-backend.onrender.com
```

---

## 🚀 Backend Deployment (Render)

1. Create Web Service
2. Connect GitHub Repository
3. Select backend folder
4. Add Environment Variables
5. Deploy

Required Variables:

```env
MONGO_URI=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
FRONTEND_URL=
```

---

## 📧 Forgot Password Setup

### Gmail SMTP

Enable:
- ✅ 2-Step Verification
- ✅ App Password

Use:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_app_password
```

---

## 📱 Future Improvements

- 🔔 Push Notifications
- 📉 Advanced Forecasting
- 🌍 Multi Currency Support
- 📄 Export PDF Reports
- 🏦 Bank Integration

---

## 👨‍💻 Author

**Raj Soni**

⭐ If you like this project, give it a star on GitHub!
