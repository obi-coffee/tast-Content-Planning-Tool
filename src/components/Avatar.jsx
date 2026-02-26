import React from 'react'
import { getMember, TEAM_MEMBERS } from '../lib/team'

export function Avatar({ memberId, size = 28, showName = false }) {
  const member = getMember(memberId)
  if (!member) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: member.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42, fontWeight: 700, color: '#fff',
        fontFamily: '"Times New Roman", serif',
        flexShrink: 0,
      }}>
        {member.initials}
      </div>
      {showName && (
        <span style={{ fontSize: 13, color: '#757575', fontFamily: 'Arial, sans-serif' }}>
          {member.name}
        </span>
      )}
    </div>
  )
}

export function AssigneeSelector({ value, onChange, label = 'Assign to' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#757575', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => onChange(null)}
          style={{
            padding: '4px 12px', borderRadius: 20, border: '1.5px solid #e0dcd5',
            background: !value ? '#757575' : 'transparent',
            color: !value ? '#fff' : '#757575',
            fontSize: 12, cursor: 'pointer', fontFamily: 'Arial, sans-serif',
          }}
        >
          Unassigned
        </button>
        {TEAM_MEMBERS.map(m => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px 4px 6px', borderRadius: 20,
              border: `1.5px solid ${value === m.id ? m.color : '#e0dcd5'}`,
              background: value === m.id ? m.color : 'transparent',
              color: value === m.id ? '#fff' : '#757575',
              fontSize: 12, cursor: 'pointer', fontFamily: 'Arial, sans-serif',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: value === m.id ? 'rgba(255,255,255,0.35)' : m.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff',
            }}>
              {m.initials}
            </div>
            {m.name}
          </button>
        ))}
      </div>
    </div>
  )
}
