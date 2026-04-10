import React from 'react'
import { getMember, TEAM_MEMBERS } from '../lib/team'

export function Avatar({ memberId, size = 28, showName = false }) {
  const member = getMember(memberId)
  if (!member) return null

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="rounded-full flex items-center justify-center font-bold text-white shrink-0 font-inter"
        style={{
          width: size, height: size,
          background: member.color,
          fontSize: size * 0.42,
        }}
      >
        {member.initials}
      </div>
      {showName && (
        <span className="text-[13px] text-rich-black/50 font-inter">
          {member.name}
        </span>
      )}
    </div>
  )
}

export function AssigneeSelector({ value, onChange, label = 'Assign to' }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-mono text-[9px] uppercase tracking-widest text-rich-black/40">{label}</label>}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onChange(null)}
          className="px-3 py-1 rounded-full border-[1.5px] text-xs cursor-pointer font-inter transition-all duration-150"
          style={{
            borderColor: !value ? '#1A1A1A' : '#1A1A1A20',
            background: !value ? '#1A1A1A' : 'transparent',
            color: !value ? '#fff' : '#1A1A1A80',
          }}
        >
          Unassigned
        </button>
        {TEAM_MEMBERS.map(m => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className="flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full border-[1.5px] text-xs cursor-pointer font-inter transition-all duration-150"
            style={{
              borderColor: value === m.id ? m.color : '#1A1A1A15',
              background: value === m.id ? m.color : 'transparent',
              color: value === m.id ? '#fff' : '#1A1A1A60',
            }}
          >
            <div
              className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: value === m.id ? 'rgba(255,255,255,0.35)' : m.color }}
            >
              {m.initials}
            </div>
            {m.name}
          </button>
        ))}
      </div>
    </div>
  )
}
