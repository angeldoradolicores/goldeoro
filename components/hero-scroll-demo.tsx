"use client";
import React, { useEffect, useState } from "react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import { motion } from "framer-motion";
import SparklesUI from './sparkles'; // Asegúrate de ajustar la ruta

export function HeroScrollDemo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: '#080b11' }}>

      {/* ── Fondo igual al primer componente ────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src="/fondo_panini.png"
          alt="Estadio"
          className="w-full h-full object-cover opacity-20 mix-blend-screen"
        />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `
              radial-gradient(circle at 50% 0%, rgba(252,209,22,0.15) 0%, transparent 10%),
              radial-gradient(circle at 0% 50%, rgba(0,56,147,0.15) 0%, transparent 10%),
              radial-gradient(circle at 100% 100%, rgba(206,17,38,0.15) 0%, transparent 10%),
              linear-gradient(to bottom, #080b11 0%, rgba(8,11,17,0.85) 10%, #080b11 100%)
            `,
          }}
        />
        {mounted && <SparklesUI />}
      </div>

      {/* ── Contenido con el fondo aplicado ────────────── */}
      <div className="relative z-10 w-full">
        <ContainerScroll
          titleComponent={
            <>
              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: 'var(--font-cinzel)',
                  fontSize: 'clamp(2.5rem, 7vw, 6.5rem)',
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #FCD116 0%, #003893 50%, #CE1126 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CONSIGUE AQUI <br />
                <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                  EL ALBUM PANINI 2026
                </span>
              </motion.h1>
            </>
          }
        >
          <img
            src={`/Album-panini-colombia-2026.webp`}
            alt="hero"
            height={540}
            width={900}
            className="mx-auto rounded-2xl object-cover h-full object-center md:object-left-top"
            draggable={false}
          />
        </ContainerScroll>
      </div>
    </div>
  );
}