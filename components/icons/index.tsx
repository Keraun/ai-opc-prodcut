export function IconPlus({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

export function IconEdit({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

export function IconDelete({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
    </svg>
  )
}

export function IconEye({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

export function IconEyeOpened({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

export function IconSave({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M19,21H5a2,2,0,0,1-2-2V5a2,2,0,0,1,2-2h11l5,5V19A2,2,0,0,1,19,21Z"/>
      <polyline points="17,21 17,13 7,13 7,21"/>
      <polyline points="7,3 7,8 15,8"/>
    </svg>
  )
}

export function IconCheck({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export function IconArrowLeft({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}

export function IconDragDotVertical({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="5" r="1"/>
      <circle cx="12" cy="12" r="1"/>
      <circle cx="12" cy="19" r="1"/>
    </svg>
  )
}

export function IconSettings({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4,15a1,1,0,0,0,.4,1.3l0,0a1,1,0,0,0,1.3-.4l.9-1.7a1,1,0,0,0-.4-1.3l0,0a1,1,0,0,0-1.3.4Z" transform="rotate(-30 12 12)"/>
      <path d="M19.4,15a1,1,0,0,0,.4,1.3l0,0a1,1,0,0,0,1.3-.4l.9-1.7a1,1,0,0,0-.4-1.3l0,0a1,1,0,0,0-1.3.4Z" transform="rotate(30 12 12)"/>
      <path d="M19.4,15a1,1,0,0,0,.4,1.3l0,0a1,1,0,0,0,1.3-.4l.9-1.7a1,1,0,0,0-.4-1.3l0,0a1,1,0,0,0-1.3.4Z" transform="rotate(90 12 12)"/>
      <path d="M19.4,15a1,1,0,0,0,.4,1.3l0,0a1,1,0,0,0,1.3-.4l.9-1.7a1,1,0,0,0-.4-1.3l0,0a1,1,0,0,0-1.3.4Z" transform="rotate(150 12 12)"/>
      <path d="M19.4,15a1,1,0,0,0,.4,1.3l0,0a1,1,0,0,0,1.3-.4l.9-1.7a1,1,0,0,0-.4-1.3l0,0a1,1,0,0,0-1.3.4Z" transform="rotate(210 12 12)"/>
      <path d="M19.4,15a1,1,0,0,0,.4,1.3l0,0a1,1,0,0,0,1.3-.4l.9-1.7a1,1,0,0,0-.4-1.3l0,0a1,1,0,0,0-1.3.4Z" transform="rotate(270 12 12)"/>
    </svg>
  )
}

export function IconApps({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

export function IconUnorderedList({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}
