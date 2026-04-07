/* ============================================================
   landing-animation.js — Hero entrance animation for Ayush Kumar's portfolio
   Drop this file in your project root and add:
     <script src="landing-animation.js"></script>
   BEFORE <script src="script.js"></script> in index.html
   ============================================================ */

(function () {
  "use strict";

  /* ── Inject animation styles ── */
  const animStyles = document.createElement("style");
  animStyles.textContent = `

    /* ─── LOCK body during intro so no scroll jump ─── */
    body.intro-playing {
      overflow: hidden;
    }

    /* ─── NAVBAR: start above viewport ─── */
    .navbar {
      transform: translateY(-110%);
      opacity: 0;
      transition: none;
    }
    .navbar.nav-landed {
      transform: translateY(0);
      opacity: 1;
      transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity   0.5s ease;
    }

    /* ─── NAV LOGO: stamp flash ─── */
    .nav-logo {
      opacity: 0;
      filter: blur(4px);
      transition: none;
    }
    .nav-logo.logo-stamp {
      opacity: 1;
      filter: blur(0);
      transition: opacity 0.4s ease, filter 0.4s ease;
    }

    /* ─── NAV LINKS: each drops from above ─── */
    .nav-links .nav-link,
    .nav-cta {
      opacity: 0;
      transform: translateY(-18px);
      transition: none;
    }
    .nav-links .nav-link.link-drop,
    .nav-cta.link-drop {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    /* Gold sweep line under each nav link on land — use animation-fill-mode: none
       so after the sweep the ::after pseudo reverts to its CSS-defined state (width:0)
       and the normal hover rule (width:100%) can take over freely */
    .nav-link.link-drop::after {
      animation: nav-sweep 0.65s 0.05s ease both;
    }
    @keyframes nav-sweep {
      0%   { width: 100%; opacity: 1; }
      80%  { width: 20%;  opacity: 0.4; }
      100% { width: 0%;   opacity: 0; }
    }
    /* Once settled, ensure hover works normally — override any lingering animation */
    .nav-link.link-drop:hover::after {
      animation: none;
      width: 100%;
    }

    /* ─── HERO TEXT: letter fly-from-left ─── */

    /* Hide original text nodes inside hero-content while we animate */
    .hero-content .hero-eyebrow,
    .hero-content .hero-name,
    .hero-content .hero-tagline,
    .hero-content .hero-contact,
    .hero-content .hero-scroll {
      opacity: 0 !important;
    }
    /* Shown once animation done */
    .hero-content .hero-eyebrow.text-settled,
    .hero-content .hero-name.text-settled,
    .hero-content .hero-tagline.text-settled,
    .hero-content .hero-contact.text-settled,
    .hero-content .hero-scroll.text-settled {
      opacity: 1 !important;
      transition: opacity 0.01s;
    }

    /* Particle letter that flies across */
    .fly-letter {
      position: fixed;
      pointer-events: none;
      z-index: 9990;
      font-family: 'Cinzel', serif;
      color: #e8d5b0;
      white-space: pre;
      will-change: transform, opacity;
    }
    .fly-letter.accent-char {
      color: #b8860b;
    }

    /* ─── HERO VISUAL (right side): elements fly from right ─── */
    .profile-glow,
    .profile-frame-outer,
    .profile-frame-inner,
    .profile-dots,
    .profile-img-wrap,
    .profile-corner,
    .profile-breach-line,
    .profile-compass,
    .profile-coords {
      opacity: 0;
      transform: translateX(120px);
      transition: none;
    }
    .visual-landed {
      opacity: 1 !important;
      transform: translateX(0) !important;
      transition: opacity 0.6s ease,
                  transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    /* Profile frame outer keeps its rotate on settle */
    .profile-frame-outer.visual-landed {
      transform: translateX(0) rotate(6deg) !important;
      transition: opacity 0.6s ease,
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    .profile-frame-inner.visual-landed {
      transform: translateX(0) rotate(-3deg) !important;
    }
    /* Corner ornaments: come from right with slight overshoot */
    .profile-corner.visual-landed {
      transition: opacity 0.5s ease,
                  transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    .profile-corner.tl.visual-landed { transform: translateX(0) !important; }
    .profile-corner.tr.visual-landed { transform: scaleX(-1) translateX(0) !important; }
    .profile-corner.bl.visual-landed { transform: scaleY(-1) translateX(0) !important; }
    .profile-corner.br.visual-landed { transform: scale(-1) translateX(0) !important; }

    /* Breach lines slide in */
    .profile-breach-line.visual-landed {
      opacity: 1 !important;
      transform: translateX(0) !important;
    }

    /* Coords fade up */
    .profile-coords.visual-landed {
      opacity: 1 !important;
      transform: translateX(-50%) !important;
      transition: opacity 0.6s ease, transform 0.6s ease !important;
    }

    /* ─── Subtle golden particle burst on arrival ─── */
    .visual-spark {
      position: fixed;
      pointer-events: none;
      z-index: 9991;
      width: 4px; height: 4px;
      background: #b8860b;
      border-radius: 50%;
      will-change: transform, opacity;
    }
  `;
  document.head.appendChild(animStyles);

  /* ── Helpers ── */
  const raf = requestAnimationFrame.bind(window);

  function lerp(a, b, t) { return a + (b - a) * t; }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

  /* ── Measure final positions of hero-content children ── */
  function getRect(el) {
    return el.getBoundingClientRect();
  }

  /* ============================================================
     PHASE 1 — Navbar animation
  ============================================================ */
  async function animateNavbar() {
    const navbar = document.getElementById("navbar");
    const logo   = navbar.querySelector(".nav-logo");
    const links  = navbar.querySelectorAll(".nav-links .nav-link");
    const cta    = navbar.querySelector(".nav-cta");

    // Slide navbar down
    await delay(100);
    navbar.classList.add("nav-landed");

    // Logo stamp after bar lands
    await delay(350);
    logo.classList.add("logo-stamp");

    // Stagger each nav link drop
    await delay(150);
    links.forEach((link, i) => {
      setTimeout(() => link.classList.add("link-drop"), i * 90);
    });

    // CTA button last
    await delay(links.length * 90 + 60);
    cta.classList.add("link-drop");
  }

  /* ============================================================
     PHASE 2 — Left side: text fly-from-left
     Each block's characters are extracted, launched as fixed
     particles from random X < 0, random Y near final position,
     then eased to their real position. When done, the real
     element fades in and particles vanish.
  ============================================================ */

  function flyTextBlock(el, startDelay) {
    return new Promise(resolve => {
      const rect   = getRect(el);
      const vw     = window.innerWidth;
      const chars  = [];
      const particles = [];

      // Gather a "flat text" representation for particles
      // We use the element's full textContent, split by char
      const text = el.textContent;
      const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16;
      const isName   = el.classList.contains("hero-name");
      const isBadge  = el.classList.contains("hero-eyebrow");

      // We'll scatter each character across the left side
      // Character count cap to avoid too many DOM nodes
      const displayChars = text.replace(/\s{2,}/g, " ").trim();
      const MAX_PARTICLES = 38;
      // Evenly sample chars if text is long
      let sample = displayChars;
      if (displayChars.length > MAX_PARTICLES) {
        const step = Math.floor(displayChars.length / MAX_PARTICLES);
        sample = [...displayChars].filter((_, i) => i % step === 0).join("");
      }

      const charArr = [...sample];
      const totalDuration = 700 + charArr.length * 18;

      setTimeout(() => {
        // Create particle per character
        charArr.forEach((ch, i) => {
          const span = document.createElement("span");
          span.className = "fly-letter" + (ch === "." || ch === "K" ? " accent-char" : "");
          span.textContent = ch === " " ? "\u00a0" : ch;

          // Random start: X off left edge, Y near element's vertical centre ± spread
          const startX = rand(-180, -20);
          const startY = rect.top + rand(-rect.height * 1.5, rect.height * 2.5);

          // End position: spread across the element's bounding rect
          const endX = rect.left + rand(0, Math.min(rect.width, 500));
          const endY = rect.top  + rand(0, rect.height);

          span.style.cssText = `
            left: ${startX}px;
            top:  ${startY}px;
            font-size: ${isName ? fontSize * rand(0.5, 1.1) : fontSize * rand(0.7, 1.0)}px;
            opacity: 0;
          `;
          document.body.appendChild(span);

          // Random launch delay per character
          const launchDelay = rand(0, 220);
          const duration    = rand(480, totalDuration);

          setTimeout(() => {
            const start = performance.now();

            function tick(now) {
              const t = Math.min((now - start) / duration, 1);
              const e = easeOutBack(t);
              const x = lerp(startX, endX, e);
              const y = lerp(startY, endY, easeOutCubic(t));
              const opacity = t < 0.15
                ? t / 0.15
                : t > 0.75
                  ? 1 - (t - 0.75) / 0.25
                  : 1;
              span.style.left    = x + "px";
              span.style.top     = y + "px";
              span.style.opacity = opacity;

              if (t < 1) {
                raf(tick);
              } else {
                span.remove();
              }
            }
            raf(tick);
          }, launchDelay);
        });

        // Reveal the real element at ~85% of total animation time
        setTimeout(() => {
          el.classList.add("text-settled");
          // Also add the standard reveal class so other effects work
          el.classList.add("visible");
          resolve();
        }, totalDuration * 0.82);

      }, startDelay);
    });
  }

  async function animateTextContent() {
    const content  = document.querySelector(".hero-content");
    const eyebrow  = content.querySelector(".hero-eyebrow");
    const name     = content.querySelector(".hero-name");
    const tagline  = content.querySelector(".hero-tagline");
    const contact  = content.querySelector(".hero-contact");
    const scroll   = content.querySelector(".hero-scroll");

    const blocks = [eyebrow, name, tagline, contact, scroll];
    // Stagger each block launch
    const blockDelays = [0, 80, 200, 320, 420];

    const promises = blocks.map((el, i) => {
      if (!el) return Promise.resolve();
      return flyTextBlock(el, blockDelays[i]);
    });

    await Promise.all(promises);
  }

  /* ============================================================
     PHASE 3 — Right side: visual elements fly in from right, IN ORDER
  ============================================================ */
  async function animateVisual() {
    const visual = document.querySelector(".hero-visual");
    if (!visual) return;

    // Ordered sequence
    const sequence = [
      { el: visual.querySelector(".profile-glow"),         delayMs: 0   },
      { el: visual.querySelector(".profile-frame-outer"),  delayMs: 90  },
      { el: visual.querySelector(".profile-frame-inner"),  delayMs: 160 },
      { el: visual.querySelector(".profile-dots"),         delayMs: 220 },
      { el: visual.querySelector(".profile-img-wrap"),     delayMs: 310 },
      // Corners in order: tl, tr, bl, br
      { el: visual.querySelector(".profile-corner.tl"),    delayMs: 470 },
      { el: visual.querySelector(".profile-corner.tr"),    delayMs: 520 },
      { el: visual.querySelector(".profile-corner.bl"),    delayMs: 570 },
      { el: visual.querySelector(".profile-corner.br"),    delayMs: 620 },
      // Breach lines
      { el: visual.querySelector(".profile-breach-line.left"),  delayMs: 680 },
      { el: visual.querySelector(".profile-breach-line.right"), delayMs: 720 },
      // Compass
      { el: visual.querySelector(".profile-compass"),      delayMs: 790 },
      // Coords
      { el: visual.querySelector(".profile-coords"),       delayMs: 870 },
    ];

    sequence.forEach(({ el, delayMs }) => {
      if (!el) return;
      setTimeout(() => {
        el.classList.add("visual-landed");
        // Small spark burst when each element lands
        if (Math.random() > 0.4) spawnSparks(el);
      }, delayMs);
    });

    // Resolve after last element lands + its transition
    return delay(sequence[sequence.length - 1].delayMs + 800);
  }

  /* ── Spark burst at element position ── */
  function spawnSparks(el) {
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;

    const cx = rect.left + rect.width  * 0.5;
    const cy = rect.top  + rect.height * 0.5;
    const count = Math.floor(rand(3, 7));

    for (let i = 0; i < count; i++) {
      const spark = document.createElement("div");
      spark.className = "visual-spark";
      spark.style.left = cx + "px";
      spark.style.top  = cy + "px";
      document.body.appendChild(spark);

      const angle   = rand(0, Math.PI * 2);
      const dist    = rand(20, 60);
      const vx      = Math.cos(angle) * dist;
      const vy      = Math.sin(angle) * dist;
      const dur     = rand(350, 650);
      const start   = performance.now();

      (function animSpark(now) {
        const t  = Math.min((now - start) / dur, 1);
        const e  = easeOutCubic(t);
        spark.style.left    = (cx + vx * e) + "px";
        spark.style.top     = (cy + vy * e + 20 * t * t) + "px"; // gravity
        spark.style.opacity = (1 - t);
        spark.style.transform = `scale(${1 - t * 0.5})`;
        if (t < 1) raf(ts => animSpark(ts));
        else spark.remove();
      })(start);
    }
  }

  /* ============================================================
     MASTER sequence
  ============================================================ */
  async function runIntroAnimation() {
    document.body.classList.add("intro-playing");

    // Prevent the standard script.js page-load reveal from firing
    // by marking hero reveals as already handled after we settle
    const heroRevealEls = document.querySelectorAll(".hero .reveal");
    heroRevealEls.forEach(el => {
      // Temporarily flag so the IntersectionObserver in script.js
      // won't double-fire after we remove intro-playing
      el.dataset.introHandled = "true";
    });

    // Run all three phases concurrently for snappiness,
    // but text and visual have internal sequencing
    await Promise.all([
      animateNavbar(),
      (async () => {
        await delay(350); // slight delay so navbar lands first
        await animateTextContent();
      })(),
      (async () => {
        await delay(500); // visual starts slightly after text begins
        await animateVisual();
      })(),
    ]);

    document.body.classList.remove("intro-playing");

    // Make sure all hero .reveal elements are marked visible
    // so the standard reveal observer in script.js doesn't re-hide them
    heroRevealEls.forEach(el => {
      el.classList.add("visible");
    });
  }

  /* ── Kick off on window load ── */
  if (document.readyState === "complete") {
    runIntroAnimation();
  } else {
    window.addEventListener("load", runIntroAnimation, { once: true });
  }

})();
