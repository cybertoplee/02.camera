'use client';

import React, { useEffect, useState } from 'react';

export default function CCTVPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const basePath = process.env.NEXT_PUBLIC_EGDESK_BASE_PATH || '';

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src={`${basePath}/cctv/index.html`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="camera; microphone; autoplay; display-capture"
      />
    </div>
  );
}
