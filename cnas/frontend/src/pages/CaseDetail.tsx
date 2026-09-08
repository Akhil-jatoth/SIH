import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Share2,
  ArrowLeft,
  ChevronRight,
  ArrowUpRight,
  Network
} from 'lucide-react';
import { GlassPanel } from '../components/GlassPanel';
import { ExplainabilityTooltip } from '../components/ExplainabilityTooltip';
import { api } from '../services/api';
import { CaseDetail as CaseDetailType, RelatedCase } from '../types';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<CaseDetailType | null>(null);
  const [relatedCases, setRelatedCases] = useState<RelatedCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadCase = async () => {
      try {
        setLoading(true);
        const [detail, related] = await Promise.all([
          api.getCaseDetail(parseInt(id)),
          api.getRelatedCases(parseInt(id)),
        ]);
        setCaseData(detail);
        setRelatedCases(related);
      } catch (err) {
        console.error('Failed to load case details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCase();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-purple-200 text-sm flex items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="font-medium">Loading Case Dossier #{id}...</span>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center text-purple-200">
        <h2 className="text-lg font-bold text-white">Case Dossier Not Found</h2>
        <Link to="/cases" className="text-fuchsia-300 font-bold text-xs mt-2 inline-block">
          Return to All Cases
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/cases')}
            className="inline-flex items-center gap-1.5 text-xs text-purple-200 hover:text-white mb-2 transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Case Files</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3 font-display">
            {caseData.title}
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-white/20 text-purple-100 border border-white/30">
              CASE #{caseData.id} • {caseData.status}
            </span>
          </h1>
          <p className="text-xs text-purple-200 mt-1 font-medium">
            Registered: {caseData.created_at} | Special Operations Intelligence File
          </p>
        </div>

        <button
          onClick={() => {
            const firstEnt = caseData.entities[0]?.id;
            navigate(`/graph${firstEnt ? `?highlight=${firstEnt}` : ''}`);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-xs font-semibold shadow-lg border border-white/30 transition-all cursor-pointer"
        >
          <Network className="w-4 h-4" />
          <span>Explore Linked Graph</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Description Panel */}
      <GlassPanel glow="blue" className="p-6">
        <h3 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-2 font-display">
          Investigation Dossier Summary
        </h3>
        <p className="text-sm text-white leading-relaxed font-normal">
          {caseData.description}
        </p>
      </GlassPanel>

      {/* Grid: Linked Entities (7 cols) & Related Cases (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linked Entities */}
        <div className="lg:col-span-7 space-y-4">
          <GlassPanel glow="green" className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-300" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Associated Entities & Assets ({caseData.entities.length})
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {caseData.entities.map((e) => (
                <div
                  key={e.id}
                  onClick={() => navigate(`/graph?highlight=${e.id}`)}
                  className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-white/30 hover:bg-white/[0.12] transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white group-hover:text-emerald-200">
                      {e.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-400/30">
                      Risk: {e.risk_score}
                    </span>
                  </div>

                  <div className="text-[11px] text-purple-200 uppercase font-mono font-semibold">
                    {e.type}
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Cross-Case Linkages */}
        <div className="lg:col-span-5 space-y-4">
          <GlassPanel glow="amber" className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Cross-Case Linkages ({relatedCases.length})
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {relatedCases.length === 0 ? (
                <p className="text-xs text-purple-200 italic">
                  No direct entity overlaps detected with other open dossiers.
                </p>
              ) : (
                relatedCases.map((rc) => (
                  <div
                    key={rc.case_id}
                    className="p-4 rounded-xl bg-white/[0.06] border border-white/10 hover:border-amber-400/40 transition-all space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {rc.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30">
                        {rc.shared_count} Shared Assets
                      </span>
                    </div>

                    <p className="text-[11px] text-purple-100 leading-relaxed font-normal">
                      {rc.reason}
                    </p>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <ExplainabilityTooltip
                        reason={rc.reason}
                        title={`Linkage Reason: Case #${rc.case_id}`}
                      />

                      <button
                        onClick={() => {
                          const firstShared = rc.shared_entities[0]?.id;
                          navigate(`/graph${firstShared ? `?highlight=${firstShared}` : ''}`);
                        }}
                        className="text-xs text-purple-200 hover:text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Highlight on Graph</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};
