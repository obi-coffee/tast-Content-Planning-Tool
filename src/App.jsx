import { useState, useEffect } from "react";
import { defaultBrandVoice } from "./Components.jsx";
import { Pipeline, Calendar, BrandVoice, Captions } from "./Views.jsx";
import { Campaigns } from "./Campaigns.jsx";

const TABS = ["Pipeline", "Calendar", "Campaigns", "Brand Voice", "Captions"];

// localStorage helpers (replaces window.storage from Claude.ai)
const store = {
  get: (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export default function App() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState(() => store.get("tast_items") || []);
  const [campaigns, setCampaigns] = useState(() => store.get("tast_campaigns") || []);
  const [brandVoice, setBrandVoice] = useState(() => store.get("tast_voice") || defaultBrandVoice);

  useEffect(() => store.set("tast_items", items), [items]);
  useEffect(() => store.set("tast_campaigns", campaigns), [campaigns]);
  useEffect(() => store.set("tast_voice", brandVoice), [brandVoice]);

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <div className="bg-white border-b border-stone-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <span className="font-bold text-stone-800 text-lg tracking-tight">tāst</span>
            <span className="text-stone-400 text-sm ml-2">content ops</span>
          </div>
          <div className="text-xs text-stone-300">{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
        </div>
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1">
            {TABS.map((t,i)=>(
              <button key={t} onClick={()=>setTab(i)}
                className="text-sm px-3 py-2.5 border-b-2 whitespace-nowrap font-medium transition-colors"
                style={tab===i?{borderColor:"#F05881",color:"#F05881"}:{borderColor:"transparent",color:"#a8a29e"}}>
                {t}
                {t==="Pipeline"&&items.length>0&&(
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{background:"#fff0f4",color:"#F05881"}}>{items.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <>
          {tab===0 && <Pipeline items={items} setItems={setItems} campaigns={campaigns} />}
          {tab===1 && <Calendar items={items} setItems={setItems} campaigns={campaigns} />}
          {tab===2 && <Campaigns campaigns={campaigns} setCampaigns={setCampaigns} allItems={items} setAllItems={setItems} />}
          {tab===3 && <BrandVoice voice={brandVoice} setVoice={setBrandVoice} />}
          {tab===4 && <Captions brandVoice={brandVoice} />}
        </>
      </div>
    </div>
  );
}