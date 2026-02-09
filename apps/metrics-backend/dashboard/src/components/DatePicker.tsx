interface DatePickerProps {
  period: 'daily' | 'monthly';
  date: string;
  onPeriodChange: (period: 'daily' | 'monthly') => void;
  onDateChange: (date: string) => void;
}

export function DatePicker({ period, date, onPeriodChange, onDateChange }: DatePickerProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <select
        value={period}
        onChange={(e) => onPeriodChange(e.target.value as 'daily' | 'monthly')}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          backgroundColor: 'white',
          fontSize: '14px',
        }}
      >
        <option value="monthly">Monthly</option>
        <option value="daily">Daily</option>
      </select>
      
      <input
        type={period === 'monthly' ? 'month' : 'date'}
        value={date}
        onChange={(e) => onDateChange(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          backgroundColor: 'white',
          fontSize: '14px',
        }}
      />
    </div>
  );
}
