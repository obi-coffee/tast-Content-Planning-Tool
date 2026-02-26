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
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 500, fontFamily: 'Arial, sans-serif',
    }} onClick={onClose}>
      <div style={{
        background: '#FBF9F3', borderRadius: '16px 16px 0 0',
        width: '100%', maxWidth: 600, maxHeight: '70vh',
        display: 'flex', flexDirection: 'column',
        padding: '24px 24px 0',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: '"Times New Roman", serif', fontSize: 20, fontWeight: 400, margin: 0 }}>
            Comments
          </h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20,
            cursor: 'pointer', color: '#757575', padding: 4,
          }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, marginBottom: 16 }}>
          {loading && <p style={{ color: '#757575', fontSize: 13 }}>Loading...</p>}
          {!loading && comments.length === 0 && (
            <p style={{ color: '#757575', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              No comments yet. Be the first!
            </p>
          )}
          {comments.map(c => {
            const author = getMember(c.author_id)
            const isMe = currentMember?.id === c.author_id
            return (
              <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: author?.color || '#757575',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                  flexShrink: 0, fontFamily: '"Times New Roman", serif',
                }}>
                  {author?.initials || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
                      {c.author_name}
                    </span>
                    <span style={{ fontSize: 11, color: '#757575' }}>
                      {timeAgo(c.created_at)}
                    </span>
                    {isMe && (
                      <button onClick={() => deleteComment(c.id)} style={{
                        marginLeft: 'auto', background: 'none', border: 'none',
                        color: '#ccc', fontSize: 11, cursor: 'pointer', padding: 0,
                      }}>delete</button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#333', lineHeight: 1.5 }}>
                    {c.text}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        <div style={{
          borderTop: '1px solid #e8e4dd', padding: '16px 0',
          display: 'flex', gap: 10,
        }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
            placeholder="Add a comment..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8,
              border: '1.5px solid #e0dcd5', background: '#fff',
              fontSize: 13, fontFamily: 'Arial, sans-serif', outline: 'none',
            }}
          />
          <button onClick={handleSubmit} style={{
            padding: '10px 20px', borderRadius: 8,
            background: '#F05881', border: 'none', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
          }}>
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
