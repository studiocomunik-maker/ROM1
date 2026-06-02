"use client";

import { useEffect, useRef, useState } from "react";

export default function TextBand({
  eyebrow,
  text,
  body,
  align,
  size,
  color,
}: {
  eyebrow?: string;
  text?: string;
  body?: string;
  align?: "left" | "center" | "right";
  size?: "s" | "m" | "l";
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sizeCls =
    size === "l"
      ? "text-[clamp(2rem,6vw,4.5rem)]"
      : size === "s"
        ? "text-[clamp(1.1rem,2.5vw,1.8rem)]"
        : "text-[clamp(1.5rem,4vw,3rem)]";
  const padCls = size === "l" ? "py-28" : size === "s" ? "py-12" : "py-20";
  const alignText = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const alignBlock = align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "";
  const words = (text ?? "").split(/\s+/).filter(Boolean);

  return (
    <div
      ref={ref}
      className={`px-6 md:px-12 ${padCls} ${alignText}`}
      style={{ color: color || undefined }}
    >
      {eyebrow && (
        <p
          className="mb-4 font-display text-xs uppercase tracking-[0.3em] text-orange transition-all duration-700 ease-out"
          style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(8px)" }}
        >
          {eyebrow}
        </p>
      )}
      {words.length > 0 && (
        <p className={`font-display uppercase leading-[0.95] tracking-tight ${sizeCls} ${alignBlock} max-w-[24ch]`}>
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span
                className="inline-block will-change-transform"
                style={{
                  transitionProperty: "transform, opacity",
                  transitionDuration: "0.7s",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: `${i * 60}ms`,
                  transform: show ? "translateY(0)" : "translateY(110%)",
                  opacity: show ? 1 : 0,
                }}
              >
                {w}
              </span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      )}
      {body && (
        <p
          className={`mt-5 max-w-[48ch] text-base leading-relaxed opacity-80 md:text-lg ${alignBlock} transition-all duration-700 ease-out`}
          style={{
            opacity: show ? 0.8 : 0,
            transform: show ? "translateY(0)" : "translateY(10px)",
            transitionDelay: `${Math.min(words.length, 8) * 60 + 80}ms`,
          }}
        >
          {body}
        </p>
      )}
    </div>
  );
}
