(() => {
  if (window.__hasuBrowseEffectLoaded) return;
  window.__hasuBrowseEffectLoaded = true;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  root.classList.add("hasu-browse-ready");

  function findTicker() {
    return Array.from(document.querySelectorAll(".fixed"))
      .find((element) => element.className.includes("top-0") && element.className.includes("h-[48px]"));
  }

  function findScrollLink() {
    return Array.from(document.querySelectorAll("a"))
      .find((element) => element.textContent?.trim().toLowerCase() === "scroll to explore");
  }

  function loaderMarkup() {
    return `
      <div class="hasu-arva-loader__mark">
        <div class="hasu-arva-loader__ring"></div>
        <div class="hasu-arva-loader__leaf" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
        </div>
        <div class="hasu-arva-loader__name">HasuMane</div>
      </div>
    `;
  }

  function ensureLoader() {
    const existing = document.querySelector(".hasu-arva-loader");
    if (existing) return existing;

    const loader = document.createElement("div");
    loader.className = "loader hasu-arva-loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = loaderMarkup();
    document.body.prepend(loader);
    return loader;
  }

  function prepareArvaElements() {
    const ticker = findTicker();
    const header = document.querySelector("header");
    const scrollLink = findScrollLink();

    ticker?.classList.add("hasu-arva-ticker");
    header?.classList.add("hasu-arva-header");
    scrollLink?.classList.add("hasu-arva-scroll");
  }

  function startArvaPreloader() {
    prepareArvaElements();

    if (reduceMotion.matches) {
      root.classList.remove("hasu-arva-preloader");
      root.classList.add("hasu-arva-loaded");
      return;
    }

    root.classList.add("hasu-arva-preloader");
    document.body.classList.add("preloader");

    const loader = ensureLoader();
    const video = document.querySelector(".hero-video");
    const startedAt = window.performance?.now?.() ?? Date.now();
    let windowReady = document.readyState === "complete";
    let mediaReady = true;
    let minimumTimeElapsed = false;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;

      root.classList.remove("hasu-arva-preloader");
      root.classList.add("hasu-arva-loaded");
      document.body.classList.remove("preloader");
      loader.classList.add("is-exiting");

      window.setTimeout(() => {
        loader.remove();
      }, 520);
    };

    const maybeFinish = () => {
      if (finished) return;
      if (windowReady && mediaReady && minimumTimeElapsed) {
        finish();
      }
    };

    window.setTimeout(() => {
      minimumTimeElapsed = true;
      maybeFinish();
    }, 520);

    window.setTimeout(finish, 1400);

    if (!windowReady) {
      window.addEventListener("load", () => {
        windowReady = true;
        maybeFinish();
      }, { once: true });
    }

    const elapsed = (window.performance?.now?.() ?? Date.now()) - startedAt;
    if (elapsed > 520) {
      minimumTimeElapsed = true;
      maybeFinish();
    }
  }

  function enhanceReveal() {
    const selectors = [
      "section",
      ".rounded-cards",
      ".zoom-container",
      ".admin-panel",
      ".admin-role-card",
      ".crm-chart-card",
      ".crm-stat-card",
    ];
    const targets = Array.from(document.querySelectorAll(selectors.join(",")))
      .filter((target) => {
        if (target.closest(".fixed")) return false;
        if (target.classList.contains("hasu-browse-target")) return false;
        return !target.querySelector(".hero-title");
      });

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("hasu-browse-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("hasu-browse-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    });

    targets.forEach((target, index) => {
      target.classList.add("hasu-browse-target");
      target.style.transitionDelay = `${Math.min(index % 4, 3) * 45}ms`;
      observer.observe(target);
    });
  }

  function enhanceParallax() {
    const images = Array.from(document.querySelectorAll(".zoom-container img"));
    images.forEach((image) => image.classList.add("hasu-browse-image"));

    if (reduceMotion.matches || images.length === 0) return;

    let ticking = false;

    function updateImages() {
      ticking = false;
      const viewportCenter = window.innerHeight / 2;
      images.forEach((image) => {
        const rect = image.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const imageCenter = rect.top + rect.height / 2;
        const offset = Math.max(-18, Math.min(18, (viewportCenter - imageCenter) * 0.035));
        image.style.setProperty("--hasu-browse-y", `${offset.toFixed(2)}px`);
      });
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateImages);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    requestUpdate();
  }

  function enhanceLinks() {
    document.querySelectorAll('a[href^="#"], button').forEach((element) => {
      if (!element.closest(".fixed")) {
        element.classList.add("hasu-browse-link");
      }
    });
  }

  function enhanceHeroVideo() {
    const video = document.querySelector(".hero-video");
    if (!(video instanceof HTMLVideoElement)) return;

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("fetchpriority", "low");
    video.setAttribute("webkit-playsinline", "");

    const play = () => {
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          // Muted autoplay can still be delayed by browser policy; retry on first user action.
        });
      }
    };

    window.requestAnimationFrame(play);

    const retry = () => {
      play();
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("touchstart", retry);
      window.removeEventListener("scroll", retry);
    };

    window.addEventListener("pointerdown", retry, { once: true, passive: true });
    window.addEventListener("touchstart", retry, { once: true, passive: true });
    window.addEventListener("scroll", retry, { once: true, passive: true });
  }

  function init() {
    startArvaPreloader();
    enhanceHeroVideo();
    enhanceReveal();
    enhanceParallax();
    enhanceLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
