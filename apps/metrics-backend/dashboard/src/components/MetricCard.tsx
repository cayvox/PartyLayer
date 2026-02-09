interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export function MetricCard({ title, value, subtitle, color = '#4299e1' }: MetricCardProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ color: '#718096', fontSize: '14px', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '32px', 
        fontWeight: 700, 
        color: '#1a202c',
        marginBottom: '4px'
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div style={{ color: '#a0aec0', fontSize: '12px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
