# FastAPI Backend for Farmer & Dealer Platform

## Setup

1. **Activate virtual environment:**
   ```bash
   # Windows
   .\.venv\Scripts\activate
   
   # Linux/Mac
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure database:**
   - Create PostgreSQL database: `farmer_dealer_db`
   - Update `.env` with your database credentials

4. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

5. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

6. **Access API docs:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app entry
│   ├── config.py        # Settings
│   ├── database.py      # DB connection
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── routers/         # API routes
│   └── services/        # Business logic
├── alembic/             # Migrations
├── requirements.txt
└── .env
```
