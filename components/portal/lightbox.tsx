"use client";

import { useEffect, useRef, useState } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

function clampScale(value: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function touchDistance(touches: React.TouchList) {
  const a = touches[0];
  const b = touches[1];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

// Área com zoom/pan de uma única imagem. Montada com key={index} pelo
// Lightbox, então trocar de foto remonta o componente e já nasce sem zoom
// (evita precisar resetar estado via effect).
function ZoomableImage({ url, alt }: { url: string; alt: string }) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [interacting, setInteracting] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);

  function resetZoom() {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const next = clampScale(scale - e.deltaY * 0.0015 * scale);
    setScale(next);
    if (next === MIN_SCALE) setTranslate({ x: 0, y: 0 });
  }

  function handleDoubleClick() {
    if (scale > MIN_SCALE) resetZoom();
    else setScale(2.5);
  }

  function handleTouchStart(e: React.TouchEvent) {
    setInteracting(true);
    if (e.touches.length === 2) {
      pinchRef.current = { startDist: touchDistance(e.touches), startScale: scale };
    } else if (e.touches.length === 1 && scale > MIN_SCALE) {
      const t = e.touches[0];
      dragRef.current = { startX: t.clientX, startY: t.clientY, originX: translate.x, originY: translate.y };
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = touchDistance(e.touches);
      setScale(clampScale(pinchRef.current.startScale * (dist / pinchRef.current.startDist)));
    } else if (e.touches.length === 1 && dragRef.current) {
      e.preventDefault();
      const t = e.touches[0];
      setTranslate({
        x: dragRef.current.originX + (t.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (t.clientY - dragRef.current.startY),
      });
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    setInteracting(false);
    if (e.touches.length < 2) pinchRef.current = null;
    if (e.touches.length === 0) dragRef.current = null;
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (scale === MIN_SCALE) return;
    setInteracting(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: translate.x, originY: translate.y };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    setTranslate({
      x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
    });
  }

  function stopDrag() {
    setInteracting(false);
    dragRef.current = null;
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none"
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- zoom via transform exige <img> simples, next/image não suporta escala dinâmica */}
      <img
        src={url}
        alt={alt}
        draggable={false}
        className="max-w-[92vw] max-h-[85vh] object-contain"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          cursor: scale > MIN_SCALE ? "grab" : "zoom-in",
          transition: interacting ? "none" : "transform 150ms ease-out",
        }}
      />
    </div>
  );
}

// Visualizador em tela cheia sem dependência externa: zoom por duplo
// clique/scroll no desktop e por pinça/duplo toque no mobile, com pan quando
// ampliado. Segue o mesmo princípio do carrossel (sem libs externas).
export function Lightbox({
  urls,
  alt,
  index,
  onClose,
  onNavigate,
}: {
  urls: string[];
  alt: string;
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((index - 1 + urls.length) % urls.length);
      if (e.key === "ArrowRight") onNavigate((index + 1) % urls.length);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, urls.length, onClose, onNavigate]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center select-none"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white text-3xl leading-none hover:opacity-70"
      >
        ×
      </button>

      {urls.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => onNavigate((index - 1 + urls.length) % urls.length)}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center text-white text-3xl leading-none hover:opacity-70"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => onNavigate((index + 1) % urls.length)}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center text-white text-3xl leading-none hover:opacity-70"
          >
            ›
          </button>
        </>
      )}

      <ZoomableImage key={index} url={urls[index]} alt={`${alt} ${index + 1}`} />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70">
        {urls.length > 1 && <span className="text-xs">{index + 1} / {urls.length}</span>}
        <span className="text-[11px] hidden sm:inline">Duplo clique ou role o mouse para ampliar</span>
        <span className="text-[11px] sm:hidden">Toque duas vezes ou belisque para ampliar</span>
      </div>
    </div>
  );
}
