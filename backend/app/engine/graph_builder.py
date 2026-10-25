from typing import Dict, Any, List, Optional
import networkx as nx
from sqlalchemy.orm import Session
from app.models import (
    RegulatoryRule,
    ComplianceRequirement,
    Application,
    ApplicationRequirement,
    EvidenceRecord,
)

class RegulatoryGraphBuilder:
    """Constructs and queries the in-memory NetworkX directed dependency graph."""

    def __init__(self, db: Session):
        self.db = db
        self.graph = nx.DiGraph()

    def build_graph(self) -> nx.DiGraph:
        """Constructs the complete regulatory dependency DAG from the database state."""
        self.graph.clear()

        # 1. Add Regulatory Rule Nodes
        rules = self.db.query(RegulatoryRule).filter(RegulatoryRule.is_active == True).all()
        for r in rules:
            node_id = f"rule:{r.id}"
            self.graph.add_node(
                node_id,
                type="rule",
                entity_id=r.id,
                label=r.rule_code,
                title=r.title,
                category=r.category,
            )

        # 2. Add Compliance Requirement Nodes & Edges from Rules
        reqs = self.db.query(ComplianceRequirement).all()
        for req in reqs:
            req_node_id = f"req:{req.id}"
            self.graph.add_node(
                req_node_id,
                type="requirement",
                entity_id=req.id,
                label=req.req_code,
                title=req.title,
                category=req.category,
                is_mandatory=req.is_mandatory,
                parameter_key=req.parameter_key,
                operator=req.operator,
                threshold_value=req.threshold_value,
                unit=req.unit,
            )

            # Rule -> defines -> Requirement
            rule_node_id = f"rule:{req.rule_id}"
            if self.graph.has_node(rule_node_id):
                self.graph.add_edge(rule_node_id, req_node_id, relation="defines")

        # 3. Add Application Nodes & Edges from Requirements
        apps = self.db.query(Application).all()
        for a in apps:
            app_node_id = f"app:{a.id}"
            inst_name = a.institution.name if a.institution else "Unknown Institution"
            self.graph.add_node(
                app_node_id,
                type="application",
                entity_id=a.id,
                label=a.application_number,
                institution_name=inst_name,
                status=a.status,
                academic_year=a.academic_year,
            )

        # 4. Map Application Requirements (Requirement -> binds -> Application)
        app_reqs = self.db.query(ApplicationRequirement).all()
        for ar in app_reqs:
            req_node = f"req:{ar.requirement_id}"
            app_node = f"app:{ar.application_id}"
            if self.graph.has_node(req_node) and self.graph.has_node(app_node):
                self.graph.add_edge(
                    req_node,
                    app_node,
                    relation="binds",
                    status=ar.status,
                    current_value=ar.current_value,
                )

        # 5. Add Evidence Nodes & Edges to Applications
        evidence_records = self.db.query(EvidenceRecord).all()
        for ev in evidence_records:
            ev_node_id = f"evidence:{ev.id}"
            self.graph.add_node(
                ev_node_id,
                type="evidence",
                entity_id=ev.id,
                label=ev.document_type,
                file_name=ev.file_name,
                status=ev.verified_status,
            )
            app_node = f"app:{ev.application_id}"
            if self.graph.has_node(app_node):
                self.graph.add_edge(
                    ev_node_id,
                    app_node,
                    relation="validates",
                    verified_status=ev.verified_status,
                )

        return self.graph

    def get_downstream_applications(self, rule_id: int) -> List[int]:
        """Finds all application IDs downstream from a target rule using NetworkX traversal."""
        rule_node = f"rule:{rule_id}"
        if not self.graph.has_node(rule_node):
            return []

        # Find all reachable descendant nodes from this rule
        descendants = nx.descendants(self.graph, rule_node)
        app_ids = []
        for node in descendants:
            if node.startswith("app:"):
                app_id = self.graph.nodes[node].get("entity_id")
                if app_id:
                    app_ids.append(app_id)
        return app_ids

    def get_subgraph_data(self, rule_id: int) -> Dict[str, Any]:
        """Exports the connected subgraph around a rule formatted for frontend rendering."""
        rule_node = f"rule:{rule_id}"
        if not self.graph.has_node(rule_node):
            return {"nodes": [], "edges": []}

        # Subgraph includes rule, its requirements, downstream apps, and attached evidence
        descendants = nx.descendants(self.graph, rule_node)
        subgraph_nodes = {rule_node} | descendants

        # Also pull any evidence connected to the included applications
        for node in list(descendants):
            if node.startswith("app:"):
                for predecessor in self.graph.predecessors(node):
                    if predecessor.startswith("evidence:"):
                        subgraph_nodes.add(predecessor)

        sub_g = self.graph.subgraph(subgraph_nodes)

        nodes = []
        for n, data in sub_g.nodes(data=True):
            nodes.append({
                "id": n,
                "label": data.get("label", n),
                "type": data.get("type", "unknown"),
                "category": data.get("category"),
                "status": data.get("status"),
            })

        edges = []
        for u, v, data in sub_g.edges(data=True):
            edges.append({
                "source": u,
                "target": v,
                "label": data.get("relation", "connects"),
            })

        return {"nodes": nodes, "edges": edges}
