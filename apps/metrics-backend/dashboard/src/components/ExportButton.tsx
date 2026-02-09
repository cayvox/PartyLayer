interface ExportButtonProps {
  date: string;
  apiBase: string;
}

export function ExportButton({ date, apiBase }: ExportButtonProps) {
  const handleExport = async () => {
    // Extract month from date
    const month = date.slice(0, 7);
    
    // Open export URL in new tab (CSV download)
    window.open(`${apiBase}/api/v1/export?month=${month}&format=csv`, '_blank');
  };

  return (
    <button
      onClick={handleExport}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#4299e1',
        color: 'white',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export CSV
    </button>
  );
}
