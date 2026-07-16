"""
ATLAS - Search Service

Given a search query (typically an email, domain, or phone value),
finds the corresponding entity in Neo4j and returns its local
neighborhood (all connected entities within 3 hops).

This is the primary entry point for ATLAS investigations. When a user
searches for a suspicious contact, this service returns the graph
data needed to visualize the fraud network around it.
"""

from database.neo4j import get_driver


async def search_entity(query: str) -> dict:
    """
    Search for an entity by its value and return the graph neighborhood.

    Args:
        query: The value to search for (e.g. "james.chen@meridian-global.co").
               Matching is case-insensitive.

    Returns:
        A dict with:
            - query: The original search string
            - found: Whether the entity was found
            - root_entity: The entity that matched (or None if not found)
            - nodes: List of all nodes within 3 hops (including the root)
            - relationships: List of all relationships between those nodes

    The returned dict is designed to be serialized directly to JSON
    and sent to the frontend, where it will drive the graph visualization.
    """
    normalized_query = query.strip().lower()

    driver = get_driver()

    async with driver.session() as session:
        result = await session.run(
            """
            // Find the entity matching the query (case-insensitive on value)
            MATCH (root)
            WHERE toLower(root.value) = $search_value
            WITH root
            // Collect the root plus everything within 3 hops
            OPTIONAL MATCH path = (root)-[*1..3]-(connected)
            WITH root,
                 collect(DISTINCT connected) AS neighbors,
                 collect(DISTINCT relationships(path)) AS rel_lists
            // Flatten the list of relationship lists into a single list
            WITH root,
                 neighbors,
                 [rel IN reduce(acc = [], list IN rel_lists | acc + list) | rel] AS rels
            RETURN root, neighbors, rels
            """,
            search_value=normalized_query,
        )

        record = await result.single()

        # No entity found matching the query
        if record is None or record["root"] is None:
            return {
                "query": query,
                "found": False,
                "root_entity": None,
                "nodes": [],
                "relationships": [],
            }

        root_node = record["root"]
        neighbor_nodes = record["neighbors"] or []
        raw_relationships = record["rels"] or []

        # Build the root entity representation
        root_entity = _format_node(root_node)

        # Combine root + neighbors into the full node list (deduplicated by id)
        all_nodes = {root_entity["id"]: root_entity}
        for node in neighbor_nodes:
            if node is None:
                continue
            formatted = _format_node(node)
            all_nodes[formatted["id"]] = formatted

        # Format relationships (deduplicated by their internal element id)
        seen_rel_ids: set[str] = set()
        formatted_relationships = []
        for rel in raw_relationships:
            if rel is None:
                continue
            rel_id = rel.element_id
            if rel_id in seen_rel_ids:
                continue
            seen_rel_ids.add(rel_id)
            formatted_relationships.append(_format_relationship(rel))

        return {
            "query": query,
            "found": True,
            "root_entity": root_entity,
            "nodes": list(all_nodes.values()),
            "relationships": formatted_relationships,
        }


def _format_node(node) -> dict:
    """
    Convert a Neo4j node object into a plain dict suitable for JSON output.
    """
    properties = dict(node)
    return {
        "id": properties.get("id"),
        "label": list(node.labels)[0] if node.labels else "Unknown",
        "properties": properties,
    }


def _format_relationship(relationship) -> dict:
    """
    Convert a Neo4j relationship object into a plain dict suitable for JSON output.
    """
    return {
        "from": relationship.start_node["id"],
        "to": relationship.end_node["id"],
        "type": relationship.type,
        "properties": dict(relationship),
    }