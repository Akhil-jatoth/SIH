import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  FileText,
  Plus,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Database,
  ArrowRight,
  RefreshCw,
  Phone,
  CreditCard,
  Car,
  MapPin,
  Building,
  User,
  ShieldAlert,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { Entity, EntityType, IngestResponse } from '../types';

interface DatasetIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNodes: Entity[];
  onIngestSuccess: (res: IngestResponse) => void;
  initialTargetEntityId?: number;
  initialCoordinates?: { lat: number; lon: number; address?: string };
}

export const DatasetIngestionModal: React.FC<DatasetIngestionModalProps> = ({
  isOpen,
  onClose,
  existingNodes,
  onIngestSuccess,
  initialTargetEntityId,
  initialCoordinates,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'templates' | 'manual'>('templates');
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<IngestResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- TAB 1: FILE UPLOAD STATE ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<{ headers: string[]; rows: string[][]; totalCount: number } | null>(null);

  // --- TAB 2: TEMPLATES & RAW CSV STATE ---
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [templateNote, setTemplateNote] = useState<string>('Live Intelligence Ingestion');

  // --- TAB 3: MANUAL FORM STATE ---
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState<EntityType>('Person');
  const [manualRisk, setManualRisk] = useState<number>(0.75);
  const [manualRole, setManualRole] = useState('');
  const [manualAlias, setManualAlias] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualLat, setManualLat] = useState<string>('28.6139');
  const [manualLon, setManualLon] = useState<string>('77.2090');
  const [linkTargetId, setLinkTargetId] = useState<string>(initialTargetEntityId ? String(initialTargetEntityId) : '');
  const [linkRelationType, setLinkRelationType] = useState<string>('connected_to');

  // Sync initial coordinate tag if provided
  useEffect(() => {
    if (initialCoordinates) {
      setManualLat(String(initialCoordinates.lat));
      setManualLon(String(initialCoordinates.lon));
      setManualType('Location');
      if (initialCoordinates.address) {
        setManualName(initialCoordinates.address.split(',')[0]);
      }
      setActiveTab('manual');
    }
  }, [initialCoordinates]);

  // Pre-configured realistic intelligence templates
  const templates = [
    {
      id: 'hawala_wire',
      title: 'Hawala Wire Transfer Conduit',
      badge: 'FINANCIAL GRID',
      badgeColor: 'border-purple-400/40 text-purple-300 bg-purple-500/20',
      desc: 'Ingest a newly flagged Dubai-Mumbai layering account transacted with primary Hawala kingpins (₹1.85 Cr flow).',
      csv: `name,entity_type,risk_score,bank,branch,balance,latitude,longitude,link_to_name,relation_type
Al-Amanah Clearing Conduit,Account,0.88,Emirates NBD / Hawala Pool,Deira Gold Souk Vault,₹4.2 Cr,19.0657,72.8683,Kabir Khan,transacted_with`
    },
    {
      id: 'burner_cdr',
      title: 'Burner MSISDN Telecom Intercept',
      badge: 'CDR STREAM',
      badgeColor: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/20',
      desc: 'Ingest an intercepted burner SIM card calling syndicate kingpin from a live cell tower sector.',
      csv: `caller,receiver,duration,tower,latitude,longitude,timestamp
+91-98110-88412,MSISDN 9811011223,184s,BTS-DEL-CONNAUGHT-402,28.6304,77.2177,2025-02-23 19:14:02 IST`
    },
    {
      id: 'safehouse_gps',
      title: 'Triangulated Safehouse Coordinates',
      badge: 'GEO-TELEMETRY',
      badgeColor: 'border-sky-400/40 text-sky-300 bg-sky-500/20',
      desc: 'Ingest a verified transit safehouse location with precise latitude/longitude coordinates and co-located suspects.',
      csv: `name,entity_type,risk_score,address,pincode,city,latitude,longitude,link_to_name,relation_type
Sector 62 Safehouse Hub,Location,0.82,Electronic City Corridor,201301,Noida,28.6280,77.3649,Rahul Verma,co_located`
    },
    {
      id: 'fleet_vehicle',
      title: 'Logistics Transport Asset',
      badge: 'FLEET SURVEILLANCE',
      badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-500/20',
      desc: 'Ingest a heavy container vehicle plate operating across regional customs corridor.',
      csv: `name,entity_type,risk_score,plate,make,model,color,latitude,longitude,link_to_name,relation_type
DL-1AA-8921 Heavy Freight,Vehicle,0.72,DL-1AA-8921,Tata,Prima Container 40ft,Dark Blue,28.4595,77.0266,Swift Translines Pvt Ltd,owns`
    }
  ];

  // Set default raw CSV template on load
  useEffect(() => {
    if (!rawCsvText) {
      setRawCsvText(templates[0].csv);
    }
  }, []);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setFileContent(text);
      parseCsvPreview(text);
    };
    reader.readAsText(file);
  };

  const parseCsvPreview = (text: string) => {
    try {
      const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const rows = lines.slice(1, 6).map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));
        setParsedPreview({
          headers,
          rows,
          totalCount: lines.length - 1,
        });
      }
    } catch (err) {
      console.error('Failed to parse preview:', err);
    }
  };

  // Submit Batch Ingestion (Tab 1 & Tab 2)
  const handleBatchIngest = async (csvData: string, note: string) => {
    if (!csvData.trim()) {
      setErrorMessage('CSV dataset content cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessResult(null);

      const res = await api.ingestDataset({
        csv_text: csvData.trim(),
        source_note: note,
      });

      setSuccessResult(res);
      onIngestSuccess(res);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Dataset ingestion failed. Check CSV syntax.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Manual Form (Tab 3)
  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      setErrorMessage('Entity name is required.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessResult(null);

      const lat = manualLat ? parseFloat(manualLat) : undefined;
      const lon = manualLon ? parseFloat(manualLon) : undefined;

      const attrs: Record<string, any> = {};
      if (manualRole) attrs.role = manualRole;
      if (manualAlias) attrs.alias = manualAlias;
      if (manualPhone) attrs.phone = manualPhone;
      if (lat !== undefined && lon !== undefined) {
        attrs.latitude = lat;
        attrs.longitude = lon;
        attrs.coordinates = `${lat},${lon}`;
      }

      const res = await api.ingestEntity({
        name: manualName.trim(),
        type: manualType,
        risk_score: manualRisk,
        attributes: attrs,
        latitude: lat,
        longitude: lon,
        link_to_entity_id: linkTargetId ? parseInt(linkTargetId) : undefined,
        relation_type: linkRelationType,
      });

      setSuccessResult(res);
      onIngestSuccess(res);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Manual ingestion failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-950/95 sm:bg-black/85 sm:backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="w-full h-full sm:h-auto sm:max-w-3xl sm:rounded-3xl bg-[#1d0824] border-0 sm:border sm:border-fuchsia-500/40 shadow-2xl overflow-hidden flex flex-col sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-fuchsia-950/90 via-purple-950/90 to-[#1d0824] border-b border-fuchsia-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors sm:hidden flex items-center gap-1 text-xs font-bold font-mono"
            >
              <span>← Back</span>
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300 shadow-md hidden sm:flex">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base font-extrabold text-white font-display">
                  Live Intelligence Ingestion
                </h2>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/30 font-bold">
                  GRAPH SYNC
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-purple-200 hidden sm:block">
                Ingest newly received forensic datasets, CDR logs, or suspect nodes directly into the graph.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-purple-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/10 bg-black/20 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('templates');
              setSuccessResult(null);
            }}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'templates'
                ? 'border-fuchsia-400 text-white font-bold'
                : 'border-transparent text-purple-300 hover:text-white'
              }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>Fast Intelligence Stream</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              setSuccessResult(null);
            }}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'upload'
                ? 'border-fuchsia-400 text-white font-bold'
                : 'border-transparent text-purple-300 hover:text-white'
              }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
            <span>File Upload (.CSV / .JSON)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manual');
              setSuccessResult(null);
            }}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'manual'
                ? 'border-fuchsia-400 text-white font-bold'
                : 'border-transparent text-purple-300 hover:text-white'
              }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manual Node & Link Form</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Success Result Banner */}
          {successResult && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 text-xs space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Dataset Ingestion Complete!</span>
              </div>
              <p className="text-emerald-300">{successResult.message}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  +{successResult.created_entities_count || (successResult.created_entities?.length ?? 1)} Entities
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-200 border border-sky-400/30">
                  +{successResult.created_relationships_count || (successResult.created_relationships?.length ?? 0)} Relationships
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-400/30">
                  +{successResult.created_events_count || (successResult.created_events?.length ?? 0)} GIS Coordinates
                </span>
              </div>
            </motion.div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: FILE UPLOAD */}
          {/* ==================================================== */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-white/25 hover:border-fuchsia-400 rounded-2xl bg-black/30 hover:bg-black/40 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    {selectedFile ? selectedFile.name : 'Click or Drag & Drop Forensic Dataset'}
                  </span>
                  <span className="text-xs text-purple-300">
                    Supports .CSV (entities, relationships, CDR logs, GIS telemetry) and .JSON
                  </span>
                </div>
              </div>

              {/* Parsed Preview Table */}
              {parsedPreview && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/15 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-purple-200 font-bold">
                      Parsed Preview ({parsedPreview.totalCount} Rows Total)
                    </span>
                    <span className="text-emerald-300">Schema Validated</span>
                  </div>

                  <div className="overflow-x-auto max-h-48 border border-white/10 rounded-xl">
                    <table className="w-full text-[11px] text-left text-purple-200">
                      <thead className="bg-white/10 text-white font-mono uppercase text-[10px]">
                        <tr>
                          {parsedPreview.headers.map((h, i) => (
                            <th key={i} className="px-2.5 py-1.5 border-b border-white/10">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {parsedPreview.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white/5">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-2.5 py-1.5 truncate max-w-[150px]">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => handleBatchIngest(fileContent, `File: ${selectedFile?.name}`)}
                    disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span>{loading ? 'Ingesting Dataset...' : `Ingest ${parsedPreview.totalCount} Records into Active Graph`}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: FAST INTELLIGENCE TEMPLATES & RAW CSV */}
          {/* ==================================================== */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {/* Template Selector Cards */}
              <div>
                <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block mb-2 font-mono">
                  Select Quick Intelligence Lead Template:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {templates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        setRawCsvText(tmpl.csv);
                        setTemplateNote(tmpl.title);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${rawCsvText === tmpl.csv
                          ? 'bg-fuchsia-600/25 border-fuchsia-400 shadow-md'
                          : 'bg-black/30 border-white/15 hover:bg-white/5 hover:border-white/25'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{tmpl.title}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${tmpl.badgeColor}`}>
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-300 leading-tight">{tmpl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Raw CSV Content */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/15 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-200 font-bold font-mono">
                    Editable CSV Payload Stream
                  </span>
                  <span className="text-[10px] text-purple-300">
                    Live editable before injection
                  </span>
                </div>

                <textarea
                  rows={6}
                  value={rawCsvText}
                  onChange={(e) => setRawCsvText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/70 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-fuchsia-400 resize-none"
                  placeholder="name,entity_type,risk_score,phone,latitude,longitude,link_to_name,relation_type"
                />

                <button
                  onClick={() => handleBatchIngest(rawCsvText, templateNote)}
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-fuchsia-300" />
                  <span>{loading ? 'Ingesting into Active Graph...' : 'Inject & Connect to Active Knowledge Graph'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: MANUAL NODE & LINK FORM */}
          {/* ==================================================== */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualIngest} className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3">
                <span className="text-xs font-bold text-purple-200 uppercase tracking-wider block font-mono">
                  1. Target Entity Profile
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Entity Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="e.g. Devendra Rawat"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Classification Type
                    </label>
                    <select
                      value={manualType}
                      onChange={(e) => setManualType(e.target.value as EntityType)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-fuchsia-400"
                    >
                      <option value="Person">👤 Person (Suspect / Operative)</option>
                      <option value="Vehicle">🚗 Vehicle (Logistics Asset)</option>
                      <option value="Phone">📱 Phone (MSISDN / Burner SIM)</option>
                      <option value="Account">💳 Account (Bank / Hawala)</option>
                      <option value="Location">📍 Location (Safehouse / Hub)</option>
                      <option value="Organization">🏢 Organization (Front Company)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Operational Role
                    </label>
                    <input
                      type="text"
                      value={manualRole}
                      onChange={(e) => setManualRole(e.target.value)}
                      placeholder="e.g. Hawala Layering Conduit"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Known Alias / Codename
                    </label>
                    <input
                      type="text"
                      value={manualAlias}
                      onChange={(e) => setManualAlias(e.target.value)}
                      placeholder="e.g. Tiger, Shadow-4"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Phone Number / Intercept
                    </label>
                    <input
                      type="text"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="e.g. +91-98110-99441"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                </div>

                {/* Coordinates & Risk */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Latitude Coordinates (° N)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder="28.6139"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Longitude Coordinates (° E)
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={manualLon}
                      onChange={(e) => setManualLon(e.target.value)}
                      placeholder="77.2090"
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Syndicate Risk Rating: {Math.round(manualRisk * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={manualRisk}
                      onChange={(e) => setManualRisk(parseFloat(e.target.value))}
                      className="w-full accent-fuchsia-500 cursor-pointer mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Relationship Linkage to Existing Graph Node */}
              <div className="p-4 rounded-2xl bg-black/40 border border-sky-400/30 space-y-3">
                <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block font-mono flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>2. Connect Directly to Existing Suspect in Graph</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Target Entity in Investigation
                    </label>
                    <select
                      value={linkTargetId}
                      onChange={(e) => setLinkTargetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-sky-400"
                    >
                      <option value="">-- No Direct Link (Isolated Hub) --</option>
                      {existingNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-purple-300 block mb-1">
                      Relationship Linkage Type
                    </label>
                    <select
                      value={linkRelationType}
                      onChange={(e) => setLinkRelationType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white text-xs focus:outline-none focus:border-sky-400"
                    >
                      <option value="transacted_with">💰 TRANSFERRED FUNDS / HAWALA (transacted_with)</option>
                      <option value="called">📞 TELECOM CALL / INTERCEPT (called)</option>
                      <option value="owns">🔑 OWNS / OPERATES (owns)</option>
                      <option value="co_located">📍 CO-LOCATED / SAFEHOUSE (co_located)</option>
                      <option value="commands">⚡ COMMANDS / CONTROLS (commands)</option>
                      <option value="associate_of">🤝 ASSOCIATE OF (associate_of)</option>
                      <option value="family_of">👥 FAMILY LINKAGE (family_of)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-sky-600 hover:from-fuchsia-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Adding & Connecting Node...' : 'Add Entity & Connect to Active Knowledge Graph'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/15 flex items-center justify-between">
          <div className="text-[11px] text-purple-300 font-mono">
            TAMPER-EVIDENT FORENSIC INGESTION • CRYPTOGRAPHICALLY AUDITED
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
