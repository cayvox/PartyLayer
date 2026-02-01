import { useState, useEffect } from 'react';
import { usePartyLayer } from '@partylayer/react';
import type { PartyLayerError, ErrorEvent } from '@partylayer/sdk';
import './ErrorPanel.css';

function ErrorPanel() {
  const client = usePartyLayer();
  const [currentError, setCurrentError] = useState<PartyLayerError | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleError = (event: ErrorEvent) => {
      if (event.error instanceof Error && 'code' in event.error) {
        setCurrentError(event.error as PartyLayerError);
        // Clear any existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // Auto-clear error after 10 seconds
        timeoutId = setTimeout(() => {
          setCurrentError(null);
        }, 10000);
      }
    };

    const unsubscribe = client.on('error', handleError);

    return () => {
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [client]);

  if (!currentError) {
    return null;
  }

  return (
    <div className="panel full-width">
      <div className="error-panel">
        <h3>Error</h3>
        <div className="error-code">{currentError.code}</div>
        <div className="error-message">{currentError.message}</div>
        <button
          className="button"
          onClick={() => setCurrentError(null)}
          style={{ marginTop: '12px', padding: '8px 16px', fontSize: '0.9rem' }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default ErrorPanel;
