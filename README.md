


---

# Google Docs Clone — Backend (Express + MongoDB + Socket.IO)

This is the backend API and real-time socket server for the Google Docs Clone. Built using **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

---
## 🔗 Useful Links

> **Live App:** [google-docs-frontend-chi.vercel.app](https://google-docs-frontend-chi.vercel.app/)

> **GitHub Repo:** [github.com/mohamim360/GoogleDocs-frontend](https://github.com/mohamim360/GoogleDocs-frontend)

> **Live API:** [googledocs-backend-smh1.onrender.com](https://googledocs-backend-smh1.onrender.com/)

> **GitHub Repo:** [github.com/mohamim360/GoogleDocs-backend](https://github.com/mohamim360/GoogleDocs-backend)


---

## 🚀 Features

### 🔐 Authentication (JWT)

* Register/Login with full name, avatar, email, and password
* JWT token authentication
* Protected routes middleware

### 📄 Document Management

* Create, update, delete documents
* Auto-save on edit
* Quill delta text stored in MongoDB

### ⚡ Real-Time Collaboration

* WebSocket rooms using **Socket.IO**
* Broadcast live text changes
* Sync content between multiple users instantly

### 🤝 Sharing & Permissions

* Share document via email
* Permissions: Editor or Viewer
* Only owner or shared users can access the document

### 👥 User Presence

* Track users currently viewing/editing a document
* Display list of online users with name/avatar

---

## 🧪 Tech Stack

* **Server:** Express.js
* **Database:** MongoDB + Mongoose
* **Auth:** JWT + bcrypt
* **Real-Time:** Socket.IO
* **CORS:** Enabled for Vercel frontend


---

## 🛠️ Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/mohamim360/GoogleDocs-backend.git

# 2. Install dependencies
cd GoogleDocs-backend
npm install

# 3. Setup environment variables
Create a `.env` file:
```

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://google-docs-frontend-chi.vercel.app
```

```bash
# 4. Run server
npm run dev
```

---
