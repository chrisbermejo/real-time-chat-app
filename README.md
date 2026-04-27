# Chatsense - RTC Application

---

## ✨ Features
*   **One-on-One Messaging:** Instant private chats with persistent message history.
*   **Group Chats:** Create or join collaborative rooms using unique invite codes.
*   **WebRTC Video Calls:** High-quality facecam and microphone communication directly within any chat.
*   **UI:** A sleek, hardcoded dark mode interface optimized for focus and performance.
*   **Real-time Synchronization:** Global state management ensures you never miss a message, even in background rooms.

## 🛠 Tech Stack
- **Frontend:** React (Vite), Socket.IO-Client, WebRTC API.
- **Backend:** Python (FastAPI), Python-Socketio, SQLAlchemy.
- **Database:** PostgreSQL.
- **Environment:** Docker & Docker Compose.

---

## 🚀 How to Run

1. **Prerequisites:** Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.
2. **Setup:** Clone the repository and navigate to the project root.
3. **Launch:** Run the following command to build and start the entire stack:

   ```bash
   docker-compose up --build

