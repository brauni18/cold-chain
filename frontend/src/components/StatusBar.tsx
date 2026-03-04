interface StatusBarProps {
  total: number;
  online: number;
  normal: number;
  warning: number;
  critical: number;
}

function TotalIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
    </svg>
  );
}

function OnlineIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2l3-9 4 18 3-9h2m1 0h3" />
    </svg>
  );
}

function NormalIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function CriticalIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

const cards = [
  {
    label: 'Total Units',
    key: 'total' as const,
    icon: TotalIcon,
    iconColor: 'text-cyan-400',
    tileBg: 'bg-cyan-400/10',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-400/20',
    glowClass: 'text-glow-cyan',
  },
  {
    label: 'Online',
    key: 'online' as const,
    icon: OnlineIcon,
    iconColor: 'text-emerald-400',
    tileBg: 'bg-emerald-400/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-400/20',
    glowClass: 'text-glow-green',
  },
  {
    label: 'Normal',
    key: 'normal' as const,
    icon: NormalIcon,
    iconColor: 'text-emerald-400',
    tileBg: 'bg-emerald-400/10',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-400/20',
    glowClass: 'text-glow-green',
  },
  {
    label: 'Warning',
    key: 'warning' as const,
    icon: WarningIcon,
    iconColor: 'text-amber-400',
    tileBg: 'bg-amber-400/10',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-400/20',
    glowClass: 'text-glow-yellow',
  },
  {
    label: 'Critical',
    key: 'critical' as const,
    icon: CriticalIcon,
    iconColor: 'text-red-400',
    tileBg: 'bg-red-400/10',
    textColor: 'text-red-400',
    borderColor: 'border-red-400/20',
    glowClass: 'text-glow-red',
  },
];

export function StatusBar({ total, online, normal, warning, critical }: StatusBarProps) {
  const values = { total, online, normal, warning, critical };

  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={`
              flex items-center gap-3 bg-card-gradient rounded-xl p-3.5
              border ${card.borderColor} shadow-card
              transition-all duration-300 hover:shadow-lg
            `}
          >
            {/* Icon tile — recessed */}
            <div
              className={`
                w-10 h-10 rounded-lg flex-shrink-0
                flex items-center justify-center
                ${card.tileBg} ${card.iconColor}
                shadow-tile-inset
              `}
            >
              <Icon />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium truncate">
                {card.label}
              </p>
              <p className={`text-xl font-bold mt-0.5 ${card.textColor} ${card.glowClass} tabular-nums leading-tight`}>
                {card.key === 'online' ? `${online}/${total}` : values[card.key]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}