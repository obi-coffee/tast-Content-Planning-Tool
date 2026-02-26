import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const PIPELINE_STAGES = ["Idea", "In Campaign", "In Production", "Ready", "Published"];
const CHANNEL_OPTIONS = ["Instagram", "Email", "Website", "TikTok", "LinkedIn"];
const TYPE_OPTIONS = ["Brewing Guide", "Product Launch", "Origin Story", "Processing Method", "Campaign", "Community", "Other"];
const TABS = ["Pipeline", "Calendar", "Campaigns", "Brand Voice", "Captions"];

const STAGE_META = {
  "Idea":          { color: "#a8a29e", light: "#f5f5f4" },
  "In Campaign":   { color: "#fa8f9c", light: "#fff0f4" },
  "In Production": { color: "#F05881", light: "#fff0f4" },
  "Ready":         { color: "#ef4056", light: "#fff0f4" },
  "Published":     { color: "#a12f52", light: "#fdf0f4" },
};

const TYPE_COLORS = {
  "Brewing Guide":      "bg-[#fa8f9c]/25 text-[#a12f52]",
  "Product Launch":     "bg-[#F05881]/20 text-[#a12f52]",
  "Origin Story":       "bg-[#ef4056]/15 text-[#a12f52]",
  "Processing Method":  "bg-[#fa8f9c]/30 text-[#a12f52]",
  "Campaign":           "bg-[#a12f52]/15 text-[#a12f52]",
  "Community":          "bg-[#F05881]/10 text-[#a12f52]",
  "Other":              "bg-stone-100 text-stone-600",
};

const defaultBrandVoice = `TONE
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

// ── Drive URL converter ────────────────────────────────────────────────────
function driveThumb(url) {
  if (!url) return null;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`;
  const m2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w400`;
  return url;
}

// ── Primitives ─────────────────────────────────────────────────────────────
function Tag({ label, colorClass, style }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass||""}`} style={style}>{label}</span>;
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${wide ? "max-w-2xl" : "max-w-lg"}`}>
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800 text-lg">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Inp({ label, ...p }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>}
      <input className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05881]/40" {...p} />
    </div>
  );
}

function Sel({ label, options, ...p }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>}
      <select className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-[#F05881]/40" {...p}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Txt({ label, rows=4, ...p }) {
  return (
    <div className="mb-3">
      {label && <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>}
      <textarea rows={rows} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05881]/40 resize-none" {...p} />
    </div>
  );
}

function ChannelPicker({ selected=[], onChange }) {
  const toggle = ch => onChange(selected.includes(ch) ? selected.filter(c=>c!==ch) : [...selected, ch]);
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-stone-600 mb-2">Channels</label>
      <div className="flex flex-wrap gap-2">
        {CHANNEL_OPTIONS.map(ch => (
          <button key={ch} type="button" onClick={()=>toggle(ch)}
            className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
            style={selected.includes(ch)?{background:"#F05881",color:"white",borderColor:"#F05881"}:{background:"white",color:"#78716c",borderColor:"#e7e5e4"}}>
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}

function StagePicker({ value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-stone-600 mb-2">Pipeline Stage</label>
      <div className="flex flex-wrap gap-2">
        {PIPELINE_STAGES.map(s => {
          const m = STAGE_META[s];
          const active = value===s;
          return (
            <button key={s} type="button" onClick={()=>onChange(s)}
              className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
              style={active?{background:m.color,color:"white",borderColor:m.color}:{background:"white",color:"#78716c",borderColor:"#e7e5e4"}}>
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Progress Bar ───────────────────────────────────────────────────────────
function CampaignProgress({ items }) {
  const total = items.length;
  if (!total) return <p className="text-xs text-stone-300 mb-4">No content yet.</p>;
  return (
    <div className="mb-5">
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

// ── Content Form ───────────────────────────────────────────────────────────
function ContentForm({ initial, campaigns, onSave, onDelete, onClose, lockCampaignId }) {
  const [form, setForm] = useState({
    title:"", type:TYPE_OPTIONS[0], channels:["Instagram"],
    stage:"Idea", campaignId:"", date:"", notes:"", product:"",
    draftCopy:"", driveUrl:"", owner:"", seq:0,
    ...initial
  });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const save = () => { if (!form.title.trim()) return; onSave(form); onClose(); };

  const linkedCampaign = campaigns.find(c=>String(c.id)===String(form.campaignId));

  return (
    <>
      <Inp label="Title" value={form.title} onChange={e=>f("title",e.target.value)} placeholder="Content title" />
      <Inp label="Product reference (optional)" value={form.product} onChange={e=>f("product",e.target.value)} placeholder="e.g. Ethiopia Anaerobic Natural" />
      <Sel label="Content type" options={TYPE_OPTIONS} value={form.type} onChange={e=>f("type",e.target.value)} />
      <ChannelPicker selected={form.channels||[]} onChange={v=>f("channels",v)} />
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
        <div className="mb-3 p-3 rounded-lg border text-xs text-stone-600 leading-relaxed" style={{background:"#fff0f4",borderColor:"#fa8f9c"}}>
          <p className="font-semibold text-[#F05881] mb-1">↗ Campaign direction · {linkedCampaign.name}</p>
          <p>{linkedCampaign.keyMessage}</p>
        </div>
      )}

      <Inp label="Scheduled date (optional)" type="date" value={form.date} onChange={e=>f("date",e.target.value)} />
      <Inp label="Owner (optional)" value={form.owner} onChange={e=>f("owner",e.target.value)} placeholder="e.g. Obi" />
      <Txt label="Draft copy / caption" rows={3} value={form.draftCopy} onChange={e=>f("draftCopy",e.target.value)} placeholder="Paste your draft caption or copy here..." />
      <Txt label="Notes" value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="Production notes, links, angles..." />
      <div className="mb-3">
        <label className="block text-sm font-medium text-stone-600 mb-1">Google Drive image URL</label>
        <input value={form.driveUrl} onChange={e=>f("driveUrl",e.target.value)}
          placeholder="Paste Drive share link — set to 'Anyone with link can view'"
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05881]/40" />
        {form.driveUrl && (
          <img src={driveThumb(form.driveUrl)} alt="preview" className="mt-2 w-full rounded-lg object-cover" style={{maxHeight:160}} onError={e=>e.target.style.display="none"} />
        )}
        <p className="text-xs text-stone-300 mt-1">File must be shared as "Anyone with the link can view"</p>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={save} style={{background:"#F05881"}} className="flex-1 hover:opacity-90 text-white py-2 rounded-lg font-medium text-sm">Save</button>
        {onDelete && <button onClick={()=>{onDelete();onClose();}} className="px-4 py-2 text-sm text-red-400 hover:text-red-600">Delete</button>}
      </div>
    </>
  );
}

// ── Content Card (Pipeline) ────────────────────────────────────────────────
function ContentCard({ item, campaigns, onClick, seq, dragHandleProps }) {
  const campaign = campaigns.find(c=>String(c.id)===String(item.campaignId));
  const channels = Array.isArray(item.channels)?item.channels:item.channel?[item.channel]:[];
  const thumb = driveThumb(item.driveUrl);

  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-stone-100 shadow-sm cursor-pointer hover:border-[#fa8f9c] transition-colors mb-2 overflow-hidden">
      {thumb && <img src={thumb} alt="" className="w-full object-cover" style={{height:100}} onError={e=>e.target.style.display="none"} />}
      <div className="p-3">
        {seq!==undefined && <span className="text-xs text-stone-300 font-medium mr-1">#{seq+1}</span>}
        <span className="font-medium text-stone-800 text-sm">{item.title}</span>
        {item.product && <p className="text-xs text-stone-400 mt-0.5">{item.product}</p>}
        {campaign && (
          <div className="mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:"#fff0f4",color:"#F05881"}}>↗ {campaign.name}</span>
          </div>
        )}
        {campaign?.keyMessage && (
          <p className="text-xs text-stone-400 mt-1 line-clamp-1 italic">"{campaign.keyMessage}"</p>
        )}
        {item.draftCopy && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 border-l-2 pl-2 border-stone-200">{item.draftCopy}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          <Tag label={item.type} colorClass={TYPE_COLORS[item.type]||TYPE_COLORS["Other"]} />
          {channels.map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}
        </div>
        {item.date && <p className="text-xs text-stone-300 mt-1.5">{item.date}</p>}
        {item.owner && <p className="text-xs text-stone-300 mt-0.5">Owner: {item.owner}</p>}
      </div>
    </div>
  );
}

// ── PIPELINE ──────────────────────────────────────────────────────────────
function Pipeline({ items, setItems, campaigns }) {
  const [view, setView] = useState("kanban");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const openNew = () => { setEditItem(null); setShowForm(true); };
  const openEdit = item => { setEditItem(item); setShowForm(true); };
  const saveItem = form => {
    if (editItem?.id) setItems(prev=>prev.map(i=>i.id===editItem.id?{...form,id:editItem.id}:i));
    else setItems(prev=>[{...form,id:Date.now()},...prev]);
  };
  const deleteItem = () => setItems(prev=>prev.filter(i=>i.id!==editItem.id));
  const moveStage = (item,stage) => setItems(prev=>prev.map(i=>i.id===item.id?{...i,stage}:i));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Content Pipeline</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 rounded-lg p-0.5">
            {[["kanban","⊞ Board"],["list","≡ List"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)}
                className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
                style={view===v?{background:"#F05881",color:"white"}:{color:"#78716c"}}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={openNew} style={{background:"#F05881"}} className="hover:opacity-90 text-white text-sm px-4 py-2 rounded-lg font-medium">+ Add</button>
        </div>
      </div>

      {view==="kanban" ? (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{minHeight:400}}>
          {PIPELINE_STAGES.map(stage=>{
            const m = STAGE_META[stage];
            const stageItems = items.filter(i=>i.stage===stage);
            const isOver = dragOver===stage;
            return (
              <div key={stage}
                onDragOver={e=>{e.preventDefault();setDragOver(stage);}}
                onDragLeave={()=>setDragOver(null)}
                onDrop={()=>{if(dragItem&&dragItem.stage!==stage)moveStage(dragItem,stage);setDragItem(null);setDragOver(null);}}
                className="flex-shrink-0 rounded-xl p-3 transition-all"
                style={{width:230,background:isOver?"#fff0f4":"#f7f6f5",border:isOver?`2px dashed #F05881`:"2px solid transparent"}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{background:m.color}} />
                    <span className="text-xs font-semibold text-stone-600">{stage}</span>
                  </div>
                  <span className="text-xs text-stone-400 font-medium">{stageItems.length}</span>
                </div>
                {stageItems.map(item=>(
                  <div key={item.id} draggable onDragStart={()=>setDragItem(item)} style={{opacity:dragItem?.id===item.id?0.5:1}}>
                    <ContentCard item={item} campaigns={campaigns} onClick={()=>openEdit(item)} />
                  </div>
                ))}
                {!stageItems.length && <p className="text-xs text-stone-300 text-center mt-4">Drop here</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          {PIPELINE_STAGES.map(stage=>{
            const m = STAGE_META[stage];
            const stageItems = items.filter(i=>i.stage===stage);
            if (!stageItems.length) return null;
            return (
              <div key={stage} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{background:m.color}} />
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{stage}</span>
                  <span className="text-xs text-stone-300">{stageItems.length}</span>
                </div>
                {stageItems.map(item=>{
                  const campaign = campaigns.find(c=>String(c.id)===String(item.campaignId));
                  const channels = Array.isArray(item.channels)?item.channels:item.channel?[item.channel]:[];
                  const thumb = driveThumb(item.driveUrl);
                  return (
                    <div key={item.id} onClick={()=>openEdit(item)}
                      className="bg-white rounded-xl border border-stone-100 px-4 py-3 shadow-sm cursor-pointer hover:border-[#fa8f9c] transition-colors mb-1.5 flex items-center gap-3">
                      {thumb && <img src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e=>e.target.style.display="none"} />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-stone-800 text-sm">{item.title}</p>
                          {campaign && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:"#fff0f4",color:"#F05881"}}>↗ {campaign.name}</span>}
                        </div>
                        {campaign?.keyMessage && <p className="text-xs text-stone-400 mt-0.5 italic line-clamp-1">"{campaign.keyMessage}"</p>}
                        {item.draftCopy && <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.draftCopy}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {channels.map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}
                        {item.date && <span className="text-xs text-stone-300 ml-1">{item.date}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {!items.length && <p className="text-stone-400 text-sm">No content yet.</p>}
        </div>
      )}

      {showForm && (
        <Modal title={editItem?.id?"Edit Content":"New Content"} onClose={()=>setShowForm(false)}>
          <ContentForm initial={editItem} campaigns={campaigns} onSave={saveItem}
            onDelete={editItem?.id?deleteItem:null} onClose={()=>setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}

// ── CALENDAR ──────────────────────────────────────────────────────────────
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function Calendar({ items, setItems, campaigns }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState("month");
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate()-d.getDay()); return d;
  });
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const openNew = (date="") => { setEditItem({date,stage:"Idea",channels:["Instagram"],type:TYPE_OPTIONS[0]}); setShowForm(true); };
  const openEdit = item => { setEditItem(item); setShowForm(true); };
  const saveItem = form => {
    if (editItem?.id) setItems(prev=>prev.map(i=>i.id===editItem.id?{...form,id:editItem.id}:i));
    else setItems(prev=>[{...form,id:Date.now()},...prev]);
  };
  const deleteItem = () => setItems(prev=>prev.filter(i=>i.id!==editItem.id));

  const dateKey = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const itemsForKey = key => items.filter(i=>i.date===key);

  // Gap heatmap
  const daysInMonth = new Date(year,month+1,0).getDate();
  const gapData = Array.from({length:daysInMonth},(_,i)=>{
    const key = dateKey(year,month,i+1);
    return itemsForKey(key).length;
  });
  const maxGap = Math.max(...gapData,1);

  const CalCell = ({dateStr, dayNum, isToday}) => {
    const dayItems = itemsForKey(dateStr);
    return (
      <div onClick={()=>openNew(dateStr)}
        className="bg-white p-1.5 cursor-pointer hover:bg-pink-50 transition-colors"
        style={{minHeight:view==="week"?120:80}}>
        <p className="text-xs font-medium mb-1" style={isToday?{color:"#F05881"}:{color:"#a8a29e"}}>{dayNum}</p>
        <div className="space-y-0.5">
          {dayItems.map(item=>{
            const thumb = driveThumb(item.driveUrl);
            const m = STAGE_META[item.stage]||STAGE_META["Idea"];
            return (
              <div key={item.id} onClick={e=>{e.stopPropagation();openEdit(item);}}
                className="cursor-pointer rounded overflow-hidden"
                style={{border:`1px solid ${m.color}33`}}>
                {thumb && view==="week" && (
                  <img src={thumb} alt="" className="w-full object-cover" style={{height:56}} onError={e=>e.target.style.display="none"} />
                )}
                <div className="px-1.5 py-0.5" style={{background:m.color+"22"}}>
                  <p className="text-xs font-medium truncate" style={{color:m.color}}>{item.title}</p>
                  {view==="week" && item.draftCopy && (
                    <p className="text-xs text-stone-400 line-clamp-2 mt-0.5">{item.draftCopy}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Month view
  const firstDay = new Date(year,month,1).getDay();
  const totalDays = new Date(year,month+1,0).getDate();
  const cells = Array.from({length:firstDay+totalDays},(_,i)=>i<firstDay?null:i-firstDay+1);

  // Week view
  const weekDays = Array.from({length:7},(_,i)=>{
    const d = new Date(weekStart); d.setDate(d.getDate()+i); return d;
  });
  const prevWeek = () => { const d=new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); };
  const nextWeek = () => { const d=new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {view==="month" && <>
            <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);}} className="text-stone-400 hover:text-stone-700 text-lg">‹</button>
            <h2 className="text-lg font-semibold text-stone-800">{MONTH_NAMES[month]} {year}</h2>
            <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);}} className="text-stone-400 hover:text-stone-700 text-lg">›</button>
          </>}
          {view==="week" && <>
            <button onClick={prevWeek} className="text-stone-400 hover:text-stone-700 text-lg">‹</button>
            <h2 className="text-lg font-semibold text-stone-800">
              {weekDays[0].toLocaleDateString("en-US",{month:"short",day:"numeric"})} – {weekDays[6].toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
            </h2>
            <button onClick={nextWeek} className="text-stone-400 hover:text-stone-700 text-lg">›</button>
          </>}
          {view==="gap" && <h2 className="text-lg font-semibold text-stone-800">Content Density — {MONTH_NAMES[month]} {year}</h2>}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 rounded-lg p-0.5">
            {[["month","Month"],["week","Week"],["gap","Gap"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)}
                className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
                style={view===v?{background:"#F05881",color:"white"}:{color:"#78716c"}}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={()=>openNew()} style={{background:"#F05881"}} className="hover:opacity-90 text-white text-sm px-4 py-2 rounded-lg font-medium">+ Add</button>
        </div>
      </div>

      {view==="month" && (
        <div className="grid grid-cols-7 gap-px bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
          {DAY_NAMES.map(d=><div key={d} className="bg-stone-50 text-center text-xs font-medium text-stone-400 py-2">{d}</div>)}
          {cells.map((d,i)=>{
            if(!d) return <div key={i} className="bg-white opacity-0" />;
            const key = dateKey(year,month,d);
            const isToday = d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
            return <CalCell key={i} dateStr={key} dayNum={d} isToday={isToday} />;
          })}
        </div>
      )}

      {view==="week" && (
        <div className="grid grid-cols-7 gap-px bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
          {weekDays.map((d,i)=>(
            <div key={i} className="bg-stone-50 text-center text-xs font-medium text-stone-400 py-2">
              {DAY_NAMES[i]}<br/>
              <span className="font-normal">{d.getDate()}</span>
            </div>
          ))}
          {weekDays.map((d,i)=>{
            const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
            const isToday = d.toDateString()===today.toDateString();
            return <CalCell key={i} dateStr={key} dayNum="" isToday={isToday} />;
          })}
        </div>
      )}

      {view==="gap" && (
        <div>
          <p className="text-xs text-stone-400 mb-4">Color intensity shows content volume per day. Light = sparse, dark = busy. Click any day to add content.</p>
          <div className="grid gap-1" style={{gridTemplateColumns:"repeat(7,1fr)"}}>
            {DAY_NAMES.map(d=><div key={d} className="text-center text-xs text-stone-400 font-medium py-1">{d}</div>)}
            {Array.from({length:new Date(year,month,1).getDay()}).map((_,i)=><div key={`e${i}`}/>)}
            {gapData.map((count,i)=>{
              const d = i+1;
              const key = dateKey(year,month,d);
              const intensity = count/maxGap;
              const bg = count===0?"#f7f6f5":`rgba(240,88,129,${0.15+intensity*0.75})`;
              const dayItems = itemsForKey(key);
              return (
                <div key={d} onClick={()=>openNew(key)}
                  className="rounded-xl cursor-pointer transition-all p-2 flex flex-col items-center justify-start"
                  style={{background:bg,minHeight:72}}>
                  <p className="text-xs font-medium mb-1" style={{color:count>0?"#a12f52":"#a8a29e"}}>{d}</p>
                  {count>0 && <span className="text-xs font-bold" style={{color:"#a12f52"}}>{count}</span>}
                  <div className="mt-1 space-y-0.5 w-full">
                    {dayItems.slice(0,2).map(item=>(
                      <div key={item.id} onClick={e=>{e.stopPropagation();openEdit(item);}}
                        className="text-xs truncate rounded px-1" style={{background:"rgba(255,255,255,0.6)",color:"#a12f52"}}>
                        {item.title}
                      </div>
                    ))}
                    {count>2 && <p className="text-xs text-center" style={{color:"#a12f52"}}>+{count-2}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-xs text-stone-400">Sparse</span>
            <div className="flex gap-0.5">
              {[0.15,0.35,0.55,0.75,0.9].map(o=>(
                <div key={o} className="w-5 h-3 rounded-sm" style={{background:`rgba(240,88,129,${o})`}} />
              ))}
            </div>
            <span className="text-xs text-stone-400">Dense</span>
          </div>
        </div>
      )}

      {showForm && (
        <Modal title={editItem?.id?"Edit Content":"New Content"} onClose={()=>setShowForm(false)}>
          <ContentForm initial={editItem} campaigns={campaigns} onSave={saveItem}
            onDelete={editItem?.id?deleteItem:null} onClose={()=>setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}

// ── CAMPAIGNS ─────────────────────────────────────────────────────────────
function Campaigns({ campaigns, setCampaigns, allItems, setAllItems }) {
  const [active, setActive] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [showCampForm, setShowCampForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [campForm, setCampForm] = useState({name:"",dropDate:"",goal:"",pillars:"",channels:[],bigThink:"",status:"Planning",keyMessage:"",tone:""});
  const cf = (k,v) => setCampForm(p=>({...p,[k]:v}));

  const saveCamp = () => {
    if (!campForm.name.trim()) return;
    if (active) {
      const updated = {...campForm,id:active.id};
      setCampaigns(prev=>prev.map(c=>c.id===active.id?updated:c));
      setActive(updated);
    } else {
      setCampaigns(prev=>[{...campForm,id:Date.now()},...prev]);
    }
    setShowCampForm(false);
  };

  const saveContent = form => {
    const linked = {...form, campaignId:String(active.id)};
    if (editContent?.id) setAllItems(prev=>prev.map(i=>i.id===editContent.id?{...linked,id:editContent.id}:i));
    else setAllItems(prev=>[{...linked,id:Date.now()},...prev]);
  };
  const deleteContent = () => { if(editContent?.id) setAllItems(prev=>prev.filter(i=>i.id!==editContent.id)); };

  const reorder = (items, fromIdx, toIdx) => {
    const arr = [...items];
    const [moved] = arr.splice(fromIdx,1);
    arr.splice(toIdx,0,moved);
    return arr;
  };

  const statusCls = s => s==="Live"?"bg-[#a12f52]/15 text-[#a12f52]":s==="Complete"?"bg-stone-200 text-stone-600":"bg-[#fa8f9c]/20 text-[#a12f52]";

  if (active) {
    const c = campaigns.find(x=>x.id===active.id)||active;
    const linked = allItems.filter(i=>String(i.campaignId)===String(c.id));
    const channels = Array.isArray(c.channels)?c.channels:[];

    // Sequenced items with drag
    const [dragIdx, setDragIdx] = useState(null);
    const [dragOverIdx, setDragOverIdx] = useState(null);
    const [seqItems, setSeqItems] = useState(linked);
    useEffect(()=>setSeqItems(linked),[allItems]);

    const applyReorder = (from,to) => {
      const reordered = reorder(seqItems,from,to);
      setSeqItems(reordered);
      // persist order via seq field
      const updated = allItems.map(item=>{
        const idx = reordered.findIndex(r=>r.id===item.id);
        return idx>=0?{...item,seq:idx}:item;
      });
      setAllItems(updated);
    };

    return (
      <div>
        <button onClick={()=>{setActive(null);setActiveTab("content");}} style={{color:"#F05881"}} className="text-sm hover:opacity-70 mb-4">← All Campaigns</button>

        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-semibold text-stone-800">{c.name}</h2>
            {c.dropDate && <p className="text-sm text-stone-400 mt-0.5">Drop: {c.dropDate}</p>}
            {channels.length>0 && <div className="flex gap-1 mt-1 flex-wrap">{channels.map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}</div>}
          </div>
          <div className="flex gap-2 items-center">
            <Tag label={c.status} colorClass={statusCls(c.status)} />
            <button onClick={()=>{setCampForm({...c});setShowCampForm(true);}} className="text-xs text-stone-400 hover:text-stone-600">Edit</button>
          </div>
        </div>

        {/* Progress */}
        <CampaignProgress items={seqItems} />

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-stone-100">
          {["content","brief"].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              className="text-sm px-4 py-2 border-b-2 font-medium capitalize transition-colors"
              style={activeTab===t?{borderColor:"#F05881",color:"#F05881"}:{borderColor:"transparent",color:"#a8a29e"}}>
              {t==="content"?`Content (${seqItems.length})`:"Brief"}
            </button>
          ))}
        </div>

        {activeTab==="content" && (
          <div>
            <div className="flex justify-end mb-3">
              <button onClick={()=>{setEditContent({stage:"In Campaign",channels:c.channels||["Instagram"],type:TYPE_OPTIONS[0],campaignId:String(c.id)});setShowContentForm(true);}}
                style={{background:"#F05881"}} className="hover:opacity-90 text-white text-sm px-4 py-2 rounded-lg font-medium">
                + Add Content
              </button>
            </div>
            {seqItems.length===0
              ? <p className="text-sm text-stone-300">No content yet — add the first piece to this campaign.</p>
              : (
                <div>
                  <p className="text-xs text-stone-300 mb-2">Drag to reorder publish sequence</p>
                  {seqItems.sort((a,b)=>(a.seq||0)-(b.seq||0)).map((item,idx)=>{
                    const thumb = driveThumb(item.driveUrl);
                    const chs = Array.isArray(item.channels)?item.channels:item.channel?[item.channel]:[];
                    return (
                      <div key={item.id}
                        draggable
                        onDragStart={()=>setDragIdx(idx)}
                        onDragOver={e=>{e.preventDefault();setDragOverIdx(idx);}}
                        onDrop={()=>{if(dragIdx!==null&&dragIdx!==idx)applyReorder(dragIdx,idx);setDragIdx(null);setDragOverIdx(null);}}
                        onDragEnd={()=>{setDragIdx(null);setDragOverIdx(null);}}
                        className="bg-white rounded-xl border mb-2 overflow-hidden cursor-grab transition-all"
                        style={{borderColor:dragOverIdx===idx?"#F05881":"#f5f5f4",opacity:dragIdx===idx?0.5:1}}>
                        <div className="flex items-center gap-3 p-3">
                          <div className="text-stone-300 cursor-grab select-none text-lg px-1">⠿</div>
                          <span className="text-xs font-bold text-stone-300 w-5">#{idx+1}</span>
                          {thumb && <img src={thumb} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" onError={e=>e.target.style.display="none"} />}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-stone-800 text-sm">{item.title}</p>
                            {item.draftCopy && <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 italic">{item.draftCopy}</p>}
                            <div className="flex gap-1 mt-1 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:STAGE_META[item.stage]?.color+"22",color:STAGE_META[item.stage]?.color}}>{item.stage}</span>
                              {chs.map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}
                            </div>
                            {item.date && <p className="text-xs text-stone-300 mt-0.5">{item.date}</p>}
                          </div>
                          <button onClick={()=>{setEditContent(item);setShowContentForm(true);}} className="text-xs text-stone-300 hover:text-stone-500 px-2">Edit</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        )}

        {activeTab==="brief" && (
          <div className="grid gap-4">
            {c.keyMessage && <div className="rounded-xl border p-4" style={{background:"#fff0f4",borderColor:"#fa8f9c"}}><p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{color:"#F05881"}}>Key Message</p><p className="text-sm text-stone-700">{c.keyMessage}</p></div>}
            {c.tone && <div className="bg-white rounded-xl border border-stone-100 p-4"><p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Tone Direction</p><p className="text-sm text-stone-700">{c.tone}</p></div>}
            {c.goal && <div className="bg-white rounded-xl border border-stone-100 p-4"><p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Goal</p><p className="text-sm text-stone-700">{c.goal}</p></div>}
            {c.pillars && <div className="bg-white rounded-xl border border-stone-100 p-4"><p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Content Pillars</p><p className="text-sm text-stone-700 whitespace-pre-wrap">{c.pillars}</p></div>}
            {c.bigThink && <div className="rounded-xl border p-4" style={{background:"#fff5f7",borderColor:"#fa8f9c"}}><p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{color:"#F05881"}}>Big Think / Creative Sandbox</p><p className="text-sm text-stone-700 whitespace-pre-wrap">{c.bigThink}</p></div>}
            {!c.keyMessage&&!c.tone&&!c.goal&&!c.pillars&&!c.bigThink && <p className="text-sm text-stone-300">No brief yet — edit the campaign to add creative direction.</p>}
          </div>
        )}

        {showCampForm && (
          <Modal title="Edit Campaign" onClose={()=>setShowCampForm(false)}>
            <Inp label="Campaign name" value={campForm.name} onChange={e=>cf("name",e.target.value)} />
            <Inp label="Drop date" type="date" value={campForm.dropDate} onChange={e=>cf("dropDate",e.target.value)} />
            <Sel label="Status" options={["Planning","Active","Live","Complete"]} value={campForm.status} onChange={e=>cf("status",e.target.value)} />
            <ChannelPicker selected={campForm.channels||[]} onChange={v=>cf("channels",v)} />
            <Txt label="Key message (shown on content cards)" rows={2} value={campForm.keyMessage} onChange={e=>cf("keyMessage",e.target.value)} placeholder="The single most important thing this campaign communicates..." />
            <Txt label="Tone direction" rows={2} value={campForm.tone} onChange={e=>cf("tone",e.target.value)} placeholder="How should this campaign feel and sound?" />
            <Txt label="Goal" value={campForm.goal} onChange={e=>cf("goal",e.target.value)} />
            <Txt label="Content pillars" value={campForm.pillars} onChange={e=>cf("pillars",e.target.value)} />
            <Txt label="Big think / creative sandbox" rows={5} value={campForm.bigThink} onChange={e=>cf("bigThink",e.target.value)} />
            <button onClick={saveCamp} style={{background:"#F05881"}} className="w-full hover:opacity-90 text-white py-2 rounded-lg font-medium text-sm">Save</button>
          </Modal>
        )}
        {showContentForm && (
          <Modal title={editContent?.id?"Edit Content":"New Content"} onClose={()=>{setShowContentForm(false);setEditContent(null);}}>
            <ContentForm initial={editContent} campaigns={campaigns} onSave={saveContent}
              onDelete={editContent?.id?deleteContent:null}
              onClose={()=>{setShowContentForm(false);setEditContent(null);}}
              lockCampaignId={true} />
          </Modal>
        )}
      </div>
    );
  }

  // Campaign list
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Campaigns</h2>
        <button onClick={()=>{setCampForm({name:"",dropDate:"",goal:"",pillars:"",channels:[],bigThink:"",status:"Planning",keyMessage:"",tone:""});setShowCampForm(true);}}
          style={{background:"#F05881"}} className="hover:opacity-90 text-white text-sm px-4 py-2 rounded-lg font-medium">
          + New Campaign
        </button>
      </div>
      {campaigns.length===0 && <p className="text-stone-400 text-sm">No campaigns yet.</p>}
      <div className="space-y-3">
        {campaigns.map(c=>{
          const linked = allItems.filter(i=>String(i.campaignId)===String(c.id));
          const channels = Array.isArray(c.channels)?c.channels:[];
          return (
            <div key={c.id} onClick={()=>{setActive(c);setActiveTab("content");}}
              className="bg-white rounded-xl border border-stone-100 p-4 shadow-sm cursor-pointer hover:border-[#fa8f9c] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-stone-800 text-sm">{c.name}</p>
                  {c.dropDate && <p className="text-xs text-stone-400 mt-0.5">Drop: {c.dropDate}</p>}
                  {c.keyMessage && <p className="text-xs text-stone-500 mt-1 line-clamp-1 italic">"{c.keyMessage}"</p>}
                  {channels.length>0 && <div className="flex gap-1 mt-2 flex-wrap">{channels.map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}</div>}
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-3">
                  <Tag label={c.status} colorClass={statusCls(c.status)} />
                  {linked.length>0 && <span className="text-xs text-stone-400">{linked.length} piece{linked.length!==1?"s":""}</span>}
                </div>
              </div>
              {linked.length>0 && (
                <>
                  <div className="mt-3">
                    <CampaignProgress items={linked} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      {showCampForm && (
        <Modal title="New Campaign" onClose={()=>setShowCampForm(false)}>
          <Inp label="Campaign name" value={campForm.name} onChange={e=>cf("name",e.target.value)} placeholder="e.g. Spring Fermentation Drop" />
          <Inp label="Drop date" type="date" value={campForm.dropDate} onChange={e=>cf("dropDate",e.target.value)} />
          <Sel label="Status" options={["Planning","Active","Live","Complete"]} value={campForm.status} onChange={e=>cf("status",e.target.value)} />
          <ChannelPicker selected={campForm.channels||[]} onChange={v=>cf("channels",v)} />
          <Txt label="Key message (shown on content cards)" rows={2} value={campForm.keyMessage} onChange={e=>cf("keyMessage",e.target.value)} placeholder="The single most important thing this campaign communicates..." />
          <Txt label="Tone direction" rows={2} value={campForm.tone} onChange={e=>cf("tone",e.target.value)} placeholder="How should this campaign feel and sound?" />
          <Txt label="Goal" value={campForm.goal} onChange={e=>cf("goal",e.target.value)} placeholder="What does success look like?" />
          <Txt label="Content pillars" value={campForm.pillars} onChange={e=>cf("pillars",e.target.value)} placeholder="Key themes..." />
          <Txt label="Big think / creative sandbox" rows={4} value={campForm.bigThink} onChange={e=>cf("bigThink",e.target.value)} placeholder="Wild ideas, moodboard notes..." />
          <button onClick={saveCamp} style={{background:"#F05881"}} className="w-full hover:opacity-90 text-white py-2 rounded-lg font-medium text-sm">Create Campaign</button>
        </Modal>
      )}
    </div>
  );
}

// ── BRAND VOICE ───────────────────────────────────────────────────────────
function BrandVoice({ voice, setVoice }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(voice);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Brand Voice & Guidelines</h2>
        {!editing
          ? <button onClick={()=>{setDraft(voice);setEditing(true);}} style={{color:"#F05881"}} className="text-sm hover:opacity-70 font-medium">Edit</button>
          : <div className="flex gap-2">
              <button onClick={()=>{setVoice(draft);setEditing(false);}} style={{background:"#F05881"}} className="text-sm hover:opacity-90 text-white px-3 py-1.5 rounded-lg font-medium">Save</button>
              <button onClick={()=>setEditing(false)} className="text-sm text-stone-400 hover:text-stone-600">Cancel</button>
            </div>}
      </div>
      {editing
        ? <textarea value={draft} onChange={e=>setDraft(e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F05881]/40 resize-none font-mono" rows={20} />
        : <div className="bg-white rounded-xl border border-stone-100 p-5 shadow-sm"><pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">{voice}</pre></div>}
    </div>
  );
}

// ── CAPTIONS ──────────────────────────────────────────────────────────────
function Captions({ brandVoice }) {
  const [channel, setChannel] = useState("Instagram");
  const [context, setContext] = useState("");
  const [product, setProduct] = useState("");
  const [tone, setTone] = useState("On-brand default");
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const generate = async () => {
    if (!context.trim()) return;
    setLoading(true); setCaptions([]);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{role:"user",content:`You are the voice of tāst, a specialty coffee company. Generate 3 distinct social media captions for ${channel}.\n\nBRAND VOICE:\n${brandVoice}\n\nPOST CONTEXT: ${context}\n${product?`PRODUCT: ${product}`:""}\nTONE: ${tone}\n\nReturn ONLY a JSON array of 3 strings. No markdown, no preamble.`}]
        })
      });
      const data = await resp.json();
      const text = data.content?.find(b=>b.type==="text")?.text||"[]";
      setCaptions(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch { setCaptions(["Error generating captions. Please try again."]); }
    setLoading(false);
  };

  const copy = (t,i) => { navigator.clipboard.writeText(t); setCopied(i); setTimeout(()=>setCopied(null),1500); };

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-800 mb-1">Caption Generator</h2>
      <p className="text-sm text-stone-400 mb-4">Generate on-brand captions from your brand voice guidelines.</p>
      <div className="bg-white rounded-xl border border-stone-100 p-4 shadow-sm mb-4">
        <Sel label="Channel" options={CHANNEL_OPTIONS} value={channel} onChange={e=>setChannel(e.target.value)} />
        <Inp label="Product (optional)" value={product} onChange={e=>setProduct(e.target.value)} placeholder="e.g. Colombia Honey Process" />
        <Txt label="Post context" rows={3} value={context} onChange={e=>setContext(e.target.value)} placeholder="What's this post about?" />
        <Sel label="Tone direction" options={["On-brand default","More poetic","More direct","Playful","Educational","Hype / launch energy"]} value={tone} onChange={e=>setTone(e.target.value)} />
        <button onClick={generate} disabled={loading||!context.trim()}
          style={loading||!context.trim()?{}:{background:"#F05881"}}
          className="w-full disabled:bg-stone-200 disabled:text-stone-400 text-white py-2.5 rounded-lg font-medium text-sm mt-1 hover:opacity-90">
          {loading?"Generating...":"Generate Captions"}
        </button>
      </div>
      {captions.length>0 && (
        <div className="space-y-3">
          {captions.map((c,i)=>(
            <div key={i} className="bg-white rounded-xl border border-stone-100 p-4 shadow-sm">
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{c}</p>
              <button onClick={()=>copy(c,i)} style={{color:"#F05881"}} className="mt-2 text-xs hover:opacity-70 font-medium">{copied===i?"Copied!":"Copy"}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [brandVoice, setBrandVoice] = useState(defaultBrandVoice);
  const [loaded, setLoaded] = useState(false);

  useEffect(()=>{
    (async()=>{
      try {
        const [it,ca,bv] = await Promise.all([
          window.storage.get("tast_items").catch(()=>null),
          window.storage.get("tast_campaigns").catch(()=>null),
          window.storage.get("tast_voice").catch(()=>null),
        ]);
        if(it) setItems(JSON.parse(it.value));
        if(ca) setCampaigns(JSON.parse(ca.value));
        if(bv) setBrandVoice(bv.value);
      } catch {}
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{if(loaded)window.storage.set("tast_items",JSON.stringify(items)).catch(()=>{});},[items,loaded]);
  useEffect(()=>{if(loaded)window.storage.set("tast_campaigns",JSON.stringify(campaigns)).catch(()=>{});},[campaigns,loaded]);
  useEffect(()=>{if(loaded)window.storage.set("tast_voice",brandVoice).catch(()=>{});},[brandVoice,loaded]);

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
                {t==="Pipeline"&&items.length>0&&<span className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{background:"#fff0f4",color:"#F05881"}}>{items.length}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {!loaded?<p className="text-stone-400 text-sm">Loading your workspace...</p>:(
          <>
            {tab===0 && <Pipeline items={items} setItems={setItems} campaigns={campaigns} />}
            {tab===1 && <Calendar items={items} setItems={setItems} campaigns={campaigns} />}
            {tab===2 && <Campaigns campaigns={campaigns} setCampaigns={setCampaigns} allItems={items} setAllItems={setItems} />}
            {tab===3 && <BrandVoice voice={brandVoice} setVoice={setBrandVoice} />}
            {tab===4 && <Captions brandVoice={brandVoice} />}
          </>
        )}
      </div>
    </div>
  );
}
