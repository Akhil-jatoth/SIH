import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Crosshair,
  Compass,
  Radio,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  X,
  Sparkles,
  AlertCircle,
  Building,
  User,
  Phone,
  CreditCard,
  Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { CoordinatesResolveResponse, Entity } from '../types';

interface CoordinatesFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusNode?: (nodeId: number) => void;
  onTagLocationAtCoordinates?: (lat: number, lon: number, address: string) => void;
  initialLat?: number;
  initialLon?: number;
}

export const CoordinatesFinderModal: React.FC<CoordinatesFinderModalProps> = ({
  isOpen,
  onClose,
  onFocusNode,
  onTagLocationAtCoordinates,
  initialLat,
  initialLon,
}) => {
  const [latInput, setLatInput] = useState<string>('28.6139');
  const [lonInput, setLonInput] = useState<string>('77.2090');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [geoData, setGeoData] = useState<CoordinatesResolveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync initial coordinates if passed
  useEffect(() => {
    if (initialLat !== undefined && initialLon !== undefined) {
      setLatInput(String(initialLat));
      setLonInput(String(initialLon));
    }
  }, [initialLat, initialLon]);

  // Preset hubs for quick investigation triage
  const presets = [
    { label: 'Delhi-NCR HQ', lat: 28.6139, lon: 77.2090, city: 'New Delhi', pin: '110001' },
    { label: 'Mumbai BKC Hawala', lat: 19.0657, lon: 72.8683, city: 'Mumbai', pin: '400051' },
    { label: 'BLR Whitefield Cyber', lat: 12.9698, lon: 77.7499, city: 'Bengaluru', pin: '560066' },
    { label: 'HYD HITEC Towers', lat: 17.4435, lon: 78.3772, city: 'Hyderabad', pin: '500081' },
    { label: 'Kolkata Salt Lake', lat: 22.5867, lon: 88.4170, city: 'Kolkata', pin: '700091' },
    { label: 'Jaipur MI Road', lat: 26.9157, lon: 75.8016, city: 'Jaipur', pin: '302001' },
  ];

  // Resolve coordinates
  const handleResolve = async (lat?: number, lon?: number) => {
    const targetLat = lat !== undefined ? lat : parseFloat(latInput);
    const targetLon = lon !== undefined ? lon : parseFloat(lonInput);

    if (isNaN(targetLat) || isNaN(targetLon)) {
      setError('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }

    if (targetLat < -90 || targetLat > 90 || targetLon < -180 || targetLon > 180) {
      setError('Coordinates out of range. Lat must be -90..90 and Lon -180..180.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.resolveCoordinates(targetLat, targetLon, radiusKm);
      setGeoData(res);
      setLatInput(String(targetLat));
      setLonInput(String(targetLon));
    } catch (err: any) {
      setError('Failed to resolve coordinates. Verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  // Search by text or landmark
  const handleSearchQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.searchCoordinates(searchQuery.trim());
      if (res && res.latitude && res.longitude) {
        setLatInput(String(res.latitude));
        setLonInput(String(res.longitude));
        await handleResolve(res.latitude, res.longitude);
      } else {
        setError(`No exact match found for "${searchQuery}".`);
      }
    } catch (err) {
      setError('Search lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  // Copy coordinates to clipboard
  const handleCopyCoords = () => {
    const coordsText = `${parseFloat(latInput).toFixed(6)}, ${parseFloat(lonInput).toFixed(6)}`;
    navigator.clipboard.writeText(coordsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Run initial resolve when modal opens
  useEffect(() => {
    if (isOpen) {
      handleResolve();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-[144px] pb-6 sm:pt-[148px] bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl rounded-3xl bg-[#1e0a26] border border-sky-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-165px)]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-950/80 via-purple-950/80 to-[#1e0a26] border-b border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shadow-md">
              <Crosshair className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white font-display">
                  GPS & Exact Coordinates Finder
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30 font-bold">
                  PRECISION GEO-INTEL
                </span>
              </div>
              <p className="text-xs text-purple-200">
                Pinpoint exact latitude & longitude coordinates, reverse-lookup Indian PIN codes, and identify closest suspect nodes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-purple-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Search & Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-purple-200 uppercase tracking-wider block font-mono">
              1. Landmark, City, or Coordinates Search
            </label>
            <form onSubmit={handleSearchQuery} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Bandra Kurla Complex, Connaught Place, 110001, or 19.0760, 72.8777"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/20 text-white placeholder:text-purple-300/50 text-xs font-medium focus:outline-none focus:border-sky-400"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Hub Quick Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-purple-300 mr-1">Hub Presets:</span>
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleResolve(p.lat, p.lon)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-sky-500/20 text-[11px] font-semibold text-purple-200 hover:text-sky-200 border border-white/10 hover:border-sky-400/40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-sky-400" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exact Coordinate Input Row */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Exact Decimal Coordinates</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-purple-300">Radius:</span>
                <select
                  value={radiusKm}
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    setRadiusKm(r);
                    handleResolve(parseFloat(latInput), parseFloat(lonInput));
                  }}
                  className="px-2 py-1 rounded-lg bg-[#2b0e33] border border-white/20 text-xs text-white focus:outline-none"
                >
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={250}>250 km</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-purple-300 block mb-1">
                  Latitude (° N/S)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="e.g. 28.6139"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-purple-300 block mb-1">
                  Longitude (° E/W)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={lonInput}
                  onChange={(e) => setLonInput(e.target.value)}
                  placeholder="e.g. 77.2090"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResolve()}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{loading ? 'Resolving Coordinates...' : 'Resolve Coordinates'}</span>
                </button>

                <button
                  onClick={handleCopyCoords}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white border border-white/20 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                  title="Copy exact coordinates to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {onTagLocationAtCoordinates && geoData && (
                <button
                  onClick={() => {
                    onTagLocationAtCoordinates(
                      geoData.query_coordinates.latitude,
                      geoData.query_coordinates.longitude,
                      geoData.resolved_metadata.formatted_address
                    );
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-fuchsia-600/30 hover:bg-fuchsia-600/40 text-fuchsia-200 border border-fuchsia-400/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  title="Create new location node at these exact coordinates"
                >
                  <MapPin className="w-3.5 h-3.5 text-fuchsia-300" />
                  <span>Tag Location Node</span>
                </button>
              )}
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Resolved Geographic Dossier */}
          {geoData && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 to-purple-950/40 border border-sky-400/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-300 font-mono flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                    <span>Resolved Geo-Spatial Metadata</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 border border-sky-400/30 font-bold">
                    GPS LOCK: {geoData.query_coordinates.formatted}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-purple-300 block text-[9px]">POSTAL PINCODE</span>
                    <span className="text-emerald-300 font-bold text-xs">{geoData.resolved_metadata.pincode}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-purple-300 block text-[9px]">DISTRICT / CITY</span>
                    <span className="text-white font-bold text-xs">{geoData.resolved_metadata.city}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-purple-300 block text-[9px]">STATE / REGION</span>
                    <span className="text-white font-bold text-xs">{geoData.resolved_metadata.state}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-purple-300 block text-[9px]">CELL TOWER BTS</span>
                    <span className="text-amber-300 font-bold text-xs">{geoData.resolved_metadata.nearest_bts_tower}</span>
                  </div>
                </div>

                <div className="text-xs text-purple-100 bg-black/30 p-2.5 rounded-xl border border-white/10 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">{geoData.resolved_metadata.area}</span>
                    <span className="text-purple-300 block text-[11px]">{geoData.resolved_metadata.formatted_address}</span>
                  </div>
                </div>
              </div>

              {/* Nearby Identified Suspects & Entities in Graph */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wider font-mono">
                    Nearby Network Entities ({geoData.nearby_entities.length} in {radiusKm}km radius)
                  </h3>
                  <span className="text-[10px] text-purple-300 font-mono">
                    Sorted by proximity
                  </span>
                </div>

                {geoData.nearby_entities.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-center text-xs text-purple-300">
                    No registered suspects or assets located within {radiusKm} km radius. Try increasing the search radius above.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {geoData.nearby_entities.map((ent) => (
                      <div
                        key={ent.entity_id}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{ent.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-200 uppercase">
                                {ent.type}
                              </span>
                              <span className="text-[9px] font-mono text-emerald-300">
                                Risk: {ent.risk_score}
                              </span>
                            </div>
                            <span className="text-[10px] text-purple-300 block truncate max-w-[280px]">
                              {ent.event_description}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-bold text-amber-300">
                            {ent.distance_km} km
                          </span>
                          {onFocusNode && (
                            <button
                              onClick={() => {
                                onFocusNode(ent.entity_id);
                                onClose();
                              }}
                              className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 hover:text-white border border-sky-400/30 transition-all cursor-pointer"
                              title="Center and highlight this node on graph"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/15 flex items-center justify-between">
          <div className="text-[11px] text-purple-300 font-mono">
            INDIAN CYBER CRIME COORDINATION CENTRE (I4C) • GIS GEOLOCATION ENGINE
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </motion.div>
    </div>
  );
};
