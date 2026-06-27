(() => {
  if (window.__hasuBrowseEffectLoaded) return;
  window.__hasuBrowseEffectLoaded = true;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  root.classList.add("hasu-browse-ready");

  function createProgress() {
    if (document.querySelector(".hasu-browse-progress")) return;
    const progress = document.createElement("div");
    progress.className = "hasu-browse-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = '<div class="hasu-browse-progress__bar"></div>';
    document.body.appendChild(progress);
  }

  function updateProgress() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const value = Math.min(1, Math.max(0, window.scrollY / scrollable));
    root.style.setProperty("--hasu-browse-progress", value.toFixed(4));
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
      .filter((target) => !target.closest(".fixed") && !target.classList.contains("hasu-browse-target"));

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

  function init() {
    createProgress();
    updateProgress();
    enhanceReveal();
    enhanceParallax();
    enhanceLinks();
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
