export const TEAM_MEMBERS = [
  { id: 'obi',    name: 'Obi',    initials: 'O',  color: '#F05881' },
  { id: 'reggie', name: 'Reggie', initials: 'R',  color: '#a12f52' },
  { id: 'maggie', name: 'Maggie', initials: 'M',  color: '#ef4056' },
  { id: 'jason',  name: 'Jason',  initials: 'J',  color: '#757575' },
]

export function getMember(id) {
  return TEAM_MEMBERS.find(m => m.id === id) || null
}
