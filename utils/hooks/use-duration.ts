import { useEffect, useState } from 'react';

export default function useDuration() {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDuration((time) => time + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return { duration };
}
