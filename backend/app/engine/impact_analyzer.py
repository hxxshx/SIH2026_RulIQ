from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import (
    RegulatoryRule,
    RuleVersion,
    ComplianceRequirement,
    Application,
    ApplicationRequirement,
    EvidenceRecord,
    ImpactAnalysisRun,
    ImpactAnalysisResult,
    RecoveryRecommendation,
    AuditLog,
)
from app.engine.graph_builder import RegulatoryGraphBuilder
from app.schemas.impact import (
    SimulationReportSchema,
    SimulationResultItemSchema,
    RecommendationItemSchema,
    DependencyGraphDataSchema,
    GraphNodeSchema,
    GraphEdgeSchema,
)

class ImpactAnalyzer:
    """Deterministic, explainable regulatory impact analysis engine using NetworkX DAG traversal."""

    def __init__(self, db: Session):
        self.db = db
        self.builder = RegulatoryGraphBuilder(db)

    def simulate_rule_amendment(
        self,
        rule_id: int,
        simulated_parameters: Dict[str, Any],
        user_id: Optional[int] = None,
    ) -> SimulationReportSchema:
        """Executes deterministic evaluation across all applications connected to the modified rule."""
        now = datetime.now(timezone.utc)

        # 1. Fetch Target Rule & Requirements
        rule = self.db.query(RegulatoryRule).filter(RegulatoryRule.id == rule_id).first()
        if not rule:
            raise ValueError(f"Regulatory rule with ID {rule_id} does not exist.")

        # 2. Build In-Memory NetworkX Graph
        graph = self.builder.build_graph()

        # 3. Traverse Downstream Applications
        downstream_app_ids = set(self.builder.get_downstream_applications(rule_id))

        all_applications = self.db.query(Application).all()
        results: List[SimulationResultItemSchema] = []

        total_impacted = 0
        total_conditional = 0
        total_unaffected = 0

        # Create RuleVersion record for simulation
        sim_version = RuleVersion(
            rule_id=rule.id,
            version_tag=f"SIM-{now.strftime('%Y%m%d%H%M')}",
            change_summary=f"Simulation of parameters: {simulated_parameters}",
            parameters=simulated_parameters,
            effective_date=now,
            is_simulation=True,
        )
        self.db.add(sim_version)
        self.db.flush()

        # Create Run record
        run = ImpactAnalysisRun(
            rule_version_id=sim_version.id,
            triggered_by_user_id=user_id,
            simulated_parameters=simulated_parameters,
            run_timestamp=now,
        )
        self.db.add(run)
        self.db.flush()

        # 4. Deterministic Evaluation Per Application
        for app in all_applications:
            inst_name = app.institution.name if app.institution else "Unknown"
            state = app.institution.state if app.institution else "N/A"

            # Case A: Application is NOT in the downstream dependency graph
            if app.id not in downstream_app_ids:
                total_unaffected += 1
                res_item = SimulationResultItemSchema(
                    applicationId=app.id,
                    applicationNumber=app.application_number,
                    institutionName=inst_name,
                    state=state,
                    impactStatus="unaffected",
                    reasonExplanation=(
                        f"Unaffected: Application does not depend on rule [{rule.rule_code}] "
                        f"based on current program category and academic requirements."
                    ),
                    unmetRequirementsSummary=[],
                    recommendations=[],
                )
                results.append(res_item)

                # Persist DB result
                db_res = ImpactAnalysisResult(
                    run_id=run.id,
                    application_id=app.id,
                    impact_status="unaffected",
                    reason_explanation=res_item.reasonExplanation,
                    unmet_requirements_summary=[],
                )
                self.db.add(db_res)
                continue

            # Case B: Application IS in the downstream path of this rule
            # Check applicable requirements for this rule
            app_reqs = [
                ar for ar in app.application_requirements
                if ar.requirement.rule_id == rule.id
            ]

            is_app_impacted = False
            is_app_conditional = False
            reasons = []
            unmet_summary = []
            recommendations: List[RecommendationItemSchema] = []

            for ar in app_reqs:
                req = ar.requirement
                param_key = req.parameter_key

                # Check if this parameter was modified in simulation
                if param_key in simulated_parameters:
                    sim_threshold = simulated_parameters[param_key]
                else:
                    # Fall back to requirement default
                    try:
                        sim_threshold = float(req.threshold_value)
                    except ValueError:
                        sim_threshold = req.threshold_value

                # Check 1: Missing or Rejected Evidence
                has_valid_evidence = False
                for ev in app.evidence_records:
                    if ev.requirement_id == req.id and ev.verified_status == "verified":
                        has_valid_evidence = True
                        break

                if not has_valid_evidence or ar.status == "missing_evidence" or not ar.current_value:
                    is_app_conditional = True
                    reason_text = (
                        f"Missing Evidence: Requirement [{req.title}] lacks verified documentation. "
                        f"Compliance against proposed parameter ({param_key} = {sim_threshold}) cannot be confirmed."
                    )
                    reasons.append(reason_text)
                    unmet_summary.append({"req_code": req.req_code, "status": "missing_evidence"})
                    recommendations.append(
                        RecommendationItemSchema(
                            actionTitle=f"Upload Verified {req.title}",
                            recommendedAction=(
                                f"Mandate immediate upload of certified institutional evidence for {req.title} "
                                f"to allow scrutiny under proposed AICTE norms."
                            ),
                            remediationType="upload_evidence",
                            urgency="critical",
                            isActionable=True,
                            status="suggested",
                        )
                    )
                    continue

                # Check 2: Mathematical / Logical Threshold Evaluation
                try:
                    cur_num = float(ar.current_value)
                    sim_num = float(sim_threshold)

                    failed = False
                    if req.operator == "<=" and cur_num > sim_num:
                        failed = True
                    elif req.operator == ">=" and cur_num < sim_num:
                        failed = True
                    elif req.operator == "==" and cur_num != sim_num:
                        failed = True

                    if failed:
                        is_app_impacted = True
                        deficit = round(abs(cur_num - sim_num), 2)
                        reason_text = (
                            f"Statutory Deficit: Current reported value {cur_num} {req.unit} "
                            f"violates proposed threshold {req.operator} {sim_num} {req.unit} (Variance: {deficit})."
                        )
                        reasons.append(reason_text)
                        unmet_summary.append({
                            "req_code": req.req_code,
                            "current": cur_num,
                            "proposed": sim_num,
                            "deficit": deficit,
                        })

                        # Constraint-aware action formulation
                        if "ratio" in param_key or "faculty" in param_key:
                            rec_action = (
                                f"Recruit additional qualified cadre faculty to restore student-faculty ratio "
                                f"to statutory threshold of 1:{sim_num} prior to final review."
                            )
                            rem_type = "recruit_faculty"
                        elif "area" in param_key:
                            rec_action = (
                                f"Expand instructional carpet area by {deficit} {req.unit} or adjust sanctioned intake."
                            )
                            rem_type = "expand_carpet_area"
                        else:
                            rec_action = f"Meet statutory requirement {req.title} with updated value {sim_num}."
                            rem_type = "statutory_compliance"

                        recommendations.append(
                            RecommendationItemSchema(
                                actionTitle=f"Remediate {req.title} Shortfall",
                                recommendedAction=rec_action,
                                remediationType=rem_type,
                                urgency="high",
                                isActionable=True,
                                status="suggested",
                            )
                        )
                    else:
                        reasons.append(
                            f"Satisfies proposed threshold: Current value {cur_num} {req.unit} "
                            f"meets proposed {req.operator} {sim_num} {req.unit}."
                        )
                except ValueError:
                    # Non-numeric fallback comparison
                    if str(ar.current_value).strip().lower() != str(sim_threshold).strip().lower():
                        is_app_impacted = True
                        reason_text = f"Value '{ar.current_value}' does not match proposed '{sim_threshold}'."
                        reasons.append(reason_text)

            # Determine final status classification for this application
            if is_app_impacted:
                impact_status = "impacted_non_compliant"
                total_impacted += 1
            elif is_app_conditional:
                impact_status = "conditionally_impacted"
                total_conditional += 1
            else:
                impact_status = "unaffected"
                total_unaffected += 1
                if not reasons:
                    reasons.append("Application requirements fully satisfy proposed regulatory norms.")

            combined_explanation = " | ".join(reasons)

            res_item = SimulationResultItemSchema(
                applicationId=app.id,
                applicationNumber=app.application_number,
                institutionName=inst_name,
                state=state,
                impactStatus=impact_status,
                reasonExplanation=combined_explanation,
                unmetRequirementsSummary=unmet_summary,
                recommendations=recommendations,
            )
            results.append(res_item)

            # Persist DB Result & Recommendations
            db_res = ImpactAnalysisResult(
                run_id=run.id,
                application_id=app.id,
                impact_status=impact_status,
                reason_explanation=combined_explanation,
                unmet_requirements_summary=unmet_summary,
            )
            self.db.add(db_res)
            self.db.flush()

            for rec in recommendations:
                db_rec = RecoveryRecommendation(
                    result_id=db_res.id,
                    action_title=rec.actionTitle,
                    recommended_action=rec.recommendedAction,
                    remediation_type=rec.remediationType,
                    urgency=rec.urgency,
                    is_actionable=rec.isActionable,
                    status=rec.status,
                )
                self.db.add(db_rec)

        # Update run aggregates
        run.total_evaluated = len(all_applications)
        run.total_impacted = total_impacted
        run.total_unaffected = total_unaffected + total_conditional

        # Record Audit Log
        audit = AuditLog(
            entity_name="RegulatoryRule",
            entity_id=str(rule.id),
            action="IMPACT_SIMULATION_EXECUTED",
            performed_by_id=user_id,
            new_values={
                "run_id": run.id,
                "simulated_parameters": simulated_parameters,
                "impacted": total_impacted,
                "conditional": total_conditional,
                "unaffected": total_unaffected,
            },
            ip_address="127.0.0.1",
        )
        self.db.add(audit)
        self.db.commit()

        # 5. Extract Graph Subgraph Data for UI Visualization
        graph_raw = self.builder.get_subgraph_data(rule_id)
        graph_data = DependencyGraphDataSchema(
            nodes=[GraphNodeSchema(**n) for n in graph_raw["nodes"]],
            edges=[GraphEdgeSchema(**e) for e in graph_raw["edges"]],
        )

        return SimulationReportSchema(
            runId=run.id,
            ruleCode=rule.rule_code,
            ruleTitle=rule.title,
            simulatedParameters=simulated_parameters,
            totalEvaluated=len(all_applications),
            totalImpacted=total_impacted,
            totalConditionallyImpacted=total_conditional,
            totalUnaffected=total_unaffected,
            results=results,
            graph=graph_data,
        )
