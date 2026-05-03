'use client';

interface StatusBadgeProps {
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', color: '#F59E0B' },
  { value: 'confirmed', label: 'Confirmée', color: '#10B981' },
  { value: 'shipped', label: 'Expédiée', color: '#3B82F6' },
  { value: 'delivered', label: 'Livrée', color: '#059669' },
  { value: 'cancelled', label: 'Annulée', color: '#EF4444' },
];

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = STATUS_OPTIONS.find(x => x.value === status) ?? STATUS_OPTIONS[0];
  
  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      background: s.color + '15',
      color: s.color,
      border: `1px solid ${s.color}30`
    }}>
      {s.label}
    </span>
  );
}