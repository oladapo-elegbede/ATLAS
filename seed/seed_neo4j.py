"""
ATLAS - Neo4j Seed Script

Loads entity and relationship data from data/entities.json
into the Neo4j graph database.

Usage:
    python seed/seed_neo4j.py

This script is idempotent — running it multiple times produces
the same result. It clears existing data before seeding.
"""

import asyncio
import json
import sys
from pathlib import Path

# --- Path setup so we can import from backend/ ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_PATH = PROJECT_ROOT / "backend"
DATA_FILE = PROJECT_ROOT / "data" / "entities.json"

sys.path.insert(0, str(BACKEND_PATH))

from database.neo4j import get_driver, close_driver  # noqa: E402


async def clear_database(session) -> None:
    """
    Removes all nodes and relationships from the database.
    Ensures the seed script produces a clean, predictable state.
    """
    print("[1/4] Clearing existing data...")
    await session.run("MATCH (n) DETACH DELETE n")
    print("      ✓ Database cleared")


async def create_nodes(session, nodes: list) -> None:
    """
    Creates all nodes from the seed data.
    Each node is stored with its id, label, and properties.
    """
    print(f"[2/4] Creating {len(nodes)} nodes...")
    for node in nodes:
        query = (
            f"CREATE (n:{node['label']} $props) "
            f"SET n.id = $id"
        )
        await session.run(
            query,
            id=node["id"],
            props=node["properties"],
        )
    print(f"      ✓ {len(nodes)} nodes created")


async def create_relationships(session, relationships: list) -> None:
    """
    Creates all relationships from the seed data.
    Nodes are matched by their id property.
    """
    print(f"[3/4] Creating {len(relationships)} relationships...")
    for rel in relationships:
        query = (
            "MATCH (a {id: $from_id}), (b {id: $to_id}) "
            f"CREATE (a)-[r:{rel['type']} $props]->(b)"
        )
        await session.run(
            query,
            from_id=rel["from"],
            to_id=rel["to"],
            props=rel["properties"],
        )
    print(f"      ✓ {len(relationships)} relationships created")


async def verify_seed(session) -> None:
    """
    Runs verification queries to confirm the seed worked.
    """
    print("[4/4] Verifying seed...")
    node_result = await session.run("MATCH (n) RETURN count(n) AS count")
    node_count = (await node_result.single())["count"]

    rel_result = await session.run("MATCH ()-[r]->() RETURN count(r) AS count")
    rel_count = (await rel_result.single())["count"]

    print(f"      ✓ Nodes in database:         {node_count}")
    print(f"      ✓ Relationships in database: {rel_count}")


async def main() -> None:
    """
    Main entry point. Reads the seed data and populates Neo4j.
    """
    print("=" * 60)
    print("ATLAS — Neo4j Seed Script")
    print("=" * 60)

    # Load seed data from JSON
    print(f"Reading seed data from: {DATA_FILE}")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    nodes = data["nodes"]
    relationships = data["relationships"]
    print(f"Loaded {len(nodes)} nodes and {len(relationships)} relationships\n")

    # Connect to Neo4j and run seed operations
    driver = get_driver()
    try:
        async with driver.session() as session:
            await clear_database(session)
            await create_nodes(session, nodes)
            await create_relationships(session, relationships)
            await verify_seed(session)

        print("\n" + "=" * 60)
        print("✓ Seed complete")
        print("=" * 60)
        print("\nVisit Neo4j Browser: http://localhost:7474")
        print("Run this query to see the graph:")
        print("  MATCH (n)-[r]-(m) RETURN n, r, m")
    finally:
        await close_driver()


if __name__ == "__main__":
    asyncio.run(main())