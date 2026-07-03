"use client";

import { useEffect } from "react";

/** Filmora-style reveal-on-scroll, observing .reveal/.reveal-left/.reveal-right/.stagger-cards. */
export default function RevealObserver() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const els = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .stagger-cards"
    );
    els.forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  return null;
}
