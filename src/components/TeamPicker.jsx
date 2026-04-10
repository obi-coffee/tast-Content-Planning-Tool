import React from 'react'
import { TEAM_MEMBERS } from '../lib/team'

export default function TeamPicker({ onChoose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] font-inter">
      <div className="bg-london-fog rounded-2xl p-10 max-w-[400px] w-[90%] text-center">
        <h2 className="font-inter text-3xl font-bold text-rich-black mb-2">
          tast content ops
        </h2>
        <p className="text-rich-black/40 text-sm mb-8">
          Who are you?
        </p>
        <div className="flex flex-col gap-3">
          {TEAM_MEMBERS.map(m => (
            <button
              key={m.id}
              onClick={() => onChoose(m.id)}
              className="flex items-center gap-4 px-5 py-3.5 rounded-xl border-2 bg-transparent cursor-pointer transition-all duration-150 hover:shadow-sm"
              style={{ borderColor: m.color }}
              onMouseEnter={e => e.currentTarget.style.background = m.color + '12'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0 font-inter"
                style={{ background: m.color }}
              >
                {m.initials}
              </div>
              <span className="text-base font-semibold text-rich-black font-inter">
                {m.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
