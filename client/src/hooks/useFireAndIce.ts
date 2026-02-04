import { useEffect } from 'react';

export function useFireAndIce() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/scripts/firenice.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
}
