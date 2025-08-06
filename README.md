---

# PingMe - Real-time Chat App

A full-stack real-time chat application with modern UI, built using **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

## 🚀 Live Demo

- 🔗 [Frontend](https://ping-me-seven.vercel.app/)
- 🔗 [Backend API](https://ping-me-backend-6iy1.onrender.com/)

---

## Features

**Authentication**

* Register and login securely (JWT)
* Password hashing with bcrypt

**Real-time Messaging**

* 1-to-1 messaging with **Socket.IO**
* Message read receipts
* Timestamps
* **Typing indicators** to show when the other user is typing
* **Unread message count** badges for each chat
* **Online/offline status** with dynamic **last seen** updates

**Media & Files**

* Image, video, and file sharing via **Cloudinary**
* Preview of media inside chat

**Message Actions**

* Copy text or link
* Delete message for yourself
* Delete message for everyone

**User Profile**

* Editable display name, profile pic and bio
* Online/offline indicator

**Chat UI**

* Search chats
* Start 1-to-1 chat with anyone with a PingMe Account
* Typing indicators in chat list and chat window
* Unread message counts
* Responsive dark theme

**Upcoming (Work in Progress)**

* End-to-end encryption of messages
* Group chat support


## 🛠️ Tech Stack

**Frontend**

* React
* Vite
* Redux Toolkit
* React Router
* Tailwind CSS
* Socket.IO Client

**Backend**

* Node.js
* Express
* MongoDB (Mongoose)
* Socket.IO
* Cloudinary (media uploads)
* Multer
* JWT & bcrypt

---

## ⚙️ Setup Instructions

### 📁 Clone this repository

```bash
git clone https://github.com/PROJITAKAR/Ping_Me.git
cd Ping_Me
```

---

### 🖥️ Backend

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file with:

   ```
   PORT=5000
   MONGODB_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NODE_ENV=development
   ```
3. Start server:

   ```bash
   npm run dev
   ```

---

### 🌐 Frontend

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file with:
   ```
   VITE_SOCKET_URL=https://ping-me-backend-6iy1.onrender.com
   VITE_BACKEND_URL=https://ping-me-backend-6iy1.onrender.com
   ```
3. Start app:

   ```bash
   npm run dev
   ```

---

## Folder Structure

```
Ping_Me
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── Socket
│   ├── config
│   ├── middlewares
│   ├── utils
│   └── app.js
├── frontend
│   ├── src
│   │   ├── Layouts
│   │   ├── components
│   │   ├── app
│   │   ├── assets
│   │   ├── context
│   │   ├── features
│   │   ├── pages
│   │   ├── utils
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── App.jsx
```

---

## 🙏 Acknowledgements

* [React](https://react.dev/)
* [Express](https://expressjs.com/)
* [Socket.IO](https://socket.io/)
* [Cloudinary](https://cloudinary.com/)
* [Tailwind CSS](https://tailwindcss.com/)

---

## 📌 TODO

* [ ] Implement end-to-end encryption
* [ ] Add group chat support

---
