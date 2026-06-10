'use client';

import React, { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  FileText,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Circle,
  Wand2,
  Eye,
  Download,
  Settings2,
  LayoutGrid,
  Type,
  Droplets,
  Info,
  X,
  Check,
  Clock,
  Pencil,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { cn, formatDate } from '@/lib/utils';
import type { DocumentType } from '@/lib/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type PageDensity = 'compact' | 'standard' | 'spacious';

interface SectionItem {
  id: string;
  name: string;
  pageEstimate: number;
  included: boolean;
  type: string;
}

interface ValidationItem {
  id: string;
  label: string;
  status: 'ok' | 'warning' | 'error' | 'info';
  checked: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES: {
  value: DocumentType;
  label: string;
  pages: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    value: 'concise',
    label: 'Concise',
    pages: '~15–30 pages',
    description: 'Best for strong, focused evidence sets',
  },
  {
    value: 'standard',
    label: 'Standard',
    pages: '~30–50 pages',
    description: 'Recommended for most applications',
    recommended: true,
  },
  {
    value: 'detailed',
    label: 'Detailed',
    pages: '~50–80 pages',
    description: 'For comprehensive evidence collections',
  },
  {
    value: 'custom',
    label: 'Custom',
    pages: 'Manual',
    description: 'Manual section selection',
  },
];

const DEFAULT_SECTIONS: SectionItem[] = [
  { id: 'cover', name: 'Cover Page', pageEstimate: 1, included: true, type: 'cover' },
  { id: 'disclaimer', name: 'Disclaimer', pageEstimate: 1, included: true, type: 'disclaimer' },
  { id: 'overview', name: 'Relationship Overview', pageEstimate: 2, included: true, type: 'overview' },
  { id: 'timeline', name: 'Relationship Timeline', pageEstimate: 3, included: true, type: 'timeline' },
  { id: 'financial', name: 'Financial Evidence', pageEstimate: 6, included: true, type: 'evidence_financial' },
  { id: 'household', name: 'Household Evidence', pageEstimate: 5, included: true, type: 'evidence_household' },
  { id: 'social', name: 'Social Evidence', pageEstimate: 6, included: true, type: 'evidence_social' },
  { id: 'commitment', name: 'Commitment Evidence', pageEstimate: 4, included: true, type: 'evidence_commitment' },
  { id: 'communication', name: 'Communication Evidence', pageEstimate: 4, included: false, type: 'evidence_communication' },
  { id: 'travel', name: 'Travel Evidence', pageEstimate: 3, included: true, type: 'evidence_travel' },
  { id: 'family', name: 'Family & Community', pageEstimate: 3, included: false, type: 'evidence_family' },
  { id: 'other', name: 'Other Evidence', pageEstimate: 2, included: false, type: 'evidence_other' },
  { id: 'declaration', name: 'Final Declaration', pageEstimate: 1, included: true, type: 'declaration' },
];

const INITIAL_VALIDATION: ValidationItem[] = [
  { id: 'names', label: 'Names confirmed', status: 'ok', checked: true },
  { id: 'dates', label: '5 dates marked as approximate (check accepted)', status: 'warning', checked: false },
  { id: 'captions', label: 'Captions reviewed', status: 'ok', checked: true },
  { id: 'redactions', label: 'Redactions pending review (2 items)', status: 'error', checked: false },
  { id: 'duplicates', label: 'Duplicates resolved', status: 'ok', checked: true },
  { id: 'declaration', label: 'Client declaration accepted', status: 'ok', checked: true },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DocumentTypeCard({
  option,
  selected,
  onClick,
}: {
  option: (typeof DOCUMENT_TYPES)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border-2 p-3 transition-all duration-200 relative',
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
      )}
    >
      {option.recommended && (
        <span className="absolute top-2 right-2 text-[10px] font-semibold bg-blue-600 text-white rounded-full px-2 py-0.5">
          Recommended
        </span>
      )}
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
            selected ? 'border-blue-600' : 'border-gray-300'
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-semibold', selected ? 'text-blue-700' : 'text-gray-800')}>
              {option.label}
            </span>
            <span className="text-xs text-gray-500">{option.pages}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{option.description}</p>
        </div>
      </div>
    </button>
  );
}

function SectionRow({
  section,
  isSelected,
  onToggle,
  onSelect,
}: {
  section: SectionItem;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-all duration-150',
        isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50',
        !section.included && 'opacity-50'
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab active:cursor-grabbing group-hover:text-gray-400" />

      {/* Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="flex-shrink-0"
        aria-label={section.included ? 'Exclude section' : 'Include section'}
      >
        {section.included ? (
          <ToggleRight className="w-5 h-5 text-blue-600" />
        ) : (
          <ToggleLeft className="w-5 h-5 text-gray-300" />
        )}
      </button>

      {/* Name */}
      <span className={cn('flex-1 text-sm font-medium truncate', isSelected ? 'text-blue-700' : 'text-gray-700')}>
        {section.name}
      </span>

      {/* Page count */}
      <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">
        {section.pageEstimate}p
      </span>

      {isSelected && <ChevronRight className="w-3 h-3 text-blue-500 flex-shrink-0" />}
    </div>
  );
}

function ValidationRow({
  item,
  onToggle,
}: {
  item: ValidationItem;
  onToggle: () => void;
}) {
  const icons = {
    ok: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  };

  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="flex-shrink-0 mt-0.5">
        <div
          onClick={onToggle}
          className={cn(
            'w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150',
            item.checked
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-300 group-hover:border-blue-400'
          )}
        >
          {item.checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
        </div>
      </div>
      <div className="flex items-start gap-2 flex-1">
        {icons[item.status]}
        <span className={cn('text-sm leading-snug', item.checked ? 'text-gray-600' : 'text-gray-800')}>
          {item.label}
        </span>
      </div>
    </label>
  );
}

// ─── Mock evidence items for section editor ────────────────────────────────────

const MOCK_EVIDENCE_ITEMS = [
  { id: 'ev1', filename: 'Joint_lease_2023.pdf', caption: 'Lease agreement for shared apartment, Sydney', included: true },
  { id: 'ev2', filename: 'Bank_statement_joint.pdf', caption: 'Joint bank account statement Q1 2023', included: true },
  { id: 'ev3', filename: 'Utility_bill_Feb.pdf', caption: 'Electricity bill showing both names', included: false },
  { id: 'ev4', filename: 'Rent_receipt_Mar.pdf', caption: 'March rent receipt — joint tenants', included: true },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PDFBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getProject, getEvidence } = useApp();
  const project = getProject(params.id);

  const [documentType, setDocumentType] = useState<DocumentType>('standard');
  const [sections, setSections] = useState<SectionItem[]>(DEFAULT_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('financial');
  const [pageDensity, setPageDensity] = useState<PageDensity>('standard');
  const [photosPerPage, setPhotosPerPage] = useState<number>(3);
  const [draftWatermark, setDraftWatermark] = useState<boolean>(true);
  const [validation, setValidation] = useState<ValidationItem[]>(INITIAL_VALIDATION);
  const [generating, setGenerating] = useState<'draft' | 'final' | null>(null);
  const [evidenceItems, setEvidenceItems] = useState(MOCK_EVIDENCE_ITEMS);

  const evidence = getEvidence(params.id);

  const includedSections = sections.filter((s) => s.included);
  const estimatedPages = includedSections.reduce((sum, s) => sum + s.pageEstimate, 0);
  const estimatedSizeMB = (estimatedPages * 0.18).toFixed(1);
  const evidenceIncluded = evidence.filter((e) => e.includeInDocument).length;
  const evidenceTotal = evidence.length;

  const allValidationChecked = validation.every((v) => v.checked);
  const showRepetitionWarning = false; // Demo: no repetition
  const showLengthWarning = estimatedPages > 80;

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const toggleSection = useCallback((id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, included: !s.included } : s))
    );
  }, []);

  const toggleValidation = useCallback((id: string) => {
    setValidation((prev) =>
      prev.map((v) => (v.id === id ? { ...v, checked: !v.checked } : v))
    );
  }, []);

  const handleAutoBuild = () => {
    setDocumentType('standard');
    setSections(DEFAULT_SECTIONS.map((s) => ({
      ...s,
      included: !['communication', 'family', 'other'].includes(s.id),
    })));
  };

  const handleGenerateDraft = async () => {
    setGenerating('draft');
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(null);
    router.push(`/projects/${params.id}/pdf-preview?download=true`);
  };

  const handleGenerateFinal = async () => {
    if (!allValidationChecked) return;
    setGenerating('final');
    await new Promise((r) => setTimeout(r, 2500));
    setGenerating(null);
    router.push(`/projects/${params.id}/pdf-preview?download=true`);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 font-[Instrument_Sans,sans-serif]">
      {/* ── LEFT PANEL ───────────────────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Panel header */}
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-600" />
            Document Settings
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* ── Document Type ─────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Document Type
            </h3>
            <div className="space-y-2">
              {DOCUMENT_TYPES.map((option) => (
                <DocumentTypeCard
                  key={option.value}
                  option={option}
                  selected={documentType === option.value}
                  onClick={() => setDocumentType(option.value)}
                />
              ))}
            </div>
          </section>

          {/* ── Sections List ─────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Sections
            </h3>
            <p className="text-xs text-gray-400 mb-3">Drag to reorder · toggle to include/exclude</p>
            <Reorder.Group
              axis="y"
              values={sections}
              onReorder={setSections}
              className="space-y-1"
            >
              {sections.map((section) => (
                <Reorder.Item
                  key={section.id}
                  value={section}
                  className="list-none"
                  whileDrag={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                  <SectionRow
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    onToggle={() => toggleSection(section.id)}
                    onSelect={() => setSelectedSectionId(section.id)}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </section>

          {/* ── Layout Settings ───────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Layout Settings
            </h3>
            <div className="space-y-4">
              {/* Page density */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Page Density</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {(['compact', 'standard', 'spacious'] as PageDensity[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setPageDensity(d)}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium transition-colors capitalize',
                        pageDensity === d
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos per page */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Photos per Page</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {[2, 3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPhotosPerPage(n)}
                      className={cn(
                        'flex-1 py-1.5 text-xs font-medium transition-colors',
                        photosPerPage === n
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Draft watermark */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">Draft Watermark</p>
                  <p className="text-xs text-gray-400">Show 'DRAFT' on each page</p>
                </div>
                <button
                  onClick={() => setDraftWatermark((v) => !v)}
                  aria-label="Toggle draft watermark"
                >
                  {draftWatermark ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* ── Document Stats ────────────────────────── */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Document Stats
            </h3>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              {[
                { label: 'Estimated pages', value: estimatedPages },
                { label: 'Est. file size', value: `${estimatedSizeMB} MB` },
                { label: 'Evidence included', value: `${evidenceIncluded}/${evidenceTotal} items` },
                { label: 'Sections', value: `${includedSections.length} of ${sections.length}` },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{stat.label}</span>
                  <span className="text-xs font-semibold text-gray-800 tabular-nums">{stat.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Warnings ──────────────────────────────── */}
          <AnimatePresence>
            {(showRepetitionWarning || showLengthWarning) && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {showRepetitionWarning && (
                  <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700 leading-snug">
                      Some evidence appears multiple times across sections.
                    </p>
                  </div>
                )}
                {showLengthWarning && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-snug">
                      Document exceeds 80 pages. Consider switching to Concise mode.
                    </p>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {/* Page header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF Document Builder</h1>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                Compose your evidence document. Drag sections to reorder, toggle sections on/off, and adjust layout settings.
              </p>
            </div>
            {/* Toolbar */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAutoBuild}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <Wand2 className="w-4 h-4 text-blue-600" />
                Auto-build recommended
              </button>
              <Link
                href={`/projects/${params.id}/pdf-preview`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                <Eye className="w-4 h-4" />
                Preview PDF
              </Link>
              <button
                onClick={handleGenerateDraft}
                disabled={generating !== null}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
              >
                {generating === 'draft' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Clock className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                {generating === 'draft' ? 'Generating…' : 'Generate draft'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* ── Section Editor ──────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {selectedSection && (
              <motion.div
                key={selectedSection.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Section header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-5 h-5 text-blue-600" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">{selectedSection.name}</h2>
                      <p className="text-xs text-gray-400">
                        {selectedSection.included ? 'Included in document' : 'Excluded from document'}
                        {' · '}~{selectedSection.pageEstimate} pages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSection(selectedSection.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        selectedSection.included
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      )}
                    >
                      {selectedSection.included ? (
                        <><X className="w-3 h-3" /> Exclude</>
                      ) : (
                        <><Check className="w-3 h-3" /> Include</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Section title editor */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Section Title</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={selectedSection.name}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Evidence grid */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Evidence Items</h3>
                    <span className="text-xs text-gray-400">
                      {evidenceItems.filter((e) => e.included).length}/{evidenceItems.length} included
                    </span>
                  </div>

                  <div className="space-y-2">
                    {evidenceItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border transition-all',
                          item.included
                            ? 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/20'
                            : 'border-dashed border-gray-200 bg-gray-50 opacity-60'
                        )}
                      >
                        {/* Drag handle */}
                        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1 cursor-grab" />

                        {/* Checkbox */}
                        <button
                          onClick={() =>
                            setEvidenceItems((prev) =>
                              prev.map((e) =>
                                e.id === item.id ? { ...e, included: !e.included } : e
                              )
                            )
                          }
                          className={cn(
                            'w-4 h-4 rounded border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all',
                            item.included ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                          )}
                        >
                          {item.included && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </button>

                        {/* Thumbnail placeholder */}
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-300" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.filename}</p>
                          {/* Caption editor */}
                          <textarea
                            defaultValue={item.caption}
                            rows={2}
                            className="mt-1.5 w-full px-2 py-1.5 text-xs text-gray-600 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            placeholder="Add caption…"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Layout preview mockup */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Layout Preview
                  </h3>
                  <div className="flex gap-3">
                    {/* Simulated page layout */}
                    {[1, 2].map((page) => (
                      <div
                        key={page}
                        className="flex-1 aspect-[3/4] bg-white rounded-lg border border-gray-200 p-2 shadow-sm"
                      >
                        <div className="h-3 w-3/4 bg-gray-200 rounded mb-2" />
                        <div className="grid grid-cols-2 gap-1.5">
                          {Array.from({ length: photosPerPage > 2 ? 4 : 2 }).map((_, i) => (
                            <div key={i} className="aspect-video bg-gray-100 rounded" />
                          ))}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="h-1.5 w-full bg-gray-100 rounded" />
                          <div className="h-1.5 w-2/3 bg-gray-100 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Validation Checklist ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Validation Checklist</h2>
              <span className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                allValidationChecked
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              )}>
                {validation.filter((v) => v.checked).length}/{validation.length} complete
              </span>
            </div>
            <div className="space-y-3">
              {validation.map((item) => (
                <ValidationRow
                  key={item.id}
                  item={item}
                  onToggle={() => toggleValidation(item.id)}
                />
              ))}
            </div>

            {!allValidationChecked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3"
              >
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  All validation items must be checked before generating the final PDF.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* ── Action Buttons ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 pb-8"
          >
            <button
              onClick={handleGenerateDraft}
              disabled={generating !== null}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
            >
              {generating === 'draft' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Clock className="w-4 h-4" />
                </motion.div>
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {generating === 'draft' ? 'Generating Draft…' : 'Generate Draft PDF'}
            </button>

            <button
              onClick={handleGenerateFinal}
              disabled={!allValidationChecked || generating !== null}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm',
                allValidationChecked
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {generating === 'final' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Clock className="w-4 h-4" />
                </motion.div>
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {generating === 'final' ? 'Generating Final…' : 'Approve & Generate Final PDF'}
            </button>

            {!allValidationChecked && (
              <span className="text-xs text-gray-400 italic">
                Complete all validation items to enable final generation
              </span>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
