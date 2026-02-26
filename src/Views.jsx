import { useState, useEffect } from "react";
import { PIPELINE_STAGES, CHANNEL_OPTIONS, TYPE_OPTIONS, STAGE_META, TYPE_COLORS, driveThumb, Tag, Modal, Inp, Sel, Txt, ChannelPicker, CampaignProgress, ContentForm } from "./Components.jsx";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ── Mobile detection ───────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(()=>window.innerWidth < 768);
  useEffect(()=>{
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  },[]);
  return isMobile;
}

// ── Product color helper ───────────────────────────────────────────────────
function getItemColor(item, products) {
  if (item.product && products?.length) {
    const matched = products.find(p => p.name === item.product);
    if (matched) return { color: matched.color, border: matched.border };
  }
  const mc = STAGE_META[item.stage] || STAGE_META["Idea"];
  return { color: mc.color };
}

// ── Content Card ───────────────────────────────────────────────────────────
function ContentCard({ item, campaigns, onClick, compact }) {
  const campaign = campaigns.find(c=>String(c.id)===String(item.campaignId));
  const channels = Array.isArray(item.channels)?item.channels:item.channel?[item.channel]:[];
  const thumb = driveThumb(item.driveUrl);
  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-stone-100 shadow-sm cursor-pointer hover:border-[#fa8f9c] transition-colors mb-2 overflow-hidden">
      {thumb && !compact && <img src={thumb} alt="" className="w-full object-cover" style={{height:100}} onError={e=>e.target.style.display="none"} />}
      <div className={compact?"p-2":"p-3"}>
        <span className={`font-medium text-stone-800 ${compact?"text-xs":"text-sm"}`}>{item.title}</span>
        {!compact && item.product && <p className="text-xs text-stone-400 mt-0.5">{item.product}</p>}
        {!compact && campaign && <div className="mt-1.5"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:"#fff0f4",color:"#F05881"}}>↗ {campaign.name}</span></div>}
        {!compact && campaign?.keyMessage && <p className="text-xs text-stone-400 mt-1 line-clamp-1 italic">"{campaign.keyMessage}"</p>}
        {!compact && item.draftCopy && <p className="text-xs text-stone-500 mt-1 line-clamp-2 border-l-2 pl-2 border-stone-200">{item.draftCopy}</p>}
        <div className={`flex flex-wrap gap-1 ${compact?"mt-1":"mt-2"}`}>
          {!compact && <Tag label={item.type} colorClass={TYPE_COLORS[item.type]||TYPE_COLORS["Other"]} />}
          {channels.slice(0, compact?1:99).map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}
          {compact && channels.length>1 && <span className="text-xs text-stone-300">+{channels.length-1}</span>}
        </div>
        {item.date && <p className="text-xs text-stone-300 mt-1">{item.date}</p>}
        {!compact && item.owner && <p className="text-xs text-stone-300 mt-0.5">Owner: {item.owner}</p>}
      </div>
    </div>
  );
}

// ── PIPELINE ──────────────────────────────────────────────────────────────
export function Pipeline({ items, setItems, campaigns, products, setProducts }) {
  const isMobile = useIsMobile();
  const [view, setView] = useState("kanban");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const openEdit = item => { setEditItem(item); setShowForm(true); };
  const saveItem = form => {
    if (editItem?.id) setItems(prev=>prev.map(i=>i.id===editItem.id?{...form,id:editItem.id}:i));
    else setItems(prev=>[{...form,id:Date.now()},...prev]);
  };
  const moveStage = (item,stage) => setItems(prev=>prev.map(i=>i.id===item.id?{...i,stage}:i));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Content Pipeline</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 rounded-lg p-0.5">
            {[["kanban","⊞ Board"],["list","≡ List"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
                style={view===v?{background:"#F05881",color:"white"}:{color:"#78716c"}}>{l}</button>
            ))}
          </div>
          <button onClick={()=>{setEditItem(null);setShowForm(true);}} style={{background:"#F05881"}}
            className="hover:opacity-90 text-white text-sm px-4 py-2.5 md:py-2 rounded-lg font-medium">+ Add</button>
        </div>
      </div>

      {view==="kanban" ? (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{minHeight:400}}>
          {PIPELINE_STAGES.map(stage=>{
            const stageItems = items.filter(i=>i.stage===stage);
            const isOver = dragOver===stage;
            return (
              <div key={stage}
                onDragOver={e=>{e.preventDefault();setDragOver(stage);}}
                onDragLeave={()=>setDragOver(null)}
                onDrop={()=>{if(dragItem&&dragItem.stage!==stage)moveStage(dragItem,stage);setDragItem(null);setDragOver(null);}}
                className="flex-shrink-0 rounded-xl p-3 transition-all"
                style={{width:isMobile?160:230,background:isOver?"#fff0f4":"#f7f6f5",border:isOver?"2px dashed #F05881":"2px solid transparent"}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{background:STAGE_META[stage].color}} />
                    <span className="text-xs font-semibold text-stone-600">{isMobile?stage.split(" ")[0]:stage}</span>
                  </div>
                  <span className="text-xs text-stone-400">{stageItems.length}</span>
                </div>
                {stageItems.map(item=>(
                  <div key={item.id} draggable onDragStart={()=>setDragItem(item)} style={{opacity:dragItem?.id===item.id?0.5:1}}>
                    <ContentCard item={item} campaigns={campaigns} onClick={()=>openEdit(item)} compact={isMobile} />
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
            const stageItems = items.filter(i=>i.stage===stage);
            if (!stageItems.length) return null;
            return (
              <div key={stage} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{background:STAGE_META[stage].color}} />
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{stage}</span>
                  <span className="text-xs text-stone-300">{stageItems.length}</span>
                </div>
                {stageItems.map(item=>{
                  const campaign = campaigns.find(c=>String(c.id)===String(item.campaignId));
                  const channels = Array.isArray(item.channels)?item.channels:[];
                  const thumb = driveThumb(item.driveUrl);
                  return (
                    <div key={item.id} onClick={()=>openEdit(item)}
                      className="bg-white rounded-xl border border-stone-100 px-4 py-3 shadow-sm cursor-pointer hover:border-[#fa8f9c] mb-1.5 flex items-center gap-3">
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
            onDelete={editItem?.id?()=>setItems(prev=>prev.filter(i=>i.id!==editItem.id)):null}
            onClose={()=>setShowForm(false)} products={products} setProducts={setProducts} />
        </Modal>
      )}
    </div>
  );
}

// ── CALENDAR ──────────────────────────────────────────────────────────────
export function Calendar({ items, setItems, campaigns, products, setProducts }) {
  const isMobile = useIsMobile();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState("month");
  const [weekStart, setWeekStart] = useState(()=>{ const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d; });
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const openNew = (date="") => { setEditItem({date,stage:"Idea",channels:["Instagram"],type:TYPE_OPTIONS[0]}); setShowForm(true); };
  const openEdit = item => { setEditItem(item); setShowForm(true); };
  const saveItem = form => {
    if (editItem?.id) setItems(prev=>prev.map(i=>i.id===editItem.id?{...form,id:editItem.id}:i));
    else setItems(prev=>[{...form,id:Date.now()},...prev]);
  };

  const dateKey = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const itemsForKey = key => items.filter(i=>i.date===key);
  const daysInMonth = new Date(year,month+1,0).getDate();
  const gapData = Array.from({length:daysInMonth},(_,i)=>itemsForKey(dateKey(year,month,i+1)).length);
  const maxGap = Math.max(...gapData,1);
  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };
  const prevWeek = () => { const d=new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); };
  const nextWeek = () => { const d=new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); };
  const weekDays = Array.from({length:7},(_,i)=>{ const d=new Date(weekStart); d.setDate(d.getDate()+i); return d; });
  const firstDay = new Date(year,month,1).getDay();
  const cells = Array.from({length:firstDay+daysInMonth},(_,i)=>i<firstDay?null:i-firstDay+1);

  const CalCell = ({dateStr,dayNum,isToday}) => {
    const dayItems = itemsForKey(dateStr);
    return (
      <div onClick={()=>openNew(dateStr)} className="bg-white p-1.5 cursor-pointer hover:bg-pink-50 transition-colors" style={{minHeight:view==="week"?120:80}}>
        <p className="text-xs font-medium mb-1" style={isToday?{color:"#F05881"}:{color:"#a8a29e"}}>{dayNum}</p>
        <div className="space-y-0.5">
          {dayItems.map(item=>{
            const thumb = driveThumb(item.driveUrl);
            const { color } = getItemColor(item, products);
            return (
              <div key={item.id} onClick={e=>{e.stopPropagation();openEdit(item);}} className="cursor-pointer rounded overflow-hidden" style={{border:`1px solid ${color}33`}}>
                {thumb && view==="week" && <img src={thumb} alt="" className="w-full object-cover" style={{height:56}} onError={e=>e.target.style.display="none"} />}
                <div className="px-1.5 py-0.5" style={{background:color+"22"}}>
                  <p className="text-xs font-medium truncate" style={{color}}>{item.title}</p>
                  {view==="week" && item.draftCopy && <p className="text-xs text-stone-400 line-clamp-2 mt-0.5">{item.draftCopy}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Mobile list view ──
  if (isMobile) {
    const upcoming = [...items].filter(i=>i.date).sort((a,b)=>a.date.localeCompare(b.date));
    const undated = items.filter(i=>!i.date);
    const grouped = upcoming.reduce((acc,item)=>{ acc[item.date]=acc[item.date]||[]; acc[item.date].push(item); return acc; },{});
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-800">Calendar</h2>
          <button onClick={()=>openNew()} style={{background:"#F05881"}} className="hover:opacity-90 text-white text-sm px-4 py-3 rounded-lg font-medium">+ Add</button>
        </div>
        {Object.keys(grouped).length===0 && undated.length===0 && <p className="text-stone-400 text-sm">No content scheduled yet.</p>}
        {Object.entries(grouped).map(([date,dayItems])=>{
          const d = new Date(date+"T00:00:00");
          const isPast = d < new Date(today.toDateString());
          return (
            <div key={date} className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{color:isPast?"#a8a29e":"#F05881"}}>
                {d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}
                {d.toDateString()===today.toDateString()&&" · Today"}
              </p>
              {dayItems.map(item=>{
                const { color } = getItemColor(item, products);
                const campaign = campaigns.find(c=>String(c.id)===String(item.campaignId));
                const channels = Array.isArray(item.channels)?item.channels:[];
                const thumb = driveThumb(item.driveUrl);
                return (
                  <div key={item.id} onClick={()=>openEdit(item)}
                    className="bg-white rounded-xl border border-stone-100 p-3.5 mb-2 cursor-pointer flex gap-3 items-center"
                    style={{borderLeft:`3px solid ${color}`}}>
                    {thumb && <img src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e=>e.target.style.display="none"} />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 text-sm">{item.title}</p>
                      {campaign && <p className="text-xs mt-0.5" style={{color:"#F05881"}}>↗ {campaign.name}</p>}
                      {item.draftCopy && <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.draftCopy}</p>}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{background:color+"22",color}}>{item.stage}</span>
                        {channels.slice(0,2).map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        {undated.length>0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-stone-400">Unscheduled</p>
            {undated.map(item=>{
              const { color } = getItemColor(item, products);
              const campaign = campaigns.find(c=>String(c.id)===String(item.campaignId));
              const channels = Array.isArray(item.channels)?item.channels:[];
              return (
                <div key={item.id} onClick={()=>openEdit(item)}
                  className="bg-white rounded-xl border border-stone-100 p-3.5 mb-2 cursor-pointer"
                  style={{borderLeft:`3px solid ${color}`}}>
                  <p className="font-medium text-stone-800 text-sm">{item.title}</p>
                  {campaign && <p className="text-xs mt-0.5" style={{color:"#F05881"}}>↗ {campaign.name}</p>}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{background:color+"22",color}}>{item.stage}</span>
                    {channels.slice(0,2).map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {showForm && (
          <Modal title={editItem?.id?"Edit Content":"New Content"} onClose={()=>setShowForm(false)}>
            <ContentForm initial={editItem} campaigns={campaigns} onSave={saveItem}
              onDelete={editItem?.id?()=>setItems(prev=>prev.filter(i=>i.id!==editItem.id)):null}
              onClose={()=>setShowForm(false)} products={products} setProducts={setProducts} />
          </Modal>
        )}
      </div>
    );
  }

  // ── Desktop calendar ──
  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button onClick={view==="week"?prevWeek:prevMonth} className="text-stone-400 hover:text-stone-700 text-lg">‹</button>
          <h2 className="text-lg font-semibold text-stone-800">
            {view==="week"
              ? `${weekDays[0].toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${weekDays[6].toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`
              : `${view==="gap"?"Gap — ":""}${MONTH_NAMES[month]} ${year}`}
          </h2>
          <button onClick={view==="week"?nextWeek:nextMonth} className="text-stone-400 hover:text-stone-700 text-lg">›</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 rounded-lg p-0.5">
            {[["month","Month"],["week","Week"],["gap","Gap"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
                style={view===v?{background:"#F05881",color:"white"}:{color:"#78716c"}}>{l}</button>
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
            const key=dateKey(year,month,d);
            return <CalCell key={i} dateStr={key} dayNum={d} isToday={d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear()} />;
          })}
        </div>
      )}

      {view==="week" && (
        <div className="grid grid-cols-7 gap-px bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
          {weekDays.map((d,i)=>(
            <div key={i} className="bg-stone-50 text-center text-xs font-medium text-stone-400 py-2">
              {DAY_NAMES[i]}<br/><span className="font-normal">{d.getDate()}</span>
            </div>
          ))}
          {weekDays.map((d,i)=>{
            const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
            return <CalCell key={i} dateStr={key} dayNum="" isToday={d.toDateString()===today.toDateString()} />;
          })}
        </div>
      )}

      {view==="gap" && (
        <div>
          <p className="text-xs text-stone-400 mb-4">Color intensity shows content volume. Light = sparse, dark = busy.</p>
          <div className="grid gap-1" style={{gridTemplateColumns:"repeat(7,1fr)"}}>
            {DAY_NAMES.map(d=><div key={d} className="text-center text-xs text-stone-400 font-medium py-1">{d}</div>)}
            {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
            {gapData.map((count,i)=>{
              const d=i+1, key=dateKey(year,month,d);
              const bg=count===0?"#f7f6f5":`rgba(240,88,129,${0.15+(count/maxGap)*0.75})`;
              return (
                <div key={d} onClick={()=>openNew(key)} className="rounded-xl cursor-pointer p-2 flex flex-col items-center" style={{background:bg,minHeight:72}}>
                  <p className="text-xs font-medium mb-1" style={{color:count>0?"#a12f52":"#a8a29e"}}>{d}</p>
                  {count>0 && <span className="text-xs font-bold" style={{color:"#a12f52"}}>{count}</span>}
                  <div className="mt-1 space-y-0.5 w-full">
                    {itemsForKey(key).slice(0,2).map(item=>(
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
            {[0.15,0.35,0.55,0.75,0.9].map(o=><div key={o} className="w-5 h-3 rounded-sm" style={{background:`rgba(240,88,129,${o})`}} />)}
            <span className="text-xs text-stone-400">Dense</span>
          </div>
        </div>
      )}

      {showForm && (
        <Modal title={editItem?.id?"Edit Content":"New Content"} onClose={()=>setShowForm(false)}>
          <ContentForm initial={editItem} campaigns={campaigns} onSave={saveItem}
            onDelete={editItem?.id?()=>setItems(prev=>prev.filter(i=>i.id!==editItem.id)):null}
            onClose={()=>setShowForm(false)} products={products} setProducts={setProducts} />
        </Modal>
      )}
    </div>
  );
}

// ── BRAND VOICE ───────────────────────────────────────────────────────────
export function BrandVoice({ voice, setVoice }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(voice);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Brand Voice & Guidelines</h2>
        {!editing
          ? <button onClick={()=>{setDraft(voice);setEditing(true);}} style={{color:"#F05881"}} className="text-sm hover:opacity-70 font-medium">Edit</button>
          : <div className="flex gap-2">
              <button onClick={()=>{setVoice(draft);setEditing(false);}} style={{background:"#F05881"}} className="text-sm text-white px-3 py-1.5 rounded-lg font-medium">Save</button>
              <button onClick={()=>setEditing(false)} className="text-sm text-stone-400">Cancel</button>
            </div>}
      </div>
      {editing
        ? <textarea value={draft} onChange={e=>setDraft(e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none font-mono" rows={20} />
        : <div className="bg-white rounded-xl border border-stone-100 p-5 shadow-sm"><pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">{voice}</pre></div>}
    </div>
  );
}

// ── CAPTIONS ──────────────────────────────────────────────────────────────
export function Captions({ brandVoice }) {
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
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
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
          className="w-full disabled:bg-stone-200 disabled:text-stone-400 text-white py-3 md:py-2.5 rounded-lg font-medium text-sm mt-1 hover:opacity-90">
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