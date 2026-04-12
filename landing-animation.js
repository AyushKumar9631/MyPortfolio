/* ============================================================
   landing-animation.js — Hero entrance animation · Neon-Lime Theme
   ============================================================ */

(function () {
  "use strict";

  const animStyles = document.createElement("style");
  animStyles.textContent = `

    body.intro-playing { overflow: hidden; }

    /* NAVBAR */
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

    /* NAV LOGO */
    .nav-logo {
      opacity: 0;
      filter: blur(6px);
      transition: none;
    }
    .nav-logo.logo-stamp {
      opacity: 1;
      filter: blur(0);
      transition: opacity 0.4s ease, filter 0.4s ease;
    }

    /* NAV LINKS */
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
    .nav-link.link-drop::after {
      animation: nav-sweep 0.6s 0.05s ease both;
    }
    @keyframes nav-sweep {
      0%   { width: 100%; opacity: 1; }
      80%  { width: 20%;  opacity: 0.3; }
      100% { width: 0%;   opacity: 0; }
    }
    .nav-link.link-drop:hover::after {
      animation: none;
      width: 100%;
    }

    /* HERO TEXT: hidden during animation */
    .hero-content .hero-eyebrow,
    .hero-content .hero-name,
    .hero-content .hero-tagline,
    .hero-content .hero-contact,
    .hero-content .hero-scroll {
      opacity: 0 !important;
    }
    .hero-content .hero-eyebrow.text-settled,
    .hero-content .hero-name.text-settled,
    .hero-content .hero-tagline.text-settled,
    .hero-content .hero-contact.text-settled,
    .hero-content .hero-scroll.text-settled {
      opacity: 1 !important;
      transition: opacity 0.01s;
    }

    /* Flying letter particles */
    .fly-letter {
      position: fixed;
      pointer-events: none;
      z-index: 9990;
      font-family: 'Fira Code', monospace;
      color: #ffffff;
      white-space: pre;
      will-change: transform, opacity;
    }
    .fly-letter.accent-char {
      color: #C3E41D;
    }

    /* HERO VISUAL: fly from right */
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
    .profile-frame-outer.visual-landed {
      transform: translateX(0) rotate(5deg) !important;
      transition: opacity 0.6s ease,
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    .profile-frame-inner.visual-landed {
      transform: translateX(0) rotate(-3deg) !important;
    }
    .profile-corner.visual-landed {
      transition: opacity 0.5s ease,
                  transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }
    .profile-corner.tl.visual-landed { transform: translateX(0) !important; }
    .profile-corner.tr.visual-landed { transform: scaleX(-1) translateX(0) !important; }
    .profile-corner.bl.visual-landed { transform: scaleY(-1) translateX(0) !important; }
    .profile-corner.br.visual-landed { transform: scale(-1) translateX(0) !important; }
    .profile-breach-line.visual-landed {
      opacity: 1 !important;
      transform: translateX(0) !important;
    }
    .profile-coords.visual-landed {
      opacity: 1 !important;
      transform: translateX(-50%) !important;
      transition: opacity 0.6s ease, transform 0.6s ease !important;
    }

    /* Lime spark particle */
    .visual-spark {
      position: fixed;
      pointer-events: none;
      z-index: 9991;
      width: 3px; height: 3px;
      background: #C3E41D;
      border-radius: 50%;
      will-change: transform, opacity;
    }
  `;
  document.head.appendChild(animStyles);

  const raf = requestAnimationFrame.bind(window);
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function delay(ms) { return new Promise(res => setTimeout(res, ms)); }
  function getRect(el) { return el.getBoundingClientRect(); }

  /* PHASE 1 — Navbar */
  async function animateNavbar() {
    const navbar = document.getElementById("navbar");
    const logo   = navbar.querySelector(".nav-logo");
    const links  = navbar.querySelectorAll(".nav-links .nav-link");
    const cta    = navbar.querySelector(".nav-cta");

    await delay(100);
    navbar.classList.add("nav-landed");
    await delay(350);
    logo.classList.add("logo-stamp");
    await delay(150);
    links.forEach((link, i) => {
      setTimeout(() => link.classList.add("link-drop"), i * 90);
    });
    await delay(links.length * 90 + 60);
    if (cta) cta.classList.add("link-drop");
  }

  /* PHASE 2 — Text fly from left */
  function flyTextBlock(el, startDelay) {
    return new Promise(resolve => {
      const rect   = getRect(el);
      const text   = el.textContent;
      const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16;
      const isName   = el.classList.contains("hero-name");

      const displayChars = text.replace(/\s{2,}/g, " ").trim();
      const MAX_PARTICLES = 38;
      let sample = displayChars;
      if (displayChars.length > MAX_PARTICLES) {
        const step = Math.floor(displayChars.length / MAX_PARTICLES);
        sample = [...displayChars].filter((_, i) => i % step === 0).join("");
      }

      const charArr = [...sample];
      const totalDuration = 700 + charArr.length * 18;

      setTimeout(() => {
        charArr.forEach((ch, i) => {
          const span = document.createElement("span");
          // accent-char for '.' or 'K' (accent letter in name)
          span.className = "fly-letter" + (ch === "." || ch === "K" ? " accent-char" : "");
          span.textContent = ch === " " ? "\u00a0" : ch;

          const startX = rand(-180, -20);
          const startY = rect.top + rand(-rect.height * 1.5, rect.height * 2.5);
          const endX   = rect.left + rand(0, Math.min(rect.width, 500));
          const endY   = rect.top  + rand(0, rect.height);

          span.style.cssText = `
            left: ${startX}px;
            top:  ${startY}px;
            font-size: ${isName ? fontSize * rand(0.5, 1.1) : fontSize * rand(0.7, 1.0)}px;
            opacity: 0;
          `;
          document.body.appendChild(span);

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
              if (t < 1) { raf(tick); } else { span.remove(); }
            }
            raf(tick);
          }, launchDelay);
        });

        setTimeout(() => {
          el.classList.add("text-settled");
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

    const blocks      = [eyebrow, name, tagline, contact, scroll];
    const blockDelays = [0, 80, 200, 320, 420];

    const promises = blocks.map((el, i) => {
      if (!el) return Promise.resolve();
      return flyTextBlock(el, blockDelays[i]);
    });
    await Promise.all(promises);
  }

  /* PHASE 3 — Visual fly from right */
  async function animateVisual() {
    const visual = document.querySelector(".hero-visual");
    if (!visual) return;

    const sequence = [
      { el: visual.querySelector(".profile-glow"),               delayMs: 0   },
      { el: visual.querySelector(".profile-frame-outer"),        delayMs: 90  },
      { el: visual.querySelector(".profile-frame-inner"),        delayMs: 160 },
      { el: visual.querySelector(".profile-dots"),               delayMs: 220 },
      { el: visual.querySelector(".profile-img-wrap"),           delayMs: 310 },
      { el: visual.querySelector(".profile-corner.tl"),          delayMs: 470 },
      { el: visual.querySelector(".profile-corner.tr"),          delayMs: 520 },
      { el: visual.querySelector(".profile-corner.bl"),          delayMs: 570 },
      { el: visual.querySelector(".profile-corner.br"),          delayMs: 620 },
      { el: visual.querySelector(".profile-breach-line.left"),   delayMs: 680 },
      { el: visual.querySelector(".profile-breach-line.right"),  delayMs: 720 },
      { el: visual.querySelector(".profile-compass"),            delayMs: 790 },
      { el: visual.querySelector(".profile-coords"),             delayMs: 870 },
    ];

    sequence.forEach(({ el, delayMs }) => {
      if (!el) return;
      setTimeout(() => {
        el.classList.add("visual-landed");
        if (Math.random() > 0.4) spawnSparks(el);
      }, delayMs);
    });

    return delay(sequence[sequence.length - 1].delayMs + 800);
  }

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

      const angle = rand(0, Math.PI * 2);
      const dist  = rand(18, 55);
      const vx    = Math.cos(angle) * dist;
      const vy    = Math.sin(angle) * dist;
      const dur   = rand(320, 600);
      const start = performance.now();

      (function animSpark(now) {
        const t  = Math.min((now - start) / dur, 1);
        const e  = easeOutCubic(t);
        spark.style.left      = (cx + vx * e) + "px";
        spark.style.top       = (cy + vy * e + 18 * t * t) + "px";
        spark.style.opacity   = (1 - t);
        spark.style.transform = `scale(${1 - t * 0.5})`;
        if (t < 1) raf(ts => animSpark(ts));
        else spark.remove();
      })(start);
    }
  }

  /* MASTER */
  async function runIntroAnimation() {
    document.body.classList.add("intro-playing");

    const heroRevealEls = document.querySelectorAll(".hero .reveal");
    heroRevealEls.forEach(el => { el.dataset.introHandled = "true"; });

    await Promise.all([
      animateNavbar(),
      (async () => {
        await delay(350);
        await animateTextContent();
      })(),
      (async () => {
        await delay(500);
        await animateVisual();
      })(),
    ]);

    document.body.classList.remove("intro-playing");
    heroRevealEls.forEach(el => { el.classList.add("visible"); });
  }

  if (document.readyState === "complete") {
    runIntroAnimation();
  } else {
    window.addEventListener("load", runIntroAnimation, { once: true });
  }

})();
