import { useState } from "react";
import { BrandVoice, Captions } from "./Views.jsx";

// Settings page — consolidates configuration the user only touches occasionally.
// In Wave 1 it holds Brand Voice (moved here from the main nav) and Captions
// (kept reachable as a fallback while we wait for Wave 2's in-item integration).
//
// Wave 2 plan: Captions moves into the content item modal and disappears from
// this page; Brand Voice becomes structured (registers, vocabulary, principles).
// Wave 3 plan: Team, Series, and Product management land here too.
export function Settings({ brandVoice, setBrandVoice, contentSeries }) {
  const [section, setSection] = useState("brand-voice");

  const SECTIONS = [
    { id: "brand-voice", label: "Brand voice" },
    { id: "captions",    label: "Captions" },
  ];

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-inter text-xl font-bold text-rich-black">Settings</h2>
        <p className="font-arizona text-sm text-rich-black/50 italic mt-0.5">
          The bits you set once and rarely touch again.
        </p>
      </div>

      {/* Sub-section nav */}
      <div className="flex gap-1 mb-6 border-b border-rich-black/8">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className="text-sm px-4 py-2 border-b-2 font-medium font-inter transition-colors"
            style={section === s.id
              ? { borderColor: "#F05881", color: "#F05881" }
              : { borderColor: "transparent", color: "#1A1A1A60" }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "brand-voice" && <BrandVoice voice={brandVoice} setVoice={setBrandVoice} />}
      {section === "captions" && (
        <div>
          <div className="mb-4 px-3 py-2 rounded-lg border border-rich-black/8 bg-bloom">
            <p className="font-arizona text-sm text-rich-black/55 italic leading-relaxed">
              Heads up — soon you'll draft captions inside each content item, with the
              item's campaign and series picked up automatically. This standalone
              tool stays as a quick scratch pad.
            </p>
          </div>
          <Captions brandVoice={brandVoice} contentSeries={contentSeries} />
        </div>
      )}
    </div>
  );
}
