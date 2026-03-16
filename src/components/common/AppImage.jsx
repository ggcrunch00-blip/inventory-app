import { useEffect, useState } from 'react';

export default function AppImage({ src, fallbackSrc, alt, className = '' }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      className={className}
      src={currentSrc || fallbackSrc}
      alt={alt}
      onError={() => {
        if (src && currentSrc === src && src.startsWith('/items/')) {
          setCurrentSrc(`/assets${src}`);
          return;
        }

        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
