# Vicky Diagnostics

This project contains a Next.js frontend and a FastAPI backend for the Vicky Diagnostics platform.

## Prerequisites
- Node.js (v16+)
- Python (v3.10+)

## Running the Backend (FastAPI)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Activate the virtual environment (if available) or create one:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will be available at `http://localhost:8000`. API documentation is available at `http://localhost:8000/docs`.

## Running the Frontend (Next.js)

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit `http://localhost:3000` to interact with the web app.

## Build for Production
To build the frontend for production deployment:
```bash
cd frontend
npm run build
npm start
```
