# Plumbers Application

A comprehensive, full-stack field service management application designed for plumbing businesses. Built with a modern React frontend and a robust FastAPI backend, containerized with Docker for easy deployment.

##  Documentation

- **Features**: Detailed breakdown of application modules (CRM, Scheduler, Invoicing, etc.).
- **Development Guide**: Tech stack, Docker setup, project structure, and git workflow.

### Quick Start
1.  Clone the repository.
2.  Start the application:
    ```bash
    docker compose up -d
    ```
3.  Access the app at `http://localhost:3001`.

## 📂 Data Persistence
- Database data is stored in the Docker volume `mongo_data`.
- To reset the database completely (WARNING: Destructive): `docker compose down -v`

## 🐙 Git Workflow

To push changes to the repository (https://github.com/smartcanada/plumbers):

```bash
git add .
git commit -m "Update description"
git push origin main
```# plumbers
