import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Users } from 'lucide-react';
import { GlassPanel } from '../components/GlassPanel';
import { HumanInTheLoopBanner } from '../components/HumanInTheLoopBanner';
import { api } from '../services/api';
import { CaseItem } from '../types';

export const CasesList: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        const data = await api.getCases();
        setCases(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCases();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Under Review': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    Closed: 'bg-slate-700/30 text-slate-400 border-slate-600/30',
  };

  return (
    <div className="space-y-6 pb-12">
      <HumanInTheLoopBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display drop-shadow">
            Operational Intelligence Cases
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-violet-400/20 text-violet-200 border border-violet-400/30 shadow-glowViolet">
              {cases.length} REGISTERED DOSSIERS
            </span>
          </h1>
          <p className="text-xs text-white/80 mt-1 font-medium">
            Browse registered investigative dossiers, link overlaps, and entity associations.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by case title or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder:text-slate-500 text-xs font-medium focus:outline-none focus:border-sky-400 shadow-ops backdrop-blur-md"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs font-semibold focus:outline-none shadow-ops w-full sm:w-auto cursor-pointer backdrop-blur-md"
        >
          <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
          <option value="Active" className="bg-slate-900 text-white">Active</option>
          <option value="Critical" className="bg-slate-900 text-white">Critical</option>
          <option value="Under Review" className="bg-slate-900 text-white">Under Review</option>
          <option value="Closed" className="bg-slate-900 text-white">Closed</option>
        </select>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
          ))
        ) : (
          filteredCases.map((c) => (
            <GlassPanel
              key={c.id}
              interactive
              glow="blue"
              onClick={() => navigate(`/cases/${c.id}`)}
              className="p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    CASE #{c.id}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      statusBadge[c.status] || ''
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors mb-1.5 font-display">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 font-normal">
                  {c.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{c.entity_count} Linked Entities</span>
                </div>

                <div className="flex items-center gap-1 text-slate-200 font-bold">
                  <span>Open Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            </GlassPanel>
          ))
        )}
      </div>
    </div>
  );
};
