"""
ATLAS - Civilian Threat Intelligence Platform
Main FastAPI application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from database.neo4j import close_driver, verify_connectivity
from services.search_service import search_entity


# ============================================
# Application Lifecycle
# ============================================
# Handles startup and shutdown events for the application.
# On shutdown, we cleanly close the Neo4j driver connection.

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Runs setup code before the app starts, and cleanup code before it stops.
    """
    # --- Startup ---
    # (Nothing to initialize eagerly — Neo4j driver is created lazily on first use)
    yield
    # --- Shutdown ---
    # Cleanly close the Neo4j driver connection
    await close_driver()


# ============================================
# Application Instance
# ============================================

app = FastAPI(
    title="ATLAS API",
    description="Civilian Threat Intelligence Platform - Employment Fraud Detection",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ============================================
# CORS Configuration
# ============================================
# Allows the frontend (running on a different port) to communicate with the API.

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


# ============================================
# Neo4j Status Endpoint
# ============================================

@app.get("/api/neo4j-status")
async def neo4j_status():
    """
    Verifies connectivity to the Neo4j graph database.
    Returns connection status and server information if reachable.
    """
    result = await verify_connectivity()
    return result


# ============================================
# Search Endpoint
# ============================================

@app.get("/api/search")
async def search(
    q: str = Query(
        ...,
        min_length=1,
        max_length=256,
        description="The value to search for (email, domain, phone, etc.)",
        examples=["james.chen@meridian-global.co"],
    )
):
    """
    Search for an entity by its value and return its local graph neighborhood.

    This is the primary entry point for ATLAS investigations. Given a
    suspicious contact (email, domain, phone), it returns the connected
    fraud network within 2 hops.

    Query parameters:
        q: The value to search for. Case-insensitive.
           Examples: an email address, a domain name, a phone number.

    Returns:
        A JSON object containing the root entity, all connected nodes,
        and all relationships between them.
    """
    result = await search_entity(q)
    return result