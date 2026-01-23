# Development Guide

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **Calendar**: React Big Calendar
- **HTTP Client**: Native Fetch API

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Database Driver**: Motor (AsyncIO for MongoDB)
- **Validation**: Pydantic Models (v1)
- **CSV Processing**: Python standard library

### Database
- **System**: MongoDB
- **GUI**: Mongo Express

## 🐳 Docker Configuration

The application is fully containerized using Docker Compose.

| Service | Internal Port | Host Port | URL | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | 3001 | **3001** | `http://localhost:3001` | Main User Interface |
| **Backend** | 8000 | **8001** | `http://localhost:8001` | API & Documentation (`/docs`) |
| **MongoDB** | 27017 | **27018** | `mongodb://localhost:27018` | Database |
| **Mongo Express** | 8081 | **8082** | `http://localhost:8082` | Database Admin UI |

### Credentials
- **Mongo Express**: `admin` / `pass`

## 💻 Development Commands

**Rebuild Containers (after code changes):**
```bash
# Rebuild everything
docker compose up -d --build --force-recreate

# Rebuild specific service
docker compose up -d --build --force-recreate frontend
docker compose up -d --build --force-recreate backend
```

**View Logs:**
```bash
docker compose logs -f backend
```

## 🏗 Project Structure & Logic Flow

### Backend (`backend/main.py`)
**Crucial Note**: The entire backend logic is contained within a single file: `backend/main.py`.
- **Models**: All Pydantic models (Schemas) for Clients, Jobs, Invoices, etc., are defined here. There are no separate `models.py` or `schemas.py` files.
- **Routes**: All API endpoints are defined in this file.
- **Logic**: When adding new fields (e.g., adding `cottage` to Clients), you **must** update the model in `backend/main.py` and **rebuild the backend container**.

### Frontend
- **Entry Point**: `frontend/src/main.jsx`
- **Components**: Located in `frontend/src/`.

## 🐙 Git Workflow

To push changes to the repository (https://github.com/smartcanada/plumbers):

```bash
git add .
git commit -m "Update description"
git push origin main
```