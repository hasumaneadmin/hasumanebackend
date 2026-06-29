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

  function ensureOpeningLoader() {
    if (document.querySelector(".hasu-opening-loader") || !document.body) return;

    const loader = document.createElement("div");
    loader.className = "hasu-opening-loader";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-live", "polite");
    loader.setAttribute("aria-label", "Loading HasuMane");
    loader.innerHTML = [
      '<div class="hasu-opening-loader__content">',
      '<img class="hasu-opening-loader__mark" src="/favicon.svg?v=20260629-pro-logo" alt="" aria-hidden="true">',
      '<div class="hasu-opening-loader__brand">HasuMane</div>',
      '<div class="hasu-opening-loader__line" aria-hidden="true"><span></span></div>',
      "</div>",
    ].join("");
    document.body.prepend(loader);
  }

  function finishOpeningLoader() {
    root.classList.add("hasu-opening-loaded");

    window.setTimeout(() => {
      document.querySelectorAll(".hasu-opening-loader").forEach((loader) => loader.remove());
    }, 700);
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

  function enhanceHeroVideo() {
    const video = document.querySelector(".hero-video");
    if (!(video instanceof HTMLVideoElement)) return false;

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.removeAttribute("poster");
    video.setAttribute("fetchpriority", "high");
    video.setAttribute("webkit-playsinline", "");
    root.classList.remove("hasu-video-ready");
    root.classList.add("hasu-video-pending");

    const markReady = () => {
      if (video.readyState < 2) return;
      if (!hasVisibleFrame()) {
        scheduleReadyCheck();
        return;
      }
      root.classList.add("hasu-video-ready");
      root.classList.remove("hasu-video-pending");
      finishOpeningLoader();
    };
    let readinessCanvas;
    let readinessContext;
    let readinessCheckQueued = false;
    let readinessAttempts = 0;

    const hasVisibleFrame = () => {
      if (video.videoWidth === 0 || video.videoHeight === 0) return false;

      try {
        readinessCanvas ||= document.createElement("canvas");
        readinessCanvas.width = 24;
        readinessCanvas.height = 14;
        readinessContext ||= readinessCanvas.getContext("2d", { willReadFrequently: true });
        if (!readinessContext) return video.currentTime > 0.35;

        readinessContext.drawImage(video, 0, 0, readinessCanvas.width, readinessCanvas.height);
        const { data } = readinessContext.getImageData(0, 0, readinessCanvas.width, readinessCanvas.height);
        let brightness = 0;
        let samples = 0;

        for (let index = 0; index < data.length; index += 16) {
          const alpha = data[index + 3];
          if (alpha < 24) continue;
          brightness += (0.2126 * data[index]) + (0.7152 * data[index + 1]) + (0.0722 * data[index + 2]);
          samples += 1;
        }

        return samples > 0 && brightness / samples > 18;
      } catch {
        return video.currentTime > 0.35;
      }
    };

    const scheduleReadyCheck = () => {
      if (readinessCheckQueued || root.classList.contains("hasu-video-ready") || readinessAttempts > 90) return;
      readinessCheckQueued = true;
      readinessAttempts += 1;
      window.setTimeout(() => {
        readinessCheckQueued = false;
        markReady();
      }, 80);
    };

    ["loadeddata", "canplay", "playing", "timeupdate"].forEach((eventName) => {
      video.addEventListener(eventName, markReady, { passive: true });
    });

    const play = () => {
      markReady();
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
      scheduleReadyCheck();
    };

    video.load();
    markReady();
    window.requestAnimationFrame(play);
    video.addEventListener("canplay", play, { once: true });

    const retry = () => {
      play();
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("touchstart", retry);
      window.removeEventListener("scroll", retry);
    };

    window.addEventListener("pointerdown", retry, { once: true, passive: true });
    window.addEventListener("touchstart", retry, { once: true, passive: true });
    window.addEventListener("scroll", retry, { once: true, passive: true });
    return true;
  }

  function enhanceScrollFadeIn() {
    const targets = Array.from(document.querySelectorAll(".scroll-fade-in"));
    if (!targets.length) return;

    const reveal = (target) => {
      target.classList.add("scroll-fade-in-visible");
      target.style.visibility = "visible";
    };

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      targets.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.04,
      rootMargin: "0px 0px -24px 0px",
    });

    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(target);
        return;
      }
      observer.observe(target);
    });

    window.setTimeout(() => {
      document.querySelectorAll("#products,.scroll-fade-in").forEach(reveal);
      observer.disconnect();
    }, 4500);
  }

  function init() {
    ensureOpeningLoader();
    createProgress();
    updateProgress();
    const hasHeroVideo = enhanceHeroVideo();
    if (!hasHeroVideo) {
      window.setTimeout(finishOpeningLoader, 900);
    }
    window.setTimeout(finishOpeningLoader, 8000);
    enhanceScrollFadeIn();
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
