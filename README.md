# 🎓 Smart Campus - SPNREC Digital Campus System
 
> **Bridging the gap between Students and Administration with transparency and efficiency.**

![Project Status](https://img.shields.io/badge/Status-Live-success)


**Smart Campus** is a real-time web application designed to digitize campus interactions. It replaces outdated notice boards and manual complaint registers with a centralized digital platform. Whether it's tracking lost items, raising hostel issues, or broadcasting official announcements, Smart Campus handles it all.

---

## 🔗 Live Demo
🚀 **[Click here to view the Live Website](https://spnrec-campus.onrender.com)**


---

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
- [📂 Project Structure](#-project-structure)
- [⚙️ System Workflow](#-system-workflow)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Installation & Setup](#-installation--setup)
- [🔑 Admin Credentials](#-admin-credentials)
- [📡 API Endpoints](#-api-endpoints)

---

## ✨ Key Features

### 1. 📢 Digital Notice Board
- **Admin Exclusive:** Only verified administrators can post notices.
- **Real-Time Updates:** Students see important updates (exams, holidays, events) instantly.
- **Categorization:** Notices are tagged (Event, Holiday, Academics) for easy filtering.

### 2. 🗳️ Transparent Complaint System
- **Community Driven:** Students can raise issues (WiFi, Hostel, Classroom).
- **Voting Mechanism:** Upvote/Downvote logic allows the administration to prioritize urgent issues.
- **Auto-Expiry:** Resolved issues disappear automatically after 5 days to keep the dashboard clean.

### 3. 🔍 Lost & Found Hub
- **Peer-to-Peer:** Students report lost or found items directly.
- **Privacy First:** "Contact Owner" feature connects users via email without exposing personal phone numbers.
- **Self-Management:** Authors can delete their items once the item is retrieved.

### 4. 🔐 Secure Authentication
- **Role-Based Access Control (RBAC):** Distinct dashboards for **Students** and **Admins**.
- **Admin Verification:** Requires a secure passcode (`Spark@2025`) to create admin accounts.
- **Security:** Passwords are hashed using **Bcrypt**, and sessions are secured with **JWT**.

---

## 📂 Project Structure

This project follows a **Monolithic Architecture** where the Backend serves the Frontend.

```bash
SPNREC-campus/
│
├── backend/                   # 🧠 Server Side Logic
│   ├── models/                # MongoDB Schemas (User, Issue, Notice, LostFound)
│   ├── routes/                # API Endpoints
│   │   ├── apiRoutes.js       # Main logic (Notices, Issues, LF)
│   │   └── authRoutes.js      # Login & Signup logic
│   ├── server.js              # Entry point (Express App)
│   └── .env                   # Environment Variables
│
├── frontend/                  # 🎨 Client Side UI
│   ├── index.html             # Single Page Application
│   ├── style.css              # Styling
│   └── script.js              # API Calls & DOM Manipulation
│
├── package.json               # Dependencies
└── README.md                  # Documentation
```

# 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Atlas Cloud)
* **Authentication:** JWT (JSON Web Tokens), Bcrypt.js
* **Deployment:** Render (Web Service)

---

## 🚀 Installation & Setup

Follow these steps to run the project locally on your machine.

### Prerequisites

* Node.js installed.
* MongoDB Connection String (Atlas).

### 1. Clone the Repository

```bash
git clone [https://github.com/codeXs-cloud/SPNREC-campus.git](https://github.com/codeXs-cloud/SPNREC-campus.git)
cd SPNREC-campus 
```
### 2. Install Dependencies
Navigate to the `backend` folder (where `package.json` lives) and install the required libraries.

```bash
cd backend
npm install
```
### 3. Environment Configuration
Create a `.env` file inside the `backend` folder and add the following configuration:

```env  
PORT=3000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=SparkHackathon2025
```
### 4. Start the Server
Run the following command to start the backend server:

```bash  
node server.js
```
## 🔑 Admin Credentials
To test the **Admin** features (like Posting Notices), use these credentials during the Sign-Up process:

* **Role:** Select `Admin`
* **Admin Passcode:** `Spark@2025`

---

## 📡 API Endpoints

| Method |      Endpoint |         Description |       Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Create new account | Public |
| **POST** | `/api/auth/login` |  Login & get Token | Public |
| **GET** | `/api/notices` |      Fetch all notices | Public |
| **POST** | `/api/notices` |     Create a notice | Admin Only |
| **GET** | `/api/complaints` |   Fetch all issues | Public |
| **POST** | `/api/complaints` |  Raise an issue | Logged In |
| **PATCH** | `/api/complaints/:id/vote` | Upvote/Downvote | Logged In |
| **DELETE** | `/api/complaints/:id` | Delete issue | Author Only |

---

### 👤 Author
**Project Lead:** [Adhyan Arya]
*Built for TechFusion '26 / Spark Hackathon*
