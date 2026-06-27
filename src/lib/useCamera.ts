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
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('SECURE_CONTEXT_REQUIRED');
      }
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('NO_MEDIA_DEVICES');
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
      let errMsg = err.message || '카메라를 시작할 수 없습니다.';
      if (err.message === 'SECURE_CONTEXT_REQUIRED' || (typeof window !== 'undefined' && !window.isSecureContext)) {
        errMsg = '보안 연결(HTTPS)이 필요합니다.\n모바일 기기로 외부/LAN에서 접속 시 보안(SSL)인증서가 활성화된 https:// 주소로 접속해야 카메라를 사용할 수 있습니다.\n(또는 Chrome 브라우저의 unsafely-treat-insecure-origin-as-secure 플래그에 접속 주소를 등록해주세요.)';
      } else if (err.message === 'NO_MEDIA_DEVICES') {
        errMsg = '카메라 장치를 사용할 수 없습니다. 권한 설정을 확인하거나 다른 앱에서 카메라를 사용 중인지 확인해주세요.';
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = '카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = '카메라 하드웨어를 찾을 수 없습니다. 기기에 카메라가 올바르게 연결되어 있는지 확인해주세요.';
      } else if (err.name === 'NotReadableError') {
        errMsg = '카메라가 이미 다른 프로그램(예: 줌, 카카오톡, 다른 브라우저 탭)에서 사용 중입니다.';
      } else if (err.name === 'AbortError') {
        errMsg = '카메라를 시작하는 중 시간이 초과되었습니다. 카메라가 멈췄거나, 백신 프로그램 및 하드웨어 설정(프라이버시 셔터)에 의해 차단되었을 수 있습니다.';
      }
      setError(errMsg);
      throw new Error(errMsg);
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

  const clearError = useCallback(() => {
    setError('');
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { stream, error, start, stop, toggle, clearError };
}
