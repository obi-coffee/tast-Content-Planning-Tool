import { useState } from "react";
import { PIPELINE_STAGES, TYPE_OPTIONS, STAGE_META, driveThumb, Tag, Modal, Inp, Sel, Txt, ChannelPicker, CampaignProgress, ContentForm } from "./Components.jsx";

export function Campaigns({ campaigns, setCampaigns, allItems, setAllItems, products=[], setProducts=()=>{} }) {
  const [active, setActive] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [showCampForm, setShowCampForm] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [editContent, setEditContent] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const emptyCamp = {name:"",dropDate:"",goal:"",pillars:"",channels:[],bigThink:"",status:"Planning",keyMessage:"",tone:""};
  const [campForm, setCampForm] = useState(emptyCamp);
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
    const linked = {...form,campaignId:String(active.id)};
    if (editContent?.id) setAllItems(prev=>prev.map(i=>i.id===editContent.id?{...linked,id:editContent.id}:i));
    else setAllItems(prev=>[{...linked,id:Date.now()},...prev]);
  };
  const deleteContent = () => { if(editContent?.id) setAllItems(prev=>prev.filter(i=>i.id!==editContent.id)); };

  const reorder = (arr,from,to) => { const a=[...arr]; const [m]=a.splice(from,1); a.splice(to,0,m); return a; };
  const statusCls = s => s==="Live"?"bg-[#a12f52]/15 text-[#a12f52]":s==="Complete"?"bg-stone-200 text-stone-600":"bg-[#fa8f9c]/20 text-[#a12f52]";

  // ── Campaign Detail ──
  if (active) {
    const c = campaigns.find(x=>x.id===active.id)||active;
    const linked = allItems.filter(i=>String(i.campaignId)===String(c.id));
    const seqItems = [...linked].sort((a,b)=>(a.seq||0)-(b.seq||0));
    const channels = Array.isArray(c.channels)?c.channels:[];

    const applyReorder = (from,to) => {
      const reordered = reorder(seqItems,from,to);
      setAllItems(allItems.map(item=>{
        const idx = reordered.findIndex(r=>r.id===item.id);
        return idx>=0?{...item,seq:idx}:item;
      }));
    };

    return (
      <div>
        <button onClick={()=>{setActive(null);setActiveTab("content");}} style={{color:"#F05881"}} className="text-sm hover:opacity-70 mb-4">← All Campaigns</button>
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

        <CampaignProgress items={seqItems} />

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
                  {seqItems.map((item,idx)=>{
                    const thumb = driveThumb(item.driveUrl);
                    const chs = Array.isArray(item.channels)?item.channels:[];
                    return (
                      <div key={item.id} draggable
                        onDragStart={()=>setDragIdx(idx)}
                        onDragOver={e=>{e.preventDefault();setDragOverIdx(idx);}}
                        onDrop={()=>{if(dragIdx!==null&&dragIdx!==idx)applyReorder(dragIdx,idx);setDragIdx(null);setDragOverIdx(null);}}
                        onDragEnd={()=>{setDragIdx(null);setDragOverIdx(null);}}
                        className="bg-white rounded-xl border mb-2 overflow-hidden cursor-grab transition-all"
                        style={{borderColor:dragOverIdx===idx?"#F05881":"#f5f5f4",opacity:dragIdx===idx?0.5:1}}>
                        <div className="flex items-center gap-3 p-3">
                          <div className="text-stone-300 select-none text-lg px-1">⠿</div>
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
              )}
          </div>
        )}

        {activeTab==="brief" && (
          <div className="grid gap-4">
            {c.keyMessage && <div className="rounded-xl border p-4" style={{background:"#fff0f4",borderColor:"#fa8f9c"}}><p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{color:"#F05881"}}>Key Message</p><p className="text-sm text-stone-700">{c.keyMessage}</p></div>}
            {c.tone && <div className="bg-white rounded-xl border border-stone-100 p-4"><p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Tone Direction</p><p className="text-sm text-stone-700">{c.tone}</p></div>}
            {c.goal && <div className="bg-white rounded-xl border border-stone-100 p-4"><p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Goal</p><p className="text-sm text-stone-700">{c.goal}</p></div>}
            {c.pillars && <div className="bg-white rounded-xl border border-stone-100 p-4"><p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Content Pillars</p><p className="text-sm text-stone-700 whitespace-pre-wrap">{c.pillars}</p></div>}
            {c.bigThink && <div className="rounded-xl border p-4" style={{background:"#fff5f7",borderColor:"#fa8f9c"}}><p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{color:"#F05881"}}>Big Think</p><p className="text-sm text-stone-700 whitespace-pre-wrap">{c.bigThink}</p></div>}
            {!c.keyMessage&&!c.tone&&!c.goal&&!c.pillars&&!c.bigThink && <p className="text-sm text-stone-300">No brief yet — edit the campaign to add creative direction.</p>}
          </div>
        )}

        {showCampForm && (
          <Modal title="Edit Campaign" onClose={()=>setShowCampForm(false)}>
            <Inp label="Campaign name" value={campForm.name} onChange={e=>cf("name",e.target.value)} />
            <Inp label="Drop date" type="date" value={campForm.dropDate} onChange={e=>cf("dropDate",e.target.value)} />
            <Sel label="Status" options={["Planning","Active","Live","Complete"]} value={campForm.status} onChange={e=>cf("status",e.target.value)} />
            <ChannelPicker selected={campForm.channels||[]} onChange={v=>cf("channels",v)} />
            <Txt label="Key message" rows={2} value={campForm.keyMessage} onChange={e=>cf("keyMessage",e.target.value)} placeholder="The single most important thing this campaign communicates..." />
            <Txt label="Tone direction" rows={2} value={campForm.tone} onChange={e=>cf("tone",e.target.value)} placeholder="How should this campaign feel and sound?" />
            <Txt label="Goal" value={campForm.goal} onChange={e=>cf("goal",e.target.value)} />
            <Txt label="Content pillars" value={campForm.pillars} onChange={e=>cf("pillars",e.target.value)} />
            <Txt label="Big think" rows={5} value={campForm.bigThink} onChange={e=>cf("bigThink",e.target.value)} />
            <button onClick={saveCamp} style={{background:"#F05881"}} className="w-full hover:opacity-90 text-white py-2 rounded-lg font-medium text-sm">Save</button>
          </Modal>
        )}
        {showContentForm && (
          <Modal title={editContent?.id?"Edit Content":"New Content"} onClose={()=>{setShowContentForm(false);setEditContent(null);}}>
            <ContentForm initial={editContent} campaigns={campaigns} onSave={saveContent}
              onDelete={editContent?.id?deleteContent:null}
              onClose={()=>{setShowContentForm(false);setEditContent(null);}}
              lockCampaignId={true} products={products} setProducts={setProducts} />
          </Modal>
        )}
      </div>
    );
  }

  // ── Campaign List ──
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-stone-800">Campaigns</h2>
        <button onClick={()=>{setCampForm(emptyCamp);setShowCampForm(true);}} style={{background:"#F05881"}} className="hover:opacity-90 text-white text-sm px-4 py-2 rounded-lg font-medium">+ New Campaign</button>
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
              {linked.length>0 && <div className="mt-3"><CampaignProgress items={linked} /></div>}
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
          <Txt label="Key message" rows={2} value={campForm.keyMessage} onChange={e=>cf("keyMessage",e.target.value)} placeholder="The single most important thing this campaign communicates..." />
          <Txt label="Tone direction" rows={2} value={campForm.tone} onChange={e=>cf("tone",e.target.value)} placeholder="How should this campaign feel and sound?" />
          <Txt label="Goal" value={campForm.goal} onChange={e=>cf("goal",e.target.value)} placeholder="What does success look like?" />
          <Txt label="Content pillars" value={campForm.pillars} onChange={e=>cf("pillars",e.target.value)} />
          <Txt label="Big think" rows={4} value={campForm.bigThink} onChange={e=>cf("bigThink",e.target.value)} placeholder="Wild ideas, moodboard notes..." />
          <button onClick={saveCamp} style={{background:"#F05881"}} className="w-full hover:opacity-90 text-white py-2 rounded-lg font-medium text-sm">Create Campaign</button>
        </Modal>
      )}
    </div>
  );
}