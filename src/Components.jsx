import { useState } from "react";
import { ProductSelector, ProductManager } from "./Products.jsx";
import { Avatar, AssigneeSelector } from "./components/Avatar.jsx";
import { CONTENT_TEMPLATES } from "./lib/templates.js";

export const PIPELINE_STAGES = ["Idea", "In Campaign", "In Production", "Ready", "Published"];
export const CHANNEL_OPTIONS = ["Instagram", "Email", "Website", "Instagram Reels", "LinkedIn"];

// ── 13 content themes from the Instagram plan ─────────────────────────────
export const TYPE_OPTIONS = [
  "The Build",
  "The Problem",
  "Roaster Love",
  "Coffee Life",
  "Taste Story",
  "Waitlist",
  "Trade Show",
  "Beta Launch",
  "Community",
  "Launch",
  "Vol. 3 Tease",
  "Vol. 3 Reveal",
  "Vol. 3 Drop",
];

// Strategic intent: maps each theme to 70/20/10 bucket
// culture = 70%, brand = 20%, conversion = 10%
export const INTENT_BUCKET = {
  "The Build":      "brand",
  "The Problem":    "culture",
  "Roaster Love":   "culture",
  "Coffee Life":    "culture",
  "Taste Story":    "culture",
  "Waitlist":       "conversion",
  "Trade Show":     "brand",
  "Beta Launch":    "conversion",
  "Community":      "culture",
  "Launch":         "conversion",
  "Vol. 3 Tease":   "brand",
  "Vol. 3 Reveal":  "brand",
  "Vol. 3 Drop":    "conversion",
};

export const INTENT_META = {
  culture:    { label: "Culture & Community", target: 70, color: "#F05881" },
  brand:      { label: "Product & Brand",     target: 20, color: "#a12f52" },
  conversion: { label: "Direct Conversion",   target: 10, color: "#ef4056" },
};

// Post format options from the plan
export const FORMAT_OPTIONS = [
  "Single Photo",
  "Carousel",
  "Graphic / Text",
  "Story",
  "Repost / UGC",
];

// Phases from the 36-week plan
export const PHASES = [
  { id: "p1", name: "Phase 1 — Foundation", subtitle: "Build the Foundation + Begin the Tease", start: "2026-02-23", end: "2026-04-13", followerTarget: 6500,  color: "#fa8f9c" },
  { id: "p2", name: "Phase 2 — Drop",       subtitle: "Partner Reveals, the Drop, and App Heat",  start: "2026-04-20", end: "2026-06-29", followerTarget: 10000, color: "#F05881" },
  { id: "p3", name: "Phase 3 — Beta",       subtitle: "Beta & Momentum",                          start: "2026-07-06", end: "2026-09-28", followerTarget: 15500, color: "#ef4056" },
  { id: "p4", name: "Phase 4 — Launch",     subtitle: "Public Launch",                            start: "2026-10-05", end: "2026-10-26", followerTarget: 24000, color: "#a12f52" },
];

export function getPhaseForDate(dateStr) {
  if (!dateStr) return null;
  return PHASES.find(p => dateStr >= p.start && dateStr <= p.end) || null;
}

export const STAGE_META = {
  "Idea":          { color: "#a8a29e", light: "#f5f5f4" },
  "In Campaign":   { color: "#fa8f9c", light: "#fff0f4" },
  "In Production": { color: "#F05881", light: "#fff0f4" },
  "Ready":         { color: "#ef4056", light: "#fff0f4" },
  "Published":     { color: "#a12f52", light: "#fdf0f4" },
};

// Theme tag colors — Vol. 3 gets distinct purple-ish tones to stand out
export const TYPE_COLORS = {
  "The Build":      "bg-stone-100 text-stone-600",
  "The Problem":    "bg-[#fa8f9c]/20 text-[#a12f52]",
  "Roaster Love":   "bg-[#F05881]/15 text-[#a12f52]",
  "Coffee Life":    "bg-[#fa8f9c]/25 text-[#a12f52]",
  "Taste Story":    "bg-[#F05881]/20 text-[#a12f52]",
  "Waitlist":       "bg-[#ef4056]/15 text-[#a12f52]",
  "Trade Show":     "bg-stone-200 text-stone-600",
  "Beta Launch":    "bg-[#ef4056]/20 text-[#ef4056]",
  "Community":      "bg-[#F05881]/10 text-[#a12f52]",
  "Launch":         "bg-[#a12f52]/20 text-[#a12f52]",
  "Vol. 3 Tease":   "bg-violet-100 text-violet-700",
  "Vol. 3 Reveal":  "bg-violet-200 text-violet-800",
  "Vol. 3 Drop":    "bg-violet-300 text-violet-900",
};

export const defaultBrandVoice = `TONE
Warm, knowledgeable, and quietly confident. We don't preach — we invite. Think of a well-traveled friend who knows everything about coffee and shares generously, without gatekeeping.

VOCABULARY
Use: craft, process, terroir, fermentation, origin, experimental, transparent, intentional
Avoid: "premium," "luxury," overused clichés like "bean juice"

CONTENT PILLARS
1. The Process — fermentation, processing methods, sourcing
2. The People — farmers, roasters, the tāst community
3. The Ritual — brewing at home, sensory experience
4. The Drop — product launches, limited releases

WRITING SAMPLES
"We spent three years chasing this fermentation profile. Not because we had to — because we couldn't stop thinking about it."
"Every bag tells a story that started long before the roast. We're just the last chapter."
"Specialty coffee isn't about exclusivity. It's about paying attention."`;

export function driveThumb(url) {
  if (!url) return null;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`;
  const m2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w400`;
  return url;
}

export function Tag({ label, colorClass, style }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass||""}`} style={style}>{label}</span>;
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 md:p-4">
      <div className="bg-white w-full md:rounded-2xl md:max-w-lg rounded-t-2xl shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800 text-lg">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl w-10 h-10 flex items-center justify-center">✕</button>
        </div>
        <div className="p-5 pb-8">{children}</div>
      </div>
    </div>
  );
}

export function Inp({ label, ...p }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>}
      <input className="w-full border border-stone-200 rounded-lg px-3 py-3 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05881]/40" {...p} />
    </div>
  );
}

export function Sel({ label, options, ...p }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>}
      <select className="w-full border border-stone-200 rounded-lg px-3 py-3 md:py-2 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-[#F05881]/40" {...p}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function Txt({ label, rows=4, ...p }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>}
      <textarea rows={rows} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05881]/40 resize-y min-h-[60px]" {...p} />
    </div>
  );
}

// ── Channel Picker: primary + secondary ───────────────────────────────────
// Data shape: { primary: "Instagram", secondary: ["Email"] }
// Legacy shape (array) is supported transparently.

export function normalizeChannels(raw) {
  if (!raw) return { primary: "", secondary: [] };
  if (Array.isArray(raw)) {
    // migrate legacy array — first item becomes primary
    return { primary: raw[0] || "", secondary: raw.slice(1) };
  }
  if (typeof raw === "object" && "primary" in raw) return raw;
  return { primary: "", secondary: [] };
}

export function flattenChannels(ch) {
  // Returns a plain array for display/filter compatibility
  const n = normalizeChannels(ch);
  return n.primary ? [n.primary, ...n.secondary] : n.secondary;
}

export function ChannelPicker({ selected={}, onChange }) {
  const norm = normalizeChannels(selected);

  const setPrimary = (ch) => {
    const secondary = norm.secondary.filter(s => s !== ch);
    onChange({ primary: ch, secondary });
  };

  const toggleSecondary = (ch) => {
    if (ch === norm.primary) return; // can't also be secondary
    const already = norm.secondary.includes(ch);
    onChange({
      primary: norm.primary,
      secondary: already ? norm.secondary.filter(s => s !== ch) : [...norm.secondary, ch],
    });
  };

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-stone-600 mb-2">Channels</label>

      {/* Primary */}
      <div className="mb-2">
        <p className="text-xs text-stone-400 mb-1.5 uppercase tracking-wider font-medium">Primary</p>
        <div className="flex flex-wrap gap-2">
          {CHANNEL_OPTIONS.map(ch => {
            const active = norm.primary === ch;
            return (
              <button key={ch} type="button" onClick={() => setPrimary(ch)}
                className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all flex items-center gap-1"
                style={active
                  ? { background: "#F05881", color: "white", borderColor: "#F05881" }
                  : { background: "white", color: "#78716c", borderColor: "#e7e5e4" }}>
                {active && <span className="text-xs">★</span>}
                {ch}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary */}
      {norm.primary && (
        <div>
          <p className="text-xs text-stone-400 mb-1.5 uppercase tracking-wider font-medium">Also publishing to</p>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.filter(ch => ch !== norm.primary).map(ch => {
              const active = norm.secondary.includes(ch);
              return (
                <button key={ch} type="button" onClick={() => toggleSecondary(ch)}
                  className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
                  style={active
                    ? { background: "#fa8f9c22", color: "#a12f52", borderColor: "#fa8f9c" }
                    : { background: "white", color: "#a8a29e", borderColor: "#e7e5e4" }}>
                  {ch}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary badge */}
      {norm.primary && (
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#fff0f4", color: "#F05881" }}>
            ★ {norm.primary}
          </span>
          {norm.secondary.map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full text-stone-500 bg-stone-100">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function StagePicker({ value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-stone-600 mb-2">Pipeline Stage</label>
      <div className="flex flex-wrap gap-2">
        {PIPELINE_STAGES.map(s => {
          const active = value===s;
          return (
            <button key={s} type="button" onClick={()=>onChange(s)}
              className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
              style={active?{background:STAGE_META[s].color,color:"white",borderColor:STAGE_META[s].color}:{background:"white",color:"#78716c",borderColor:"#e7e5e4"}}>
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Format Picker ──────────────────────────────────────────────────────────
const FORMAT_ICONS = {
  "Single Photo":   "◻",
  "Carousel":       "⧉",
  "Graphic / Text": "T",
  "Story":          "◎",
  "Repost / UGC":   "↺",
};

export function FormatPicker({ value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-stone-600 mb-2">Post Format</label>
      <div className="flex flex-wrap gap-2">
        {FORMAT_OPTIONS.map(f => {
          const active = value === f;
          return (
            <button key={f} type="button" onClick={() => onChange(f)}
              className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all flex items-center gap-1.5"
              style={active
                ? { background: "#F05881", color: "white", borderColor: "#F05881" }
                : { background: "white", color: "#78716c", borderColor: "#e7e5e4" }}>
              <span>{FORMAT_ICONS[f]}</span>
              {f}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Phase Tag (read-only display) ──────────────────────────────────────────
export function PhaseTag({ dateStr, className = "" }) {
  const phase = getPhaseForDate(dateStr);
  if (!phase) return null;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}
      style={{ background: phase.color + "22", color: phase.color }}>
      {phase.name}
    </span>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────
export function EmptyState({ icon = "~", title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-2xl text-stone-300 mb-4">{icon}</div>
      <p className="text-sm font-semibold text-stone-500 mb-1">{title}</p>
      {description && <p className="text-xs text-stone-400 max-w-xs mb-4">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} style={{ background: "#F05881" }}
          className="text-sm text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ── Comment Badge ─────────────────────────────────────────────────────────
export function CommentBadge({ count, onClick }) {
  if (!count) return null;
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full transition-colors hover:bg-[#F05881]/10"
      style={{ color: "#F05881" }}
      title={`${count} comment${count !== 1 ? 's' : ''}`}
    >
      <span style={{ fontSize: 10 }}>💬</span>
      <span className="font-medium">{count}</span>
    </button>
  );
}

// ── Collapsible Form Section ──────────────────────────────────────────────
export function FormSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full py-2 text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-stone-600 transition-colors"
      >
        {title}
        <span className="text-sm transition-transform" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          ▾
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ── Template Picker ───────────────────────────────────────────────────────
export function TemplatePicker({ onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = CONTENT_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Quick-create from template</p>
        <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-600">Cancel</button>
      </div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search templates..."
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05881]/40 mb-3"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        {filtered.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="text-left bg-white border border-stone-100 rounded-xl p-3 hover:border-[#fa8f9c] transition-colors"
          >
            <p className="text-sm font-medium text-stone-800">{t.name}</p>
            <p className="text-xs text-stone-400 mt-0.5">{t.description}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#F0588118", color: "#F05881" }}>{t.type}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">{t.format}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">{t.channels.primary}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-xs text-stone-400 col-span-2 text-center py-4">No templates match your search</p>}
      </div>
    </div>
  );
}

export function CampaignProgress({ items }) {
  const total = items.length;
  if (!total) return <p className="text-xs text-stone-300 mb-4">No content yet.</p>;
  return (
    <div className="mb-4">
      <div className="flex rounded-full overflow-hidden h-2 mb-2">
        {PIPELINE_STAGES.map(s => {
          const count = items.filter(i=>i.stage===s).length;
          const pct = (count/total)*100;
          if (!pct) return null;
          return <div key={s} style={{width:`${pct}%`,background:STAGE_META[s].color}} title={`${s}: ${count}`} />;
        })}
      </div>
      <div className="flex gap-3 flex-wrap">
        {PIPELINE_STAGES.map(s => {
          const count = items.filter(i=>i.stage===s).length;
          if (!count) return null;
          return (
            <span key={s} className="text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{background:STAGE_META[s].color}} />
              <span style={{color:STAGE_META[s].color}}>{count} {s}</span>
            </span>
          );
        })}
        <span className="text-xs text-stone-400 ml-auto">{total} total</span>
      </div>
    </div>
  );
}

export function ContentForm({ initial, campaigns, onSave, onDelete, onClose, lockCampaignId, products=[], setProducts=()=>{}, onOpenComments, currentMember }) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [form, setForm] = useState(() => {
    const base = {
      title:"", type:TYPE_OPTIONS[0],
      channels: { primary: "Instagram", secondary: [] },
      format: FORMAT_OPTIONS[0],
      stage:"Idea", campaignId:"", date:"", notes:"", product:"",
      draftCopy:"", driveUrl:"", driveUrls:[], owner:"", assigneeId:"", seq:0,
      metrics: { likes: "", comments: "", saves: "", shares: "" },
      emailSubject:"", emailPreview:"", emailBody:"", emailCta:"",
    };
    if (!initial) return base;
    const channels = normalizeChannels(initial.channels);
    const driveUrls = initial.driveUrls?.length
      ? initial.driveUrls
      : initial.driveUrl ? [initial.driveUrl] : [];
    return { ...base, ...initial, channels, driveUrls, metrics: initial.metrics || base.metrics };
  });

  const [showProductManager, setShowProductManager] = useState(false);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const applyTemplate = (tpl) => {
    setForm(p => ({
      ...p,
      type: tpl.type,
      format: tpl.format,
      channels: tpl.channels,
      stage: tpl.stage,
      notes: tpl.notes || p.notes,
    }));
    setShowTemplates(false);
  };

  const isInstagramPrimary = normalizeChannels(form.channels).primary === "Instagram";
  const isEmailPrimary = normalizeChannels(form.channels).primary === "Email";

  // Drive URL helpers
  const addDriveUrl = () => f("driveUrls", [...(form.driveUrls||[]), ""]);
  const updateDriveUrl = (i, val) => {
    const arr = [...(form.driveUrls||[])];
    arr[i] = val;
    f("driveUrls", arr);
  };
  const removeDriveUrl = (i) => f("driveUrls", (form.driveUrls||[]).filter((_,idx)=>idx!==i));
  const moveDriveUrl = (i, dir) => {
    const arr = [...(form.driveUrls||[])];
    const to = i + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[i], arr[to]] = [arr[to], arr[i]];
    f("driveUrls", arr);
  };

  const save = () => {
    if (!form.title.trim()) return;
    const driveUrls = (form.driveUrls||[]).filter(u=>u.trim());
    onSave({ ...form, driveUrls, driveUrl: driveUrls[0] || "" });
    onClose();
  };

  const linkedCampaign = campaigns.find(c=>String(c.id)===String(form.campaignId));

  return (
    <>
      {/* Template picker for new content */}
      {!initial?.id && !showTemplates && (
        <button onClick={() => setShowTemplates(true)}
          className="w-full mb-4 text-xs font-medium px-3 py-2 rounded-lg border border-dashed border-[#F05881]/40 text-[#F05881] hover:bg-[#F05881]/5 transition-colors">
          Use a template for quick setup
        </button>
      )}
      {showTemplates && <TemplatePicker onSelect={applyTemplate} onClose={() => setShowTemplates(false)} />}

      {/* ── Details Section ── */}
      <FormSection title="Details" defaultOpen={true}>
        <Inp label="Title" value={form.title} onChange={e=>f("title",e.target.value)} placeholder="Content title" />
        <ProductSelector value={form.product} onChange={v=>f("product",v)} products={products} onManage={()=>setShowProductManager(true)} />
        {showProductManager && <ProductManager products={products} setProducts={setProducts} onClose={()=>setShowProductManager(false)} />}
        <Sel label="Content type / theme" options={TYPE_OPTIONS} value={form.type} onChange={e=>f("type",e.target.value)} />

        {form.type && INTENT_BUCKET[form.type] && (() => {
          const bucket = INTENT_BUCKET[form.type];
          const meta = INTENT_META[bucket];
          return (
            <div className="mb-3 -mt-1 flex items-center gap-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: meta.color + "18", color: meta.color }}>
                {meta.label}
              </span>
              <span className="text-xs text-stone-300">{bucket === "culture" ? "70%" : bucket === "brand" ? "20%" : "10%"} bucket</span>
            </div>
          );
        })()}

        <FormatPicker value={form.format||FORMAT_OPTIONS[0]} onChange={v=>f("format",v)} />
        <ChannelPicker selected={form.channels} onChange={v=>f("channels",v)} />
      </FormSection>

      {/* ── Scheduling Section ── */}
      <FormSection title="Scheduling & Assignment" defaultOpen={true}>
        <StagePicker value={form.stage} onChange={v=>f("stage",v)} />
        {!lockCampaignId && campaigns.length>0 && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-stone-600 mb-1">Link to Campaign</label>
            <select value={form.campaignId} onChange={e=>f("campaignId",e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-[#F05881]/40">
              <option value="">No campaign</option>
              {campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        {linkedCampaign?.keyMessage && (
          <div className="mb-3 p-3 rounded-lg border text-xs" style={{background:"#fff0f4",borderColor:"#fa8f9c"}}>
            <p className="font-semibold mb-1" style={{color:"#F05881"}}>↗ {linkedCampaign.name}</p>
            <p className="text-stone-600">{linkedCampaign.keyMessage}</p>
          </div>
        )}
        <Inp label="Scheduled date" type="date" value={form.date} onChange={e=>f("date",e.target.value)} />
        {form.date && (() => {
          const phase = getPhaseForDate(form.date);
          return phase ? (
            <div className="mb-3 -mt-1">
              <PhaseTag dateStr={form.date} />
            </div>
          ) : null;
        })()}
        <div className="mb-3">
          <AssigneeSelector value={form.assigneeId||null} onChange={v=>f("assigneeId",v)} label="Assign to" />
        </div>
      </FormSection>

      {/* ── Copy & Notes Section (email-aware) ── */}
      {isEmailPrimary ? (
        <FormSection key="email-content" title="Email Content" defaultOpen={true}>
          <Inp label="Subject line" value={form.emailSubject} onChange={e=>f("emailSubject",e.target.value)} placeholder="e.g. The story behind our newest roast" />
          <Inp label="Preview text" value={form.emailPreview} onChange={e=>f("emailPreview",e.target.value)} placeholder="Text shown in inbox before opening..." />
          <Txt label="Body" rows={6} value={form.emailBody} onChange={e=>f("emailBody",e.target.value)} placeholder="Write or paste your email body copy here..." />
          <Inp label="Call to action" value={form.emailCta} onChange={e=>f("emailCta",e.target.value)} placeholder="e.g. Shop the drop, Join the waitlist" />
          <Txt label="Notes" value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="Production notes, links, angles..." />
        </FormSection>
      ) : (
        <FormSection key="copy-notes" title="Copy & Notes" defaultOpen={true}>
          <Txt label="Draft copy / caption" rows={3} value={form.draftCopy} onChange={e=>f("draftCopy",e.target.value)} placeholder="Paste your draft caption or copy here..." />
          <Txt label="Notes" value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="Production notes, links, angles..." />
        </FormSection>
      )}

      {/* ── Media Section ── */}
      <FormSection title="Media" defaultOpen={!!initial?.driveUrl || !!(initial?.driveUrls?.length)}>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-stone-600">
              {isInstagramPrimary ? "Photos / Carousel" : "Google Drive image"}
            </label>
            {isInstagramPrimary && (
              <span className="text-xs text-stone-400">{(form.driveUrls||[]).filter(u=>u).length} image{(form.driveUrls||[]).filter(u=>u).length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {isInstagramPrimary ? (
            <div>
              {(form.driveUrls||[]).map((url, i) => (
                <div key={i} className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-stone-400 w-5">#{i+1}</span>
                    <input
                      value={url}
                      onChange={e => updateDriveUrl(i, e.target.value)}
                      placeholder="Paste Drive share link"
                      className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05881]/40"
                    />
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={()=>moveDriveUrl(i,-1)} disabled={i===0}
                        className="text-stone-300 hover:text-stone-500 disabled:opacity-30 text-sm px-1">↑</button>
                      <button type="button" onClick={()=>moveDriveUrl(i,1)} disabled={i===(form.driveUrls||[]).length-1}
                        className="text-stone-300 hover:text-stone-500 disabled:opacity-30 text-sm px-1">↓</button>
                      <button type="button" onClick={()=>removeDriveUrl(i)}
                        className="text-stone-300 hover:text-red-400 text-sm px-1">✕</button>
                    </div>
                  </div>
                  {url && (
                    <img src={driveThumb(url)} alt={`preview ${i+1}`}
                      className="ml-7 w-24 h-24 rounded-lg object-cover border border-stone-100"
                      onError={e=>e.target.style.display="none"} />
                  )}
                </div>
              ))}
              <button type="button" onClick={addDriveUrl}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-stone-300 text-stone-400 hover:border-[#F05881] hover:text-[#F05881] transition-colors w-full mt-1">
                + Add image
              </button>
              {(form.driveUrls||[]).length > 1 && (
                <p className="text-xs text-stone-300 mt-1">First image is the cover. Reorder with ↑↓.</p>
              )}
            </div>
          ) : (
            <div>
              <input value={(form.driveUrls||[])[0]||form.driveUrl||""} onChange={e=>{f("driveUrls",[e.target.value]);f("driveUrl",e.target.value);}}
                placeholder="Paste Drive share link"
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05881]/40" />
              {((form.driveUrls||[])[0]||form.driveUrl) && (
                <img src={driveThumb((form.driveUrls||[])[0]||form.driveUrl)} alt="preview"
                  className="mt-2 w-full rounded-lg object-cover" style={{maxHeight:160}} onError={e=>e.target.style.display="none"} />
              )}
            </div>
          )}
          <p className="text-xs text-stone-300 mt-1">Files must be "Anyone with the link can view"</p>
        </div>
      </FormSection>

      {/* ── Performance Metrics (Published only) ── */}
      {form.stage === "Published" && (
        <FormSection title="Performance Metrics" defaultOpen={false}>
          <p className="text-xs text-stone-400 mb-3">Track engagement on published content.</p>
          <div className="grid grid-cols-2 gap-3">
            <Inp label="Likes" type="number" value={form.metrics?.likes || ""} onChange={e => f("metrics", { ...form.metrics, likes: e.target.value })} placeholder="0" />
            <Inp label="Comments" type="number" value={form.metrics?.comments || ""} onChange={e => f("metrics", { ...form.metrics, comments: e.target.value })} placeholder="0" />
            <Inp label="Saves" type="number" value={form.metrics?.saves || ""} onChange={e => f("metrics", { ...form.metrics, saves: e.target.value })} placeholder="0" />
            <Inp label="Shares" type="number" value={form.metrics?.shares || ""} onChange={e => f("metrics", { ...form.metrics, shares: e.target.value })} placeholder="0" />
          </div>
        </FormSection>
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={save} style={{background:"#F05881"}} className="flex-1 hover:opacity-90 text-white py-2 rounded-lg font-medium text-sm">Save</button>
        {initial?.id && onOpenComments && (
          <button onClick={()=>{onClose();onOpenComments(initial.id);}}
            className="px-4 py-2 text-sm font-medium border border-stone-200 rounded-lg text-stone-500 hover:border-[#F05881] hover:text-[#F05881] transition-colors flex items-center gap-1.5">
            <span>💬</span>
            <span>Comments</span>
          </button>
        )}
        {onDelete && <button onClick={()=>{onDelete();onClose();}} className="px-4 py-2 text-sm text-red-400 hover:text-red-600">Delete</button>}
      </div>
    </>
  );
}