import { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();

export function useMonday() {
  const [context, setContext] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  useEffect(() => {
    monday.listen('context', (res) => setContext(res.data));
    monday.get('sessionToken').then((res) => setSessionToken(res.data));
  }, []);

  return { monday, context, sessionToken };
}
