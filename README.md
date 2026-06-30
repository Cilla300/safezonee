# safezonee
# 🛡️ SafeZone AI Guardian

SafeZone AI Guardian is an AI-powered women safety web application that helps users travel more safely by identifying risky locations, recommending safer routes, and providing emergency assistance features.

---

## 🚀 Features

- 🗺️ Smart Safe Route Recommendation
- 📍 Live Risk Map
- 🚨 One-Tap Emergency SOS
- 👆 Hidden SOS Trigger (5 Screen Taps)
- 📝 Community Incident Reporting
- 🚓 Nearby Police Station & Hospital Display
- 🧠 AI Distress Detection
- 🌐 Neo4j Aura Graph Database Integration

---

🎯 Problem Statement

Example:

Women often rely on reactive safety apps that require them to manually trigger help. In many emergencies, victims may not have enough time to do so.

💡 Our Solution

Example:

SafeZone AI Guardian provides proactive safety using AI-powered distress detection, intelligent safe routing, hidden SOS activation, and community-driven risk mapping.

🔮 Future Scope

Mobile Application
Real-time GPS Navigation
Google Maps Integration
AI Video Analysis
Wearable Device Integration
Smartwatch SOS
Offline Emergency Mode
Multilingual Voice Detection

👨‍💻 Team

UpsideDown

Cilla Elsa Binoy
Archana K
Alena N Saji
Hemani R
...

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- Neo4j Aura (Graph Database)
- Neo4j JavaScript Driver

### Tools
- Git
- GitHub
- VS Code
- Neo4j Desktop (Development)

---

# 📂 Project Structure

```
SafeZone/
│
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

## 2. Open the project folder

```bash
cd YOUR_REPOSITORY
```

## 3. Install dependencies

```bash
npm install
```

---

# 🔐 Configure Neo4j Aura

Open **server.js** and update the Neo4j connection details.

```javascript
const driver = neo4j.driver(
    "YOUR_AURA_URI",
    neo4j.auth.basic(
        "YOUR_USERNAME",
        "YOUR_PASSWORD"
    )
);
```

Also make sure the correct Aura database name is used.

Example:

```javascript
database: "YOUR_DATABASE_NAME"
```

---

# ▶️ Running the Project

## Step 1

Start the backend server.

```bash
node server.js
```

You should see:

```
Server running on port 3000
```

Keep this terminal running.

---

## Step 2

Open the project folder in **Visual Studio Code**.

---

## Step 3

Open **index.html**.

Right-click

```
Open with Live Server
```

or

```
Go Live
```

The website will open automatically in your browser.

---

# 📌 Important

Do **NOT** open

```
http://localhost:3000
```

Port **3000** is only for the backend API.

Always open the frontend using

```
index.html → Open with Live Server
```

---

# 🌟 Unique Features

- AI-based proactive safety
- Safe route recommendation using Neo4j Graph Database
- Hidden SOS activation by tapping the screen five times
- Community-based harassment reporting
- Dynamic danger zone visualization
- Nearby emergency assistance locations

---

⭐ Why SafeZone?

Add a short section:

Unlike traditional women safety applications that mainly respond after an emergency, SafeZone focuses on preventing danger through AI-based monitoring, graph-powered safe route recommendations, hidden SOS activation, and community-driven safety intelligence.


# 👥 Team

Developed by the UpsideDown Team.

---

# 📄 License

This project is developed for educational and hackathon purposes.