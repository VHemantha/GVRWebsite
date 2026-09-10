/* =====================================================================
   GVR Caliber — "Enter the System"
   script.js  (vanilla JS, Three.js optional via CDN)

   Modules:
     1.  Helpers & feature flags
     2.  Boot loader sequence
     3.  Cursor glow (desktop)
     4.  Top bar stuck state + mobile nav
     5.  Scroll reveal (IntersectionObserver)
     6.  Animated counters
     7.  HUD zone tracking + smooth anchor scroll
     8.  Service cards: expand + 3D tilt
     9.  Tech stack hint
     10. Contact form validation
     11. Button ripple
     12. Hero particle field (Three.js -> Canvas2D fallback)
     13. Footer ambient canvas
     14. Easter egg: Konami code + click bursts
     15. Footer year
   ===================================================================== */

(function () {
  "use strict";

  /* ---------- 1. HELPERS & FEATURE FLAGS ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;
  const isSmall = window.matchMedia("(max-width: 720px)").matches;
  const canHeavy = !prefersReduced && !isSmall;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setFooterYear();
    initLoader();
    initCursorGlow();
    initTopbar();
    initReveal();
    initCounters();
    initHud();
    initServiceCards();
    initStackHints();
    initContactForm();
    initRipple();
    initEasterEgg();

    // Heavy visuals start after first paint so they never block content.
    requestAnimationFrame(() => {
      initHeroBackground();
      initFooterCanvas();
    });
  }

  /* ---------- 2. BOOT LOADER SEQUENCE ---------- */
  function initLoader() {
    const loader = $("#loader");
    if (!loader) return;

    let li = 0, ci = 0, done = false, typed = 0;

    function finish() {
      if (done) return;
      done = true;
      loader.classList.add("is-done");
      document.body.style.overflow = "";
      window.setTimeout(() => loader.remove(), 800);
      // Nudge reveal on hero now that it's visible.
      window.dispatchEvent(new Event("scroll"));
    }

    if (prefersReduced) { finish(); return; }

    const textEl = $("#bootText");
    const barEl  = $("#bootBar");
    const skip   = $("#skipBoot");

    const lines = [
      "> GVR CALIBER // core boot sequence",
      "> mounting automation modules ......... ok",
      "> loading agentic ai runtime .......... ok",
      "> calibrating ml pipelines ........... ok",
      "> establishing secure uplink ......... ok",
      "> system ready. welcome, operator.",
    ];

    const total = lines.join("\n").length;

    function tick() {
      if (done) return;
      if (li >= lines.length) { finishSoon(); return; }
      const line = lines[li];
      if (ci <= line.length) {
        textEl.textContent =
          lines.slice(0, li).join("\n") +
          (li > 0 ? "\n" : "") +
          line.slice(0, ci);
        typed++;
        ci++;
        barEl.style.width = Math.min(100, Math.round((typed / total) * 100)) + "%";
        setTimeout(tick, 14 + Math.random() * 26);
      } else {
        li++; ci = 0;
        setTimeout(tick, 130);
      }
    }

    function finishSoon() {
      barEl.style.width = "100%";
      setTimeout(finish, 450);
    }

    document.body.style.overflow = "hidden";
    skip && skip.addEventListener("click", finish);
    // Safety valve: never trap the user.
    setTimeout(finish, 6000);
    tick();
  }

  /* ---------- 3. CURSOR GLOW ---------- */
  function initCursorGlow() {
    const glow = $("#cursorGlow");
    if (!glow || isTouch || prefersReduced) return;

    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y;

    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add("cursor-active");
    });
    window.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"));

    (function loop() {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      glow.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 4. TOP BAR + MOBILE NAV ---------- */
  function initTopbar() {
    const bar = $(".topbar");
    const toggle = $("#navToggle");
    const nav = $("#primaryNav");

    const onScroll = () => {
      bar && bar.classList.toggle("is-stuck", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      nav.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    }
  }

  /* ---------- 5. SCROLL REVEAL ---------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    items.forEach((el) => io.observe(el));
  }

  /* ---------- 6. ANIMATED COUNTERS ---------- */
  function initCounters() {
    const counters = $$(".counter");
    if (!counters.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.target || "0");
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      if (prefersReduced) { el.textContent = prefix + target + suffix; return; }

      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = prefix + val + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) { counters.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- 7. HUD ZONE TRACKING + SMOOTH SCROLL ---------- */
  function initHud() {
    const dots = $$(".hud__dot");
    const zones = $$("main .zone");
    if (!zones.length) return;

    // Smooth-scroll for every in-page anchor.
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", id);
      });
    });

    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        dots.forEach((d) => d.classList.toggle("is-active", d.dataset.zone === id));
      });
    }, { threshold: 0.5, rootMargin: "-20% 0px -20% 0px" });
    zones.forEach((z) => io.observe(z));
  }

  /* ---------- 8. SERVICE CARDS: EXPAND + 3D TILT ---------- */
  function initServiceCards() {
    $$(".svc-card").forEach((card) => {
      const head = $(".svc-card__head", card);
      const detail = $(".svc-card__detail", card);
      if (head && detail) {
        head.addEventListener("click", () => {
          const open = card.classList.toggle("is-open");
          head.setAttribute("aria-expanded", String(open));
          detail.hidden = !open;
        });
      }

      if (!canHeavy) return;
      // Perspective tilt following cursor.
      let raf = null;
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-4px)`;
        });
      };
      const reset = () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = "";
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", reset);
    });
  }

  /* ---------- 9. TECH STACK HINTS ---------- */
  function initStackHints() {
    const hint = $("#stackHint");
    const chips = $$(".chip");
    if (!hint || !chips.length) return;

    const show = (chip) => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      hint.textContent = chip.dataset.use || "";
    };

    chips.forEach((chip) => {
      chip.setAttribute("tabindex", "0");
      chip.setAttribute("role", "button");
      chip.addEventListener("mouseenter", () => show(chip));
      chip.addEventListener("focus", () => show(chip));
      chip.addEventListener("click", () => show(chip));
      chip.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(chip); }
      });
    });
  }

  /* ---------- 10. CONTACT FORM VALIDATION ---------- */
  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;
    const status = $("#formStatus");

    const setError = (input, msg) => {
      const field = input.closest(".field");
      field.classList.toggle("is-invalid", Boolean(msg));
      const err = $(`.field__error[data-for="${input.id}"]`, form);
      if (err) err.textContent = msg || "";
      return !msg;
    };

    const validators = {
      "cf-name": (v) => v.trim().length >= 2 ? "" : "Please enter your name.",
      "cf-email": (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address.",
      "cf-message": (v) => v.trim().length >= 10 ? "" : "A little more detail helps us reply well.",
    };

    Object.keys(validators).forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener("blur", () => setError(input, validators[id](input.value)));
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("is-invalid")) {
          setError(input, validators[id](input.value));
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      Object.keys(validators).forEach((id) => {
        const input = document.getElementById(id);
        if (input && !setError(input, validators[id](input.value))) ok = false;
      });

      if (!ok) {
        status.textContent = "Please fix the highlighted fields.";
        status.classList.add("is-error");
        const firstBad = $(".field.is-invalid input, .field.is-invalid textarea", form);
        firstBad && firstBad.focus();
        return;
      }

      status.classList.remove("is-error");
      status.textContent = "Transmitting...";
      const btn = $("button[type=submit]", form);
      btn && (btn.disabled = true);

      // No backend in this static build: simulate a successful hand-off.
      setTimeout(() => {
        const name = $("#cf-name").value.trim().split(" ")[0] || "there";
        status.textContent = `Thanks, ${name}. Your enquiry is queued and a partner will reply within one business day.`;
        form.reset();
        btn && (btn.disabled = false);
        $$(".field", form).forEach((f) => f.classList.remove("is-invalid"));
      }, 900);
    });
  }

  /* ---------- 11. BUTTON RIPPLE ---------- */
  function initRipple() {
    if (prefersReduced) return;
    $$("[data-ripple]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const r = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height);
        const span = document.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = size + "px";
        span.style.left = (e.clientX - r.left - size / 2) + "px";
        span.style.top = (e.clientY - r.top - size / 2) + "px";
        btn.appendChild(span);
        setTimeout(() => span.remove(), 650);
      });
    });
  }

  /* ---------- 12. HERO PARTICLE FIELD ---------- */
  function initHeroBackground() {
    const canvas = $("#heroCanvas");
    if (!canvas || prefersReduced) return;

    if (window.THREE && canHeavy) {
      try { heroThree(canvas); return; } catch (err) { /* fall through */ }
    }
    heroCanvas2D(canvas);
  }

  function heroThree(canvas) {
    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 14;

    const COUNT = 900;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 44;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const sprite = makeDotTexture();
    const mat = new THREE.PointsMaterial({
      size: 0.16,
      map: sprite,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color(0x59d7ff),
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Wire mesh of connecting lines for a "network" feel.
    const lineGeo = new THREE.BufferGeometry();
    const linePos = new Float32Array(180 * 6);
    for (let i = 0; i < 180; i++) {
      const a = (Math.floor(Math.random() * COUNT)) * 3;
      const b = (Math.floor(Math.random() * COUNT)) * 3;
      linePos.set([
        positions[a], positions[a + 1], positions[a + 2],
        positions[b], positions[b + 1], positions[b + 2],
      ], i * 6);
    }
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7c4dff, transparent: true, opacity: 0.12 });
    scene.add(new THREE.LineSegments(lineGeo, lineMat));

    let mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / window.innerWidth - 0.5);
      my = (e.clientY / window.innerHeight - 0.5);
    });

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    let running = true;
    document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) tick(); });

    const clock = new THREE.Clock();
    function tick() {
      if (!running) return;
      const t = clock.getElapsedTime();
      points.rotation.y = t * 0.04 + mx * 0.5;
      points.rotation.x = my * 0.3;
      scene.children.forEach((c) => { if (c.isLineSegments) c.rotation.copy(points.rotation); });
      camera.position.x += (mx * 3 - camera.position.x) * 0.03;
      camera.position.y += (-my * 2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
  }

  function makeDotTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(120,220,255,0.9)");
    grad.addColorStop(1, "rgba(120,220,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const tex = new window.THREE.Texture(c);
    tex.needsUpdate = true;
    return tex;
  }

  /* Canvas2D fallback particle field (also used on mobile-lite). */
  function heroCanvas2D(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w, h, dpr = Math.min(window.devicePixelRatio, 2);
    const N = isSmall ? 46 : 90;
    const pts = [];
    let mx = -999, my = -999;

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      });
    }

    if (!isTouch) {
      window.addEventListener("mousemove", (e) => {
        const r = canvas.getBoundingClientRect();
        mx = e.clientX - r.left; my = e.clientY - r.top;
      });
    }

    let running = true;
    document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) frame(); });

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = p.x - mx, dy = p.y - my;
        const d = Math.hypot(dx, dy);
        if (d < 120) {
          p.x += (dx / d) * (120 - d) * 0.02;
          p.y += (dy / d) * (120 - d) * 0.02;
        }

        for (let j = i + 1; j < N; j++) {
          const q = pts[j];
          const dd = Math.hypot(p.x - q.x, p.y - q.y);
          if (dd < 130) {
            ctx.strokeStyle = `rgba(0,229,255,${(1 - dd / 130) * 0.16})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(124,150,255,0.8)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
  }

  /* ---------- 13. FOOTER AMBIENT CANVAS ---------- */
  function initFooterCanvas() {
    const canvas = $("#footerCanvas");
    if (!canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w, h, t = 0;
    const dpr = Math.min(window.devicePixelRatio, 2);
    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let visible = false;
    const io = new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      if (visible) frame();
    }, { threshold: 0 });
    io.observe(canvas);

    function frame() {
      if (!visible) return;
      t += 0.006;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 12) {
          const y = h / 2 + Math.sin(x * 0.01 + t + i * 1.6) * (12 + i * 8);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${i % 2 ? "124,77,255" : "0,229,255"},${0.14 - i * 0.03})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    }
  }

  /* ---------- 14. EASTER EGG ---------- */
  function initEasterEgg() {
    // Click bursts anywhere on the hero.
    const hero = $("#hero");
    if (hero && !prefersReduced) {
      hero.addEventListener("click", (e) => {
        if (e.target.closest("a, button")) return;
        burst(e.clientX, e.clientY);
      });
    }

    // Konami code -> "overclock" the accent gradient.
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let idx = 0;
    document.addEventListener("keydown", (e) => {
      idx = (e.key.toLowerCase() === seq[idx].toLowerCase() || e.key === seq[idx]) ? idx + 1 : 0;
      if (idx === seq.length) {
        idx = 0;
        document.documentElement.style.setProperty("--grad",
          "linear-gradient(120deg,#FFB020 0%,#00E5FF 50%,#7C4DFF 100%)");
        announce("Overclock mode engaged.");
        for (let i = 0; i < 24; i++) {
          setTimeout(() => burst(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight * 0.6 + 40
          ), i * 60);
        }
      }
    });
  }

  function burst(x, y) {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      const ang = (i / n) * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      p.style.cssText = `
        position:fixed;left:${x}px;top:${y}px;width:6px;height:6px;border-radius:50%;
        background:linear-gradient(120deg,#00E5FF,#7C4DFF);pointer-events:none;z-index:9999;
        transition:transform .7s cubic-bezier(.22,1,.36,1),opacity .7s;`;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px) scale(0)`;
        p.style.opacity = "0";
      });
      setTimeout(() => p.remove(), 750);
    }
  }

  function announce(msg) {
    let live = $("#a11yLive");
    if (!live) {
      live = document.createElement("div");
      live.id = "a11yLive";
      live.setAttribute("aria-live", "polite");
      live.className = "sr-only";
      document.body.appendChild(live);
    }
    live.textContent = msg;
  }

  /* ---------- 15. FOOTER YEAR ---------- */
  function setFooterYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }
})();
