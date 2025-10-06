# main.py

import logging
import asyncio
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from api import http_routes, websocket_routes
from database import startup_db_client, shutdown_db_client
from api.websocket_routes import start_background_tasks

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('mindmaze.log')
    ]
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager with proper startup and shutdown."""
    # Startup
    logger.info("🚀 Starting MindMaze Ultimate Quiz Platform...")
    await startup_db_client()
    
    # Start background tasks
    await start_background_tasks()
    
    logger.info("✅ MindMaze Ultimate Quiz Platform started successfully!")
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down MindMaze Ultimate Quiz Platform...")
    shutdown_db_client()
    logger.info("✅ Shutdown complete")

# Create FastAPI app with lifespan
app = FastAPI(
    title="MindMaze Ultimate Quiz Platform API",
    description="The most advanced, secure, and engaging quiz platform with cutting-edge anti-cheat mechanisms and revolutionary gamification",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add Security Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app", "*.netlify.app"]
)

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://mindmaze.vercel.app",
        "https://mindmaze.netlify.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add Compression Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(http_routes.router, tags=["HTTP API"])
app.include_router(websocket_routes.router, tags=["WebSocket API"])

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "MindMaze Ultimate Quiz Platform",
        "version": "2.0.0",
        "features": [
            "Advanced Anti-Cheat System",
            "Revolutionary Gamification",
            "Real-time Analytics",
            "3D Interface Support",
            "AI-Powered Recommendations",
            "Comprehensive Security"
        ]
    }

# API Documentation
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "MindMaze Ultimate Quiz Platform API",
        "version": "2.0.0",
        "status": "operational",
        "documentation": "/docs",
        "features": {
            "anti_cheat": "Advanced real-time monitoring and detection",
            "gamification": "Comprehensive achievement and reward system",
            "analytics": "AI-powered insights and recommendations",
            "real_time": "Live updates and notifications",
            "security": "Enterprise-grade security measures",
            "scalability": "Built for high-performance and scale"
        },
        "endpoints": {
            "http": "RESTful API for all operations",
            "websocket": "Real-time communication and updates",
            "admin": "Comprehensive admin dashboard and analytics"
        }
    }

# Run the app
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )