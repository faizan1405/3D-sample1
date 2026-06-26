import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import bookCoverAsset from "@/assets/book-cover-full.jpeg.asset.json";
import realmImg from "@/assets/realm-wide.jpg";
import portalImg from "@/assets/portal.jpg";
import silhouetteImg from "@/assets/silhouette.jpg";

const COVER_URL = bookCoverAsset.url;
// The uploaded asset is the FULL book wrap (back | spine | front).
// Crop to just the front cover (right ~48%) via background-position.
const FRONT_COVER_STYLE: React.CSSProperties = {
  backgroundImage: `url(${COVER_URL})`,
  backgroundSize: "208% 100%",
  backgroundPosition: "100% 50%",
  backgroundRepeat: "no-repeat",
};

/* ============== Atmosphere layers ============== */
function Stars({ count = 120 }: { count?: number }) {
  const stars = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 1.6 + 0.4,
      d: Math.random() * 4,
    }))
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.current.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            animationDelay: `${st.d}s`,
            boxShadow: "0 0 4px rgba(255,255,255,0.8)",
          }}
        />
      ))}
    </div>
  );
}

function GoldParticles({ count = 40, className = "" }: { count?: number; className?: string }) {
  const dots = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 3 + 1,
      d: Math.random() * 6,
      dur: 4 + Math.random() * 6,
    }))
  );
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {dots.current.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            background: "radial-gradient(circle, oklch(0.92 0.16 88) 0%, transparent 70%)",
            animation: `float-y ${p.dur}s ease-in-out ${p.d}s infinite`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}

function PaperFragments({ count = 14 }: { count?: number }) {
  const items = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 360,
      w: 18 + Math.random() * 30,
      h: 24 + Math.random() * 36,
      d: Math.random() * 8,
      dur: 8 + Math.random() * 10,
    }))
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.current.map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.w,
            height: p.h,
            transform: `rotate(${p.r}deg)`,
            background: "linear-gradient(135deg, #f5ecd6, #d9c890)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            opacity: 0.75,
            animation: `float-y ${p.dur}s ease-in-out ${p.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function VolumetricRays() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-[150%] opacity-40 mix-blend-screen animate-shimmer"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 0%, transparent 0deg, oklch(0.85 0.15 88 / 25%) 6deg, transparent 12deg, transparent 30deg, oklch(0.7 0.18 295 / 18%) 36deg, transparent 44deg, transparent 90deg, oklch(0.85 0.15 88 / 20%) 96deg, transparent 102deg, transparent 360deg)",
          filter: "blur(8px)",
        }}
      />
    </div>
  );
}

function FogLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -inset-x-1/2 bottom-0 h-2/3 opacity-70 animate-drift"
        style={{
          background:
            "radial-gradient(ellipse at 30% 80%, oklch(0.4 0.12 295 / 50%) 0%, transparent 60%), radial-gradient(ellipse at 70% 90%, oklch(0.5 0.08 280 / 40%) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />
    </div>
  );
}

/* ============== 3D Book ============== */
function Book3D({
  rotateY = -22,
  rotateX = 8,
  openAmount = 0,
  scale = 1,
}: {
  rotateY?: number;
  rotateX?: number;
  openAmount?: number; // 0..1 (right cover opens)
  scale?: number;
}) {
  // book dimensions
  const W = 320;
  const H = 460;
  const D = 38; // spine depth

  return (
    <div
      style={{
        perspective: "2000px",
        width: W,
        height: H,
        transform: `scale(${scale})`,
        filter: "drop-shadow(0 60px 50px rgba(0,0,0,0.7))",
      }}
      className="relative"
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          width: W,
          height: H,
          position: "relative",
        }}
      >
        {/* Pages stack (visible thickness on right) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateZ(-${D / 2}px)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* spine */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: D,
              height: H,
              transform: `rotateY(-90deg) translateZ(0)`,
              transformOrigin: "left center",
              background:
                "linear-gradient(180deg, #1a0f2e 0%, #2a1545 50%, #1a0f2e 100%)",
            }}
          >
            <div className="h-full w-full flex items-center justify-center">
              <div
                className="font-display text-[10px] tracking-[0.4em]"
                style={{ writingMode: "vertical-rl", color: "oklch(0.82 0.14 85)" }}
              >
                LOVE FOR HER · TUSHAR
              </div>
            </div>
          </div>
          {/* page edges (top/right/bottom) */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: D,
              height: H,
              transform: `rotateY(90deg)`,
              transformOrigin: "right center",
              background:
                "repeating-linear-gradient(90deg, #f5ecd6 0px, #e8d9a8 1px, #f5ecd6 2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: W,
              height: D,
              transform: `rotateX(90deg)`,
              transformOrigin: "top center",
              background:
                "repeating-linear-gradient(0deg, #f5ecd6 0px, #e8d9a8 1px, #f5ecd6 2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: W,
              height: D,
              transform: `rotateX(-90deg)`,
              transformOrigin: "bottom center",
              background:
                "repeating-linear-gradient(0deg, #f5ecd6 0px, #e8d9a8 1px, #f5ecd6 2px)",
            }}
          />
          {/* back cover */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translateZ(-${D / 2}px) rotateY(180deg)`,
              background: "linear-gradient(135deg, #1a0f2e, #0a0518)",
            }}
          />
        </div>

        {/* Front cover (opens) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
            transform: `translateZ(${D / 2}px) rotateY(${-openAmount * 160}deg)`,
            transition: "transform 0.1s linear",
          }}
        >
          <div
            style={{
              ...FRONT_COVER_STYLE,
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* gloss highlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(115deg, transparent 30%, oklch(1 0 0 / 18%) 45%, transparent 60%)",
              }}
            />
          </div>
          {/* inside of front cover (when opened) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              background: "linear-gradient(135deg, #f5ecd6, #e0cf9c)",
              padding: 24,
            }}
          >
            <div className="h-full w-full border border-amber-700/40 flex flex-col items-center justify-center text-center p-6 text-amber-900">
              <div className="font-display text-xs tracking-[0.4em] mb-4">PUSHP PUBLISHERS</div>
              <div className="font-serif-novel italic text-lg leading-snug">
                "His endless love and infinite guilt awaken the revenge of blood."
              </div>
              <div className="mt-6 h-[1px] w-16 bg-amber-700/60" />
              <div className="font-display text-[10px] tracking-[0.4em] mt-4">— TUSHAR</div>
            </div>
          </div>
        </div>

        {/* Revealed first page (under the cover) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateZ(${D / 2 - 2}px)`,
            background: "linear-gradient(135deg, #f7efd6, #e8d9a8)",
            padding: 22,
            opacity: openAmount > 0.05 ? 1 : 0,
          }}
        >
          <NovelPage />
        </div>
      </div>
    </div>
  );
}

function NovelPage() {
  return (
    <div className="h-full w-full text-[#3a2a18] font-serif-novel relative overflow-hidden">
      <div className="text-center font-display text-[9px] tracking-[0.4em] text-amber-800">
        CHAPTER ONE
      </div>
      <div className="mt-1 text-center font-display text-base text-amber-900">
        THE LAST BREATH
      </div>
      <div className="mx-auto my-2 h-[1px] w-12 bg-amber-800/60" />
      <p className="text-[8px] leading-[1.5] text-justify">
        <span className="float-left font-display text-3xl leading-none mr-1 mt-0.5 text-amber-900">
          T
        </span>
        he road out of Gurugram was empty when the headlights began to fail. Tiyash felt
        the wheel slip, the world tilt, and the dull metal taste of his own blood. He
        thought of her — only of her — as the night closed in and the stars seemed to
        bend toward him like curious witnesses.
      </p>
      <p className="text-[8px] leading-[1.5] text-justify mt-1.5">
        When he opened his eyes again the sky was the colour of bruised wine. An eclipsed
        sun hung at the horizon. Two columns of light — one green, one blue — rose from
        the broken earth to pierce the dark. Nothing moved. Nothing breathed. And then a
        voice, soft as falling ash, said his name.
      </p>
      <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] tracking-widest text-amber-800/80">
        — 1 —
      </div>
    </div>
  );
}

/* ============== HUD ============== */
function HUD() {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full"
            style={{ background: "var(--grad-gold)", boxShadow: "var(--shadow-gold-glow)" }}
          />
          <div className="font-display text-[11px] md:text-xs tracking-[0.35em] text-foreground/90">
            PUSHP <span className="text-gold-grad">PUBLISHERS</span>
          </div>
        </div>
        <a
          href="https://www.amazon.in/Deal-draveen-Tushar-Tandwalia/dp/9354277047"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto group relative px-5 md:px-7 py-2.5 font-display text-[10px] md:text-xs tracking-[0.35em] text-ink"
          style={{
            background: "var(--grad-gold)",
            boxShadow: "var(--shadow-gold-glow)",
          }}
        >
          BUY NOW
          <span className="absolute inset-0 border border-amber-200/60 pointer-events-none" />
        </a>
      </div>
    </>
  );
}

function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.4, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none"
    >
      <div className="font-display text-[9px] tracking-[0.5em] text-foreground/70">SCROLL</div>
      <div className="h-10 w-[1px] bg-gradient-to-b from-amber-200/80 to-transparent" />
    </motion.div>
  );
}

/* ============== Sections ============== */

// Wrap each "scene" in a sticky pinned container so scroll drives camera
function Scene({
  children,
  bg,
  heightVh = 200,
}: {
  children: (p: { progress: number }) => React.ReactNode;
  bg?: React.ReactNode;
  heightVh?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);
  useEffect(() => scrollYProgress.on("change", setP), [scrollYProgress]);

  return (
    <section ref={ref} style={{ height: `${heightVh}vh` }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {bg}
        {children({ progress: p })}
      </div>
    </section>
  );
}

/* HERO */
function HeroScene() {
  return (
    <Scene
      heightVh={180}
      bg={
        <>
          <div className="absolute inset-0 bg-realm" />
          <Stars count={160} />
          <VolumetricRays />
          <FogLayer />
          <GoldParticles count={50} />
        </>
      }
    >
      {({ progress }) => {
        const openAmount = Math.min(1, Math.max(0, (progress - 0.45) / 0.4));
        const bookScale = 1 + progress * 0.15;
        const rotY = -22 + progress * 18;
        const titleY = -progress * 120;
        const titleOpacity = 1 - progress * 1.6;
        return (
          <div className="relative h-full w-full flex items-center justify-center">
            <div className="absolute left-6 md:left-16 top-1/2 -translate-y-1/2 max-w-xl z-10 pointer-events-none">
              <motion.div
                style={{ y: titleY, opacity: Math.max(0, titleOpacity) }}
                className="space-y-6"
              >
                <div className="font-display text-[10px] md:text-xs tracking-[0.5em] text-gold-grad">
                  BOOK ONE · A DARK ROMANTIC THRILLER
                </div>
                <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-foreground">
                  LOVE
                  <br />
                  <span className="text-gold-grad">FOR HER</span>
                </h1>
                <p className="font-serif-novel italic text-lg md:text-xl text-foreground/80 max-w-md">
                  "His endless love and infinite guilt awaken the revenge of blood."
                </p>
                <div className="font-display text-[10px] tracking-[0.4em] text-foreground/60">
                  — TUSHAR TANDWALIA
                </div>
              </motion.div>
            </div>
            <div
              className="absolute right-[8%] md:right-[14%] top-1/2 -translate-y-1/2 animate-float-y"
              style={{ animationDuration: "9s" }}
            >
              <Book3D openAmount={openAmount} rotateY={rotY} scale={bookScale} />
            </div>
          </div>
        );
      }}
    </Scene>
  );
}

/* PAGES TURNING -> INK BIRDS */
function PagesScene() {
  return (
    <Scene
      heightVh={200}
      bg={
        <>
          <div className="absolute inset-0 bg-realm" />
          <Stars count={90} />
          <FogLayer />
          <GoldParticles count={70} />
        </>
      }
    >
      {({ progress }) => {
        // The book is opened, pages turn 0..1 across 0..0.6, then dissolves into birds 0.6..1
        const flip = progress * 4; // up to 4 page flips
        const dissolve = Math.max(0, (progress - 0.6) / 0.4);
        return (
          <div className="relative h-full w-full flex items-center justify-center">
            <div
              style={{ perspective: 2200 }}
              className="relative w-[640px] max-w-[92vw] h-[460px]"
            >
              {/* Open book base */}
              <div
                className="absolute inset-0 flex"
                style={{
                  transform: `rotateX(${18 - progress * 4}deg) scale(${1 + progress * 0.1})`,
                  transformStyle: "preserve-3d",
                  opacity: 1 - dissolve,
                  transition: "opacity 0.3s",
                }}
              >
                {/* Left static page */}
                <div
                  className="w-1/2 h-full p-6 text-[#3a2a18] font-serif-novel relative"
                  style={{
                    background: "linear-gradient(95deg, #d9c890 0%, #f7efd6 12%)",
                    boxShadow: "inset 12px 0 24px -8px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="text-center font-display text-[9px] tracking-[0.4em] text-amber-800">
                    CHAPTER TWO
                  </div>
                  <div className="mt-1 text-center font-display text-base text-amber-900">
                    THE LOKA
                  </div>
                  <div className="mx-auto my-2 h-[1px] w-12 bg-amber-800/60" />
                  <p className="text-[9px] leading-[1.5] text-justify">
                    <span className="float-left font-display text-3xl leading-none mr-1 mt-0.5 text-amber-900">
                      A
                    </span>
                    realm without footprints. A sky bruised purple. Two beams of light —
                    one a green flame, one a cold blue spear — marking the spine of a
                    world that should not be. He stood, and the dust did not stir.
                  </p>
                  <p className="text-[9px] leading-[1.5] text-justify mt-1.5">
                    "You are early," said the wind, and the wind had a name.
                  </p>
                  <div className="absolute bottom-3 left-0 right-0 text-center text-[7px] tracking-widest text-amber-800/80">
                    — 14 —
                  </div>
                </div>
                {/* Right page - stack of flipping pages */}
                <div className="w-1/2 h-full relative" style={{ perspective: 2000 }}>
                  {["DRAVEEN", "THE DEAL", "BLOOD AWAKENS", "LOVE BEYOND DEATH"].map(
                    (title, idx) => {
                      const flipProg = Math.min(1, Math.max(0, flip - idx));
                      const z = 4 - idx;
                      return (
                        <div
                          key={title}
                          className="absolute inset-0"
                          style={{
                            transformOrigin: "left center",
                            transform: `rotateY(${-flipProg * 175}deg)`,
                            transformStyle: "preserve-3d",
                            zIndex: z,
                            transition: "transform 0.15s linear",
                          }}
                        >
                          <div
                            className="absolute inset-0 p-6 text-[#3a2a18] font-serif-novel"
                            style={{
                              background:
                                "linear-gradient(265deg, #d9c890 0%, #f7efd6 12%)",
                              boxShadow: "inset -12px 0 24px -8px rgba(0,0,0,0.25)",
                              backfaceVisibility: "hidden",
                            }}
                          >
                            <div className="text-center font-display text-[9px] tracking-[0.4em] text-amber-800">
                              CHAPTER {3 + idx}
                            </div>
                            <div className="mt-1 text-center font-display text-base text-amber-900">
                              {title}
                            </div>
                            <div className="mx-auto my-2 h-[1px] w-12 bg-amber-800/60" />
                            <p className="text-[9px] leading-[1.5] text-justify">
                              The eclipsed sun did not move. Time, here, was a courtesy.
                              Draveen spoke of centuries the way other men speak of
                              afternoons, and Tiyash, who had once measured his life in
                              her heartbeats, listened.
                            </p>
                            <p className="text-[9px] leading-[1.5] text-justify mt-1.5 italic">
                              "Tell me her name," Draveen said. "And I will tell you the
                              price."
                            </p>
                            <div className="absolute bottom-3 left-0 right-0 text-center text-[7px] tracking-widest text-amber-800/80">
                              — {28 + idx * 14} —
                            </div>
                          </div>
                          <div
                            className="absolute inset-0 p-6 text-[#3a2a18] font-serif-novel"
                            style={{
                              background:
                                "linear-gradient(95deg, #d9c890 0%, #f7efd6 12%)",
                              transform: "rotateY(180deg)",
                              backfaceVisibility: "hidden",
                            }}
                          >
                            <div className="h-full w-full flex flex-col items-center justify-center text-center">
                              <div className="font-display text-[9px] tracking-[0.4em] text-amber-800">
                                INTERLUDE
                              </div>
                              <div className="font-serif-novel italic text-sm mt-3 max-w-[80%]">
                                "Love comes with a price.
                                <br />
                                How far will you go?"
                              </div>
                              <div className="mt-4 h-[1px] w-12 bg-amber-800/60" />
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Ink birds emerging */}
              {dissolve > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ opacity: dissolve }}
                >
                  {Array.from({ length: 18 }).map((_, i) => {
                    const angle = (i / 18) * Math.PI * 2;
                    const r = 80 + dissolve * 500;
                    const tx = Math.cos(angle) * r;
                    const ty = Math.sin(angle) * r * 0.6;
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 top-1/2"
                        style={{
                          transform: `translate(${tx}px, ${ty}px) rotate(${
                            (angle * 180) / Math.PI
                          }deg)`,
                        }}
                      >
                        <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                          <path
                            d="M2 10 Q 8 2, 16 10 Q 24 2, 30 10"
                            stroke="oklch(0.85 0.15 88)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            style={{ filter: "drop-shadow(0 0 6px oklch(0.85 0.15 88))" }}
                          />
                        </svg>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
              style={{ opacity: 1 - progress * 1.4 }}
            >
              <div className="font-display text-[10px] tracking-[0.5em] text-foreground/70">
                THE PAGES BEGIN TO TURN
              </div>
            </motion.div>
          </div>
        );
      }}
    </Scene>
  );
}

/* PORTAL FLY THROUGH */
function PortalScene() {
  return (
    <Scene
      heightVh={180}
      bg={
        <>
          <div className="absolute inset-0 bg-black" />
          <Stars count={140} />
        </>
      }
    >
      {({ progress }) => {
        const scale = 1 + progress * 4;
        const blur = progress > 0.7 ? (progress - 0.7) * 30 : 0;
        return (
          <div className="relative h-full w-full overflow-hidden">
            <motion.img
              src={portalImg}
              alt="A vast portal of golden ink and stone arches"
              width={1920}
              height={1280}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                scale,
                filter: `blur(${blur}px) brightness(${1 + progress * 0.3})`,
                transformOrigin: "50% 55%",
              }}
            />
            <PaperFragments count={20} />
            <GoldParticles count={60} />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 55%, transparent 30%, rgba(0,0,0,0.85) 80%)",
              }}
            />
            <motion.div
              style={{ opacity: 1 - progress * 1.5 }}
              className="absolute top-[18%] left-0 right-0 text-center pointer-events-none"
            >
              <div className="font-display text-xs tracking-[0.5em] text-gold-grad">
                INTO THE LOKA
              </div>
            </motion.div>
          </div>
        );
      }}
    </Scene>
  );
}

/* REALM + TITLE ASSEMBLE */
function RealmScene() {
  return (
    <Scene
      heightVh={220}
      bg={
        <>
          <img
            src={realmImg}
            alt="A cinematic floating realm of ancient ruins in a violet sky"
            width={1920}
            height={1280}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "brightness(0.85) saturate(1.1)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, transparent 0%, rgba(8,4,20,0.7) 80%)",
            }}
          />
          <FogLayer />
          <Stars count={70} />
          <GoldParticles count={50} />
        </>
      }
    >
      {({ progress }) => {
        // Title assembles 0..0.5, dissolves 0.5..0.7, reforms 0.7..1
        const phase1 = Math.min(1, progress / 0.5);
        const phase2 = Math.max(0, Math.min(1, (progress - 0.5) / 0.2));
        const phase3 = Math.max(0, (progress - 0.7) / 0.3);
        const titleOpacity = Math.max(phase3, phase1 - phase2);
        const titleBlur = (1 - titleOpacity) * 12;
        const titleScale = 0.8 + titleOpacity * 0.3;
        return (
          <div className="relative h-full w-full flex items-center justify-center">
            <PaperFragments count={16} />
            <motion.div
              style={{
                opacity: titleOpacity,
                filter: `blur(${titleBlur}px)`,
                scale: titleScale,
              }}
              className="relative text-center px-4"
            >
              <div className="font-display text-[11px] md:text-sm tracking-[0.6em] text-gold-grad mb-4">
                A WAR FOR LOVE IS COMING
              </div>
              <h2
                className="font-display text-6xl md:text-9xl leading-none text-gold-grad"
                style={{
                  textShadow:
                    "0 0 40px oklch(0.85 0.15 88 / 60%), 0 0 100px oklch(0.7 0.15 295 / 40%)",
                }}
              >
                LOVE
                <br />
                FOR HER
              </h2>
              <div className="font-serif-novel italic text-lg md:text-2xl text-foreground/85 mt-6">
                How far will you go for your love?
              </div>
            </motion.div>
          </div>
        );
      }}
    </Scene>
  );
}

/* MYSTERIOUS SILHOUETTE */
function SilhouetteScene() {
  return (
    <Scene
      heightVh={160}
      bg={
        <>
          <div className="absolute inset-0 bg-black" />
          <Stars count={80} />
        </>
      }
    >
      {({ progress }) => {
        const reveal = Math.min(1, progress * 1.3);
        const eyeBlink = Math.sin(progress * 14) * 0.5 + 0.5;
        return (
          <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
            <motion.img
              src={silhouetteImg}
              alt="A mysterious silhouette glimpsed in violet fog"
              width={1536}
              height={1920}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              style={{
                scale: 1.1 + progress * 0.2,
                filter: `brightness(${0.6 + reveal * 0.5}) contrast(1.05)`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 45%, transparent 20%, rgba(0,0,0,0.7) 75%)",
              }}
            />
            <FogLayer />
            <GoldParticles count={40} />
            {/* Two glowing eyes that flash */}
            <div
              className="absolute"
              style={{ top: "38%", left: "44%", opacity: eyeBlink * reveal }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: "oklch(0.95 0.18 85)",
                  boxShadow: "0 0 16px oklch(0.95 0.18 85), 0 0 40px oklch(0.85 0.2 60)",
                }}
              />
            </div>
            <div
              className="absolute"
              style={{ top: "38%", left: "53%", opacity: eyeBlink * reveal }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: "oklch(0.95 0.18 85)",
                  boxShadow: "0 0 16px oklch(0.95 0.18 85), 0 0 40px oklch(0.85 0.2 60)",
                }}
              />
            </div>
            <motion.div
              style={{ opacity: Math.min(1, progress * 2) * (1 - Math.max(0, (progress - 0.8) * 5)) }}
              className="absolute bottom-[18%] left-0 right-0 text-center px-6 pointer-events-none"
            >
              <div className="font-display text-[10px] md:text-xs tracking-[0.5em] text-foreground/70 mb-3">
                SHE WAS THE REASON
              </div>
              <div className="font-serif-novel italic text-xl md:text-3xl text-foreground/90 max-w-2xl mx-auto">
                "Never fully revealed.
                <br />
                Only hair, fog, light — and two eyes that remembered him."
              </div>
            </motion.div>
          </div>
        );
      }}
    </Scene>
  );
}

/* ABOUT THE BOOK */
function AboutBook() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section ref={ref} className="relative bg-realm overflow-hidden">
      <Stars count={60} />
      <FogLayer />
      <GoldParticles count={35} />
      <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-32 md:py-44 grid md:grid-cols-12 gap-10 items-center">
        <motion.div style={{ y }} className="md:col-span-5">
          <div className="mx-auto md:mx-0" style={{ width: 280 }}>
            <div className="animate-float-y" style={{ animationDuration: "8s" }}>
              <Book3D openAmount={0} rotateY={-18} rotateX={6} scale={0.9} />
            </div>
          </div>
        </motion.div>
        <div className="md:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9 }}
          >
            <div className="font-display text-xs tracking-[0.5em] text-gold-grad mb-4">
              ABOUT THE BOOK
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-foreground leading-tight mb-8">
              A bloody love story
              <br />
              <span className="text-gold-grad">awaits.</span>
            </h2>
            <div className="space-y-5 font-serif-novel text-lg md:text-xl text-foreground/85 leading-relaxed">
              <p>
                His endless love and infinite guilt awaken the revenge of blood. A man
                named <em className="text-gold-grad not-italic font-semibold">Tiyash</em> is
                dying on the outskirts of Gurugram after a brutal attack.
              </p>
              <p>
                Believing he is taking his final breath, he awakens in a mysterious realm
                where no living being exists. Under an eclipsed sky he meets the mysterious{" "}
                <em className="text-gold-grad not-italic font-semibold">Draveen</em>, who
                has waited there for centuries.
              </p>
              <p>
                As Tiyash reveals the story of his lost love, Draveen offers him a
                terrifying deal. Who is Draveen? Why was Tiyash chosen? What is this
                mysterious realm?
              </p>
              <p>
                As love transforms into horror, revenge and mythology, an ancient war
                begins across the realms.
              </p>
              <p className="italic text-foreground/95">
                LOVE FOR HER is a dark romantic thriller blending horror, mythology,
                mystery and emotion — the first novel in an epic trilogy.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {["Dark Romance", "Mythology", "Revenge", "Horror", "Trilogy · Book One"].map(
                (t) => (
                  <span
                    key={t}
                    className="px-4 py-1.5 text-[10px] tracking-[0.3em] font-display border border-amber-200/30 text-foreground/80"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* AUTHOR */
function AuthorSection() {
  return (
    <section className="relative bg-realm overflow-hidden">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, oklch(0.25 0.15 295 / 50%) 0%, transparent 60%)",
        }}
      />
      <Stars count={50} />
      <PaperFragments count={10} />
      <GoldParticles count={30} />
      <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-32 md:py-44 grid md:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="md:col-span-5 order-2 md:order-1"
        >
          <div className="font-display text-xs tracking-[0.5em] text-gold-grad mb-4">
            MEET THE AUTHOR
          </div>
          <h2 className="font-display text-4xl md:text-6xl text-foreground leading-tight mb-2">
            Tushar
          </h2>
          <h3 className="font-display text-2xl md:text-3xl text-gold-grad mb-8">
            Tandwalia
          </h3>
          <div className="space-y-5 font-serif-novel text-lg text-foreground/85 leading-relaxed">
            <p>
              An IAS aspirant turned author, Tushar Tandwalia graduated in BBA from
              Maharaja Agrasen Institute of Management Studies, Guru Gobind Singh
              Indraprastha University.
            </p>
            <p>
              After spending two years in customer service, he left his job to pursue the
              dream of becoming an IAS officer while fulfilling his childhood dream of
              becoming an author.
            </p>
            <p>
              <em>Love For Her</em> started as a romantic dedication but evolved into a
              dark fantasy romance filled with mystery, mythology, revenge and emotion —
              the beginning of a trilogy exploring destiny, sacrifice and supernatural
              realms.
            </p>
          </div>
          <div
            className="mt-8 font-serif-novel italic text-2xl text-gold-grad"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            ~ Tushar
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="md:col-span-7 order-1 md:order-2 relative"
        >
          <div className="relative aspect-[4/5] max-w-md mx-auto">
            <div
              className="absolute -inset-4 opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse, oklch(0.82 0.14 85 / 25%) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />
            <img
              src={authorPlaceholder}
              alt="Tushar Tandwalia, author of Love For Her"
              width={1024}
              height={1280}
              loading="lazy"
              className="relative h-full w-full object-cover"
              style={{
                boxShadow: "var(--shadow-cinematic)",
                filter: "contrast(1.05) saturate(1.05)",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, transparent 60%, oklch(0.05 0.02 290 / 60%) 100%)",
              }}
            />
            <div className="absolute bottom-4 left-4 right-4 font-display text-[10px] tracking-[0.4em] text-foreground/80">
              TUSHAR TANDWALIA · AUTHOR
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import authorPlaceholder from "@/assets/author.jpg";

/* FINAL CTA */
function FinalCTA() {
  return (
    <section className="relative bg-realm overflow-hidden">
      <Stars count={120} />
      <VolumetricRays />
      <FogLayer />
      <GoldParticles count={70} />
      <PaperFragments count={14} />
      <div className="relative max-w-5xl mx-auto px-6 md:px-10 py-32 md:py-48 text-center">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="font-display text-xs tracking-[0.6em] text-gold-grad mb-6">
            THE STORY AWAITS
          </div>
          <h2
            className="font-display text-6xl md:text-9xl leading-[0.95] text-gold-grad"
            style={{
              textShadow:
                "0 0 50px oklch(0.85 0.15 88 / 50%), 0 0 120px oklch(0.7 0.15 295 / 35%)",
            }}
          >
            LOVE
            <br />
            FOR HER
          </h2>
          <p className="mt-8 font-serif-novel italic text-2xl md:text-3xl text-foreground/90">
            How far will you go for your love?
          </p>
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-5">
            <a
              href="https://www.amazon.in/Deal-draveen-Tushar-Tandwalia/dp/9354277047"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-10 py-4 font-display text-xs tracking-[0.4em] text-ink"
              style={{
                background: "var(--grad-gold)",
                boxShadow: "var(--shadow-gold-glow)",
              }}
            >
              BUY ON AMAZON
              <span className="absolute inset-0 border border-amber-200/70 pointer-events-none" />
            </a>
            <button
              type="button"
              className="px-10 py-4 font-display text-xs tracking-[0.4em] text-foreground border border-amber-200/40 hover:bg-amber-200/5 transition-colors"
            >
              SWIGGY INSTAMART
            </button>
          </div>
          <div className="mt-20 grid grid-cols-3 max-w-2xl mx-auto gap-4 text-foreground/60">
            <div>
              <div className="font-display text-2xl text-gold-grad">I</div>
              <div className="font-display text-[10px] tracking-[0.4em] mt-1">BOOK ONE</div>
            </div>
            <div>
              <div className="font-display text-2xl text-gold-grad">III</div>
              <div className="font-display text-[10px] tracking-[0.4em] mt-1">TRILOGY</div>
            </div>
            <div>
              <div className="font-display text-2xl text-gold-grad">∞</div>
              <div className="font-display text-[10px] tracking-[0.4em] mt-1">REVENGE</div>
            </div>
          </div>
        </motion.div>
      </div>
      <footer className="relative border-t border-amber-200/10 py-8 text-center">
        <div className="font-display text-[10px] tracking-[0.4em] text-foreground/50">
          PUSHP PUBLISHERS · © {new Date().getFullYear()} TUSHAR TANDWALIA
        </div>
      </footer>
    </section>
  );
}

/* ============== Cursor reactive dust ============== */
function CursorDust() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 80, damping: 20 });
  const sy = useSpring(y, { stiffness: 80, damping: 20 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);
  const bg = useMotionTemplate`radial-gradient(circle at ${sx}px ${sy}px, oklch(0.85 0.15 88 / 0.12) 0px, transparent 220px)`;
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 mix-blend-screen"
      style={{ background: bg }}
    />
  );
}

/* ============== Page ============== */
export default function CinematicLoveForHer() {
  return (
    <main className="relative bg-background text-foreground">
      <HUD />
      <ScrollHint />
      <CursorDust />
      <HeroScene />
      <PagesScene />
      <PortalScene />
      <RealmScene />
      <SilhouetteScene />
      <AboutBook />
      <AuthorSection />
      <FinalCTA />
    </main>
  );
}
