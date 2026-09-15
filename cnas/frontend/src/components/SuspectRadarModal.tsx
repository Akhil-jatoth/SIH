import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  Phone,
  MapPin,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Radio,
  Clock,
  Car,
  CreditCard,
  Network,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface SuspectRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const SuspectRadarModal: React.FC<SuspectRadarModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialQuery) {
        setSearchQuery(initialQuery);
        handleSearch(initialQuery);
      } else {
        // default search for demo if empty
        handleSearch('Kabir Khan');
      }
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (queryText?: string) => {
    const q = queryText !== undefined ? queryText : searchQuery;
    if (!q.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.searchSuspectOrPhone(q.trim());
      if (data.found) {
        setResult(data);
      } else {
        setResult(null);
        setErrorMsg(data.message || 'No matching suspect or phone number found in intelligence records.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to query intelligence database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [locatingDevice, setLocatingDevice] = useState(false);

  const handleUseCurrentDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingDevice(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let area = 'Current Device Physical Location';
        let pincode = '';
        let fullAddress = '';

        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          if (geoRes.ok) {
            const data = await geoRes.json();
            pincode = data.address?.postcode || '';
            const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
            const city = data.address?.city || data.address?.town || data.address?.state_district || '';
            const state = data.address?.state || '';
            area = road ? `${road}, ${city || state}` : `${city || state || 'Live Physical Device'}`;
            fullAddress = data.display_name || '';
          }
        } catch (e) {
          console.warn('Reverse geocode failed:', e);
        }

        const numLabel = searchQuery.trim() ? searchQuery.trim() : 'Live User Device';
        const pinStr = pincode ? ` — PINCODE: ${pincode}` : '';
        const fullDesc = `${area}${pinStr} (Real-time Device Hardware GPS Probe)`;

        setResult({
          found: true,
          query: numLabel,
          person_name: 'Current Device User',
          target: {
            id: 8888,
            name: 'Current Device User',
            person_name: 'Current Device User',
            type: 'Phone',
            risk_score: 0.20,
            attributes: {
              person_name: 'Active Local User',
              phone: numLabel,
              status: 'EXACT_HARDWARE_GPS_FIX',
              pincode: pincode,
              area: area,
              coordinates: `${lat.toFixed(5)}, ${lng.toFixed(5)}`
            }
          },
          latest_location: {
            latitude: lat,
            longitude: lng,
            pincode: pincode,
            description: fullDesc,
            timestamp: new Date().toLocaleTimeString() + ' (EXACT HARDWARE GPS FIX)',
            case_title: `Live Device GPS Tracking (${pincode ? `PIN: ${pincode}` : 'REAL-TIME'})`,
            entity_name: `📍 Real Device (${numLabel})`
          },
          movement_history: [
            {
              latitude: lat,
              longitude: lng,
              pincode: pincode,
              description: fullDesc,
              timestamp: new Date().toLocaleTimeString(),
              case_title: 'Real-time GPS Coordinate Stream'
            }
          ],
          associates_count: 0,
          associates: []
        });
        setLocatingDevice(false);
      },
      (err) => {
        console.error(err);
        setLocatingDevice(false);
        alert('Could not obtain device GPS. Please grant location permissions in your browser or type a phone number.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSelectAssociate = (assocName: string) => {
    setSearchQuery(assocName);
    handleSearch(assocName);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex flex-col sm:items-center sm:justify-center p-0 sm:p-6 bg-slate-950/95 sm:bg-black/85 sm:backdrop-blur-md overflow-hidden">
      <div className="relative w-full h-full sm:h-auto sm:max-w-4xl bg-slate-900 border-0 sm:border sm:border-sky-500/40 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 sm:max-h-[90vh]">

        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors sm:hidden flex items-center gap-1 text-xs font-bold font-mono"
            >
              <span>← Back</span>
            </button>
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 hidden sm:block">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white font-display flex items-center gap-2">
                <span>Suspect & Telecom Radar</span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  REAL-TIME GPS
                </span>
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
                Query mobile intercepts, IMEI triangulations, and suspect geospatial traces
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer hidden sm:block"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter suspect name (e.g. Rahul Verma) or phone (e.g. 9848012345, 9811011223)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Locating...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Search & Locate</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleUseCurrentDeviceLocation}
              disabled={locatingDevice}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
              title="Use your actual device GPS to pinpoint your current location and real PINCODE on the map"
            >
              {locatingDevice ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Reading GPS...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-white animate-bounce" />
                  <span>📍 Pin My GPS</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-slate-400 flex-wrap">
            <span>Quick Queries:</span>
            {[
              { label: 'Kabir Khan (Boss)', q: 'Kabir Khan' },
              { label: 'Rahul Verma (Hawala)', q: 'Rahul Verma' },
              { label: 'Priya Sharma (Crypto)', q: 'Priya Sharma' },
              { label: 'Phone: +91-98110-11223', q: '+91-98110-11223' },
              { label: 'Phone: +91-98200-55441', q: '+91-98200-55441' },
            ].map((chip) => (
              <button
                key={chip.q}
                type="button"
                onClick={() => {
                  setSearchQuery(chip.q);
                  handleSearch(chip.q);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-300 border border-slate-700 text-[10px] cursor-pointer transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-bold text-rose-200">Intelligence Search Notice</p>
                <p className="mt-0.5 text-rose-300/90">{errorMsg}</p>
              </div>
            </div>
          )}

          {result && result.target && (
            <>
              {/* Target Profile Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-sky-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border-2 border-sky-400/40 flex items-center justify-center text-sky-300 text-xl font-bold font-display shadow-glassGlow">
                    {(result.person_name || result.target.name || 'S').charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white tracking-wide">
                        {result.person_name || result.target.person_name || result.target.name}
                      </h3>
                      {result.target.attributes?.kyc_status && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          {result.target.attributes.kyc_status}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                        Risk: {(result.target.risk_score * 100).toFixed(0)}%
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        {result.target.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 font-mono flex-wrap">
                      {result.target.attributes?.phone && (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{result.target.attributes.phone}</span>
                        </span>
                      )}
                      {result.target.attributes?.role && (
                        <span>Role: <strong className="text-amber-300">{result.target.attributes.role}</strong></span>
                      )}
                      {result.target.attributes?.carrier && (
                        <span className="text-sky-300 font-semibold">Carrier: {result.target.attributes.carrier}</span>
                      )}
                      {result.target.attributes?.alias && (
                        <span className="text-slate-400">Alias: <em className="text-slate-200">"{result.target.attributes.alias}"</em></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/graph?highlight=${result.target.id}`);
                    }}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>View in Graph</span>
                  </button>

                  {result.latest_location && (
                    <button
                      onClick={() => {
                        onClose();
                        const params = new URLSearchParams({
                          lat: String(result.latest_location.latitude),
                          lng: String(result.latest_location.longitude),
                          name: result.person_name || result.target.name || 'Tracked Target',
                          desc: result.latest_location.description || 'Live Intercept Telemetry',
                          time: result.latest_location.timestamp || '',
                          case: result.latest_location.case_title || 'LIVE TELECOM INTERCEPT',
                          isolate: 'true'
                        });
                        navigate(`/timeline-gis?${params.toString()}`);
                      }}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer shadow-glowGreen"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Track on Map</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Section: Live Telecom / GPS Location Telemetry Card with PINCODE */}
              {result.latest_location ? (
                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 shadow-glowGreen">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-emerald-400" />
                        <span>Live Telecom Tower & GPS Telemetry Intercept</span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {result.latest_location.pincode && (
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs">
                          📍 PINCODE: {result.latest_location.pincode}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">
                        {result.latest_location.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Person / Subscriber</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {result.person_name || result.target.name}
                      </span>
                      {result.latest_location.pincode && (
                        <span className="text-[11px] text-sky-300 font-semibold block mt-0.5">
                          Postal PIN: {result.latest_location.pincode}
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">GPS Coordinates</span>
                      <span className="text-sm font-bold text-sky-400">
                        {result.latest_location.latitude.toFixed(4)}° N, {result.latest_location.longitude.toFixed(4)}° E
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {result.latest_location.city ? `${result.latest_location.city}, ${result.latest_location.state || ''}` : 'Active Cellular Sector'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Current Live Location & Tower</span>
                      <span className="text-xs font-medium text-slate-200">
                        {result.latest_location.description}
                      </span>
                    </div>
                  </div>

                  {result.latest_location.case_title && (
                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-400 border-t border-slate-800/80 flex-wrap gap-2">
                      <span>Linked Operation: <strong className="text-amber-300">{result.latest_location.case_title}</strong></span>
                      <span className="text-emerald-400 font-semibold">● ACTIVE REAL-TIME CARRIER TELEMETRY</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
                  📍 Direct GPS coordinates resolving. Linked safehouse and transit telemetry available under Graph Explorer.
                </div>
              )}

              {/* Section: Who Was With Them / Connected Associates */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-300">
                      Direct Criminal Associates & Linkages ({result.associates_count ?? result.associates?.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Click any person to pivot radar
                  </span>
                </div>

                {result.associates && result.associates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {result.associates.map((assoc: any) => (
                      <div
                        key={assoc.id}
                        onClick={() => handleSelectAssociate(assoc.name)}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-400/50 hover:bg-slate-900/80 transition-all cursor-pointer group flex flex-col justify-between gap-2 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                              {assoc.name}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              {assoc.role || assoc.type}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {(assoc.risk_score * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                          <span className="text-sky-400 font-semibold truncate max-w-[130px]">
                            {assoc.relation_type}
                          </span>
                          <span className="text-slate-500 group-hover:text-slate-300 flex items-center gap-0.5">
                            Pivot <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-mono">No direct connected associates recorded.</p>
                )}
              </div>

              {/* Section: Movement History Trail */}
              {result.movement_history && result.movement_history.length > 1 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <h5 className="text-[11px] font-bold font-mono uppercase text-slate-300">
                      Chronological Movement Trail ({result.movement_history.length} pings)
                    </h5>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {result.movement_history.slice(1, 4).map((hist: any, i: number) => (
                      <div key={i} className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-slate-300">
                        <span className="truncate max-w-md">{hist.description}</span>
                        <span className="text-slate-500 text-[10px] shrink-0 ml-2">{hist.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
