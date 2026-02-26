import { useState, useEffect } from 'react'
import { getMember } from '../lib/team'

const STORAGE_KEY = 'tast_team_member'

export function useTeamMember() {
  const [memberId, setMemberId] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [showPicker, setShowPicker] = useState(!localStorage.getItem(STORAGE_KEY))

  const member = getMember(memberId)

  const chooseMember = (id) => {
    localStorage.setItem(STORAGE_KEY, id)
    setMemberId(id)
    setShowPicker(false)
  }

  const switchMember = () => setShowPicker(true)

  return { member, showPicker, chooseMember, switchMember }
}
