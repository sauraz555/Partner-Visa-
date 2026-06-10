import type {
  User,
  Project,
  EvidenceFile,
  TimelineMilestone,
  EvidenceCategory,
} from '@/lib/types';

// ============================================================
// Demo User
// ============================================================

export const DEMO_USER: User = {
  id: 'user-001',
  name: 'Saurav Khanal',
  email: 'saurav@interlacestudies.com',
  phone: '+61 412 345 678',
  role: 'client',
  emailVerified: true,
  mfaEnabled: false,
  createdAt: '2025-01-15T00:00:00Z',
  lastLogin: '2026-06-10T04:00:00Z',
};

// ============================================================
// Demo Projects
// ============================================================

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    ownerId: 'user-001',
    title: 'Partner Visa — Subclass 820/801',
    applicantName: 'Saurav Khanal',
    partnerName: 'Jane Smith',
    relationshipStatus: 'de_facto',
    visaSubclass: '820',
    relationshipStartDate: '2022-03-14',
    currentCountry: 'Australia',
    partnerCountry: 'Australia',
    hasSeparationPeriods: true,
    separationPeriods: [
      {
        id: 'sep-001',
        startDate: '2022-09-01',
        endDate: '2023-01-15',
        reason: 'Work assignment overseas',
        location: 'Nepal',
      },
    ],
    migrationAgentName: 'Michael Chen',
    migrationAgentEmail: 'mchen@migrationlaw.com.au',
    preferredDocumentTitle: 'Relationship Evidence Profile',
    dateFormat: 'australian',
    reviewerSharing: true,
    retentionPreference: 'retain_12_months',
    status: 'active',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-06-09T00:00:00Z',
    evidenceCount: 146,
    readyCount: 112,
    needsInfoCount: 18,
    duplicateCount: 9,
    excludedCount: 7,
  },
  {
    id: 'proj-002',
    ownerId: 'user-001',
    title: 'Partner Visa — Subclass 309/100',
    applicantName: 'Saurav Khanal',
    partnerName: 'Emma Williams',
    relationshipStatus: 'married',
    visaSubclass: '309',
    relationshipStartDate: '2020-06-20',
    marriageDate: '2023-11-04',
    currentCountry: 'Australia',
    partnerCountry: 'United Kingdom',
    hasSeparationPeriods: false,
    dateFormat: 'australian',
    reviewerSharing: false,
    retentionPreference: 'retain_12_months',
    status: 'draft',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    evidenceCount: 23,
    readyCount: 18,
    needsInfoCount: 5,
    duplicateCount: 2,
    excludedCount: 0,
  },
];

// ============================================================
// Demo Evidence Files
// ============================================================

const evidenceCategories: EvidenceCategory[] = [
  'financial',
  'household',
  'social',
  'commitment',
  'communication',
  'travel',
  'family_community',
  'timeline_milestones',
];

const sampleCaptions = [
  'Applicant Saurav Khanal and partner Jane Smith at a family dinner in Brisbane, December 2025.',
  'Screenshot of joint bank account statement showing shared expenses, January 2026.',
  'Photograph taken during a weekend trip to the Gold Coast, August 2024.',
  'WhatsApp conversation between the applicant and partner during the separation period, October 2022.',
  'Joint lease agreement for the shared residence in Fortitude Valley, Brisbane.',
  'Christmas celebration with Jane\'s parents at their home in Sydney, December 2023.',
  'Video call screenshot during separation period, November 2022.',
  'Flight booking confirmation for return trip to Australia, January 2023.',
  'Applicant and partner attending a friend\'s wedding in Melbourne, May 2024.',
  'Joint utility bill for the shared apartment in Brisbane, March 2025.',
  'Photograph at Kangaroo Point Cliffs, Brisbane, April 2023.',
  'Restaurant receipt showing shared meal in Fortitude Valley, February 2025.',
  'Partner and applicant at Brisbane Ekka, August 2024.',
  'Travel photographs from Vietnam holiday together, July 2023.',
  'Joint travel insurance policy documentation.',
  'Screenshot of regular video call log, showing consistent communication.',
];

function generateEvidenceFile(index: number): EvidenceFile {
  const category = evidenceCategories[index % evidenceCategories.length];
  const statusOptions: EvidenceFile['status'][] = [
    'ready', 'ready', 'ready', 'ready', 'ready',
    'needs_date', 'needs_location', 'needs_names',
    'possible_duplicate', 'low_quality',
  ];
  const status = statusOptions[index % statusOptions.length];

  const date = new Date('2022-01-01');
  date.setDate(date.getDate() + index * 30);
  const dateStr = date.toISOString().split('T')[0];

  return {
    id: `file-${String(index + 1).padStart(3, '0')}`,
    projectId: 'proj-001',
    originalFilename: `evidence_${index + 1}.jpg`,
    mimeType: 'image/jpeg',
    sizeBytes: 1024 * (200 + Math.floor(Math.random() * 800)),
    thumbnailUrl: `https://picsum.photos/seed/${index + 100}/400/300`,
    previewUrl: `https://picsum.photos/seed/${index + 100}/1200/900`,
    status,
    processingStage: 'ready',

    suggestedCategory: category,
    confirmedCategory: status === 'ready' ? category : undefined,
    categoryConfidence: 'high',
    categoryStatus: status === 'ready' ? 'client_confirmed' : 'ai_suggested',

    suggestedDate: dateStr,
    confirmedDate: status === 'ready' ? dateStr : undefined,
    dateApproximate: index % 5 === 0,
    dateStatus: status === 'needs_date' ? 'unknown' : 'client_confirmed',

    suggestedLocation: index % 3 === 0 ? 'Brisbane, Queensland' : index % 3 === 1 ? 'Sydney, NSW' : 'Melbourne, Victoria',
    confirmedLocation: status === 'ready' ? 'Brisbane, Queensland' : undefined,
    locationStatus: status === 'needs_location' ? 'unknown' : 'client_confirmed',

    suggestedPeople: ['Saurav Khanal', 'Jane Smith'],
    confirmedPeople: status === 'ready' ? ['Saurav Khanal', 'Jane Smith'] : undefined,
    peopleStatus: status === 'needs_names' ? 'unknown' : 'client_confirmed',

    suggestedCaption: sampleCaptions[index % sampleCaptions.length],
    confirmedCaption: status === 'ready' ? sampleCaptions[index % sampleCaptions.length] : undefined,
    captionStatus: status === 'ready' ? 'client_confirmed' : 'ai_suggested',

    sourceType: index % 4 === 0 ? 'screenshot_chat' : index % 4 === 1 ? 'screenshot_social' : 'photograph',
    qualityScore: status === 'low_quality' ? 45 : 75 + Math.floor(Math.random() * 25),
    isBlurry: status === 'low_quality',
    isDuplicate: status === 'possible_duplicate',
    duplicateGroupId: status === 'possible_duplicate' ? 'dup-001' : undefined,

    includeInDocument: status === 'ready',
    evidenceNumber: status === 'ready' ? index + 1 : undefined,

    uploadedAt: new Date('2026-06-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-06-05T00:00:00Z').toISOString(),
  };
}

export const DEMO_EVIDENCE: EvidenceFile[] = Array.from(
  { length: 146 },
  (_, i) => generateEvidenceFile(i)
);

// ============================================================
// Demo Milestones
// ============================================================

export const DEMO_MILESTONES: TimelineMilestone[] = [
  {
    id: 'milestone-001',
    projectId: 'proj-001',
    date: '2022-03-14',
    title: 'First Meeting',
    description: 'Saurav and Jane first met at a mutual friend\'s gathering in Brisbane.',
    category: 'timeline_milestones',
    isKeyMilestone: true,
  },
  {
    id: 'milestone-002',
    projectId: 'proj-001',
    date: '2022-06-01',
    title: 'Began Dating',
    description: 'The couple officially began their relationship.',
    category: 'timeline_milestones',
    isKeyMilestone: true,
  },
  {
    id: 'milestone-003',
    projectId: 'proj-001',
    date: '2022-09-01',
    title: 'Separation Period Begins',
    description: 'Saurav travelled to Nepal for a work assignment. Regular video calls maintained the relationship.',
    category: 'commitment',
    isKeyMilestone: false,
  },
  {
    id: 'milestone-004',
    projectId: 'proj-001',
    date: '2023-01-15',
    title: 'Reunited in Australia',
    description: 'Saurav returned to Brisbane and the couple resumed living together.',
    category: 'timeline_milestones',
    isKeyMilestone: true,
  },
  {
    id: 'milestone-005',
    projectId: 'proj-001',
    date: '2023-04-22',
    title: 'Moved In Together',
    description: 'Couple signed a joint lease for their apartment in Fortitude Valley, Brisbane.',
    category: 'household',
    isKeyMilestone: true,
  },
  {
    id: 'milestone-006',
    projectId: 'proj-001',
    date: '2023-07-10',
    title: 'Holiday in Vietnam',
    description: 'First overseas trip together — two weeks in Vietnam.',
    category: 'travel',
    isKeyMilestone: false,
  },
  {
    id: 'milestone-007',
    projectId: 'proj-001',
    date: '2023-12-25',
    title: 'Christmas with Family',
    description: 'Celebrated Christmas together with Jane\'s family in Sydney.',
    category: 'social',
    isKeyMilestone: false,
  },
  {
    id: 'milestone-008',
    projectId: 'proj-001',
    date: '2024-03-14',
    title: 'Two-Year Anniversary',
    description: 'Celebrated two years since first meeting.',
    category: 'social',
    isKeyMilestone: false,
  },
  {
    id: 'milestone-009',
    projectId: 'proj-001',
    date: '2025-01-01',
    title: 'Joint Bank Account Opened',
    description: 'Couple opened a joint bank account for shared household expenses.',
    category: 'financial',
    isKeyMilestone: true,
  },
  {
    id: 'milestone-010',
    projectId: 'proj-001',
    date: '2025-06-01',
    title: 'Visa Application Lodged',
    description: 'Partner visa application lodged with the Department of Home Affairs.',
    category: 'timeline_milestones',
    isKeyMilestone: true,
  },
];

// ============================================================
// Helper: Category Metadata
// ============================================================

export const CATEGORY_META: Record<
  EvidenceCategory,
  { label: string; description: string; colour: string; icon: string }
> = {
  financial: {
    label: 'Financial',
    description: 'Joint accounts, shared expenses, transfers, bills',
    colour: 'emerald',
    icon: '💳',
  },
  household: {
    label: 'Household',
    description: 'Living together, home photos, utilities, lease',
    colour: 'amber',
    icon: '🏠',
  },
  social: {
    label: 'Social',
    description: 'Events, celebrations, family gatherings, travel',
    colour: 'pink',
    icon: '🎉',
  },
  commitment: {
    label: 'Commitment',
    description: 'Communication, future plans, emotional support',
    colour: 'purple',
    icon: '💜',
  },
  communication: {
    label: 'Communication',
    description: 'Chats, calls, messages, correspondence',
    colour: 'blue',
    icon: '💬',
  },
  travel: {
    label: 'Travel',
    description: 'Holidays, trips, flights, bookings',
    colour: 'sky',
    icon: '✈️',
  },
  family_community: {
    label: 'Family & Community',
    description: 'Family events, community involvement',
    colour: 'orange',
    icon: '👨‍👩‍👧‍👦',
  },
  timeline_milestones: {
    label: 'Timeline & Milestones',
    description: 'Key dates, first meeting, moving in, engagement',
    colour: 'indigo',
    icon: '📍',
  },
  other: {
    label: 'Other',
    description: 'Other supporting evidence',
    colour: 'gray',
    icon: '📄',
  },
};
