import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (!toast.undoAction) {
      const timer = setTimeout(() => {
        setExiting(true)
        setTimeout(() => onDismiss(toast.id), 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 5000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.undoAction, onDismiss])

  const typeStyles = {
    success: { bg: '#f0fdf4', border: '#86efac', color: '#166534', icon: '\u2713' },
    error:   { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b', icon: '!' },
    info:    { bg: '#fff0f4', border: '#F287B7', color: '#A23053', icon: '\u2139' },
  }
  const s = typeStyles[toast.type] || typeStyles.info

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300"
      style={{
        background: s.bg,
        borderColor: s.border,
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(10px)' : 'translateY(0)',
        maxWidth: 420,
      }}
    >
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: s.color }}>{s.icon}</span>
      <p className="text-sm font-medium flex-1" style={{ color: s.color }}>{toast.message}</p>
      {toast.undoAction && (
        <button
          onClick={() => { toast.undoAction(); onDismiss(toast.id) }}
          className="text-xs font-bold px-2 py-1 rounded-lg hover:opacity-70 transition-opacity shrink-0"
          style={{ color: '#F05881', background: '#F0588118' }}
        >
          Undo
        </button>
      )}
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300) }}
        className="text-xs opacity-40 hover:opacity-70 shrink-0"
        style={{ color: s.color }}
      >
        {"×"}
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', undoAction = null) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, undoAction }])
    return id
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message, type, undoAction) => addToast(message, type, undoAction), [addToast])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 items-center">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
