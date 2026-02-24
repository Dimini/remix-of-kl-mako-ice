import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function DisclaimerBar() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('disclaimer-dismissed');
    if (!wasDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('disclaimer-dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 text-xs sm:text-sm"
      style={{ backgroundColor: '#F1F8E9', borderLeft: '4px solid #2E7D32', minHeight: '36px' }}
    >
      <p className="text-muted-foreground flex-1">
        Klíma ťa potrebuje je nezávislá iniciatíva. Toto nie je volebná kampaň — nikoho neodporúčame.
      </p>
      <button
        onClick={handleDismiss}
        className="ml-4 p-1 hover:bg-black/5 rounded shrink-0"
        aria-label="Zavrieť"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}
