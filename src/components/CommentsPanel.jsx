import React, { useState, useRef, useEffect } from 'react'
import { useComments } from '../hooks/useComments'
import { getMember } from '../lib/team'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function CommentsPanel({ itemId, currentMember, onClose }) {
  const { comments, loading, addComment, deleteComment } = useComments(itemId)
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const handleSubmit = async () => {
    if (!text.trim() || !currentMember) return
    await addComment(text.trim(), currentMember.id, currentMember.name)
    setText('')
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-[500] font-inter"
      onClick={onClose}
    >
      <div
        className="bg-london-fog rounded-t-2xl w-full max-w-[600px] max-h-[70vh] flex flex-col pt-6 px-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-inter text-xl font-bold text-rich-black">
            Comments
          </h3>
          <button
            onClick={onClose}
            className="text-rich-black/30 hover:text-rich-black text-xl p-1 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Comments list */}
        <div className="overflow-y-auto flex-1 mb-4">
          {loading && (
            <p className="text-rich-black/30 text-xs font-mono uppercase tracking-wider text-center py-6">Loading...</p>
          )}
          {!loading && comments.length === 0 && (
            <p className="text-rich-black/30 text-sm text-center py-8">
              No comments yet. Be the first!
            </p>
          )}
          {comments.map(c => {
            const author = getMember(c.author_id)
            const isMe = currentMember?.id === c.author_id
            return (
              <div key={c.id} className="flex gap-2.5 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 font-inter"
                  style={{ background: author?.color || '#1A1A1A40' }}
                >
                  {author?.initials || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-rich-black">
                      {c.author_name}
                    </span>
                    <span className="text-[11px] font-mono text-rich-black/30">
                      {timeAgo(c.created_at)}
                    </span>
                    {isMe && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        className="ml-auto text-rich-black/20 hover:text-no3 text-[11px] transition-colors"
                      >
                        delete
                      </button>
                    )}
                  </div>
                  <p className="text-[13px] text-rich-black/70 leading-relaxed font-body">
                    {c.text}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-rich-black/8 py-4 flex gap-2.5">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Add a comment..."
            className="flex-1 px-3.5 py-2.5 rounded-lg border-[1.5px] border-rich-black/12 bg-white text-[13px] font-inter text-rich-black outline-none focus:ring-2 focus:ring-pink/20 focus:border-pink/40 transition-colors"
          />
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-lg bg-pink text-white text-[13px] font-semibold font-inter cursor-pointer hover:opacity-90 transition-opacity"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
