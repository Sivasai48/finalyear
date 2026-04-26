import sys
import os

# Add the project root to the path so we can import from backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from mangum import Mangum
from backend.app.main import app

# Wrap FastAPI with Mangum for Vercel serverless functions
handler = Mangum(app, lifespan="off")
