// Core TypeScript models for RULIQ

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_scrutiny'
  | 'compliance_pending'
  | 'approved'
  | 'rejected';

export type ApplicationType =
  | 'new_institute'
  | 'extension_of_approval'
  | 'increase_intake'
  | 'new_course';

export type ComplianceStatus =
  | 'compliant'
  | 'non_compliant'
  | 'missing_evidence'
  | 'waived';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';

export type ImpactStatus =
  | 'impacted_non_compliant'
  | 'conditionally_impacted'
  | 'unaffected';

export interface Institution {
  id: number;
  aictePermanentId: string;
  name: string;
  state: string;
  district: string;
  category: string;
  contactEmail: string;
  region?: string;
  casesCount?: number;
  deficitCount?: number;
  identityVerified?: boolean;
}

export interface Application {
  id: number;
  applicationNumber: string;
  institution: Institution;
  academicYear: string;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  submissionDate: string;
  deadline: string;
  isOverdue: boolean;
  totalRequirements: number;
  metRequirements: number;
  missingEvidenceCount: number;
}

export interface RegulatoryRule {
  id: number;
  ruleCode: string;
  title: string;
  category: 'faculty' | 'infrastructure' | 'finance' | 'safety' | 'curriculum';
  currentVersion: string;
  effectiveDate: string;
  description: string;
  parameters: Record<string, any>;
  applicableRequirementsCount: number;
}

export interface ComplianceAlert {
  id: number;
  applicationNumber: string;
  institutionName: string;
  severity: AlertSeverity;
  alertType: 'deadline_overdue' | 'evidence_missing' | 'regulatory_breach' | 'rule_impact';
  message: string;
  suggestedAction: string;
  createdAt: string;
  isResolved: boolean;
}

export interface DashboardStats {
  totalApplications: number;
  pendingScrutiny: number;
  compliancePending: number;
  approved: number;
  rejected: number;
  overdueCount: number;
  criticalAlertsCount: number;
  activeRulesCount: number;
}

export interface RecommendationItem {
  id?: number;
  actionTitle: string;
  recommendedAction: string;
  remediationType: string;
  urgency: string;
  isActionable: boolean;
  status: string;
}

export interface SimulationResultItem {
  id?: number;
  applicationId: number;
  applicationNumber: string;
  institutionName: string;
  state: string;
  impactStatus: ImpactStatus;
  reasonExplanation: string;
  unmetRequirementsSummary?: any[];
  recommendations?: RecommendationItem[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  category?: string;
  status?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface DependencyGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SimulationReport {
  runId: number;
  ruleCode: string;
  ruleTitle: string;
  simulatedParameters: Record<string, any>;
  totalEvaluated: number;
  totalImpacted: number;
  totalConditionallyImpacted: number;
  totalUnaffected: number;
  results: SimulationResultItem[];
  graph: DependencyGraphData;
}

export interface EvidenceItem {
  id: number;
  applicationId: number;
  applicationNumber: string;
  institutionName: string;
  requirementId?: number;
  requirementTitle?: string;
  documentType: string;
  fileName: string;
  fileUri: string;
  fileSizeBytes: number;
  verifiedStatus: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
}

export interface AuditLogItem {
  id: number;
  entityName: string;
  entityId: string;
  action: string;
  performedBy: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}


