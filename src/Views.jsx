import { useState, useEffect } from "react";
import { PIPELINE_STAGES, CHANNEL_OPTIONS, TYPE_OPTIONS, STAGE_META, TYPE_COLORS, driveThumb, Tag, Modal, Inp, Sel, Txt, ChannelPicker, CampaignProgress, ContentForm, flattenChannels, normalizeChannels, PhaseTag, PHASES, getPhaseForDate, EmptyState, CommentBadge } from "./Components.jsx";
import { Avatar } from "./components/Avatar.jsx";
import CommentsPanel from "./components/CommentsPanel.jsx";

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
function ContentCard({ item, campaigns, onClick, compact, currentMember, commentCount = 0, selected, onToggleSelect }) {
  const [showComments, setShowComments] = useState(false);
  const campaign = campaigns.find(c=>String(c.id)===String(item.campaignId));
  const channels = flattenChannels(item.channels);
  const thumb = driveThumb(item.driveUrl);
  return (
    <>
      <div onClick={onClick} className="bg-white rounded-xl border shadow-sm cursor-pointer hover:border-[#fa8f9c] transition-colors mb-2 overflow-hidden"
        style={{ borderColor: selected ? '#F05881' : '#f5f5f4' }}>
        {thumb && !compact && <img src={thumb} alt="" className="w-full object-cover" style={{height:100}} onError={e=>e.target.style.display="none"} />}
        <div className={compact?"p-2":"p-3"}>
          <div className="flex items-start gap-2">
            {onToggleSelect && (
              <input type="checkbox" checked={!!selected} onChange={e => { e.stopPropagation(); onToggleSelect(item.id); }}
                onClick={e => e.stopPropagation()}
                className="mt-1 shrink-0 accent-[#F05881]" />
            )}
            <div className="flex-1 min-w-0">
              <span className={`font-medium text-stone-800 ${compact?"text-xs":"text-sm"}`}>{item.title}</span>
              {!compact && item.product && <p className="text-xs text-stone-400 mt-0.5">{item.product}</p>}
            </div>
            {commentCount > 0 && <CommentBadge count={commentCount} onClick={() => setShowComments(true)} />}
          </div>
          {!compact && campaign && <div className="mt-1.5"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:"#fff0f4",color:"#F05881"}}>↗ {campaign.name}</span></div>}
          {!compact && campaign?.keyMessage && <p className="text-xs text-stone-400 mt-1 line-clamp-1 italic">"{campaign.keyMessage}"</p>}
          {!compact && item.draftCopy && <p className="text-xs text-stone-500 mt-1 line-clamp-2 border-l-2 pl-2 border-stone-200">{item.draftCopy}</p>}
          <div className={`flex flex-wrap gap-1 ${compact?"mt-1":"mt-2"}`}>
            {!compact && <Tag label={item.type} colorClass={TYPE_COLORS[item.type]||TYPE_COLORS["Other"]} />}
            {channels.slice(0, compact?1:99).map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}
            {compact && channels.length>1 && <span className="text-xs text-stone-300">+{channels.length-1}</span>}
          </div>
          {item.date && <p className="text-xs text-stone-300 mt-1">{item.date}</p>}
          {!compact && (
            <div className="flex items-center justify-between mt-2">
              {item.assigneeId && <Avatar memberId={item.assigneeId} size={18} />}
              <button
                onClick={e=>{e.stopPropagation();setShowComments(true);}}
                className="text-xs text-stone-300 hover:text-[#F05881] transition-colors ml-auto flex items-center gap-1"
                title="Comments"
              >
                💬 Comments
              </button>
            </div>
          )}
        </div>
      </div>
      {showComments && (
        <CommentsPanel
          itemId={item.id}
          currentMember={currentMember}
          onClose={()=>setShowComments(false)}
        />
      )}
    </>
  );
}

// ── CSV helpers ───────────────────────────────────────────────────────────
function exportItemsToCSV(items) {
  const headers = ["title","type","stage","date","channels","format","product","draftCopy","notes","assigneeId","campaignId"];
  const rows = items.map(item => headers.map(h => {
    if (h === "channels") return flattenChannels(item.channels).join("; ");
    return String(item[h] || "").replace(/"/g, '""');
  }));
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `tast-content-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const lines = text.split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/"/g, "").trim());
  return lines.slice(1).map(line => {
    const values = line.match(/("(?:[^"]|"")*"|[^,]*)/g) || [];
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] || "").replace(/^"|"$/g, "").replace(/""/g, '"').trim(); });
    if (obj.channels) {
      const parts = obj.channels.split(";").map(s => s.trim()).filter(Boolean);
      obj.channels = { primary: parts[0] || "Instagram", secondary: parts.slice(1) };
    }
    return obj;
  });
}

// ── PIPELINE ──────────────────────────────────────────────────────────────
export function Pipeline({ items, addItem, updateItem, deleteItem, campaigns, products, setProducts, currentMember, commentCounts = {} }) {
  const isMobile = useIsMobile();
  const [view, setView] = useState("kanban");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [themeFilter, setThemeFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(filteredItems.map(i => i.id)));
  const clearSelection = () => { setSelectedIds(new Set()); setBulkMode(false); setShowBulkActions(false); };

  const bulkMoveStage = async (stage) => {
    for (const id of selectedIds) {
      const item = items.find(i => i.id === id);
      if (item && item.stage !== stage) {
        const { id: _id, created_at, ...rest } = item;
        await updateItem(id, { ...rest, stage }).catch(console.error);
      }
    }
    clearSelection();
  };
  const bulkAssign = async (assigneeId) => {
    for (const id of selectedIds) {
      const item = items.find(i => i.id === id);
      if (item) {
        const { id: _id, created_at, ...rest } = item;
        await updateItem(id, { ...rest, assigneeId }).catch(console.error);
      }
    }
    clearSelection();
  };
  const bulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteItem(id).catch(console.error);
    }
    clearSelection();
  };

  const handleImportCSV = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".csv";
    input.onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      const text = await file.text();
      const rows = parseCSV(text);
      for (const row of rows) {
        if (!row.title) continue;
        const { id, created_at, ...rest } = row;
        await addItem({ stage: "Idea", type: TYPE_OPTIONS[0], format: "Single Photo", ...rest }).catch(console.error);
      }
    };
    input.click();
  };

  const openEdit = item => { setEditItem(item); setShowForm(true); };
  const saveItem = async (form) => {
    if (editItem?.id) {
      const { id, created_at, ...rest } = form;
      await updateItem(editItem.id, rest).catch(console.error);
    } else {
      const { id, ...rest } = form;
      await addItem(rest).catch(console.error);
    }
  };
  const deleteItemHandler = async (item) => {
    await deleteItem(item.id).catch(console.error);
  };
  const moveStage = (item, stage) => {
    const { id, created_at, ...rest } = item;
    updateItem(id, { ...rest, stage }).catch(console.error);
  };

  const filteredItems = items.filter(item => {
    if (themeFilter !== "all" && item.type !== themeFilter) return false;
    if (platformFilter !== "all") {
      const primary = normalizeChannels(item.channels).primary;
      if (primary !== platformFilter) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-stone-800">Content Pipeline</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bulk / CSV controls */}
          <button onClick={() => { setBulkMode(!bulkMode); if (bulkMode) clearSelection(); }}
            className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all"
            style={bulkMode ? { background: "#F05881", color: "white", borderColor: "#F05881" } : { borderColor: "#e7e5e4", color: "#78716c" }}>
            {bulkMode ? "Cancel select" : "Select"}
          </button>
          <button onClick={() => exportItemsToCSV(filteredItems)}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-700 font-medium">
            Export CSV
          </button>
          <button onClick={handleImportCSV}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-700 font-medium">
            Import CSV
          </button>
          <div className="flex bg-stone-100 rounded-lg p-0.5">
            {[["kanban","Board"],["list","List"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
                style={view===v?{background:"#F05881",color:"white"}:{color:"#78716c"}}>{l}</button>
            ))}
          </div>
          <button onClick={()=>{setEditItem(null);setShowForm(true);}} style={{background:"#F05881"}}
            className="hover:opacity-90 text-white text-sm px-4 py-2.5 md:py-2 rounded-lg font-medium">+ Add</button>
        </div>
      </div>

      {/* Bulk action bar */}
      {bulkMode && selectedIds.size > 0 && (
        <div className="bg-white rounded-xl border border-[#F05881] p-3 mb-4 flex items-center gap-3 flex-wrap shadow-sm">
          <span className="text-sm font-medium text-stone-800">{selectedIds.size} selected</span>
          <button onClick={selectAll} className="text-xs text-[#F05881] hover:opacity-70 font-medium">Select all ({filteredItems.length})</button>
          <div className="h-4 w-px bg-stone-200" />
          <span className="text-xs text-stone-400">Move to:</span>
          {PIPELINE_STAGES.map(s => (
            <button key={s} onClick={() => bulkMoveStage(s)}
              className="text-xs px-2 py-1 rounded-full border font-medium hover:opacity-70"
              style={{ borderColor: STAGE_META[s].color + "66", color: STAGE_META[s].color }}>
              {s}
            </button>
          ))}
          <div className="h-4 w-px bg-stone-200" />
          <button onClick={bulkDelete} className="text-xs text-red-400 hover:text-red-600 font-medium">Delete</button>
          <button onClick={clearSelection} className="text-xs text-stone-400 hover:text-stone-600 ml-auto">Clear</button>
        </div>
      )}

      {/* Platform filter pills */}
      <div className="flex gap-1.5 flex-wrap mb-2">
        <button onClick={()=>setPlatformFilter("all")}
          className="text-xs px-2.5 py-1 rounded-full border font-medium transition-all"
          style={platformFilter==="all"?{background:"#F05881",color:"white",borderColor:"#F05881"}:{background:"white",color:"#78716c",borderColor:"#e7e5e4"}}>
          All platforms
        </button>
        {CHANNEL_OPTIONS.map(ch => {
          const count = items.filter(i => normalizeChannels(i.channels).primary === ch).length;
          return (
            <button key={ch} onClick={()=>setPlatformFilter(platformFilter===ch?"all":ch)}
              className="text-xs px-2.5 py-1 rounded-full border font-medium transition-all"
              style={platformFilter===ch?{background:"#F05881",color:"white",borderColor:"#F05881"}:{background:"white",color:"#78716c",borderColor:"#e7e5e4"}}>
              {ch} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Theme filter */}
      <div className="flex gap-1.5 flex-wrap mb-4 overflow-x-auto pb-1">
        <button onClick={()=>setThemeFilter("all")}
          className="text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap transition-all"
          style={themeFilter==="all"?{background:"#F05881",color:"white",borderColor:"#F05881"}:{background:"white",color:"#78716c",borderColor:"#e7e5e4"}}>
          All themes
        </button>
        {TYPE_OPTIONS.map(t => (
          <button key={t} onClick={()=>setThemeFilter(themeFilter===t?"all":t)}
            className="text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap transition-all"
            style={themeFilter===t?{background:"#F05881",color:"white",borderColor:"#F05881"}:{background:"white",color:"#78716c",borderColor:"#e7e5e4"}}>
            {t}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="+"
          title="No content yet"
          description="Start building your content pipeline. Add your first piece of content or import from CSV."
          actionLabel="+ Add Content"
          onAction={() => { setEditItem(null); setShowForm(true); }}
        />
      ) : view==="kanban" ? (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{minHeight:400}}>
          {PIPELINE_STAGES.map(stage=>{
            const stageItems = filteredItems.filter(i=>i.stage===stage);
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
                    <ContentCard item={item} campaigns={campaigns} onClick={()=>openEdit(item)} compact={isMobile} currentMember={currentMember}
                      commentCount={commentCounts[item.id] || 0}
                      selected={selectedIds.has(item.id)} onToggleSelect={bulkMode ? toggleSelect : null} />
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
            const stageItems = filteredItems.filter(i=>i.stage===stage);
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
                  const channels = flattenChannels(item.channels);
                  const thumb = driveThumb(item.driveUrl);
                  const cc = commentCounts[item.id] || 0;
                  return (
                    <div key={item.id} onClick={()=>openEdit(item)}
                      className="bg-white rounded-xl border border-stone-100 px-4 py-3 shadow-sm cursor-pointer hover:border-[#fa8f9c] mb-1.5 flex items-center gap-3">
                      {bulkMode && (
                        <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)}
                          onClick={e => e.stopPropagation()} className="shrink-0 accent-[#F05881]" />
                      )}
                      {thumb && <img src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e=>e.target.style.display="none"} />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-stone-800 text-sm">{item.title}</p>
                          {campaign && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:"#fff0f4",color:"#F05881"}}>↗ {campaign.name}</span>}
                          {cc > 0 && <CommentBadge count={cc} />}
                        </div>
                        {campaign?.keyMessage && <p className="text-xs text-stone-400 mt-0.5 italic line-clamp-1">"{campaign.keyMessage}"</p>}
                        {item.draftCopy && <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.draftCopy}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {item.assigneeId && <Avatar memberId={item.assigneeId} size={18} />}
                        {channels.map(ch=><Tag key={ch} label={ch} colorClass="bg-stone-100 text-stone-500" />)}
                        {item.date && <span className="text-xs text-stone-300 ml-1">{item.date}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {!filteredItems.length && <p className="text-stone-400 text-sm">{platformFilter !== 'all' || themeFilter !== 'all' ? 'No content matches this filter.' : 'No content yet.'}</p>}
        </div>
      )}

      {showForm && (
        <Modal title={editItem?.id?"Edit Content":"New Content"} onClose={()=>setShowForm(false)}>
          <ContentForm initial={editItem} campaigns={campaigns} onSave={saveItem}
            onDelete={editItem?.id ? () => deleteItemHandler(editItem) : null}
            onClose={()=>setShowForm(false)} products={products} setProducts={setProducts}
            currentMember={currentMember} />
        </Modal>
      )}
    </div>
  );
}

// ── CALENDAR ──────────────────────────────────────────────────────────────
export function Calendar({ items, addItem, updateItem, deleteItem, campaigns, products, setProducts, currentMember, commentCounts = {} }) {
  const isMobile = useIsMobile();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState("month");
  const [weekStart, setWeekStart] = useState(()=>{ const d=new Date(); d.setDate(d.getDate()-d.getDay()); return d; });
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const openNew = (date="") => { setEditItem({date,stage:"Idea",channels:{primary:"Instagram",secondary:[]},type:TYPE_OPTIONS[0]}); setShowForm(true); };
  const openEdit = item => { setEditItem(item); setShowForm(true); };
  const saveItem = async (form) => {
    if (editItem?.id) {
      const { id, created_at, ...rest } = form;
      await updateItem(editItem.id, rest).catch(console.error);
    } else {
      const { id, ...rest } = form;
      await addItem(rest).catch(console.error);
    }
  };
  const deleteItemHandler = async (item) => {
    await deleteItem(item.id).catch(console.error);
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
                const channels = flattenChannels(item.channels);
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
              const channels = flattenChannels(item.channels);
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
              onDelete={editItem?.id ? () => deleteItemHandler(editItem) : null}
              onClose={()=>setShowForm(false)} products={products} setProducts={setProducts}
              currentMember={currentMember} />
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
        <>
          {/* Phase band for this month */}
          {(() => {
            const monthStart = `${year}-${String(month+1).padStart(2,"0")}-01`;
            const monthEnd   = `${year}-${String(month+1).padStart(2,"0")}-${String(new Date(year,month+1,0).getDate()).padStart(2,"0")}`;
            const activePhases = PHASES.filter(p => p.start <= monthEnd && p.end >= monthStart);
            if (!activePhases.length) return null;
            return (
              <div className="flex gap-2 mb-2 flex-wrap">
                {activePhases.map(p => (
                  <span key={p.id} className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: p.color + "22", color: p.color }}>
                    📅 {p.name} — {p.subtitle}
                  </span>
                ))}
              </div>
            );
          })()}
          <div className="grid grid-cols-7 gap-px bg-stone-100 rounded-xl overflow-hidden border border-stone-100">
          {DAY_NAMES.map(d=><div key={d} className="bg-stone-50 text-center text-xs font-medium text-stone-400 py-2">{d}</div>)}
          {cells.map((d,i)=>{
            if(!d) return <div key={i} className="bg-white opacity-0" />;
            const key=dateKey(year,month,d);
            return <CalCell key={i} dateStr={key} dayNum={d} isToday={d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear()} />;
          })}
        </div>
        </>
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
            onDelete={editItem?.id ? () => deleteItemHandler(editItem) : null}
            onClose={()=>setShowForm(false)} products={products} setProducts={setProducts}
            currentMember={currentMember} />
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
  const EDGE_FN_URL = "https://yfixjafskptbhjsbvxwf.supabase.co/functions/v1/generate-caption";

  const [channel, setChannel] = useState("Instagram");
  const [context, setContext] = useState("");
  const [product, setProduct] = useState("");
  const [theme, setTheme] = useState("(no theme)");
  const [tone, setTone] = useState("On-brand default");
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const generate = async () => {
    if (!context.trim()) return;
    setLoading(true); setCaptions([]); setErrorMsg(null);
    try {
      const resp = await fetch(EDGE_FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, context, product, theme, tone, brandVoice }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) throw new Error(data.error || `HTTP ${resp.status}`);
      setCaptions(data.captions || []);
    } catch(e) {
      console.error("Caption generation error:", e);
      setErrorMsg(e.message || "Unknown error — check browser console");
    }
    setLoading(false);
  };

  const copy = (t, i) => { navigator.clipboard.writeText(t); setCopied(i); setTimeout(() => setCopied(null), 1500); };

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-800 mb-1">Caption Generator</h2>
      <p className="text-sm text-stone-400 mb-4">AI-drafted captions grounded in your brand voice.</p>
      <div className="bg-white rounded-xl border border-stone-100 p-4 shadow-sm mb-4">
        <Sel label="Channel" options={CHANNEL_OPTIONS} value={channel} onChange={e=>setChannel(e.target.value)} />
        <Sel label="Content theme" options={["(no theme)",...TYPE_OPTIONS]} value={theme} onChange={e=>setTheme(e.target.value)} />
        <Inp label="Coffee / product (optional)" value={product} onChange={e=>setProduct(e.target.value)} placeholder="e.g. Colombia Honey Process Vol. 3" />
        <Txt label="Post context — what is this post about?" rows={3} value={context} onChange={e=>setContext(e.target.value)} placeholder="e.g. Behind the scenes at Mill City showing how our Vol. 3 blend is roasted..." />
        <Sel label="Tone direction" options={["On-brand default","More poetic","More direct","Playful","Educational","Hype / launch energy"]} value={tone} onChange={e=>setTone(e.target.value)} />
        <button onClick={generate} disabled={loading||!context.trim()}
          style={loading||!context.trim()?{}:{background:"#F05881"}}
          className="w-full disabled:bg-stone-200 disabled:text-stone-400 text-white py-3 md:py-2.5 rounded-lg font-medium text-sm mt-1 hover:opacity-90 transition-all">
          {loading
            ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Generating...</span>
            : "Generate Captions"}
        </button>
      </div>
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-red-700 mb-1">Generation failed</p>
          <p className="text-xs font-mono text-red-500 break-all">{errorMsg}</p>
          <p className="text-xs text-red-400 mt-2">Make sure the Edge Function is deployed and ANTHROPIC_API_KEY is set in Supabase Vault.</p>
        </div>
      )}
      {captions.length > 0 && (
        <div className="space-y-3">
          {captions.map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-100 p-4 shadow-sm">
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{c}</p>
              <button onClick={()=>copy(c,i)} style={{color:"#F05881"}} className="mt-3 text-xs hover:opacity-70 font-medium">
                {copied===i ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}