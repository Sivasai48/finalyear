import sys
import os

# Add the project root to the path so we can import from backend
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.app.main import app

# Vercel Serverless Functions natively support FastAPI ASGI via the @vercel/python builder.
# We just need to expose the 'app' variable here.
