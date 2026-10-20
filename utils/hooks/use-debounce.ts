import { useState, useEffect } from 'react';

export default function useDebounce<Value>(value: Value, timeout: number): Value {
  const [state, setState] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setState(value), timeout);

    return () => clearTimeout(handler);
  }, [value, timeout]);

  return state;
}
