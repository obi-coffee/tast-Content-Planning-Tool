import { useMemo } from "react";
import { PIPELINE_STAGES, STAGE_META, CHANNEL_OPTIONS, TYPE_OPTIONS, flattenChannels } from "./Components.jsx";
import { Avatar } from "./components/Avatar.jsx";
import { TEAM_MEMBERS } from "./lib/team.js";

const PINK = "#F05881";
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Small stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "#1a1a1a", accent }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex flex-col gap-1">
      <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold leading-none" style={{ color: color }}>{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      {accent && <div className="mt-2 h-1 rounded-full" style={{ background: accent, width: "40%" }} />}
    </div>
  );
}

// ── Horizontal bar ─────────────────────────────────────────────────────────
function Bar({ label, value, max, color, count }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 mb-2">
      <p className="text-xs text-stone-600 w-28 shrink-0 truncate">{label}</p>
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color || PINK }} />
      </div>
      <p className="text-xs text-stone-400 w-6 text-right">{count}</p>
    </div>
  );
}

// ── Mini sparkline (SVG) ───────────────────────────────────────────────────
function Sparkline({ data, color = PINK, height = 36, width = 120 }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={i * step} cy={height - ((v - min) / range) * (height - 6) - 3}
          r="3" fill={color} />
      ))}
    </svg>
  );
}

// ── Calendar heatmap (last 12 weeks) ──────────────────────────────────────
function PostingHeatmap({ items }) {
  const today = new Date();
  const weeks = 12;
  const totalDays = weeks * 7;

  const dayCounts = useMemo(() => {
    const map = {};
    items.forEach(item => {
      if (item.date && item.stage === "Published") {
        map[item.date] = (map[item.date] || 0) + 1;
      }
    });
    return map;
  }, [items]);

  const days = useMemo(() => {
    const result = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      result.push({ key, count: dayCounts[key] || 0, d });
    }
    return result;
  }, [dayCounts]);

  const maxCount = Math.max(...days.map(d => d.count), 1);

  // Split into week columns
  const weekCols = [];
  for (let w = 0; w < weeks; w++) weekCols.push(days.slice(w * 7, (w + 1) * 7));

  return (
    <div>
      <div className="flex gap-1">
        {weekCols.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => {
              const intensity = day.count === 0 ? 0 : 0.2 + (day.count / maxCount) * 0.8;
              return (
                <div
                  key={day.key}
                  title={`${day.key}: ${day.count} published`}
                  className="w-3 h-3 rounded-sm"
                  style={{ background: day.count === 0 ? "#f0ede9" : `rgba(240,88,129,${intensity})` }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-stone-300">Less</span>
        {[0.15, 0.35, 0.55, 0.75, 0.95].map(o => (
          <div key={o} className="w-3 h-3 rounded-sm" style={{ background: `rgba(240,88,129,${o})` }} />
        ))}
        <span className="text-xs text-stone-300">More</span>
      </div>
    </div>
  );
}

// ── Cadence chart: posts per month ────────────────────────────────────────
function CadenceChart({ items }) {
  const today = new Date();
  const months = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      result.push({ label: MONTH_NAMES[d.getMonth()], key });
    }
    return result;
  }, []);

  const counts = useMemo(() => {
    return months.map(m => ({
      ...m,
      count: items.filter(i => i.date && i.date.startsWith(m.key)).length,
      published: items.filter(i => i.date && i.date.startsWith(m.key) && i.stage === "Published").length,
    }));
  }, [items, months]);

  const max = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="flex items-end gap-2 h-24">
      {counts.map((m) => (
        <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col justify-end gap-px" style={{ height: 72 }}>
            {/* Published portion */}
            <div className="w-full rounded-t-sm transition-all"
              style={{ height: `${(m.published / max) * 100}%`, background: PINK, minHeight: m.published > 0 ? 4 : 0 }} />
            {/* Planned portion */}
            <div className="w-full rounded-t-sm transition-all"
              style={{ height: `${((m.count - m.published) / max) * 100}%`, background: PINK + "33", minHeight: (m.count - m.published) > 0 ? 4 : 0 }} />
          </div>
          <p className="text-xs text-stone-400">{m.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Gap detector ───────────────────────────────────────────────────────────
function GapDetector({ items }) {
  const today = new Date();

  const gaps = useMemo(() => {
    const issues = [];

    // Overdue: scheduled in the past, not published
    const overdue = items.filter(i => {
      if (!i.date || i.stage === "Published") return false;
      return new Date(i.date + "T00:00:00") < today;
    });
    if (overdue.length > 0) {
      issues.push({
        type: "overdue",
        label: "Overdue posts",
        detail: `${overdue.length} item${overdue.length > 1 ? "s" : ""} past their scheduled date`,
        items: overdue,
        severity: "high",
      });
    }

    // Stale: in Production or Ready for >7 days without a date
    const stale = items.filter(i =>
      ["In Production", "Ready"].includes(i.stage) && !i.date
    );
    if (stale.length > 0) {
      issues.push({
        type: "stale",
        label: "Ready but unscheduled",
        detail: `${stale.length} item${stale.length > 1 ? "s" : ""} in Production/Ready with no publish date`,
        items: stale,
        severity: "medium",
      });
    }

    // Upcoming gaps: check next 14 days for empty stretches > 4 days
    let longestGap = 0, gapStart = null, currentGap = 0;
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const hasPosts = items.some(item => item.date === key);
      if (hasPosts) {
        currentGap = 0;
      } else {
        currentGap++;
        if (currentGap > longestGap) {
          longestGap = currentGap;
          if (!gapStart) gapStart = i - currentGap + 1;
        }
      }
    }
    if (longestGap > 4) {
      issues.push({
        type: "gap",
        label: "Posting gap ahead",
        detail: `${longestGap}-day gap with no scheduled content in the next 2 weeks`,
        items: [],
        severity: "medium",
      });
    }

    // No Instagram content
    const igItems = items.filter(i => flattenChannels(i.channels).includes("Instagram"));
    if (igItems.length === 0) {
      issues.push({ type: "channel", label: "No Instagram content", detail: "No posts tagged for Instagram", items: [], severity: "low" });
    }

    if (issues.length === 0) {
      issues.push({ type: "ok", label: "Pipeline looks healthy", detail: "No gaps or overdue items detected", items: [], severity: "ok" });
    }

    return issues;
  }, [items]);

  const severityStyle = (s) => ({
    high:   { bg: "#fff0f0", border: "#fca5a5", dot: "#ef4444", label: "bg-red-100 text-red-600" },
    medium: { bg: "#fffbeb", border: "#fcd34d", dot: "#f59e0b", label: "bg-yellow-100 text-yellow-700" },
    low:    { bg: "#f0f9ff", border: "#93c5fd", dot: "#3b82f6", label: "bg-blue-100 text-blue-600" },
    ok:     { bg: "#f0fdf4", border: "#86efac", dot: "#22c55e", label: "bg-green-100 text-green-600" },
  }[s]);

  return (
    <div className="space-y-2">
      {gaps.map((g, i) => {
        const s = severityStyle(g.severity);
        return (
          <div key={i} className="rounded-xl border px-4 py-3 flex items-start gap-3"
            style={{ background: s.bg, borderColor: s.border }}>
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: s.dot }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800">{g.label}</p>
              <p className="text-xs text-stone-500 mt-0.5">{g.detail}</p>
              {g.items.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {g.items.slice(0, 4).map(item => (
                    <span key={item.id} className="text-xs px-2 py-0.5 rounded-full bg-white/70 text-stone-600 border border-stone-200">
                      {item.title}
                    </span>
                  ))}
                  {g.items.length > 4 && <span className="text-xs text-stone-400">+{g.items.length - 4} more</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Analytics View ────────────────────────────────────────────────────
export function Analytics({ items, campaigns }) {
  const today = new Date();
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}`;

  // Core stats
  const totalItems = items.length;
  const published  = items.filter(i => i.stage === "Published").length;
  const inFlight   = items.filter(i => ["In Production","Ready","In Campaign"].includes(i.stage)).length;
  const thisMonthCount = items.filter(i => i.date && i.date.startsWith(thisMonth)).length;
  const publishedPct = totalItems > 0 ? Math.round((published / totalItems) * 100) : 0;

  // By stage
  const byCh = useMemo(() => CHANNEL_OPTIONS.map(ch => ({
    label: ch,
    count: items.filter(i => flattenChannels(i.channels).includes(ch)).length,
  })), [items]);
  const maxCh = Math.max(...byCh.map(c => c.count), 1);

  // By type
  const byType = useMemo(() => TYPE_OPTIONS.map(t => ({
    label: t,
    count: items.filter(i => i.type === t).length,
  })).filter(t => t.count > 0).sort((a,b) => b.count - a.count), [items]);
  const maxType = Math.max(...byType.map(t => t.count), 1);

  // By team member
  const byMember = useMemo(() => TEAM_MEMBERS.map(m => ({
    member: m,
    count: items.filter(i => i.assigneeId === m.id).length,
    published: items.filter(i => i.assigneeId === m.id && i.stage === "Published").length,
  })).filter(m => m.count > 0), [items]);

  // Cadence sparkline (last 6 months)
  const sparkData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      return items.filter(item => item.date && item.date.startsWith(key)).length;
    });
  }, [items]);

  // Campaign health
  const campaignStats = useMemo(() => campaigns.map(c => {
    const linked = items.filter(i => String(i.campaignId) === String(c.id));
    const pub = linked.filter(i => i.stage === "Published").length;
    return { ...c, total: linked.length, published: pub };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total), [items, campaigns]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">Analytics</h2>
          <p className="text-xs text-stone-400 mt-0.5">Pipeline health · posting cadence · gaps</p>
        </div>
      </div>

      {/* ── Top stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total content" value={totalItems} sub="across all channels" accent={PINK} />
        <StatCard label="Published" value={published} sub={`${publishedPct}% of total`} color={PINK} accent={PINK} />
        <StatCard label="In flight" value={inFlight} sub="production + ready" accent="#ef4056" />
        <StatCard label="This month" value={thisMonthCount} sub="scheduled or published" accent="#fa8f9c" />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* ── Cadence ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-stone-800">Monthly cadence</p>
              <p className="text-xs text-stone-400">Last 6 months</p>
            </div>
            <Sparkline data={sparkData} width={80} height={28} />
          </div>
          <CadenceChart items={items} />
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: PINK }} /><span className="text-xs text-stone-400">Published</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: PINK + "33" }} /><span className="text-xs text-stone-400">Planned</span></div>
          </div>
        </div>

        {/* ── Gap detector ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-stone-800 mb-1">Pipeline health</p>
          <p className="text-xs text-stone-400 mb-3">Overdue, stale, and gaps</p>
          <GapDetector items={items} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* ── By channel ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-stone-800 mb-3">By channel</p>
          {byCh.map(ch => (
            <Bar key={ch.label} label={ch.label} value={ch.count} max={maxCh} count={ch.count}
              color={ch.label === "Instagram" ? PINK : ch.label === "Email" ? "#a12f52" : ch.label === "TikTok" ? "#ef4056" : "#fa8f9c"} />
          ))}
        </div>

        {/* ── By type ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-stone-800 mb-3">By content type</p>
          {byType.length === 0
            ? <p className="text-xs text-stone-300">No content yet</p>
            : byType.map(t => <Bar key={t.label} label={t.label} value={t.count} max={maxType} count={t.count} />)}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* ── Posting heatmap ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-stone-800 mb-1">Publishing heatmap</p>
          <p className="text-xs text-stone-400 mb-3">Published posts · last 12 weeks</p>
          <PostingHeatmap items={items} />
        </div>

        {/* ── Team workload ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-stone-800 mb-3">Team workload</p>
          {byMember.length === 0
            ? <p className="text-xs text-stone-300">No items assigned yet</p>
            : byMember.map(({ member: m, count, published: pub }) => (
              <div key={m.id} className="flex items-center gap-3 mb-3">
                <Avatar memberId={m.id} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-stone-700">{m.name}</p>
                    <p className="text-xs text-stone-400">{pub}/{count} published</p>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / (items.length || 1)) * 100}%`, background: m.color }} />
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Campaign health ── */}
      {campaignStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-stone-800 mb-3">Campaign health</p>
          <div className="space-y-3">
            {campaignStats.map(c => {
              const pct = c.total > 0 ? (c.published / c.total) * 100 : 0;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-stone-700 truncate">{c.name}</p>
                      <p className="text-xs text-stone-400 shrink-0 ml-2">{c.published}/{c.total} posts</p>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PINK }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold w-10 text-right" style={{ color: PINK }}>{Math.round(pct)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
