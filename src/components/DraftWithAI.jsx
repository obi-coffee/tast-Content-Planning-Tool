import { useState } from "react";

const EDGE_FN_URL = "https://yfixjafskptbhjsbvxwf.supabase.co/functions/v1/generate-caption";

const TONE_OPTIONS = [
  "On-brand default",
  "More poetic",
  "More direct",
  "Playful",
  "Educational",
  "Hype / launch energy",
];

// ── Draft with AI ─────────────────────────────────────────────────────────
// In-context caption generator. Knows the item's channel, product, series,
// and current draft — so the only thing the user provides is intent
// (a tone) and optional extra context.
//
// Wave 2 step 1: replaces the standalone Captions tab as the primary
// caption-drafting surface. The standalone version still exists in Settings
// as a scratch pad fallback.
//
// Props:
//   item       — the form state (so we know channel, product, series, etc.)
//   brandVoice — current brand voice string (passed via Edge Function)
//   onAccept   — called with the chosen caption text; receiver writes it
//                into the item's draftCopy field
export function DraftWithAI({ item, brandVoice, onAccept }) {
  const [expanded, setExpanded] = useState(false);
  const [extraContext, setExtraContext] = useState("");
  const [tone, setTone] = useState(TONE_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [error, setError] = useState(null);
  const [acceptedIdx, setAcceptedIdx] = useState(null);

  const channel = item.channels?.primary || "Instagram";
  const product = item.product || "";
  const series = item.type || "";

  // What we'll send as "context" to the Edge Function.
  // Priority: explicit extra context > existing draft copy > item title > item notes.
  const buildContext = () => {
    const parts = [];
    if (extraContext.trim()) parts.push(extraContext.trim());
    if (item.title?.trim()) parts.push(`Working title: ${item.title.trim()}`);
    if (!extraContext.trim() && item.draftCopy?.trim()) parts.push(`Existing draft: ${item.draftCopy.trim()}`);
    if (item.notes?.trim()) parts.push(`Notes: ${item.notes.trim().slice(0, 280)}`);
    return parts.join(" — ");
  };

  const generate = async () => {
    const context = buildContext();
    if (!context) {
      setError("Add a title, an existing draft, or some extra context — I need something to riff on.");
      return;
    }
    setLoading(true); setCaptions([]); setError(null); setAcceptedIdx(null);
    try {
      const resp = await fetch(EDGE_FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          context,
          product,
          theme: series || "(no theme)",
          tone,
          brandVoice,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) throw new Error(data.error || `HTTP ${resp.status}`);
      setCaptions(data.captions || []);
    } catch (e) {
      console.error("DraftWithAI error:", e);
      setError(e.message || "Generation failed — check the browser console.");
    }
    setLoading(false);
  };

  const accept = (text, i) => {
    onAccept?.(text);
    setAcceptedIdx(i);
    setTimeout(() => setAcceptedIdx(null), 1500);
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Collapsed: just a small invitation. Keeps the form short until invoked.
  if (!expanded) {
    return (
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-left px-3 py-2.5 rounded-lg border border-dashed transition-all"
          style={{ borderColor: "#F0588140", background: "#FDFCF8" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-inter text-sm font-medium" style={{ color: "#F05881" }}>
                Draft with AI
              </p>
              <p className="font-arizona text-xs text-rich-black/50 italic mt-0.5">
                Generate {channel} captions in your brand voice — uses what's already filled in.
              </p>
            </div>
            <span className="text-xs font-medium" style={{ color: "#F05881" }}>↓</span>
          </div>
        </button>
      </div>
    );
  }

  // Expanded panel
  return (
    <div className="mb-3 rounded-xl border border-rich-black/8 overflow-hidden" style={{ background: "#FDFCF8" }}>
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-rich-black/8" style={{ background: "#FFF0F4" }}>
        <p className="font-inter text-sm font-semibold" style={{ color: "#F05881" }}>Draft with AI</p>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-rich-black/40 hover:text-rich-black/70"
        >
          collapse
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Auto-detected context chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#F0588118", color: "#F05881" }}>
            {channel}
          </span>
          {product && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rich-black/5 text-rich-black/55">
              {product}
            </span>
          )}
          {series && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-rich-black/5 text-rich-black/55">
              {series}
            </span>
          )}
          {!product && !series && (
            <span className="font-arizona text-[11px] italic text-rich-black/40">
              No product or series picked — captions will be more general.
            </span>
          )}
        </div>

        {/* Optional extra context */}
        <div>
          <label className="block font-inter text-[12px] font-medium text-rich-black/55 mb-1.5">
            Extra context <span className="text-rich-black/30">(optional — overrides your draft)</span>
          </label>
          <textarea
            rows={2}
            value={extraContext}
            onChange={e => setExtraContext(e.target.value)}
            placeholder="Anything I should know? An angle, a vibe, what the photo shows…"
            className="w-full border border-rich-black/12 rounded-lg px-3 py-2 text-sm font-body text-rich-black bg-white focus:outline-none focus:ring-2 focus:ring-pink/20 focus:border-pink/40 resize-y min-h-[44px]"
          />
        </div>

        {/* Tone */}
        <div>
          <label className="block font-inter text-[12px] font-medium text-rich-black/55 mb-1.5">Tone</label>
          <select
            value={tone}
            onChange={e => setTone(e.target.value)}
            className="w-full border border-rich-black/12 rounded-lg px-3 py-2 text-sm font-inter text-rich-black bg-white focus:outline-none focus:ring-2 focus:ring-pink/20"
          >
            {TONE_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          style={loading ? {} : { background: "#F05881" }}
          className="w-full text-white py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:bg-rich-black/10 disabled:text-rich-black/30"
        >
          {loading
            ? <span className="inline-flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Generating…</span>
            : captions.length > 0 ? "Generate three more" : "Generate captions"}
        </button>

        {error && (
          <div className="text-xs px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {captions.length > 0 && (
          <div className="space-y-2 pt-1">
            {captions.map((c, i) => (
              <div key={i} className="bg-white rounded-lg border border-rich-black/8 p-3">
                <p className="text-sm text-rich-black/75 leading-relaxed whitespace-pre-wrap">{c}</p>
                <div className="flex gap-2 mt-2.5 items-center">
                  <button
                    type="button"
                    onClick={() => accept(c, i)}
                    className="text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
                    style={acceptedIdx === i
                      ? { background: "#A23053", color: "white" }
                      : { background: "#F05881", color: "white" }}
                  >
                    {acceptedIdx === i ? "✓ Added to draft" : "Use this"}
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(c)}
                    className="text-xs font-medium px-2.5 py-1 rounded-md text-rich-black/55 hover:text-rich-black hover:bg-rich-black/5 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
            <p className="font-arizona text-[11px] italic text-rich-black/40 pt-1">
              "Use this" overwrites the draft below. Copy if you'd rather paste it manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
