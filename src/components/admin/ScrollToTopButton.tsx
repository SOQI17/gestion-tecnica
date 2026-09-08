import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  // Rendered via portal directly into <body> so it always floats relative to the
  // real viewport, even if a styled ancestor (transform/filter/backdrop-blur)
  // would otherwise turn it into the containing block for position:fixed.
  return createPortal(
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="sm:hidden print:hidden fixed bottom-5 right-4 z-[9999] w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/40 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <ArrowUp className="w-5 h-5" />
    </button>,
    document.body
  );
};
