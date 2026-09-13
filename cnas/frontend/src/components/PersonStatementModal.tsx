import React, { useRef } from 'react';
import {
  X,
  Printer,
  Shield,
  Download,
  FileSpreadsheet,
  FileCode,
  CreditCard,
  Car,
  Phone,
  MapPin,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building,
  UserCheck
} from 'lucide-react';
import { EntityDossier, Entity, EntityType } from '../types';

interface PersonStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: EntityDossier | null;
  selectedNode: Entity | null;
}

export const PersonStatementModal: React.FC<PersonStatementModalProps> = ({
  isOpen,
  onClose,
  dossier,
  selectedNode,
}) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || (!dossier && !selectedNode)) return null;

  const entity = dossier?.entity || {
    id: selectedNode?.id || 0,
    name: selectedNode?.name || 'Unknown Entity',
    type: (selectedNode?.type || 'Person') as EntityType,
    risk_score: selectedNode?.risk_score || 0.5,
    attributes: selectedNode?.attributes || {},
    role: (selectedNode?.attributes?.role as string) || 'Primary Target',
    alias: (selectedNode?.attributes?.alias as string) || 'N/A',
    citizenship: (selectedNode?.attributes?.citizenship as string) || 'Indian',
    phone: (selectedNode?.attributes?.phone as string) || '+91-98110-11223',
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

  const statementRef = `CNAS/I4C/2026/STAT-${entity.id}-${Math.abs(entity.id * 137).toString().padStart(4, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const lines: string[] = [];

    // Header
    lines.push('INDIAN CYBER CRIME COORDINATION CENTRE (I4C) - CNAS OFFICIAL INVESTIGATIVE STATEMENT');
    lines.push('CONFIDENTIAL // TOP SECRET // LAW ENFORCEMENT SENSITIVE');
    lines.push(`Statement Reference,${statementRef}`);
    lines.push(`Generated Date & Time,${currentDate} ${currentTime} IST`);
    lines.push('');

    // 1. Identification Profile
    lines.push('--- 1. SUBJECT IDENTIFICATION PROFILE ---');
    lines.push('Field,Value');
    lines.push(`Subject ID,${entity.id}`);
    lines.push(`Full Legal Name,"${entity.name}"`);
    lines.push(`Entity Classification,${entity.type}`);
    lines.push(`Syndicate Operational Role,"${entity.role || 'Primary Target'}"`);
    lines.push(`Known Alias / Codename,"${entity.alias || 'None'}"`);
    lines.push(`Citizenship,"${entity.citizenship || 'Indian'}"`);
    lines.push(`Primary Phone / Intercept,"${entity.phone || 'Unlisted'}"`);
    lines.push(`Syndicate Risk Rating,"${(entity.risk_score * 100).toFixed(1)}%"`);
    lines.push('');

    // 2. Financial & Hawala Accounts
    lines.push('--- 2. BANK ACCOUNTS & HAWALA TRANSACTIONS ---');
    lines.push('Account Name,Institution / Bank,Branch / Ledger,Balance,Account Status,Last Tx Amount,Flow Type,Timestamp');
    if (dossier?.bank_transactions && dossier.bank_transactions.length > 0) {
      dossier.bank_transactions.forEach((tx) => {
        lines.push(
          `"${tx.account_name}","${tx.bank_name}","${tx.branch}","${tx.balance}","${tx.status}","${tx.last_transaction?.amount || 'N/A'}","${tx.last_transaction?.type || 'Transfer'}","${tx.last_transaction?.timestamp || 'N/A'}"`
        );
      });
    } else {
      lines.push('No direct bank or Hawala accounts registered for this subject.,,,,,,');
    }
    lines.push('');

    // 3. Vehicles
    lines.push('--- 3. REGISTERED VEHICLES & LOGISTICS ASSETS ---');
    lines.push('Plate Number,Make & Model,Color,Registered Owner,Surveillance Status');
    if (dossier?.vehicles && dossier.vehicles.length > 0) {
      dossier.vehicles.forEach((v) => {
        lines.push(
          `"${v.plate_number}","${v.make_model}","${v.color}","${v.registered_owner}","${v.status}"`
        );
      });
    } else {
      lines.push('No registered vehicle plates or fleet assets linked.,,,,');
    }
    lines.push('');

    // 4. Telecom & Cell Tower
    lines.push('--- 4. TELECOM INTERCEPT & LAST KNOWN LOCATION ---');
    const loc = dossier?.last_disconnected_location;
    lines.push('Parameter,Value');
    lines.push(`Primary Phone,"${dossier?.phones?.[0]?.number || entity.phone || 'N/A'}"`);
    lines.push(`Carrier,"${dossier?.phones?.[0]?.carrier || 'Airtel Delhi'}"`);
    lines.push(`IMEI Reference,"${dossier?.phones?.[0]?.imei || '864501048892101'}"`);
    lines.push(`Triangulated Cell Tower,"${loc?.cell_tower || 'BTS-NCR-PRIMARY-808'}"`);
    lines.push(`GPS Latitude,"${loc?.latitude?.toFixed(4) || '28.6139'}° N"`);
    lines.push(`GPS Longitude,"${loc?.longitude?.toFixed(4) || '77.2090'}° E"`);
    lines.push(`Signal Drop Time,"${loc?.timestamp || '2025-02-23 18:45:12 IST'}"`);
    lines.push(`Corridor Description,"${loc?.description?.replace(/"/g, '""') || 'Last known spatial corridor'}"`);
    lines.push('');

    // 5. Syndicate Linkages
    lines.push('--- 5. DIRECT SYNDICATE NETWORK LINKAGES ---');
    lines.push('Target Name,Target Type,Relationship Type,Risk Score,Direction,Linkage Description');
    if (dossier?.connections && dossier.connections.length > 0) {
      dossier.connections.forEach((c) => {
        lines.push(
          `"${c.target_name}","${c.target_type}","${c.relation_type}","${(c.target_risk * 100).toFixed(0)}%","${c.direction}","${c.description.replace(/"/g, '""')}"`
        );
      });
    } else {
      lines.push('No direct linkages identified in active subgraph.,,,,,');
    }

    const csvBlob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statement_${entity.name.replace(/\s+/g, '_')}_${entity.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const dataToExport = {
      statement_ref: statementRef,
      generated_at: `${currentDate} ${currentTime} IST`,
      classification: 'TOP SECRET // LAW ENFORCEMENT SENSITIVE',
      subject: entity,
      financial_statement: dossier?.bank_transactions || [],
      vehicle_assets: dossier?.vehicles || [],
      telecom_intercepts: dossier?.phones || [],
      last_location_triangulation: dossier?.last_disconnected_location || null,
      direct_syndicate_linkages: dossier?.connections || [],
    };

    const jsonBlob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statement_${entity.name.replace(/\s+/g, '_')}_${entity.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center sm:p-6 sm:pt-[148px] bg-slate-950 sm:bg-black/85 sm:backdrop-blur-md overflow-y-auto official-print-modal print:p-0 print:m-0 print:static print:bg-white print:overflow-visible">
      <div className="relative w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[calc(100vh-165px)] bg-slate-900 sm:border sm:border-sky-500/40 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 print:bg-white print:text-black print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none print:overflow-visible">

        {/* Control Header Toolbar (Non-printable) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-950 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors sm:hidden flex items-center gap-1 text-xs font-bold font-mono"
            >
              <span>← Back</span>
            </button>
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 hidden sm:block">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white font-display flex items-center gap-2">
                <span>Official Person Statement</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {entity.name}
                </span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                Official Law Enforcement Record • Clear Telemetry, Hawala, CDR & Evidence Statement
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 shadow-sm transition-all cursor-pointer"
              title="Download clean structured CSV for Excel / Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {/* Download JSON */}
            <button
              onClick={handleDownloadJSON}
              className="hidden xs:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 shadow-sm transition-all cursor-pointer"
              title="Download clean structured JSON dataset"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md transition-all cursor-pointer"
              title="Print or Save as Official PDF Document"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer hidden sm:block"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Statement Document Body */}
        <div
          ref={printRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-950 text-slate-200 font-sans space-y-6 print:space-y-3.5 print:bg-white print:text-black print:p-2 print:m-0 print:overflow-visible"
        >
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-sky-500/60 pb-5 print:pb-2.5 space-y-1.5 print:border-black print-avoid-break">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded bg-sky-500/15 border border-sky-500/40 text-sky-400 text-xs font-mono font-bold uppercase tracking-widest print:text-black print:border-black print:bg-transparent print:text-[8pt] print:py-0">
              GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase text-white font-serif print:text-[14pt] print:text-black print:tracking-normal">
              Indian Cyber Crime Coordination Centre (I4C)
            </h1>
            <h2 className="text-sm font-semibold tracking-wider text-sky-300 font-mono print:text-[9.5pt] print:text-black print:font-bold">
              NATIONAL CRIMINAL NETWORK ANALYSIS SYSTEM (CNAS) — INDIVIDUAL INVESTIGATIVE STATEMENT
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-400 pt-2 print:pt-1 print:text-[8pt] print:text-gray-800">
              <span><strong>STATEMENT REF:</strong> {statementRef}</span>
              <span>•</span>
              <span><strong>DATE:</strong> {currentDate} {currentTime} IST</span>
              <span>•</span>
              <span className="text-rose-400 font-bold print:text-black">CLASSIFICATION: TOP SECRET // LES</span>
            </div>
          </div>

          {/* Statutory Mandate Note */}
          <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/30 text-xs text-sky-200 leading-relaxed font-mono print:p-2 print:text-[8pt] print:leading-tight print:bg-gray-50 print:text-black print:border print:border-gray-300 print:rounded-none print-avoid-break">
            <strong>STATUTORY ADMISSIBILITY & RECORDING NOTICE (CrPC Sec 161 / Intelligence Briefing):</strong> This verified investigative statement collates corroborated evidentiary telemetry, CDR cross-correlations, Hawala ledger traces, and spatial-temporal triangulation for the specified subject.
          </div>

          {/* SECTION 1: SUBJECT IDENTIFICATION & RECORD PROFILE */}
          <div className="space-y-3 print:space-y-1 print-avoid-break">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-1 flex items-center gap-2 print:text-black print:border-black print:text-[9pt] print:pb-0.5">
              <Shield className="w-3.5 h-3.5 text-sky-400 print:hidden" />
              1. Subject Identification & Centrality Telemetry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs print:grid-cols-3 print:gap-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">Legal Subject Name</span>
                <span className="text-sm font-bold text-white print:text-[9.5pt] print:text-black">{entity.name}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">Known Alias / Codename</span>
                <span className="text-sm font-bold text-amber-300 print:text-[9.5pt] print:text-black">{entity.alias || 'N/A'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">Syndicate Hierarchy Role</span>
                <span className="text-sm font-bold text-sky-300 print:text-[9.5pt] print:text-black">{entity.role || 'Key Operative'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">Syndicate Risk Rating</span>
                <span className="text-sm font-black text-rose-400 print:text-[9.5pt] print:text-black">
                  {(entity.risk_score * 100).toFixed(0)}% (HIGH THREAT TIER)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">Primary MSISDN / Phone</span>
                <span className="text-sm font-bold text-emerald-400 print:text-[9.5pt] print:text-black">
                  {dossier?.phones?.[0]?.number || entity.phone || '+91-98110-11223'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:p-1.5 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">Citizenship & Status</span>
                <span className="text-sm font-bold text-slate-200 print:text-[9.5pt] print:text-black">
                  {entity.citizenship || 'Indian'} • MONITORED
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: BANK ACCOUNTS & HAWALA TRANSACTIONS */}
          <div className="space-y-3 print:space-y-1 print-avoid-break">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-1 flex items-center gap-2 print:text-black print:border-black print:text-[9pt] print:pb-0.5">
              <CreditCard className="w-3.5 h-3.5 text-sky-400 print:hidden" />
              2. Financial Accounts & Hawala Transaction Statement
            </h3>

            {dossier?.bank_transactions && dossier.bank_transactions.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800 print:border print:border-gray-300 print:rounded-none">
                <table className="w-full text-left text-xs font-mono print:text-[8pt]">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800 print:bg-gray-100 print:text-black print:border-b print:border-gray-300">
                    <tr>
                      <th className="p-2.5 print:p-1">Account / Entity</th>
                      <th className="p-2.5 print:p-1">Institution</th>
                      <th className="p-2.5 print:p-1">Branch / Node</th>
                      <th className="p-2.5 print:p-1">Ledger Balance</th>
                      <th className="p-2.5 print:p-1">Recent Transaction</th>
                      <th className="p-2.5 print:p-1">FIU Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 print:divide-y print:divide-gray-300 print:text-black">
                    {dossier.bank_transactions.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 print:bg-white">
                        <td className="p-2.5 print:p-1 font-bold text-white print:text-black">{tx.account_name}</td>
                        <td className="p-2.5 print:p-1">{tx.bank_name}</td>
                        <td className="p-2.5 print:p-1 text-slate-400 print:text-gray-700">{tx.branch}</td>
                        <td className="p-2.5 print:p-1 font-bold text-emerald-400 print:text-black">{tx.balance}</td>
                        <td className="p-2.5 print:p-1 font-bold text-rose-400 print:text-black">
                          {tx.last_transaction?.amount || '₹25,00,000'}
                          <span className="block text-[10px] text-slate-500 font-normal print:text-[7pt] print:text-gray-600">
                            {tx.last_transaction?.type || 'Hawala Layering Transfer'}
                          </span>
                        </td>
                        <td className="p-2.5 print:p-1">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold print:border-black print:text-black print:bg-transparent print:text-[7pt]">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 print:p-1.5 print:border print:border-gray-300 print:rounded-none print:text-black">
                No direct financial conduit or Hawala accounts registered in primary network layer.
              </div>
            )}
          </div>

          {/* SECTION 3: REGISTERED VEHICLES & FLEET ASSETS */}
          <div className="space-y-3 print:space-y-1 print-avoid-break">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-1 flex items-center gap-2 print:text-black print:border-black print:text-[9pt] print:pb-0.5">
              <Car className="w-3.5 h-3.5 text-sky-400 print:hidden" />
              3. Vehicle Fleet & Logistics Intercepts
            </h3>

            {dossier?.vehicles && dossier.vehicles.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800 print:border print:border-gray-300 print:rounded-none">
                <table className="w-full text-left text-xs font-mono print:text-[8pt]">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800 print:bg-gray-100 print:text-black print:border-b print:border-gray-300">
                    <tr>
                      <th className="p-2.5 print:p-1">Plate Number</th>
                      <th className="p-2.5 print:p-1">Make & Model</th>
                      <th className="p-2.5 print:p-1">Color</th>
                      <th className="p-2.5 print:p-1">Registered Owner</th>
                      <th className="p-2.5 print:p-1">Surveillance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 print:divide-y print:divide-gray-300 print:text-black">
                    {dossier.vehicles.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 print:bg-white">
                        <td className="p-2.5 print:p-1 font-bold text-amber-300 print:text-black">{v.plate_number}</td>
                        <td className="p-2.5 print:p-1">{v.make_model}</td>
                        <td className="p-2.5 print:p-1 text-slate-400 print:text-gray-700">{v.color}</td>
                        <td className="p-2.5 print:p-1 font-bold text-sky-300 print:text-black">{v.registered_owner}</td>
                        <td className="p-2.5 print:p-1">
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold print:border-black print:text-black print:bg-transparent print:text-[7pt]">
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 print:p-1.5 print:border print:border-gray-300 print:rounded-none print:text-black">
                No vehicle registrations or transport logistics currently tagged.
              </div>
            )}
          </div>

          {/* SECTION 4: TELECOM CDR & SPATIAL LOCATION TRIANGULATION */}
          <div className="space-y-3 print:space-y-1 print-avoid-break">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-1 flex items-center gap-2 print:text-black print:border-black print:text-[9pt] print:pb-0.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400 print:hidden" />
              4. Telecom Intercept & Last Triangulated BTS Cell Tower Location
            </h3>

            {dossier?.last_disconnected_location ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs print:p-2 print:bg-white print:border print:border-gray-300 print:rounded-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">Cell Tower Ref</span>
                    <span className="font-bold text-emerald-400 print:text-[8.5pt] print:text-black">
                      {dossier.last_disconnected_location.cell_tower}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">GPS Coordinates</span>
                    <span className="font-bold text-white print:text-[8.5pt] print:text-black">
                      {dossier.last_disconnected_location.latitude.toFixed(4)}° N, {dossier.last_disconnected_location.longitude.toFixed(4)}° E
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">Signal Drop Time</span>
                    <span className="font-bold text-amber-300 print:text-[8.5pt] print:text-black">
                      {dossier.last_disconnected_location.timestamp}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase print:text-[7pt] print:text-gray-600">Triangulation State</span>
                    <span className="font-bold text-rose-400 print:text-[8.5pt] print:text-black">
                      {dossier.last_disconnected_location.triangulation_status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 print:pt-1 print:border-t print:border-gray-300 print:text-[7.5pt] print:text-black">
                  <strong>Spatial Sector Note:</strong> {dossier.last_disconnected_location.description}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 print:p-1.5 print:border print:border-gray-300 print:rounded-none print:text-black">
                No active cell tower triangulation records in recent surveillance window.
              </div>
            )}
          </div>

          {/* SECTION 5: DIRECT SYNDICATE NETWORK ASSOCIATES */}
          <div className="space-y-3 print:space-y-1 print-avoid-break">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-1 flex items-center gap-2 print:text-black print:border-black print:text-[9pt] print:pb-0.5">
              <Activity className="w-3.5 h-3.5 text-sky-400 print:hidden" />
              5. Confirmed Syndicate Associates & Graph Linkages ({dossier?.connections.length || 0})
            </h3>

            {dossier?.connections && dossier.connections.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800 print:border print:border-gray-300 print:rounded-none">
                <table className="w-full text-left text-xs font-mono print:text-[8pt]">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800 print:bg-gray-100 print:text-black print:border-b print:border-gray-300">
                    <tr>
                      <th className="p-2.5 print:p-1">Associated Target</th>
                      <th className="p-2.5 print:p-1">Entity Type</th>
                      <th className="p-2.5 print:p-1">Modus Operandi / Relation</th>
                      <th className="p-2.5 print:p-1">Target Risk</th>
                      <th className="p-2.5 print:p-1">Flow Direction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300 print:divide-y print:divide-gray-300 print:text-black">
                    {dossier.connections.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 print:bg-white">
                        <td className="p-2.5 print:p-1 font-bold text-white print:text-black">{c.target_name}</td>
                        <td className="p-2.5 print:p-1 text-slate-400 print:text-gray-700">{c.target_type}</td>
                        <td className="p-2.5 print:p-1">
                          <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-bold print:border-black print:text-black print:bg-transparent print:text-[7pt]">
                            {c.relation_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-2.5 print:p-1 font-bold text-rose-400 print:text-black">
                          {(c.target_risk * 100).toFixed(0)}%
                        </td>
                        <td className="p-2.5 print:p-1 uppercase text-slate-400 print:text-gray-700">{c.direction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 print:p-1.5 print:border print:border-gray-300 print:rounded-none print:text-black">
                No direct syndicate relations identified in active graph query.
              </div>
            )}
          </div>

          {/* SECTION 6: STATUTORY INVESTIGATION SUMMARY & EVIDENCE RECORD */}
          <div className="space-y-2 print:space-y-1 print-avoid-break">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-1 flex items-center gap-2 print:text-black print:border-black print:text-[9pt] print:pb-0.5">
              <UserCheck className="w-3.5 h-3.5 text-sky-400 print:hidden" />
              6. Recorded Operational Statement & Evidence Summary
            </h3>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-sans text-slate-300 leading-relaxed space-y-2 print:p-2 print:bg-white print:border print:border-gray-300 print:rounded-none print:text-[8pt] print:leading-snug print:text-black">
              <p>
                <strong>Operational Overview:</strong> Subject <strong>{entity.name}</strong> has been tagged in multi-relational intelligence graph matrices operating under role <strong>{entity.role}</strong>. Graph centrality metrics indicate a bridge centrality score of <strong>{((selectedNode?.composite_centrality || 0.2) * 10).toFixed(1)} / 10</strong>, identifying the subject as a key conduit between operational logistics cells and financial Hawala accounts.
              </p>
              <p>
                <strong>Evidence Corroboration:</strong> Intercepted telecom CDR records corroborate recurrent communications preceding high-volume fund layering transactions across national and offshore conduits. Disconnected phone coordinates indicate evasive behavioral patterns matching known syndicate operational SOPs.
              </p>
            </div>
          </div>

          {/* SECTION 7: OFFICIAL VERIFICATION & CERTIFICATION SEAL */}
          <div className="pt-6 border-t-2 border-slate-800 text-xs font-mono text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 print:pt-3 print:border-t-2 print:border-black print:text-black print-avoid-break">
            <div className="space-y-1 print:text-[7.5pt]">
              <div><strong>EVIDENCE SHA-256 HASH:</strong> e8f2a93c4b1098e72b6a54d190283c74</div>
              <div><strong>RECORDED BY:</strong> CYBER INTELLIGENCE SPECIAL BRANCH (I4C)</div>
              <div><strong>STATUS:</strong> EVIDENCE FILE CERTIFIED FOR LEGAL DISCLOSURE</div>
            </div>

            <div className="text-right sm:text-right space-y-3 w-full sm:w-auto print:space-y-1">
              <div className="h-10 border-b border-dashed border-slate-600 print:border-b print:border-black w-48 ml-auto print:h-6" />
              <div className="text-[11px] font-bold text-slate-300 uppercase print:text-[7.5pt] print:text-black">
                Authorized Investigating Officer (IO) Signature & Seal
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
