# Plumbers Application

A comprehensive, full-stack field service management application designed for plumbing businesses. Built with a modern React frontend and a robust FastAPI backend, containerized with Docker for easy deployment.

## 🚀 Features

### 1. Dashboard
- **Central Hub**: Quick access cards to all application modules.
- **Navigation**: Persistent, responsive navigation bar.

### 2. Client Management (CRM)
- **Client Database**: Store detailed client information including contact details and service addresses.
- **Notes System**: Dedicated field for gate codes, warnings, and preferences.
- **Search & Filter**: Real-time filtering by name or email.
- **CSV Import**: Bulk import clients from external tools (like Airtable) via CSV.

### 3. Staff & Crew Management
- **Employees**: Manage staff profiles, roles (Plumber, Apprentice), and contact info.
- **Crews**: Organize employees into crews (e.g., "Van 1", "Install Team").
- **Visual Scheduling**: Assign specific colors to crews for easy identification on the scheduler.

### 4. Inventory Control
- **Parts Tracking**: Manage materials, tools, and equipment.
- **Categorization**: Organize items by category (e.g., Sinks, Filters, Labour) for quick lookup.
- **Stock Levels**: Track quantities, unit costs, and selling prices.
- **CSV Import**: Bulk import inventory items to get started quickly.

### 5. Task Library
- **Service Definitions**: Create a library of standard services (e.g., "Faucet Installation").
- **Smart Data**: Define base prices and estimated durations for accurate scheduling.
- **Inventory Linking**: Link required parts to tasks. When a task is scheduled, the parts are automatically listed.
- **Voice-to-Text**: Use the microphone to dictate task names and descriptions.

### 6. Advanced Scheduler
- **Interactive Calendar**: Drag-and-drop interface to schedule and reschedule jobs.
- **Job Management**: Track Work Order numbers, Status (Scheduled, In Progress, Completed), and Priority.
- **Recurrence Engine**: Schedule repeating jobs (Daily, Weekly, Monthly, Annually) and Seasonal tasks (Spring/Fall).
- **Auto-Reschedule**: Automatically prompts to schedule the next appointment when a recurring job is completed.
- **Visuals**: Color-coded events based on the assigned Crew.

### 7. Invoicing
- **Seamless Integration**: Generate invoices directly from completed Jobs.
- **Auto-Population**: Pulls client info, task details, and inventory items automatically.
- **Financial Tracking**: Track invoice status (Draft, Sent, Paid, Overdue) and total amounts.

### 8. Reports
- **Business Analytics**: Dashboard for key performance indicators.
- **Financials**: View total revenue and outstanding invoices.
- **Job Stats**: Breakdown of jobs by type and status.
- **Crew Performance**: Track completed jobs per crew.

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

## 💻 Development

### Prerequisites
- Docker & Docker Compose
- Git

### Quick Start
1.  Clone the repository.
2.  Start the application:
    ```bash
    docker compose up -d
    ```
3.  Access the app at `http://localhost:3001`.

### Useful Commands

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

## 📂 Data Persistence
- Database data is stored in the Docker volume `mongo_data`.
- To reset the database completely (WARNING: Destructive): `docker compose down -v`