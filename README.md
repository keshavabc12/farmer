# 🌿 SOILSENSE – Soil Research & Adoption Platform

A comprehensive research study tool for MBA students at **SIT Tumakuru**. This application tracks farmer awareness, accessibility barriers, and fertilizer adoption patterns in rural agriculture.

---

## 📁 Project Structure

```
farmer/
├── backend/
│   ├── models/Farmer.js      # Updated SOILSENSE schema (30 questions)
│   ├── routes/farmers.js     # Analytics-enhanced REST API
│   ├── server.js             # Express entry point
│   ├── .env                  # 🔑 Add your MongoDB URI here
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/Layout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewSurvey.jsx  # 30-question strictly validated form
│   │   │   ├── Responses.jsx  # CSV Export enabled
│   │   │   ├── Analytics.jsx  # Question-level dynamic graphs
│   │   │   └── Settings.jsx
│   │   ├── utils.js           # Image resizing & CSV export utilities
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start

### Step 1 – Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → create a free cluster
2. Create a database user and whitelist your IP (`0.0.0.0/0` for dev)
3. Copy the connection string and paste it into `backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/soilsense?retryWrites=true&w=majority
PORT=5000
```

### Step 2 – Install Dependencies

Open **two terminals**:

**Terminal 1 – Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Step 3 – Open the App

- Frontend → [http://localhost:5173](http://localhost:5173)
- Backend API → [http://localhost:5000](http://localhost:5000)

---

## 📱 Key Features

- ✅ **Strict Validation**: All 30 questions must be completed before submission.
- 📸 **Automatic Image Compression**: Photos are optimized to resolve "high image size" errors.
- 📊 **Dynamic Analytics**: Question-level breakdown with **Downloadable PNG Graphs**.
- 📥 **CSV Export**: Export all responses for professional analysis.
- 🌿 **Premium Earth-Toned Design**: Modern, responsive UI tailored for field research.
- 🎓 **Academic Branding**: Dedicated to SIT Tumakuru MBA Research.

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Axios               |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB Atlas (Mongoose ODM)        |
| Styling   | Vanilla CSS, Google Fonts           |
| Utils     | Canvas (Image Processing), CSV Blob  |
