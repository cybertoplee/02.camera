import { useState, useCallback, useRef, useEffect } from 'react';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    try {
      if (streamRef.current) {
        return streamRef.current;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setError('');
      return mediaStream;
    } catch (err: any) {
      console.error('Camera start error:', err);
      setError(err.message || 'Failed to start camera');
      throw err;
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (streamRef.current) {
      stop();
    } else {
      await start();
    }
  }, [start, stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { stream, error, start, stop, toggle };
}
