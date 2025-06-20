'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingBar from 'react-top-loading-bar';

const NextTopLoader = () => {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Inicia a barra em 30% e a completa após um pequeno atraso
    // para simular o carregamento da página.
    setProgress(30);
    const timer = setTimeout(() => setProgress(100), 300);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return (
    <LoadingBar
      height={3}
      color="#2563eb"
      progress={progress}
      onLoaderFinished={() => setProgress(0)}
      waitingTime={400}
      shadow={true}
    />
  );
};

export default NextTopLoader; 