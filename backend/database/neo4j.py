"""
ATLAS - Neo4j Database Connection

Manages the connection to the Neo4j graph database.
Provides functions for connection verification and query execution.
"""

from neo4j import AsyncDriver, AsyncGraphDatabase

from config.settings import get_settings


# Module-level driver instance (created lazily via get_driver())
_driver: AsyncDriver | None = None


def get_driver() -> AsyncDriver:
    """
    Returns the Neo4j async driver instance.
    Creates it on first call, reuses it on subsequent calls (singleton pattern).
    """
    global _driver
    if _driver is None:
        settings = get_settings()
        _driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
        )
    return _driver


async def close_driver() -> None:
    """
    Closes the Neo4j driver connection.
    Called during application shutdown.
    """
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None


async def verify_connectivity() -> dict:
    """
    Verifies that Neo4j is reachable and returns basic connection info.
    Used by health check endpoints.

    Returns a dict containing:
        - connected: True if reachable, False otherwise
        - server_info: Server version and address (if connected)
        - error: Error message (if connection failed)
    """
    driver = get_driver()
    try:
        # verify_connectivity() confirms the connection is alive
        await driver.verify_connectivity()

        # Fetch server info to prove the connection returns real data
        server_info = await driver.get_server_info()

        return {
            "connected": True,
            "server_info": {
                "address": str(server_info.address),
                "agent": server_info.agent,
                "protocol_version": str(server_info.protocol_version),
            },
        }
    except Exception as exc:
        return {
            "connected": False,
            "error": str(exc),
        }