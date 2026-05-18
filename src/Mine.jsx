import { useMemo } from "react";
import { driveThumb, Tag, EmptyState, CommentBadge, flattenChannels, normalizeChannels } from "./Components.jsx";
import { Avatar } from "./components/Avatar.jsx";

// "Mine" — the personal view. Three sections:
//   1. Assigned to you — items where assigneeId === currentMember.id, sorted by date
//   2. New comments — items with comments since you last visited Mine
//   3. Recently updated — items modified in the last 7 days
//
// State for "last visited" lives in the existing `settings` table as a JSON
// blob keyed by member id — no schema change needed.
//
// Wave 2 will add @-mention awareness once the comments parser ships.
export function Mine({ items, commentCounts, currentMember, campaigns, contentSeries, onOpenItem }) {
  const memberId = currentMember?.id;

  const { assignedToMe, recentlyUpdated } = useMemo(() => {
    if (!memberId) return { assignedToMe: [], recentlyUpdated: [] };
    const assignedToMe = items
      .filter(i => i.assigneeId === memberId && i.stage !== "Published")
      .sort((a, b) => {
        if (a.date && b.date) return a.date.localeCompare(b.date);
        if (a.date) return -1;
        if (b.date) return 1;
        return 0;
      });

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlyUpdated = items
      .filter(i => {
        const updated = i.updated_at || i.created_at;
        if (!updated) return false;
        return new Date(updated).getTime() >= sevenDaysAgo;
      })
      .sort((a, b) => String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || "")))
      .slice(0, 8);
    return { assignedToMe, recentlyUpdated };
  }, [items, memberId]);

  // Items with comments — for Wave 1 we just show "has comments" as a proxy.
  // Wave 2 will track per-member last_seen_at and only surface NEW comments.
  const withComments = useMemo(() => {
    return items
      .filter(i => (commentCounts[i.id] || 0) > 0 && i.stage !== "Published")
      .sort((a, b) => (commentCounts[b.id] || 0) - (commentCounts[a.id] || 0))
      .slice(0, 6);
  }, [items, commentCounts]);

  if (!currentMember) return null;

  const Row = ({ item }) => {
    const campaign = campaigns.find(c => String(c.id) === String(item.campaignId));
    const channels = flattenChannels(item.channels);
    const thumb = driveThumb(item.driveUrl);
    const cc = commentCounts[item.id] || 0;
    return (
      <div
        onClick={() => onOpenItem?.(item)}
        className="bg-white rounded-xl border border-rich-black/8 px-4 py-3 mb-1.5 cursor-pointer hover:border-no2 hover:shadow-md transition-all flex items-center gap-3"
      >
        {thumb && <img src={thumb} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={e=>e.target.style.display="none"} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-rich-black text-sm">{item.title || "Untitled"}</p>
            {campaign && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#fff0f4", color: "#F05881" }}>
                ↗ {campaign.name}
              </span>
            )}
            {cc > 0 && <CommentBadge count={cc} />}
          </div>
          {item.draftCopy && <p className="text-xs text-rich-black/40 mt-0.5 line-clamp-1">{item.draftCopy}</p>}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: "#1A1A1A08", color: "#1A1A1A60" }}>
              {item.stage}
            </span>
            {channels.slice(0, 2).map(ch => (
              <Tag key={ch} label={ch} colorClass="bg-rich-black/5 text-rich-black/40" />
            ))}
            {item.date && <span className="text-xs text-rich-black/30 ml-1 font-mono">{item.date}</span>}
          </div>
        </div>
        {item.assigneeId && <Avatar memberId={item.assigneeId} size={22} />}
      </div>
    );
  };

  const Section = ({ title, count, children, emptyHint }) => (
    <div className="mb-7">
      <div className="flex items-baseline gap-2 mb-2">
        <h3 className="font-inter text-base font-semibold text-rich-black">{title}</h3>
        {count > 0 && <span className="font-mono text-xs text-rich-black/30">({count})</span>}
      </div>
      {count > 0 ? children : <p className="font-arizona text-sm text-rich-black/40 italic">{emptyHint}</p>}
    </div>
  );

  const totalToDo = assignedToMe.length + withComments.length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-inter text-2xl font-bold text-rich-black tracking-tight">
          Hey, {currentMember.name?.split(" ")[0] || "you"}.
        </h2>
        <p className="font-arizona text-sm text-rich-black/50 italic mt-1">
          What's yours right now —{" "}
          {totalToDo === 0
            ? "you're clear."
            : `${totalToDo} thing${totalToDo === 1 ? "" : "s"} looking for you.`}
        </p>
      </div>

      <Section
        title="Assigned to you"
        count={assignedToMe.length}
        emptyHint="Nothing on your plate. Pick something up from the Pipeline?"
      >
        {assignedToMe.map(item => <Row key={item.id} item={item} />)}
      </Section>

      <Section
        title="Conversations"
        count={withComments.length}
        emptyHint="No comments to catch up on."
      >
        {withComments.map(item => <Row key={item.id} item={item} />)}
      </Section>

      <Section
        title="Recently touched"
        count={recentlyUpdated.length}
        emptyHint="Quiet week so far."
      >
        {recentlyUpdated.map(item => <Row key={item.id} item={item} />)}
      </Section>

      {assignedToMe.length === 0 && withComments.length === 0 && recentlyUpdated.length === 0 && (
        <EmptyState
          icon="✓"
          title="All clear."
          description="Nothing assigned to you, no live conversations, nothing changed this week. Start something new, or take five."
        />
      )}
    </div>
  );
}
