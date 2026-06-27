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
    root.classList.remove("hasu-arva-preloader");
    root.classList.add("hasu-arva-loaded");
    document.body.classList.remove("preloader");
    document.querySelectorAll(".hasu-arva-loader").forEach((loader) => loader.remove());
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
