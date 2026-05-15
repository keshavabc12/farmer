# 🌿 Mitti Mitra – Soil Research Platform

A full-stack web application for tracking farmer surveys across villages.  
Built with **React + Vite** (frontend), **Node.js + Express** (backend), and **MongoDB Atlas** (database).

---

## 📁 Project Structure

```
farmer/
├── backend/
│   ├── models/Farmer.js      # MongoDB schema
│   ├── routes/farmers.js     # REST API routes
│   ├── server.js             # Express entry point
│   ├── .env                  # 🔑 Add your MongoDB URI here
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/Layout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewSurvey.jsx
│   │   │   ├── Responses.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Settings.jsx
│   │   ├── context/ToastContext.jsx
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
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/mitti-mitra?retryWrites=true&w=majority
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

## 🔌 API Endpoints

| Method | Route                    | Description              |
|--------|--------------------------|--------------------------|
| GET    | `/api/farmers`           | List all farmers (filters + pagination) |
| GET    | `/api/farmers/stats`     | Dashboard statistics     |
| GET    | `/api/farmers/:id`       | Get single farmer        |
| POST   | `/api/farmers`           | Create new survey        |
| PUT    | `/api/farmers/:id`       | Update survey            |
| DELETE | `/api/farmers/:id`       | Delete record            |

### Filter Query Params (GET /api/farmers)
`?status=Complete&cropType=Cotton&village=Dharwad&ageGroup=31-50&page=1&limit=10`

---

## 🛠️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Axios               |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB Atlas (Mongoose ODM)        |
| Styling   | Vanilla CSS, Google Fonts           |
| Fonts     | Crimson Pro, DM Sans                |

---

## 📱 Features

- ✅ Fully **responsive** – works on mobile & desktop
- 📊 **Live dashboard** with real-time MongoDB stats
- 📝 **Multi-step survey form** (5 sections)
- 📋 **Paginated responses** table with filters & delete
- 📈 **Analytics** with SVG donut charts & metric bars
- 🌿 **Mobile drawer**, sticky header, bottom nav
- 💾 Draft & Complete submission states
- 🔔 Toast notification system
- ⚙️ Settings & system status page
