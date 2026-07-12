"""
ATLAS - Civilian Threat Intelligence Platform
Main FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# ============================================
# Application Instance
# ============================================

app = FastAPI(
    title="ATLAS API",
    description="Civilian Threat Intelligence Platform - Employment Fraud Detection",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ============================================
# CORS Configuration
# ============================================
# Allows the frontend (running on a different port) to communicate with the API.
# For local development, we permit standard frontend dev ports.

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# Root Endpoint
# ============================================

@app.get("/")
async def root():
    """
    Root endpoint - confirms the API is reachable.
    """
    return {
        "service": "ATLAS API",
        "status": "operational",
        "version": "0.1.0",
        "documentation": "/docs",
    }


# ============================================
# Health Check Endpoint
# ============================================

@app.get("/health")
async def health_check():
    """
    Health check endpoint - used by monitoring, load balancers, and Docker.
    Returns operational status and basic system information.
    """
    return {
        "status": "healthy",
        "service": "atlas-api",
        "version": "0.1.0",
    }