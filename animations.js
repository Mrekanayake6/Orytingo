/* ============================================================
   ORYTINGO — shared GSAP animation manager
============================================================ */
(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  const heroSelector = ".hero, .software-hero, .network-hero";
  const revealSelector = [
    ".section-head > *",
    ".pillar-card",
    ".why-card",
    ".service-card",
    ".timeline li",
    ".tech-badges > span",
    ".modern-tech-marquee",
    ".about-visual",
    ".about-copy > *",
    ".ot-carousel",
    ".cta-inner > *",
    ".software-service-card",
    ".project-card",
    ".package-card",
    ".benefit-card",
    ".software-process-grid > div",
    ".software-tech-grid > div",
    ".business-automation .industry-marquee",
    ".network-service-card",
    ".network-process-grid > div",
    ".worker-card",
    "[data-animate]"
  ].join(", ");
  const contexts = new Map();
  let mutationObserver;
  let resizeObserver;
  let eventController;
  let refreshFrame = 0;
  let transitionOverlay;
  let active = false;
  const interactiveSelector = ".btn, .pillar-card, .service-card, .software-service-card, .network-service-card, .project-card, .package-card, .benefit-card, .worker-card";

  const updateMarqueeDuration = (track) => {
    const distance = track.scrollWidth / 2;
    if (distance > 0) track.style.setProperty("--marquee-duration", `${distance / 32}s`);
  };

  const mount = (element, animation) => {
    if (!element.isConnected || contexts.has(element)) return;
    contexts.set(element, gsap.context(animation, element));
  };

  const containsRelatedTarget = (element, relatedTarget) =>
    relatedTarget instanceof Node && element.contains(relatedTarget);

  const animateHero = (hero) => {
    mount(hero, () => {
      const copy = hero.querySelector(".hero-copy, .software-hero-copy, .network-hero-copy");
      const visual = hero.querySelector(".hero-visual, .software-visual, .network-visual");
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (copy) {
        const copyItems = copy.querySelectorAll(".hero-kicker, h1, .hero-desc, .software-hero-desc, .network-hero-desc, .hero-actions, .software-hero-actions, .network-hero-actions, .hero-stats, .software-mini-stats, .network-mini-stats");
        timeline.fromTo(
          copyItems,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.78, stagger: 0.1, clearProps: "opacity,visibility,transform" },
          0
        );
      }

      if (visual) {
        timeline.fromTo(
          visual,
          { autoAlpha: 0, x: 34, scale: 0.97 },
          { autoAlpha: 1, x: 0, scale: 1, duration: 1, clearProps: "opacity,visibility,transform" },
          0.16
        );

        const networkLines = visual.querySelectorAll(".net-lines line");
        const networkNodes = visual.querySelectorAll(".net-nodes circle");
        if (networkLines.length) {
          timeline.fromTo(
            networkLines,
            { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" },
            { autoAlpha: 1, scaleX: 1, duration: 0.55, stagger: 0.055 },
            0.42
          );
        }
        if (networkNodes.length) {
          timeline.fromTo(
            networkNodes,
            { autoAlpha: 0, scale: 0.25, transformOrigin: "center center" },
            { autoAlpha: 1, scale: 1, duration: 0.42, stagger: 0.045 },
            0.68
          );
        }

        const orbits = visual.querySelectorAll(".code-orbit, .network-orbit");
        orbits.forEach((orbit, index) => {
          gsap.to(orbit, {
            rotation: `+=${index % 2 === 0 ? 360 : -360}`,
            duration: index % 2 === 0 ? 24 : 30,
            repeat: -1,
            ease: "none"
          });
        });

        const pulseOrbits = visual.querySelectorAll(".network-orbit");
        pulseOrbits.forEach((orbit, index) => {
          gsap.to(orbit, {
            scale: 1.045,
            opacity: 0.96,
            duration: 3.2 + index,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        });

        const parallaxTarget = visual.querySelector(".hero-svg");
        if (ScrollTrigger && parallaxTarget) {
          gsap.to(parallaxTarget, {
            y: 42,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: 1
            }
          });
        }
      }
    });
  };

  const animateReveal = (element, delay = 0) => {
    mount(element, () => {
      gsap.fromTo(
        element,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          delay,
          ease: "power2.out",
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
            onEnter: () => element.classList.add("is-revealed")
          }
        }
      );
    });
  };

  const elementsWithin = (root, selector) => {
    const elements = [];
    if (root instanceof Element && root.matches(selector)) elements.push(root);
    if (root.querySelectorAll) elements.push(...root.querySelectorAll(selector));
    return elements;
  };

  const scheduleRefresh = () => {
    if (!active || !ScrollTrigger || refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      ScrollTrigger.refresh();
    });
  };

  const initializeTree = (root = document) => {
    elementsWithin(root, heroSelector).forEach(animateHero);
    const siblingIndexes = new Map();
    elementsWithin(root, revealSelector).forEach((element) => {
      if (!ScrollTrigger) {
        element.classList.add("is-revealed");
        return;
      }

      const parent = element.parentElement;
      const siblingIndex = siblingIndexes.get(parent) || 0;
      siblingIndexes.set(parent, siblingIndex + 1);
      animateReveal(element, Math.min(siblingIndex, 4) * 0.07);
    });

    const tracks = elementsWithin(root, ".tech-marquee-track");
    tracks.forEach((track) => {
      updateMarqueeDuration(track);
      if (resizeObserver) resizeObserver.observe(track);
    });

    if (root !== document) scheduleRefresh();
  };

  const disposeTree = (root) => {
    if (root.matches && root.matches(interactiveSelector)) gsap.killTweensOf(root);
    if (root.querySelectorAll) {
      root.querySelectorAll(interactiveSelector).forEach((element) => gsap.killTweensOf(element));
    }

    contexts.forEach((context, element) => {
      if (element === root || root.contains(element)) {
        context.revert();
        element.classList.remove("is-revealed");
        contexts.delete(element);
      }
    });
  };

  const setupInteractions = () => {
    eventController = new AbortController();
    const options = { signal: eventController.signal };

    document.addEventListener("pointerover", (event) => {
      if (event.pointerType !== "mouse") return;
      const origin = event.target instanceof Element ? event.target : null;
      const target = origin && origin.closest(interactiveSelector);
      if (!target || containsRelatedTarget(target, event.relatedTarget)) return;
      gsap.to(target, { y: -4, duration: 0.24, ease: "power2.out", overwrite: "auto" });
    }, options);

    document.addEventListener("pointerout", (event) => {
      if (event.pointerType !== "mouse") return;
      const origin = event.target instanceof Element ? event.target : null;
      const target = origin && origin.closest(interactiveSelector);
      if (!target || containsRelatedTarget(target, event.relatedTarget)) return;
      gsap.to(target, { y: 0, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    }, options);

    document.addEventListener("focusin", (event) => {
      const origin = event.target instanceof Element ? event.target : null;
      const target = origin && origin.closest(".btn");
      if (target) gsap.to(target, { y: -3, duration: 0.2, overwrite: "auto" });
    }, options);

    document.addEventListener("focusout", (event) => {
      const origin = event.target instanceof Element ? event.target : null;
      const target = origin && origin.closest(".btn");
      if (target) gsap.to(target, { y: 0, duration: 0.24, overwrite: "auto" });
    }, options);

    transitionOverlay = document.querySelector(".page-transition-overlay");
    if (!transitionOverlay) {
      transitionOverlay = document.createElement("div");
      transitionOverlay.className = "page-transition-overlay";
      transitionOverlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(transitionOverlay);
    }
    gsap.set(transitionOverlay, { yPercent: 100 });

    document.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const origin = event.target instanceof Element ? event.target : null;
      const link = origin && origin.closest("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin ||
        (destination.pathname === window.location.pathname && destination.search === window.location.search) ||
        !destination.pathname.match(/\.(html?)$/i) && destination.pathname !== "/") return;

      event.preventDefault();
      gsap.to(transitionOverlay, {
        yPercent: 0,
        duration: 0.24,
        ease: "power3.inOut",
        overwrite: true,
        onComplete: () => window.location.assign(destination.href)
      });
    }, options);
  };

  const teardown = () => {
    active = false;
    if (mutationObserver) mutationObserver.disconnect();
    if (resizeObserver) resizeObserver.disconnect();
    if (eventController) eventController.abort();
    if (refreshFrame) cancelAnimationFrame(refreshFrame);
    refreshFrame = 0;

    document.querySelectorAll(interactiveSelector).forEach((element) => gsap.killTweensOf(element));
    if (transitionOverlay) gsap.killTweensOf(transitionOverlay);
    contexts.forEach((context, element) => {
      context.revert();
      element.classList.remove("is-revealed");
    });
    contexts.clear();
  };

  const initialize = () => {
    if (!gsap) {
      document.querySelectorAll(revealSelector).forEach((element) => element.classList.add("is-revealed"));
      return;
    }

    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    active = true;
    setupInteractions();
    resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver((entries) => entries.forEach(({ target }) => updateMarqueeDuration(target)))
      : null;
    initializeTree();

    mutationObserver = new MutationObserver((records) => {
      let treeChanged = false;
      records.forEach((record) => {
        treeChanged = true;
        record.removedNodes.forEach((node) => {
          if (node instanceof Element) {
            disposeTree(node);
          }
        });
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            initializeTree(node);
          }
        });
      });
      if (treeChanged) scheduleRefresh();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener("load", scheduleRefresh, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleRefresh);
  };

  initialize();
  window.addEventListener("pagehide", teardown);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) initialize();
  });
})();
