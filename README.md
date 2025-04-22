📚 SmartDaro Backend

SmartDaro is a smart backend system built with Node.js and Express.js that uses AI-driven logic to handle room allocation, timetable generation, and alert notifications for academic institutions.
🚀 Features

    🧠 AI-Based Room Allocation: Smartly assigns students or staff to available rooms based on availability, course type, and preferences.

    📅 Timetable Generation: Uses AI algorithms to generate clash-free, optimized timetables for students and lecturers.

    🔔 Smart Alerts System: Sends timely alerts and notifications to users regarding room changes, timetable updates, or important announcements.

🏗️ Tech Stack

    Backend: Node.js, Express.js

    Database: MongoDB / PostgreSQL (customizable)

    Authentication: JWT

    AI Logic: Custom algorithms or integration with AI services (e.g., Python microservices, TensorFlow, or OpenAI)

    Notifications: Email (Nodemailer), In-app Alerts (WebSockets or Polling)

📁 Project Structure

smartdaro-backend/
├── controllers/
│   └── roomController.js
│   └── timetableController.js
│   └── alertController.js
├── models/
│   └── Room.js
│   └── Timetable.js
│   └── User.js
├── routes/
│   └── rooms.js
│   └── timetable.js
│   └── alerts.js
├── utils/
│   └── aiAllocator.js
│   └── timetableGenerator.js
│   └── notifier.js
├── middleware/
│   └── auth.js
├── .env
├── server.js
└── README.md
