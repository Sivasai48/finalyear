from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .database import engine, Base
from .routers import (
    auth_router,
    farmers_router,
    farmer_profile_router,
    dhalaris_router,
    crops_router,
    market_prices_router,
    trader_requests_router,
    notifications_router,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    try:
        # Startup: Create database tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created or verified successfully.")
    except Exception as e:
        print(f"Warning: Could not connect to database during startup. Error: {e}")
        print("Application will start, but database-dependent endpoints may fail.")
    
    yield
    
    # Shutdown: cleanup if needed
    pass


# Create FastAPI application
app = FastAPI(
    title="Farmer & Dealer Platform API",
    description="Backend API for connecting farmers with traders (dhalaris)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*"  # Temporary for debugging connection issues
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(farmers_router)
app.include_router(farmer_profile_router)
app.include_router(dhalaris_router)
app.include_router(crops_router)
app.include_router(market_prices_router)
app.include_router(trader_requests_router)
app.include_router(notifications_router)



@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Farmer & Dealer Platform API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
