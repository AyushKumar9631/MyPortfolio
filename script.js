/* ============================================================
   script.js — Ayush Kumar Portfolio · Neon-Lime Theme
   ============================================================ */

(function () {
  "use strict";

  /* ── Custom Cursor ── */
  const cursor = document.getElementById("cursor");
  const trail  = document.getElementById("cursorTrail");
  let trailX = 0, trailY = 0, mouseX = 0, mouseY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top  = mouseY + "px";
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    trail.style.left = trailX + "px";
    trail.style.top  = trailY + "px";
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
    trail.style.opacity  = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
    trail.style.opacity  = "1";
  });

  /* ── Navbar scroll shrink ── */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });

  /* ── Hamburger / Mobile Menu ── */
  const hamburger  = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  let menuOpen = false;

  hamburger.addEventListener("click", toggleMenu);

  function toggleMenu() {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle("open", menuOpen);
    const spans = hamburger.querySelectorAll("span");
    if (menuOpen) {
      spans[0].style.transform = "translateY(7px) rotate(45deg)";
      spans[1].style.opacity   = "0";
      spans[2].style.transform = "translateY(-7px) rotate(-45deg)";
      document.body.style.overflow = "hidden";
    } else {
      spans[0].style.transform = "";
      spans[1].style.opacity   = "";
      spans[2].style.transform = "";
      document.body.style.overflow = "";
    }
  }

  document.querySelectorAll(".mob-link").forEach((link) => {
    link.addEventListener("click", () => { if (menuOpen) toggleMenu(); });
  });

  /* ── Scroll Reveal ── */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const d = parseInt(entry.target.dataset.delay || "0", 10);
          setTimeout(() => entry.target.classList.add("visible"), d);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ── Active Nav Highlight ── */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.classList.remove("active-nav");
            link.style.color = "";
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active-nav");
              link.style.color = "var(--accent)";
            }
          });
        }
      });
    },
    { threshold: 0.35 }
  );
  sections.forEach((section) => sectionObserver.observe(section));

  /* ── Skill Tag Ripple ── */
  document.querySelectorAll(".skill-tag").forEach((tag) => {
    tag.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        background: rgba(195, 228, 29, 0.18);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-anim 0.5s ease-out forwards;
        pointer-events: none;
      `;
      this.style.position = "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  const style = document.createElement("style");
  style.textContent = `@keyframes ripple-anim { to { transform: scale(2.5); opacity: 0; } }`;
  document.head.appendChild(style);

  /* ── Project Card Tilt ── */
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      this.style.transform = `translateY(-6px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "";
    });
  });

  /* ── CGPA Counter Animation ── */
  document.querySelectorAll(".edu-score").forEach((el) => {
    const text      = el.textContent.trim();
    const isPercent = text.includes("%");
    const isCGPA    = text.includes("CGPA");
    const target    = parseFloat(text.replace("%", "").replace(" CGPA", ""));
    let started = false;

    const scoreObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            animateCount(el, target, isPercent, isCGPA);
            scoreObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    scoreObserver.observe(el);
  });

  function animateCount(el, target, isPercent, isCGPA) {
    const duration  = 1200;
    const startTime = performance.now();
    const suffix    = isCGPA ? " CGPA" : isPercent ? "%" : "";
    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = (eased * target).toFixed(isCGPA ? 2 : 1) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ── Smooth scroll anchors ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ── Badge cursor-dodge ── */
  (function () {
    const badges = document.querySelectorAll(".hero-eyebrow .badge");
    if (!badges.length) return;
    const DODGE_RADIUS = 90, MAX_SHIFT = 72;
    let lastMouseX = -999, lastMouseY = -999;

    document.addEventListener("mousemove", (e) => {
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      updateDodge();
    }, { passive: true });

    function updateDodge() {
      badges.forEach((badge) => {
        const rect = badge.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = lastMouseX - cx;
        const dy   = lastMouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < DODGE_RADIUS) {
          const strength = 1 - dist / DODGE_RADIUS;
          const shiftX   = -(dx / (dist || 1)) * MAX_SHIFT * strength;
          badge.style.transform = `translateX(${shiftX.toFixed(2)}px)`;
        } else {
          badge.style.transform = "translateX(0px)";
        }
      });
    }
  })();

})();
