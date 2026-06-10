// ============================================================
// Interlace Partner Visa Evidence Builder — Core Types
// ============================================================

export type UserRole = 'client' | 'partner' | 'staff' | 'admin';

export type VisaSubclass = '309' | '100' | '820' | '801' | 'unknown';

export type RelationshipStatus = 'married' | 'engaged' | 'de_facto' | 'other';

export type EvidenceCategory =
  | 'financial'
  | 'household'
  | 'social'
  | 'commitment'
  | 'communication'
  | 'travel'
  | 'family_community'
  | 'timeline_milestones'
  | 'other';

export type EvidenceStatus =
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'needs_date'
  | 'needs_location'
  | 'needs_names'
  | 'needs_explanation'
  | 'possible_duplicate'
  | 'low_quality'
  | 'sensitive_detected'
  | 'excluded'
  | 'approved';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';

export type ConfirmationStatus =
  | 'ai_suggested'
  | 'client_confirmed'
  | 'reviewer_confirmed'
  | 'approximate'
  | 'unknown';

export type DocumentType = 'concise' | 'standard' | 'detailed' | 'custom';

export type DocumentStatus = 'draft' | 'client_review' | 'approved' | 'final';

export type ProcessingStage =
  | 'uploading'
  | 'security_scan'
  | 'reading_metadata'
  | 'extracting_text'
  | 'detecting_duplicates'
  | 'categorising'
  | 'ready'
  | 'error';

// ============================================================
// User & Auth
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

// ============================================================
// Project
// ============================================================

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  applicantName: string;
  partnerName: string;
  relationshipStatus: RelationshipStatus;
  visaSubclass?: VisaSubclass;
  relationshipStartDate?: string;
  marriageDate?: string;
  engagementDate?: string;
  separationPeriods?: SeparationPeriod[];
  currentCountry: string;
  partnerCountry?: string;
  hasSeparationPeriods: boolean;
  migrationAgentName?: string;
  migrationAgentEmail?: string;
  preferredDocumentTitle?: string;
  dateFormat: 'australian' | 'international';
  reviewerSharing: boolean;
  retentionPreference: 'auto_delete_90' | 'retain_12_months' | 'manual';
  status: 'active' | 'draft' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  evidenceCount: number;
  readyCount: number;
  needsInfoCount: number;
  duplicateCount: number;
  excludedCount: number;
  members?: ProjectMember[];
}

export interface SeparationPeriod {
  id: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  location?: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'partner' | 'staff' | 'viewer';
  invitedAt: string;
  acceptedAt?: string;
}

// ============================================================
// Evidence
// ============================================================

export interface EvidenceFile {
  id: string;
  projectId: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  thumbnailUrl?: string;
  previewUrl?: string;
  status: EvidenceStatus;
  processingStage?: ProcessingStage;
  processingProgress?: number;

  // Classification
  suggestedCategory?: EvidenceCategory;
  confirmedCategory?: EvidenceCategory;
  categoryConfidence?: ConfidenceLevel;
  categoryStatus: ConfirmationStatus;

  // Date
  suggestedDate?: string;
  confirmedDate?: string;
  dateApproximate?: boolean;
  dateApproximateLevel?: 'day' | 'month' | 'year';
  dateStatus: ConfirmationStatus;

  // Location
  suggestedLocation?: string;
  confirmedLocation?: string;
  locationStatus: ConfirmationStatus;

  // People
  suggestedPeople?: string[];
  confirmedPeople?: string[];
  peopleStatus: ConfirmationStatus;

  // Caption
  suggestedCaption?: string;
  confirmedCaption?: string;
  captionStatus: ConfirmationStatus;

  // Source type
  sourceType?:
    | 'photograph'
    | 'screenshot_chat'
    | 'screenshot_social'
    | 'screenshot_call'
    | 'receipt'
    | 'document'
    | 'booking'
    | 'email'
    | 'map'
    | 'other';

  // Quality
  qualityScore?: number; // 0-100
  isBlurry?: boolean;
  isDuplicate?: boolean;
  duplicateGroupId?: string;

  // Redaction
  hasRedactions?: boolean;
  redactions?: Redaction[];

  // Metadata
  exifDate?: string;
  exifLocation?: string;
  extractedText?: string;

  // Review
  includeInDocument: boolean;
  evidenceNumber?: number;
  reviewComments?: ReviewComment[];

  notes?: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface Redaction {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  reason?: string;
  appliedAt?: string;
}

export interface ReviewComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  isClientVisible: boolean;
  createdAt: string;
}

export interface DuplicateGroup {
  id: string;
  projectId: string;
  files: EvidenceFile[];
  similarity: number; // 0-1
  recommendedKeep?: string; // file id
}

// ============================================================
// Missing Info
// ============================================================

export interface MissingInfoItem {
  id: string;
  fileId: string;
  file?: EvidenceFile;
  questionType: 'date' | 'location' | 'people' | 'occasion' | 'context' | 'redaction' | 'category';
  question: string;
  answered: boolean;
  answeredAt?: string;
  answer?: string;
}

// ============================================================
// Timeline
// ============================================================

export interface TimelineMilestone {
  id: string;
  projectId: string;
  date: string;
  dateApproximate?: boolean;
  title: string;
  description?: string;
  category: EvidenceCategory | 'milestone';
  linkedFileIds?: string[];
  isKeyMilestone?: boolean;
}

// ============================================================
// PDF Document
// ============================================================

export interface PDFDocument {
  id: string;
  projectId: string;
  title: string;
  documentType: DocumentType;
  status: DocumentStatus;
  version: number;
  sections: PDFSection[];
  includedFileIds: string[];
  draftWatermark: boolean;
  estimatedPages?: number;
  estimatedSizeKb?: number;
  clientApproved?: boolean;
  clientApprovedAt?: string;
  generatedAt?: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PDFSection {
  id: string;
  type:
    | 'cover'
    | 'disclaimer'
    | 'overview'
    | 'timeline'
    | 'evidence_financial'
    | 'evidence_household'
    | 'evidence_social'
    | 'evidence_commitment'
    | 'evidence_communication'
    | 'evidence_travel'
    | 'evidence_family'
    | 'evidence_other'
    | 'declaration';
  title: string;
  order: number;
  included: boolean;
  fileIds?: string[];
  layoutDensity?: 'compact' | 'standard' | 'spacious';
}

// ============================================================
// Audit
// ============================================================

export interface AuditEvent {
  id: string;
  projectId?: string;
  userId: string;
  userName: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

// ============================================================
// Subscription / Plan
// ============================================================

export interface Plan {
  id: string;
  name: 'self_service' | 'consultant_reviewed' | 'enterprise';
  label: string;
  price?: number;
  currency?: string;
  features: string[];
  highlighted?: boolean;
}
