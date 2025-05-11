# 🤖 AI Chatbot (MERN Stack)

A full-stack AI-powered chatbot built using the *MERN stack (MongoDB, Express.js, React, Node.js)*. This application allows users to interact with an intelligent chatbot capable of responding to queries dynamically, with support for user authentication and project management.

---

## 🚀 Features

- 🔐 User authentication (login/register)
- 💬 AI-based chatbot powered by OpenAI (or your custom logic)
- 📂 Project and conversation management
- 🧠 RESTful API architecture for scalability
- ⚙ MongoDB integration for data persistence

---

## 🛠 Tech Stack

### Frontend
- React.js
- Axios
- TailwindCSS 
- JWT for token-based auth

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- OpenAI API (or custom NLP logic)
- JWT-based authentication
- Modular MVC structure

---

## 📁 Folder Structure

AI-Chatbot/
│
├── frontend/ # React frontend
├── backend/ # Express server & API routes
│ ├── controllers/
│ ├── models/
│ ├── middleware/
│ ├── db/
│ └── app.js, server.js
├── .env # Environment variables
└── README.md

---

## 🧪 Getting Started

### 1. Clone the Repository
-git clone https://github.com/yourusername/AI-Chatbot.git
-cd AI-Chatbot

### 2. Backend Setup
-cd backend
npm install
#### Add your MongoDB URI and secrets in .env
-npm start

### 3. Frontend Setup
-cd ../frontend
-npm install
-npm start

---

### 🌐 API Endpoints (Backend)
-Method	Endpoint	        Description
-POST	/api/user/login	    Login user
-POST	/api/user/register	Register new user
-POST	/api/chat/ask	      Get response from chatbot
-GET	  /api/project	      Get projects for user

### 🙋‍♂ Author
Harshit Jain

