import { useEffect, useState } from 'react';
import { StockfishEngine } from './stockfishWorker';

export function useEngine(): StockfishEngine | null {
  const [engine, setEngine] = useState<StockfishEngine | null>(null);
  useEffect(() => {
    const e = new StockfishEngine();
    setEngine(e);
    return () => {
      e.dispose();
      setEngine(null);
    };
  }, []);
  return engine;
}
