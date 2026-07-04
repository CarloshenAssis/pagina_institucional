"use client";

import { useRef } from "react";
import Image from "next/image";

// Carrossel deslizável sem dependência externa: scroll horizontal nativo com
// snap (funciona por toque/swipe sozinho) + setas para clique no desktop.
export function GalleryCarousel({ urls, alt }: { urls: string[]; alt: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByPage(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  }

  if (urls.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {urls.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative shrink-0 w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.667rem)] aspect-[4/3] snap-start"
          >
            <Image
              src={url}
              alt={`${alt} ${i + 1}`}
              fill
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {urls.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => scrollByPage(-1)}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-background/90 border shadow hover:bg-background text-lg"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => scrollByPage(1)}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center bg-background/90 border shadow hover:bg-background text-lg"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
