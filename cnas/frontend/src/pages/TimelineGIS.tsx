import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Calendar,
  MapPin,
  Clock,
  Filter,
  Radio,
  Eye,
  Layers,
  Crosshair,
  ShieldAlert,
  Search,
  Phone,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassPanel } from '../components/GlassPanel';
import { HumanInTheLoopBanner } from '../components/HumanInTheLoopBanner';
import { api } from '../services/api';
import { TimelineEvent } from '../types';

// Fix for default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Vibrant Case Color Palette
const caseColors = [
  '#38bdf8', // Sky Blue
  '#34d399', // Emerald
  '#fbbf24', // Amber
  '#f87171', // Red
  '#e879f9', // Fuchsia
  '#22d3ee', // Cyan
  '#f472b6', // Pink
  '#a3e635', // Lime
];

// Map Center Controller Component
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 6 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

export const TimelineGIS: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Read URL tracking parameters
  const queryLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const queryLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
  const queryName = searchParams.get('name');
  const queryDesc = searchParams.get('desc');
  const queryTime = searchParams.get('time');
  const queryCase = searchParams.get('case');
  const hasTargetInQuery = queryLat !== null && queryLng !== null && !isNaN(queryLat) && !isNaN(queryLng);

  // Target Isolation State
  const [isIsolatedMode, setIsIsolatedMode] = useState<boolean>(() => {
    const isolateParam = searchParams.get('isolate');
    if (isolateParam !== null) return isolateParam === 'true';
    return hasTargetInQuery;
  });

  // Construct special live target event if URL params provided
  const liveTargetEvent: TimelineEvent | null = useMemo(() => {
    if (hasTargetInQuery) {
      return {
        id: 999999,
        entity_id: 999999,
        case_id: 999999,
        case_title: queryCase || 'LIVE INTERCEPT',
        entity_name: queryName || 'Tracked Target',
        entity_type: 'Phone' as any,
        timestamp: queryTime || new Date().toLocaleString(),
        latitude: queryLat!,
        longitude: queryLng!,
        description: queryDesc || 'Live Telecom Signal Triangulation Intercept',
      };
    }
    return null;
  }, [hasTargetInQuery, queryLat, queryLng, queryName, queryDesc, queryTime, queryCase]);

  // Sync state
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    liveTargetEvent ? liveTargetEvent.id : null
  );
  const [selectedCaseId, setSelectedCaseId] = useState<string>('ALL');
  const [dateFilterIndex, setDateFilterIndex] = useState<number>(100);
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    liveTargetEvent ? [liveTargetEvent.latitude, liveTargetEvent.longitude] : [22.5, 78.9]
  );

  // Update center when liveTargetEvent becomes available
  useEffect(() => {
    if (liveTargetEvent) {
      setMapCenter([liveTargetEvent.latitude, liveTargetEvent.longitude]);
      setSelectedEventId(liveTargetEvent.id);
    }
  }, [liveTargetEvent]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await api.getTimeline();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load timeline events:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  // Filter events based on Isolated Mode vs Full Corridors
  const displayedEvents = useMemo(() => {
    if (isIsolatedMode && liveTargetEvent) {
      return [liveTargetEvent];
    }

    let list = [...events];
    if (liveTargetEvent) {
      // Prepend live target event to the top of list
      list = [liveTargetEvent, ...list.filter((e) => e.id !== liveTargetEvent.id)];
    }

    if (selectedCaseId !== 'ALL') {
      list = list.filter((e) => String(e.case_id) === selectedCaseId);
    }

    const cutoff = Math.floor((dateFilterIndex / 100) * list.length);
    return list.slice(0, Math.max(1, cutoff));
  }, [events, liveTargetEvent, isIsolatedMode, selectedCaseId, dateFilterIndex]);

  // Distinct cases for filter dropdown
  const uniqueCases = useMemo(() => {
    const map = new Map<number, string>();
    events.forEach((e) => {
      if (e.case_id) map.set(e.case_id, e.case_title);
    });
    return Array.from(map.entries());
  }, [events]);

  // Direct Number Live Search state (works for ANY number inside or outside dataset)
  const [directNumberQuery, setDirectNumberQuery] = useState('');
  const [directSearching, setDirectSearching] = useState(false);
  const [locatingDevice, setLocatingDevice] = useState(false);

  // Direct Live Locator function
  const handleSearchDirectNumber = async (qText?: string) => {
    const q = (qText !== undefined ? qText : directNumberQuery).trim();
    if (!q) return;
    try {
      setDirectSearching(true);
      const res = await api.searchSuspectOrPhone(q);
      if (res.found && res.latest_location) {
        const pin = res.latest_location.pincode ? ` [PINCODE: ${res.latest_location.pincode}]` : '';
        const name = res.person_name || res.target?.person_name || res.target?.name || q;
        const desc = `${res.latest_location.description || 'Live Carrier Intercept'}${pin}`;

        setSearchParams({
          lat: String(res.latest_location.latitude),
          lng: String(res.latest_location.longitude),
          name: name,
          desc: desc,
          time: res.latest_location.timestamp || 'LIVE CURRENT PING',
          case: `LIVE CARRIER PING — PIN: ${res.latest_location.pincode || 'RESOLVED'}`,
          isolate: 'true'
        });
        setMapCenter([res.latest_location.latitude, res.latest_location.longitude]);
      } else {
        alert(res.message || 'Could not locate phone number coordinates.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to triangulate carrier location for this number.');
    } finally {
      setDirectSearching(false);
    }
  };

  // Real Hardware Device GPS Probe (accurately finds the user's exact current physical location & pincode)
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
        let area = 'Current Device Location';
        let pincode = '';

        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          if (geoRes.ok) {
            const data = await geoRes.json();
            pincode = data.address?.postcode || '';
            const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
            const city = data.address?.city || data.address?.town || data.address?.state_district || '';
            const state = data.address?.state || '';
            area = road ? `${road}, ${city || state}` : `${city || state || 'Live Physical Device'}`;
          }
        } catch (e) {
          console.warn('Reverse geocode failed:', e);
        }

        const numLabel = directNumberQuery.trim() ? directNumberQuery.trim() : 'Active User Device';
        const pinStr = pincode ? ` — PINCODE: ${pincode}` : '';
        const finalDesc = `${area}${pinStr} (Live Device Hardware GPS Probe)`;

        setSearchParams({
          lat: String(lat),
          lng: String(lng),
          name: `📍 REAL DEVICE: ${numLabel}`,
          desc: finalDesc,
          time: new Date().toLocaleTimeString() + ' (EXACT DEVICE GPS FIX)',
          case: `EXACT DEVICE HARDWARE GPS — ${pincode ? `PIN: ${pincode}` : 'LIVE FIX'}`,
          isolate: 'true'
        });
        setMapCenter([lat, lng]);
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

  const handleSelectEvent = (ev: TimelineEvent) => {
    setSelectedEventId(ev.id);
    setMapCenter([ev.latitude, ev.longitude]);
  };

  const handleToggleIsolation = (isolate: boolean) => {
    setIsIsolatedMode(isolate);
    if (isolate && liveTargetEvent) {
      setMapCenter([liveTargetEvent.latitude, liveTargetEvent.longitude]);
      setSelectedEventId(liveTargetEvent.id);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner */}
      <HumanInTheLoopBanner />

      {/* Real-time Phone Number & Suspect Tracker Bar (Locates ANY Outside Number on Map) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-sky-500/40 shadow-xl backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchDirectNumber();
          }}
          className="flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={directNumberQuery}
              onChange={(e) => setDirectNumberQuery(e.target.value)}
              placeholder="Enter ANY Mobile Number (e.g. your 10-digit number) or tap 'Pin My Device'..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={directSearching || !directNumberQuery.trim()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {directSearching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Triangulating...</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 text-emerald-300" />
                <span>Locate on Map</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleUseCurrentDeviceLocation}
            disabled={locatingDevice}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            title="Use your actual device browser GPS to pinpoint your exact current location and real PINCODE on the map"
          >
            {locatingDevice ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Reading GPS...</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-white animate-bounce" />
                <span>📍 Pin My Exact Location (GPS)</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 mt-2.5 text-[11px] font-mono text-slate-400 flex-wrap">
          <span className="text-slate-500">Quick Test (Outside & Inside Dataset):</span>
          {[
            { label: 'Outside: 9848012345 (AP/TS)', q: '9848012345' },
            { label: 'Outside: 9811099887 (Delhi)', q: '9811099887' },
            { label: 'Outside: 9820033221 (Mumbai)', q: '9820033221' },
            { label: 'Outside: 9845011223 (Bengaluru)', q: '9845011223' },
            { label: 'Dataset: 9811011223 (Kabir Khan)', q: '9811011223' },
          ].map((chip) => (
            <button
              key={chip.q}
              type="button"
              onClick={() => {
                setDirectNumberQuery(chip.q);
                handleSearchDirectNumber(chip.q);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-300 border border-slate-700 text-[10px] cursor-pointer transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Isolation Notice Bar (when Tracking a Specific Suspect / Phone Number) */}
      {liveTargetEvent && (
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isIsolatedMode
            ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/70 border-emerald-500/60 shadow-glowGreen'
            : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center gap-3">
              <span className="relative flex h-3.5 w-3.5 mt-0.5 md:mt-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
              </span>

              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono uppercase font-bold text-emerald-300">
                    {isIsolatedMode ? '📍 ISOLATED TARGET TRACKING MODE' : '🛰️ TARGET PINNED IN FULL NETWORK'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-bold">
                    {liveTargetEvent.entity_name}
                  </span>
                  <span className="font-mono text-sky-400 font-bold text-[11px]">
                    [{liveTargetEvent.latitude.toFixed(4)}° N, {liveTargetEvent.longitude.toFixed(4)}° E]
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5 leading-snug">
                  {liveTargetEvent.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              {isIsolatedMode ? (
                <button
                  onClick={() => handleToggleIsolation(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-300" />
                  <span>Show All India Network ({events.length} Pins)</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleIsolation(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer shadow-glowGreen"
                >
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Isolate ONLY This Target</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
            Spatial-Temporal Timeline & GIS Analysis
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
              {isIsolatedMode ? 'TARGET ISOLATION' : 'SYNCHRONIZED FEED'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {isIsolatedMode
              ? `Displaying precise GPS telemetry and cell tower triangulation intercept strictly for ${liveTargetEvent?.entity_name}.`
              : 'Correlating physical surveillance intercepts, wire handoffs, and satellite telemetry across India corridors.'}
          </p>
        </div>

        {/* Case Selector Filter (Only active in Full Network mode) */}
        {!isIsolatedMode && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs shadow-lg">
              <Filter className="w-3.5 h-3.5 text-sky-400" />
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs font-semibold cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Operations ({uniqueCases.length})</option>
                {uniqueCases.map(([id, title]) => (
                  <option key={id} value={String(id)} className="bg-slate-900">
                    Case #{id}: {title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Date Slider Strip (Only in full mode) */}
      {!isIsolatedMode && (
        <GlassPanel glow="blue" className="p-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Calendar className="w-4 h-4 text-sky-300" />
              <span>Temporal Window Filter:</span>
              <span className="text-sky-300 font-mono font-bold">
                Showing {displayedEvents.length} of {events.length + (liveTargetEvent ? 1 : 0)} telemetry events
              </span>
            </div>

            <div className="text-[11px] font-mono font-medium text-purple-200">
              {displayedEvents.length > 0 && (
                <span>
                  Range: {displayedEvents[0]?.timestamp.split(' ')[0]} ➔ {displayedEvents[displayedEvents.length - 1]?.timestamp.split(' ')[0]}
                </span>
              )}
            </div>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            value={dateFilterIndex}
            onChange={(e) => setDateFilterIndex(parseInt(e.target.value))}
            className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-fuchsia-400"
          />
        </GlassPanel>
      )}

      {/* Dual Panel Grid (Timeline Left, Leaflet Map Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[650px]">
        {/* LEFT: Timeline Panel (5 cols) */}
        <div className="lg:col-span-5 h-full">
          <GlassPanel glow="purple" className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-fuchsia-300" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  {isIsolatedMode ? 'Isolated Target Telemetry' : 'Chronological Event Feed'}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-medium text-purple-200">
                {displayedEvents.length} {displayedEvents.length === 1 ? 'Location Ping' : 'Location Pings'}
              </span>
            </div>

            {/* Scrollable Event List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {loading && !liveTargetEvent ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 bg-white/10 rounded-xl animate-pulse" />
                ))
              ) : (
                displayedEvents.map((ev) => {
                  const isSelected = selectedEventId === ev.id;
                  const isTarget = ev.id === 999999;
                  const cColor = isTarget ? '#10b981' : caseColors[(ev.case_id || 0) % caseColors.length];

                  return (
                    <motion.div
                      key={ev.id}
                      onClick={() => handleSelectEvent(ev)}
                      whileHover={{ scale: 1.01 }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                        isTarget
                          ? 'bg-emerald-950/80 border-emerald-500/60 shadow-glowGreen ring-1 ring-emerald-400/40'
                          : isSelected
                          ? 'bg-white/20 border-white/40 shadow-glowBlue'
                          : 'bg-white/[0.06] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1"
                          style={{
                            backgroundColor: `${cColor}25`,
                            borderColor: `${cColor}60`,
                            color: cColor,
                          }}
                        >
                          {isTarget && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                          {ev.case_title}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-purple-200">
                          {ev.timestamp}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cColor }} />
                        <span>{ev.entity_name}</span>
                        {isTarget && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            ACTIVE RADAR
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-purple-100 leading-relaxed font-normal">
                        {ev.description}
                      </p>

                      <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-purple-200 font-mono">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300 font-bold">{ev.latitude.toFixed(4)}° N, {ev.longitude.toFixed(4)}° E</span>
                        </div>
                        {isSelected && (
                          <span className="text-sky-300 font-bold">● Focused on Map</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </GlassPanel>
        </div>

        {/* RIGHT: Leaflet GIS Map (7 cols) */}
        <div className="lg:col-span-7 h-full">
          <GlassPanel glow="green" className="p-0 h-full rounded-2xl overflow-hidden border border-white/25 relative shadow-glowGreen">
            <MapContainer
              center={mapCenter}
              zoom={isIsolatedMode ? 13 : 5}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <MapRecenter
                center={mapCenter}
                zoom={isIsolatedMode ? 13 : (selectedEventId ? 9 : 5)}
              />

              {/* OpenStreetMap Tactical Dark Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark-map-tiles"
              />

              {/* Event Markers */}
              {displayedEvents.map((ev) => {
                const isSelected = selectedEventId === ev.id;
                const isTarget = ev.id === 999999;
                const cColor = isTarget ? '#10b981' : caseColors[(ev.case_id || 0) % caseColors.length];

                return (
                  <React.Fragment key={ev.id}>
                    {/* Outer animated radar ping ring for target */}
                    {isTarget && (
                      <CircleMarker
                        center={[ev.latitude, ev.longitude]}
                        radius={26}
                        pathOptions={{
                          color: '#10b981',
                          fillColor: '#10b981',
                          fillOpacity: 0.2,
                          weight: 1.5,
                          dashArray: '4 4',
                        }}
                      />
                    )}

                    <CircleMarker
                      center={[ev.latitude, ev.longitude]}
                      radius={isTarget ? 14 : (isSelected ? 10 : 6)}
                      pathOptions={{
                        color: isTarget ? '#ffffff' : (isSelected ? '#ffffff' : cColor),
                        fillColor: isTarget ? '#10b981' : (isSelected ? '#38bdf8' : cColor),
                        fillOpacity: isTarget ? 1.0 : (isSelected ? 0.95 : 0.75),
                        weight: isTarget ? 3.5 : (isSelected ? 3 : 1.5),
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelectedEventId(ev.id);
                          setMapCenter([ev.latitude, ev.longitude]);
                        },
                      }}
                    >
                      <Popup autoPan={true}>
                        <div className="p-1.5 min-w-[220px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold">
                              {ev.case_title}
                            </span>
                            {isTarget && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                LIVE PING
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-white mb-1">
                            {ev.entity_name} {ev.entity_type ? `(${ev.entity_type})` : ''}
                          </div>
                          <p className="text-[11px] text-purple-100 leading-snug mb-2 font-normal">
                            {ev.description}
                          </p>
                          <div className="text-[10px] text-purple-200 font-mono border-t border-white/10 pt-1 flex items-center justify-between">
                            <span>{ev.timestamp}</span>
                            <span className="text-emerald-400 font-bold">
                              {ev.latitude.toFixed(4)}° N, {ev.longitude.toFixed(4)}° E
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}
            </MapContainer>

            {/* Map Floating HUD */}
            <div className="absolute top-4 right-4 z-[400] p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-2xl text-xs text-white flex items-center gap-2 font-semibold backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[11px]">
                {isIsolatedMode ? `1 Target Isolated (${queryName || 'Suspect'})` : `${displayedEvents.length} Active Geo Pins`}
              </span>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
