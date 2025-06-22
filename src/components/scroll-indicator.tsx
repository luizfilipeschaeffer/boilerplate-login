"use client";

import { useEffect, useState, useRef, useLayoutEffect } from 'react';

interface Section {
  id: string;
  label: string;
}

interface ScrollIndicatorProps {
  sections: Section[];
}

const ScrollIndicator = ({ sections }: ScrollIndicatorProps) => {
  const [thumbPosition, setThumbPosition] = useState(0);
  const [sectionPositions, setSectionPositions] = useState<Record<string, number>>({});
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const dragStartData = useRef<{ offsetY: number } | null>(null);

  useLayoutEffect(() => {
    const calculatePositions = () => {
      if (!indicatorRef.current || !thumbRef.current) return;
      
      const indicatorHeight = indicatorRef.current.offsetHeight;
      const dotHeight = thumbRef.current.offsetHeight; // Usar a altura dinâmica do polegar
      const trackHeight = indicatorHeight - dotHeight;
      const gap = trackHeight / (sections.length - 1);

      const newPositions: Record<string, number> = {};
      sections.forEach((section, index) => {
        newPositions[section.id] = index * gap;
      });
      setSectionPositions(newPositions);
    };

    // Recalcula após um breve delay para garantir que o layout esteja estável
    const timeoutId = setTimeout(calculatePositions, 100);
    window.addEventListener('resize', calculatePositions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculatePositions);
    }
  }, [sections]);

  useEffect(() => {
    const scrollContainer = document.querySelector('.scroll-container');
    if (!scrollContainer || Object.keys(sectionPositions).length === 0) return;

    const handleScroll = () => {
      // Se estamos arrastando, a fonte da verdade é o mouse, não o scroll.
      if (isDragging) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) {
        setThumbPosition(sectionPositions[sections[0].id] || 0);
        return;
      }
      const scrollPercent = scrollTop / maxScroll;
      
      const firstDotTop = sectionPositions[sections[0].id];
      const lastDotTop = sectionPositions[sections[sections.length - 1].id];
      
      const thumbTrackHeight = lastDotTop - firstDotTop;
      const newThumbPosition = firstDotTop + (scrollPercent * thumbTrackHeight);

      setThumbPosition(newThumbPosition);

      let currentActiveId: string | null = null;
      const sortedSections = Object.entries(sectionPositions).sort(([, a], [, b]) => a - b);
      const thumbHeight = thumbRef.current?.offsetHeight || 32;
      const thumbCenterOffset = newThumbPosition + (thumbHeight / 2);
      for (const [id, pos] of sortedSections) {
        if (thumbCenterOffset >= pos) {
          currentActiveId = id;
        }
      }
      setActiveSectionId(currentActiveId);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [sections, sectionPositions, isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!thumbRef.current) return;
    e.preventDefault();
    dragStartData.current = {
      offsetY: e.clientY - thumbRef.current.getBoundingClientRect().top,
    };
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!thumbRef.current) return;
    const touch = e.touches[0];
    dragStartData.current = {
      offsetY: touch.clientY - thumbRef.current.getBoundingClientRect().top,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const getClientY = (e: MouseEvent | TouchEvent): number => {
      if (e instanceof MouseEvent) {
        return e.clientY;
      }
      return e.touches[0].clientY;
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !indicatorRef.current || !thumbRef.current || !dragStartData.current) return;
      
      const clientY = getClientY(e);
      const indicatorRect = indicatorRef.current.getBoundingClientRect();
      const thumbHeight = thumbRef.current.offsetHeight;

      const newTop = clientY - indicatorRect.top - dragStartData.current.offsetY;
      const maxTop = indicatorRect.height - thumbHeight;
      const clampedTop = Math.max(0, Math.min(newTop, maxTop));
      
      setThumbPosition(clampedTop);

      const scrollPercent = clampedTop / maxTop;
      const scrollContainer = document.querySelector('.scroll-container');
      if (scrollContainer) {
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        scrollContainer.scrollTop = scrollPercent * maxScroll;
      }
    };

    const handleRelease = () => {
      setIsDragging(false);
      dragStartData.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleRelease);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleRelease);
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleRelease);
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const scrollToSection = (id: string) => {
    const scrollContainer = document.querySelector('.scroll-container');
    if (!scrollContainer || Object.keys(sectionPositions).length === 0) return;

    const { scrollHeight, clientHeight } = scrollContainer;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return;

    const firstDotTop = sectionPositions[sections[0].id];
    const lastDotTop = sectionPositions[sections[sections.length - 1].id];
    const thumbTrackHeight = lastDotTop - firstDotTop;

    if (thumbTrackHeight <= 0) return; // Evita divisão por zero

    const targetThumbPosition = sectionPositions[id];
    if (targetThumbPosition === undefined) return;

    // Lógica Inversa: encontrar o scrollTop que corresponde à posição do ponto
    const targetScrollPercent = (targetThumbPosition - firstDotTop) / thumbTrackHeight;
    const targetScrollTop = targetScrollPercent * maxScroll;

    scrollContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
  };

  return (
    <>
      {/* Parte 1: A barra de fundo, que ficará atrás do conteúdo no mobile */}
      <div 
        className="fixed top-1/2 right-4 sm:right-12 -translate-y-1/2 z-10 sm:z-40 h-[70vh] w-4 sm:w-8 bg-gray-800/50 backdrop-blur-sm rounded-full"
      />

      {/* Parte 2: Os elementos interativos, que ficarão sempre na frente */}
      <div 
        ref={indicatorRef} 
        className="fixed top-1/2 right-4 sm:right-12 -translate-y-1/2 z-40 h-[70vh] w-4 sm:w-8"
      >
        {/* Section Dots */}
        {Object.entries(sectionPositions).map(([id, top]) => {
            const section = sections.find(s => s.id === id);
            return (
                <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className="group absolute w-full h-4 sm:h-8 flex items-center justify-center"
                    style={{ top: `${top}px` }}
                    aria-label={`Scroll to ${section?.label}`}
                >
                    <div className={`absolute right-full mr-3 sm:mr-4 transition-opacity duration-300 ${activeSectionId === id ? 'opacity-100' : 'opacity-0'}`}>
                      <div className="bg-gray-800 border border-gray-700 text-white text-xs rounded-md py-1 px-2 whitespace-nowrap">
                          {section?.label}
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full bg-gray-500/80 transition-colors group-hover:bg-white" />
                </button>
            )
        })}

        {/* Thumb */}
        <div 
          ref={thumbRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="absolute w-4 h-4 sm:w-8 sm:h-8 rounded-full bg-blue-500 transition-all duration-75 ease-linear left-0 cursor-grab active:cursor-grabbing"
          style={{ top: `${thumbPosition}px` }}
        />
      </div>
    </>
  );
};

export default ScrollIndicator; 