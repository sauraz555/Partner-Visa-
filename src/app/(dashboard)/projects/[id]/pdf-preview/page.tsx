'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Download,
  CheckCircle2,
  MessageSquare,
  Droplets,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  Clock,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { cn, formatDate } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageDef {
  id: string;
  label: string;
  type: 'cover' | 'disclaimer' | 'overview' | 'timeline' | 'evidence' | 'declaration';
  sectionLabel?: string;
}

// ─── Demo page structure ───────────────────────────────────────────────────────

const PAGES: PageDef[] = [
  { id: 'p1', label: 'Cover Page', type: 'cover' },
  { id: 'p2', label: 'Disclaimer', type: 'disclaimer' },
  { id: 'p3', label: 'Relationship Overview', type: 'overview' },
  { id: 'p4', label: 'Relationship Timeline', type: 'timeline' },
  { id: 'p5', label: 'Financial Evidence', type: 'evidence', sectionLabel: 'Financial Evidence' },
  { id: 'p6', label: 'Financial Evidence (cont.)', type: 'evidence', sectionLabel: 'Financial Evidence' },
  { id: 'p7', label: 'Household Evidence', type: 'evidence', sectionLabel: 'Household Evidence' },
  { id: 'p8', label: 'Social Evidence', type: 'evidence', sectionLabel: 'Social Evidence' },
  { id: 'p9', label: 'Social Evidence (cont.)', type: 'evidence', sectionLabel: 'Social Evidence' },
  { id: 'p10', label: 'Commitment Evidence', type: 'evidence', sectionLabel: 'Commitment Evidence' },
  { id: 'p11', label: 'Travel Evidence', type: 'evidence', sectionLabel: 'Travel Evidence' },
  { id: 'p12', label: 'Final Declaration', type: 'declaration' },
];

// ─── Individual page renderers ────────────────────────────────────────────────

function WatermarkOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-10"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: 'rotate(-35deg)' }}
      >
        <span
          className="text-[80px] font-black tracking-widest select-none"
          style={{ color: 'rgba(100,116,139,0.08)', whiteSpace: 'nowrap' }}
        >
          DRAFT
        </span>
      </div>
    </div>
  );
}

function CoverPage({
  applicantName,
  partnerName,
  visaSubclass,
  watermark,
}: {
  applicantName: string;
  partnerName: string;
  visaSubclass?: string;
  watermark: boolean;
}) {
  return (
    <div className="relative h-full flex flex-col">
      <WatermarkOverlay show={watermark} />
      {/* Top accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-sm" />

      <div className="flex-1 flex flex-col items-center justify-center px-12 py-10 text-center">
        {/* Logo */}
        <div className="mb-8">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto mb-3">
            <rect width="48" height="48" rx="12" fill="#2563EB" />
            <path d="M14 24L24 14L34 24L24 34L14 24Z" fill="white" opacity="0.9" />
            <circle cx="24" cy="24" r="4" fill="#2563EB" />
          </svg>
          <p className="text-xs font-semibold text-blue-600 tracking-widest uppercase">Interlace</p>
        </div>

        <div className="w-12 h-0.5 bg-gray-200 mb-8" />

        <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight mb-2">
          RELATIONSHIP EVIDENCE PROFILE
        </h1>
        <p className="text-xs text-gray-400 tracking-widest uppercase mb-10">
          Partner Visa Application
        </p>

        {/* Names */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-8 py-6 w-full max-w-xs mb-8">
          <p className="text-xs text-blue-500 uppercase tracking-wider font-semibold mb-1">Applicant</p>
          <p className="text-xl font-bold text-gray-900 mb-4">{applicantName}</p>
          <div className="w-8 h-0.5 bg-blue-200 mx-auto mb-4" />
          <p className="text-xs text-blue-500 uppercase tracking-wider font-semibold mb-1">Partner</p>
          <p className="text-xl font-bold text-gray-900">{partnerName}</p>
        </div>

        <div className="space-y-1.5 text-sm text-gray-600">
          {visaSubclass && (
            <p>
              <span className="font-medium text-gray-800">Visa subclass:</span>{' '}
              {visaSubclass === '309' ? 'Partner (Provisional) 309' :
               visaSubclass === '820' ? 'Partner (Temporary) 820' :
               `Subclass ${visaSubclass}`}
            </p>
          )}
          <p>
            <span className="font-medium text-gray-800">Evidence period:</span> Jan 2019 – Dec 2024
          </p>
          <p>
            <span className="font-medium text-gray-800">Generated:</span>{' '}
            {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Footer notice */}
      <div className="px-8 py-4 border-t border-gray-100 text-center">
        <p className="text-[9px] text-gray-400 tracking-wider uppercase font-medium">
          CONFIDENTIAL — PREPARED FOR VISA APPLICATION PURPOSES ONLY
        </p>
      </div>
    </div>
  );
}

function DisclaimerPage({ watermark }: { watermark: boolean }) {
  return (
    <div className="relative h-full flex flex-col px-10 py-8">
      <WatermarkOverlay show={watermark} />
      <h2 className="text-base font-bold text-gray-900 mb-1">Disclaimer</h2>
      <div className="w-8 h-0.5 bg-blue-600 mb-5" />
      <div className="text-xs text-gray-600 leading-relaxed space-y-3">
        <p>
          This document has been compiled by Interlace Technology Pty Ltd ("Interlace") on behalf of the applicant for the purpose of supporting a Partner Visa application lodged with the Department of Home Affairs, Australia.
        </p>
        <p>
          The evidence contained within this document has been provided by the applicant and their partner. Interlace has assisted in the organisation, categorisation and presentation of this evidence but makes no representation as to its completeness or sufficiency for visa grant purposes.
        </p>
        <p>
          All personal information contained in this document is subject to the Australian Privacy Act 1988 (Cth). Recipients of this document are required to handle it in accordance with applicable privacy laws and regulations.
        </p>
        <p>
          Dates marked as "approximate" have been indicated as such by the applicant. The Department of Home Affairs accepts approximate dates in certain circumstances; refer to the relevant policy instrument for guidance.
        </p>
        <p>
          Any redactions applied to documents or images within this evidence package have been made to protect sensitive personal information not relevant to the visa application. A log of all redactions is available upon request.
        </p>
        <p>
          This document is <strong>CONFIDENTIAL</strong>. It must not be shared with parties other than the applicant, their authorised migration agent, and the Department of Home Affairs without the applicant's written consent.
        </p>
        <p>
          Interlace accepts no liability for the outcome of any visa application. Migration advice should only be obtained from a registered migration agent (MARN holder) or a legal practitioner.
        </p>
      </div>
      <div className="mt-auto pt-6 border-t border-gray-100">
        <p className="text-[9px] text-gray-300 text-center uppercase tracking-wider">
          Page 2 of {PAGES.length}
        </p>
      </div>
    </div>
  );
}

function OverviewPage({ applicantName, partnerName, watermark }: { applicantName: string; partnerName: string; watermark: boolean }) {
  return (
    <div className="relative h-full flex flex-col px-10 py-8">
      <WatermarkOverlay show={watermark} />
      <h2 className="text-base font-bold text-gray-900 mb-1">Relationship Overview</h2>
      <div className="w-8 h-0.5 bg-blue-600 mb-5" />

      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Applicant', value: applicantName },
          { label: 'Partner', value: partnerName },
          { label: 'Relationship Status', value: 'De Facto / Married' },
          { label: 'Relationship commenced', value: 'March 2019' },
          { label: 'Marriage date', value: 'November 2021' },
          { label: 'Current residence', value: 'Sydney, NSW, Australia' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">{item.label}</p>
            <p className="text-xs font-semibold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Relationship Narrative</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          {applicantName} and {partnerName} met in March 2019 through mutual friends at a social event in Melbourne. Their relationship developed over the following months, culminating in them establishing a shared residence in Sydney in September 2019. The couple became engaged in February 2021 and married in November 2021 at a ceremony attended by family and friends.
        </p>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Separation Periods</h3>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1.5 text-gray-500 font-medium">Period</th>
              <th className="text-left py-1.5 text-gray-500 font-medium">Duration</th>
              <th className="text-left py-1.5 text-gray-500 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-1.5 text-gray-700">Mar 2020 – Aug 2020</td>
              <td className="py-1.5 text-gray-700">6 months</td>
              <td className="py-1.5 text-gray-600">COVID-19 travel restrictions</td>
            </tr>
            <tr>
              <td className="py-1.5 text-gray-700">Jan 2022 – Mar 2022</td>
              <td className="py-1.5 text-gray-700">3 months</td>
              <td className="py-1.5 text-gray-600">Work assignment (overseas)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TimelinePage({ watermark }: { watermark: boolean }) {
  const milestones = [
    { date: 'March 2019', event: 'First meeting — Melbourne social event', key: true },
    { date: 'July 2019', event: 'First international trip together (Bali)', key: false },
    { date: 'September 2019', event: 'Moved into shared apartment, Sydney', key: true },
    { date: 'March 2020', event: 'Separated due to COVID-19 border closures', key: false },
    { date: 'August 2020', event: 'Reunited in Sydney following border reopening', key: true },
    { date: 'February 2021', event: 'Engagement — proposal at Manly Beach', key: true },
    { date: 'November 2021', event: 'Wedding ceremony — Sydney CBD', key: true },
    { date: 'January 2022', event: 'Partner departs for overseas work assignment', key: false },
    { date: 'March 2022', event: 'Partner returns to Australia', key: false },
    { date: 'June 2023', event: 'Purchased joint property — Western Sydney', key: true },
    { date: 'October 2024', event: 'Partner Visa application lodged', key: true },
  ];

  return (
    <div className="relative h-full flex flex-col px-10 py-8">
      <WatermarkOverlay show={watermark} />
      <h2 className="text-base font-bold text-gray-900 mb-1">Relationship Timeline</h2>
      <div className="w-8 h-0.5 bg-blue-600 mb-5" />
      <div className="relative flex-1 overflow-hidden">
        {/* Vertical line */}
        <div className="absolute left-[88px] top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-3.5 pr-2">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-start gap-4 relative">
              <span className="text-[9px] text-gray-400 w-20 text-right flex-shrink-0 pt-0.5 leading-tight">{m.date}</span>
              {/* Dot */}
              <div className={cn(
                'w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5 z-10',
                m.key ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'
              )} />
              <p className={cn('text-xs leading-snug', m.key ? 'text-gray-800 font-semibold' : 'text-gray-600')}>
                {m.event}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvidencePage({
  sectionLabel,
  pageNum,
  watermark,
}: {
  sectionLabel: string;
  pageNum: number;
  watermark: boolean;
}) {
  const items = [
    {
      num: (pageNum - 4) * 2 + 1,
      date: 'March 2023',
      location: 'Sydney, NSW',
      people: 'Both',
      caption: 'Joint lease agreement for apartment at 42 Crown Street, Surry Hills',
      source: 'Document',
    },
    {
      num: (pageNum - 4) * 2 + 2,
      date: 'April 2023',
      location: 'Sydney, NSW',
      people: 'Both',
      caption: 'Commonwealth Bank joint savings account statement showing regular shared expenses',
      source: 'Screenshot',
    },
  ];

  return (
    <div className="relative h-full flex flex-col px-10 py-8">
      <WatermarkOverlay show={watermark} />
      {/* Section header stripe */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-blue-600 rounded-full" />
        <h2 className="text-base font-bold text-gray-900">{sectionLabel}</h2>
      </div>

      <div className="space-y-5 flex-1">
        {items.map((item) => (
          <div key={item.num} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Item header */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                {item.num}
              </span>
              <div className="flex gap-3 text-[9px] text-gray-500 flex-wrap">
                <span><strong>Category:</strong> {sectionLabel}</span>
                <span><strong>Date:</strong> {item.date}</span>
                <span><strong>Location:</strong> {item.location}</span>
                <span><strong>People:</strong> {item.people}</span>
                <span><strong>Source:</strong> {item.source}</span>
              </div>
            </div>
            {/* Thumbnail placeholder */}
            <div className="flex items-start gap-4 px-4 py-4">
              <div className="w-24 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-700 leading-relaxed italic">
                  "{item.caption}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
        <span className="text-[9px] text-gray-300 uppercase tracking-wider">
          Interlace Partner Visa Evidence Profile
        </span>
        <span className="text-[9px] text-gray-300 uppercase tracking-wider">
          Page {pageNum} of {PAGES.length}
        </span>
      </div>
    </div>
  );
}

function DeclarationPage({
  applicantName,
  watermark,
}: {
  applicantName: string;
  watermark: boolean;
}) {
  return (
    <div className="relative h-full flex flex-col px-10 py-8">
      <WatermarkOverlay show={watermark} />
      <h2 className="text-base font-bold text-gray-900 mb-1">Client Declaration</h2>
      <div className="w-8 h-0.5 bg-blue-600 mb-5" />

      <div className="flex-1 text-xs text-gray-600 leading-relaxed space-y-4">
        <p>
          I, <strong className="text-gray-900">{applicantName}</strong>, hereby declare that the evidence contained within this document is true and correct to the best of my knowledge and belief.
        </p>
        <p>
          I understand that providing false or misleading information in support of a visa application is a serious offence under the Migration Act 1958 (Cth) and may result in visa refusal, cancellation, or criminal prosecution.
        </p>
        <p>
          I confirm that all photographs, documents and records included in this evidence package relate to my genuine relationship with my partner, and that the captions and descriptions provided accurately reflect the circumstances depicted.
        </p>
        <p>
          I have reviewed this evidence document in its entirety and authorise Interlace Technology Pty Ltd to submit this package on my behalf.
        </p>
      </div>

      {/* Signature block */}
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <div className="border-b border-gray-300 h-12 mb-2" />
          <p className="text-[10px] text-gray-500">Applicant Signature</p>
          <p className="text-[10px] text-gray-800 font-medium mt-0.5">{applicantName}</p>
        </div>
        <div>
          <div className="border-b border-gray-300 h-12 mb-2" />
          <p className="text-[10px] text-gray-500">Date</p>
          <p className="text-[10px] text-gray-800 font-medium mt-0.5">
            {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p className="text-[10px] text-gray-500">
          This declaration was electronically approved by the client on{' '}
          {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}{' '}
          via the Interlace secure client portal.
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PDFPreviewPage() {
  const params = useParams<{ id: string }>();
  const { getProject, notify } = useApp();
  const project = getProject(params.id);

  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [watermark, setWatermark] = useState(true);
  const [approved, setApproved] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [downloading, setDownloading] = useState(false);

  const applicantName = project?.applicantName ?? 'Sarah Mitchell';

  const downloadPDF = useCallback(async () => {
    // Keep reference to original functions for sandboxing restoration
    let originalGetComputedStyle: any = null;
    let originalGetPropertyValue: any = null;

    try {
      setDownloading(true);
      notify('info', 'Generating PDF', 'Compiling evidence pages. Please wait...');
      
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default || jsPDFModule;

      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;

      // ─── Color Helper Converters ───
      const parseAndConvertOklch = (str: string): string => {
        const regex = /oklch\(\s*([\d\.]+%?)\s+([\d\.]+)\s+([\d\.]+)(?:\s*\/\s*([\d\.]+%?))?\s*\)/i;
        const match = str.match(regex);
        if (!match) return str;
        
        let l = parseFloat(match[1]);
        if (match[1].endsWith('%')) l /= 100;
        const c = parseFloat(match[2]);
        const h = parseFloat(match[3]);
        const alphaStr = match[4];
        
        let alpha = 1;
        if (alphaStr) {
          alpha = parseFloat(alphaStr);
          if (alphaStr.endsWith('%')) alpha /= 100;
        }
        
        const hRad = (h * Math.PI) / 180;
        const a = c * Math.cos(hRad);
        const b = c * Math.sin(hRad);
        
        const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
        const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
        const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
        
        const l3 = l_ * l_ * l_;
        const m3 = m_ * m_ * m_;
        const s3 = s_ * s_ * s_;
        
        const rL = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
        const gL = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
        const bL = -0.0041960863 * l3 - 0.7034186148 * m3 + 1.7076147010 * s3;
        
        const f = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055);
        
        const rgbR = Math.max(0, Math.min(255, Math.round(f(rL) * 255)));
        const rgbG = Math.max(0, Math.min(255, Math.round(f(gL) * 255)));
        const rgbB = Math.max(0, Math.min(255, Math.round(f(bL) * 255)));
        
        return alphaStr ? `rgba(${rgbR}, ${rgbG}, ${rgbB}, ${alpha})` : `rgb(${rgbR}, ${rgbG}, ${rgbB})`;
      };

      const parseAndConvertLab = (str: string): string => {
        const regex = /lab\(\s*([\d\.]+%?)\s+([\d\.-]+)\s+([\d\.-]+)(?:\s*\/\s*([\d\.]+%?))?\s*\)/i;
        const match = str.match(regex);
        if (!match) return str;
        
        let l = parseFloat(match[1]);
        if (match[1].endsWith('%')) l /= 100;
        const a = parseFloat(match[2]);
        const b = parseFloat(match[3]);
        const alphaStr = match[4];
        
        const y = (l * 100 + 16) / 116;
        const x = a / 500 + y;
        const z = y - b / 200;
        
        const xR = x > 0.206897 ? x * x * x : (x - 16/116) / 7.787;
        const yR = y > 0.206897 ? y * y * y : (y - 16/116) / 7.787;
        const zR = z > 0.206897 ? z * z * z : (z - 16/116) / 7.787;
        
        const rL = xR * 3.2406 + yR * -1.5372 + zR * -0.4986;
        const gL = xR * -0.9689 + yR * 1.8758 + zR * 0.0415;
        const bL = xR * 0.0557 + yR * -0.2040 + zR * 1.0570;
        
        const f = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055);
        
        const rgbR = Math.max(0, Math.min(255, Math.round(f(rL) * 255)));
        const rgbG = Math.max(0, Math.min(255, Math.round(f(gL) * 255)));
        const rgbB = Math.max(0, Math.min(255, Math.round(f(bL) * 255)));
        
        let alpha = 1;
        if (alphaStr) {
          alpha = parseFloat(alphaStr);
          if (alphaStr.endsWith('%')) alpha /= 100;
          return `rgba(${rgbR}, ${rgbG}, ${rgbB}, ${alpha})`;
        }
        return `rgb(${rgbR}, ${rgbG}, ${rgbB})`;
      };

      const cleanColorStyles = (value: any): any => {
        if (typeof value !== 'string') return value;
        let cleaned = value;
        
        const oklchRegex = /oklch\([^\)]+\)/gi;
        cleaned = cleaned.replace(oklchRegex, (match) => parseAndConvertOklch(match));
        
        const labRegex = /lab\([^\)]+\)/gi;
        cleaned = cleaned.replace(labRegex, (match) => parseAndConvertLab(match));
        
        return cleaned;
      };

      // ─── Monkey Patch DOM Style Resolvers ───
      originalGetComputedStyle = window.getComputedStyle;
      originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;

      CSSStyleDeclaration.prototype.getPropertyValue = function(propertyName: string) {
        const val = originalGetPropertyValue.call(this, propertyName);
        return cleanColorStyles(val);
      };

      window.getComputedStyle = function(el: Element, pseudoElt?: string | null): any {
        const style = originalGetComputedStyle(el, pseudoElt);
        return new Proxy(style, {
          get(target, prop, receiver) {
            if (prop === 'getPropertyValue') {
              return function(propertyName: string) {
                const val = target.getPropertyValue(propertyName);
                return cleanColorStyles(val);
              };
            }
            const val = Reflect.get(target, prop, receiver);
            if (typeof val === 'string') {
              return cleanColorStyles(val);
            }
            return val;
          }
        });
      };

      // ─── PDF Compilation ───
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let foundPages = 0;

      for (let i = 0; i < PAGES.length; i++) {
        const pageElement = document.getElementById(`pdf-page-${i}`);
        if (!pageElement) {
          console.warn(`Page element pdf-page-${i} not found in DOM`);
          continue;
        }
        foundPages++;

        const canvas = await html2canvas(pageElement, {
          scale: 1.5, // Memory-friendly
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (foundPages > 1) {
          doc.addPage();
        }

        doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      }

      if (foundPages === 0) {
        throw new Error('No preview pages were found in the DOM. Please reload.');
      }

      doc.save(`Relationship_Evidence_${applicantName.replace(/\s+/g, '_')}.pdf`);
      notify('success', 'Download Complete', 'Your PDF has been successfully generated and downloaded.');
    } catch (err: any) {
      console.error('PDF Generation failed:', err);
      notify('error', 'Generation Failed', err.message || 'Could not compile the PDF. Please try again.');
    } finally {
      // ─── Restore Original DOM Functions ───
      if (originalGetComputedStyle) {
        window.getComputedStyle = originalGetComputedStyle;
      }
      if (originalGetPropertyValue) {
        CSSStyleDeclaration.prototype.getPropertyValue = originalGetPropertyValue;
      }
      setDownloading(false);
    }
  }, [applicantName, notify]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search);
      if (query.get('download') === 'true') {
        const timer = setTimeout(() => {
          downloadPDF();
        }, 1000); // Wait 1s for browser to paint and mount DOM elements
        
        // Clear query parameter to avoid repeated download on page refreshes
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);

        return () => clearTimeout(timer);
      }
    }
  }, [downloadPDF]);

  const partnerName = project?.partnerName ?? 'James Chen';
  const visaSubclass = project?.visaSubclass ?? '820';

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  const scrollToPage = (index: number) => {
    setCurrentPage(index + 1);
    pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderPage = (page: PageDef, index: number) => {
    switch (page.type) {
      case 'cover':
        return (
          <CoverPage
            applicantName={applicantName}
            partnerName={partnerName}
            visaSubclass={visaSubclass}
            watermark={watermark}
          />
        );
      case 'disclaimer':
        return <DisclaimerPage watermark={watermark} />;
      case 'overview':
        return (
          <OverviewPage
            applicantName={applicantName}
            partnerName={partnerName}
            watermark={watermark}
          />
        );
      case 'timeline':
        return <TimelinePage watermark={watermark} />;
      case 'evidence':
        return (
          <EvidencePage
            sectionLabel={page.sectionLabel ?? 'Evidence'}
            pageNum={index + 1}
            watermark={watermark}
          />
        );
      case 'declaration':
        return (
          <DeclarationPage applicantName={applicantName} watermark={watermark} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-100 font-[Instrument_Sans,sans-serif]">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <h1 className="text-xl font-bold text-gray-900">Document Preview</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Review your evidence document before downloading. This is a representation of the final PDF.
        </p>
      </div>

      {/* ── Sticky toolbar ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center gap-4 flex-wrap sticky top-0 z-20 shadow-sm">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs font-semibold px-2.5 py-1 rounded-full',
            approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          )}>
            {approved ? 'Final' : 'Draft'}
          </span>
          <span className="text-xs text-gray-500 font-medium">v1.2</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{PAGES.length} pages</span>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Page navigation inline */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollToPage(Math.max(0, currentPage - 2))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-xs text-gray-600 font-medium tabular-nums">
            {currentPage} / {PAGES.length}
          </span>
          <button
            onClick={() => scrollToPage(Math.min(PAGES.length - 1, currentPage))}
            disabled={currentPage >= PAGES.length}
            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-xs font-medium text-gray-600 w-12 text-center tabular-nums">{zoom}%</span>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Watermark toggle */}
        <button
          onClick={() => setWatermark((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all',
            watermark
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          <Droplets className="w-3.5 h-3.5" />
          {watermark ? 'Watermark on' : 'Watermark off'}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Request changes
        </button>

        <button
          onClick={() => setApproved(true)}
          disabled={approved}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            approved
              ? 'bg-emerald-100 text-emerald-700 cursor-default'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md'
          )}
        >
          <CheckCircle2 className="w-4 h-4" />
          {approved ? 'Approved' : 'Approve document'}
        </button>

        <button
          onClick={downloadPDF}
          disabled={downloading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {downloading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="shrink-0"
            >
              <Clock className="w-4 h-4" />
            </motion.div>
          ) : (
            <Download className="w-4 h-4" />
          )}
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {/* ── Body: preview + thumbnails ───────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main preview scroll area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div
            className="mx-auto space-y-6"
            style={{
              width: `${Math.round(595 * zoom / 100)}px`,
              maxWidth: '100%',
            }}
          >
            {PAGES.map((page, index) => (
              <motion.div
                key={page.id}
                ref={(el) => { pageRefs.current[index] = el; }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onViewportEnter={() => setCurrentPage(index + 1)}
                className="relative"
              >
                {/* Page label */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 font-medium">Page {index + 1}</span>
                  <span className="text-xs text-gray-300">—</span>
                  <span className="text-xs text-gray-400">{page.label}</span>
                </div>

                {/* A4 page card */}
                <div
                  id={`pdf-page-${index}`}
                  className="bg-white rounded-sm shadow-md overflow-hidden border border-gray-200"
                  style={{
                    // A4 ratio: 210x297mm = 1:1.414
                    aspectRatio: '1 / 1.414',
                  }}
                >
                  {renderPage(page, index)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="w-[100px] flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto py-4 px-2">
          <p className="text-[9px] text-gray-400 text-center uppercase tracking-wider font-semibold mb-3">Pages</p>
          <div className="space-y-2">
            {PAGES.map((page, index) => (
              <button
                key={page.id}
                ref={(el) => { thumbnailRefs.current[index] = el; }}
                onClick={() => scrollToPage(index)}
                className={cn(
                  'w-full rounded-lg overflow-hidden border-2 transition-all group',
                  currentPage === index + 1
                    ? 'border-blue-600 shadow-sm shadow-blue-200'
                    : 'border-gray-200 hover:border-blue-300'
                )}
              >
                {/* Thumbnail miniature */}
                <div
                  className="bg-white relative overflow-hidden"
                  style={{ aspectRatio: '1 / 1.414' }}
                >
                  {/* Simplified thumbnail content */}
                  <div className="absolute inset-0 flex flex-col p-1">
                    {page.type === 'cover' && (
                      <>
                        <div className="h-0.5 w-full bg-blue-600 mb-1 rounded" />
                        <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                          <div className="w-4 h-4 rounded bg-blue-600 opacity-80" />
                          <div className="h-0.5 w-6 bg-gray-200" />
                          <div className="h-1 w-10 bg-gray-300 rounded" />
                          <div className="h-0.5 w-8 bg-gray-200 rounded" />
                        </div>
                      </>
                    )}
                    {page.type !== 'cover' && (
                      <>
                        <div className="h-1 w-8 bg-gray-700 rounded mb-0.5" />
                        <div className="h-0.5 w-3 bg-blue-600 rounded mb-1" />
                        <div className="space-y-0.5 flex-1">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-0.5 rounded"
                              style={{
                                width: `${60 + (i % 3) * 15}%`,
                                backgroundColor: '#e5e7eb',
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {watermark && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{ transform: 'rotate(-35deg)' }}
                      >
                        <span
                          className="text-[7px] font-black tracking-widest select-none"
                          style={{ color: 'rgba(100,116,139,0.15)' }}
                        >
                          DRAFT
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={cn(
                  'text-[8px] py-0.5 text-center font-medium truncate px-1',
                  currentPage === index + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-400 bg-gray-50'
                )}>
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Request Changes Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-1">Request Changes</h3>
              <p className="text-sm text-gray-500 mb-4">
                Describe what needs to be changed. Your consultant will be notified.
              </p>
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="e.g. Please update the caption on photo #12 and remove item #7…"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowRequestModal(false); setRequestNote(''); }}
                  disabled={!requestNote.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  Send request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
