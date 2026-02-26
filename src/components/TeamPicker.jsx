import React from 'react'
import { TEAM_MEMBERS } from '../lib/team'

export default function TeamPicker({ onChoose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        background: '#FBF9F3', borderRadius: 16, padding: 40,
        maxWidth: 400, width: '90%', textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: '"Times New Roman", serif',
          fontSize: 28, fontWeight: 400, color: '#1a1a1a',
          marginBottom: 8,
        }}>
          tāst content ops
        </h2>
        <p style={{ color: '#757575', fontSize: 14, marginBottom: 32 }}>
          Who are you?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {TEAM_MEMBERS.map(m => (
            <button
              key={m.id}
              onClick={() => onChoose(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px', borderRadius: 12,
                border: `2px solid ${m.color}`,
                background: 'transparent', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = m.color + '15'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: m.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: '#fff',
                fontFamily: '"Times New Roman", serif',
                flexShrink: 0,
              }}>
                {m.initials}
              </div>
              <span style={{
                fontSize: 16, fontWeight: 600, color: '#1a1a1a',
              }}>
                {m.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
