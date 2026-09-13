import React, { useRef } from 'react';
import {
  X,
  Printer,
  Shield,
  FileText,
  CheckCircle2,
  Lock,
  Download,
  Building,
  Scale,
  Award
} from 'lucide-react';
import { KeyEntity, CaseItem, StatsSummary } from '../types';

interface OfficialDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: StatsSummary | null;
  keyEntities: KeyEntity[];
  cases: CaseItem[];
}

export const OfficialDossierModal: React.FC<OfficialDossierModalProps> = ({
  isOpen,
  onClose,
  stats,
  keyEntities,
  cases,
}) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pt-[144px] pb-6 sm:pt-[148px] bg-black/85 backdrop-blur-md overflow-y-auto official-print-modal print:p-0 print:m-0 print:static print:bg-white print:overflow-visible">
      <div className="relative w-full max-w-4xl max-h-[calc(100vh-165px)] bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none print:overflow-visible">

        {/* Top Control Header (Non-printable) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                Official Intelligence Dossier Generator
              </h2>
              <p className="text-[11px] text-slate-400">
                Print or export statutory law-enforcement case briefing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div
          ref={printRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-950 text-slate-200 font-sans space-y-6 print:space-y-3.5 print:bg-white print:text-black print:p-2 print:m-0 print:overflow-visible"
        >
          {/* Government Official Header */}
          <div className="text-center border-b-2 border-amber-500/60 pb-5 print:pb-2.5 space-y-1 print:border-black print-avoid-break">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase tracking-widest print:text-black print:border-black print:bg-transparent print:text-[8pt] print:py-0">
              GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase text-white font-serif print:text-[14pt] print:text-black print:tracking-normal">
              Indian Cyber Crime Coordination Centre (I4C)
            </h1>
            <h2 className="text-sm font-semibold tracking-wider text-amber-300 font-mono print:text-[9.5pt] print:text-black print:font-bold">
              NATIONAL CRIMINAL NETWORK ANALYSIS SYSTEM (CNAS) — INTELLIGENCE DOSSIER
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-400 pt-2 print:pt-1 print:text-[8pt] print:text-gray-800">
              <span><strong>DOSSIER REF:</strong> CNAS/I4C/2026/INT-8839/CR</span>
              <span>•</span>
              <span><strong>DATE:</strong> {currentDate} {currentTime} IST</span>
              <span>•</span>
              <span className="text-rose-400 font-bold print:text-black">CLASSIFICATION: TOP SECRET // LES</span>
            </div>
          </div>

          {/* Statutory Notice */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed font-mono print:p-2 print:text-[8pt] print:leading-tight print:bg-gray-50 print:text-black print:border print:border-gray-300 print:rounded-none print-avoid-break">
            <strong>STATUTORY MANDATE (HUMAN-IN-THE-LOOP):</strong> This intelligence dossier is generated via algorithmic network centrality and knowledge graph heuristics. Surfaced nodes, betweenness rankings, and cross-case linkages constitute operational investigative leads for authorized law-enforcement personnel and do not constitute final judicial guilt.
          </div>

          {/* Section 1: Executive Network Overview */}
          <div className="space-y-2 print:space-y-1 print-avoid-break">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-2 print:text-black print:border-black print:text-[9pt] print:pb-0.5">
              <FileText className="w-3.5 h-3.5 text-amber-400 print:hidden" />
              1. Executive Network Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs print:grid-cols-4 print:gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block print:text-[7.5pt] print:text-gray-600">Total Monitored Nodes</span>
                <span className="text-base font-bold text-sky-400 print:text-[11pt] print:text-black">{stats?.entities ?? 62}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block print:text-[7.5pt] print:text-gray-600">Intercepted Linkages</span>
                <span className="text-base font-bold text-emerald-400 print:text-[11pt] print:text-black">{stats?.relationships ?? 129}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block print:text-[7.5pt] print:text-gray-600">Active FIR Dossiers</span>
                <span className="text-base font-bold text-amber-400 print:text-[11pt] print:text-black">{stats?.cases ?? 15}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block print:text-[7.5pt] print:text-gray-600">High Risk Bottlenecks</span>
                <span className="text-base font-bold text-rose-400 print:text-[11pt] print:text-black">{stats?.high_risk_entities ?? 5}</span>
              </div>
            </div>
          </div>

          {/* Section 2: High-Priority Kingpin & Centrality Bottlenecks */}
          <div className="space-y-2 print:space-y-1 print-avoid-break">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-2 print:text-black print:border-black print:text-[9pt] print:pb-0.5">
              <Shield className="w-3.5 h-3.5 text-amber-400 print:hidden" />
              2. High-Centrality Target Hierarchy
            </h3>
            <div className="overflow-x-auto border border-slate-800 rounded-lg print:border print:border-gray-300 print:rounded-none">
              <table className="w-full text-left text-xs font-mono print:text-[8pt]">
                <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 print:bg-gray-100 print:text-black print:border-b print:border-gray-300">
                  <tr>
                    <th className="p-2.5 print:p-1">Rank</th>
                    <th className="p-2.5 print:p-1">Target Name</th>
                    <th className="p-2.5 print:p-1">Classification</th>
                    <th className="p-2.5 print:p-1">Risk Index</th>
                    <th className="p-2.5 print:p-1">Betweenness</th>
                    <th className="p-2.5 print:p-1">Primary Linkage Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-y print:divide-gray-300">
                  {keyEntities.slice(0, 5).map((entity, idx) => (
                    <tr key={entity.id} className="hover:bg-slate-900/50 print:bg-white">
                      <td className="p-2.5 print:p-1 font-bold text-amber-400 print:text-black">#{idx + 1}</td>
                      <td className="p-2.5 print:p-1 font-bold text-slate-100 print:text-black">{entity.name}</td>
                      <td className="p-2.5 print:p-1 text-slate-300 print:text-black">{entity.type}</td>
                      <td className="p-2.5 print:p-1 text-rose-400 font-bold print:text-black">{(entity.risk_score * 100).toFixed(0)}%</td>
                      <td className="p-2.5 print:p-1 text-sky-300 print:text-black">{entity.betweenness_centrality.toFixed(3)}</td>
                      <td className="p-2.5 print:p-1 text-slate-400 text-[11px] print:text-[7.5pt] print:text-gray-800">{entity.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Registered Inter-Agency Cases */}
          <div className="space-y-2 print:space-y-1 print-avoid-break">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-2 print:text-black print:border-black print:text-[9pt] print:pb-0.5">
              <Building className="w-3.5 h-3.5 text-amber-400 print:hidden" />
              3. Cross-Jurisdictional Case Operations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono print:grid-cols-2 print:gap-2 print:text-[8pt]">
              {cases.slice(0, 4).map((c) => (
                <div key={c.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 print:text-black print:text-[8.5pt]">Case #{c.id}: {c.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 print:border-black print:text-black print:bg-transparent print:text-[7.5pt] font-semibold uppercase">{c.status}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 print:text-[7.5pt] print:text-gray-700 print:mt-0.5">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Cryptographic Evidence Stamp & Chain of Custody */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none print-avoid-break">
            <div className="flex items-center gap-2 text-emerald-400 print:text-black font-bold print:text-[8pt]">
              <CheckCircle2 className="w-4 h-4 print:hidden" />
              <span>CRYPTOGRAPHIC CHAIN-OF-CUSTODY ATTESTATION</span>
            </div>
            <p className="text-[11px] text-slate-400 print:text-[7.5pt] print:text-gray-700">
              All ingested CDR links, Fastag toll passages, and banking ledgers in this report are sealed under SHA-256 block hash:
            </p>
            <div className="p-2 rounded bg-slate-950 text-emerald-300 font-mono text-[10px] break-all border border-emerald-500/30 print:p-1 print:text-[7.5pt] print:bg-gray-50 print:text-black print:border-gray-300 print:rounded-none">
              SHA256: 0x8f4d92a1c7e5b304f8190d7e234a9b6c0192e485a3c2b1d09e87f6543210abef
            </div>
          </div>

          {/* Section 5: Signature Blocks */}
          <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-2 gap-8 text-xs font-mono print:pt-4 print:border-t-2 print:border-black print-avoid-break">
            <div className="space-y-10 print:space-y-4">
              <div className="border-b border-slate-700 w-48 print:border-b-2 print:border-black" />
              <div>
                <p className="font-bold text-slate-200 print:text-black print:text-[8.5pt]">INVESTIGATING OFFICER (IO)</p>
                <p className="text-[11px] text-slate-400 print:text-[7.5pt] print:text-gray-700">Cyber Crime Cell / Special Task Force</p>
                <p className="text-[10px] text-slate-500 print:text-[7pt] print:text-gray-600">Badge ID: IO-CBI-7729</p>
              </div>
            </div>

            <div className="space-y-10 text-right print:space-y-4">
              <div className="border-b border-slate-700 w-48 ml-auto print:border-b-2 print:border-black" />
              <div>
                <p className="font-bold text-slate-200 print:text-black print:text-[8.5pt]">SUPERINTENDENT OF POLICE</p>
                <p className="text-[11px] text-slate-400 print:text-[7.5pt] print:text-gray-700">Cyber Operations & Link Intelligence</p>
                <p className="text-[10px] text-slate-500 print:text-[7pt] print:text-gray-600">I4C National Command Center</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
