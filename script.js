/* ============================================================
   ORYTINGO — site scripts
   (loaded with `defer` after document parsing)
============================================================ */

(() => {
  const loader = document.getElementById("pageLoader");
  if (!loader || loader.dataset.loaderInitialized === "true") return;

  loader.dataset.loaderInitialized = "true";
  const root = document.documentElement;
  const fallbackTimer = root.dataset.pageLoaderFallback
    ? Number(root.dataset.pageLoaderFallback)
    : null;
  if (root.dataset.pageLoaderExpired === "true" || document.readyState === "complete") {
    if (fallbackTimer !== null) clearTimeout(fallbackTimer);
    delete root.dataset.pageLoaderFallback;
    root.classList.remove("page-loading");
    loader.remove();
    return;
  }

  let removalTimer;

  const hideLoader = () => {
    if (!root.classList.contains("page-loading")) return;

    if (fallbackTimer !== null) clearTimeout(fallbackTimer);
    delete root.dataset.pageLoaderFallback;
    root.classList.remove("page-loading");
    loader.classList.add("is-hiding");

    loader.addEventListener("transitionend", (event) => {
      if (event.target === loader && event.propertyName === "opacity") {
        clearTimeout(removalTimer);
        loader.remove();
      }
    }, { once: true });

    removalTimer = window.setTimeout(() => loader.remove(), 350);
  };

  window.addEventListener("load", hideLoader, { once: true });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) hideLoader();
  }, { once: true });
})();

(() => {

  /* =========================
     Footer Year
  ========================= */
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }


  /* =========================
     Mobile Menu
  ========================= */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
    });

    /* The open menu pushes the page down (it sits in the header's flow). If the browser
       scrolled to an #anchor while it was open, the page would jump up ~400px once the
       menu collapsed and overshoot the section. So: close the menu first, then scroll
       after the collapse transition (.35s) has finished. */
    const MENU_COLLAPSE_MS = 380;

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (event) => {
        const wasOpen = mobileMenu.classList.contains("open");

        mobileMenu.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");

        const href = link.getAttribute("href");
        if (!wasOpen || !href || href.length < 2 || href.charAt(0) !== "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();

        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.pushState(null, "", href);
        }, MENU_COLLAPSE_MS);
      });
    });
  }


  /* =========================
     Navbar Scroll
  ========================= */
  const navBar = document.getElementById("navBar");

  if (navBar) {
    let navTicking = false;

    const updateNavbar = () => {
      navBar.classList.toggle("scrolled", window.scrollY > 12);
      navTicking = false;
    };

    window.addEventListener("scroll", () => {
      if (!navTicking) {
        requestAnimationFrame(updateNavbar);
        navTicking = true;
      }
    }, { passive: true });

    /* Page may already be scrolled on load (e.g. refresh mid-page) */
    updateNavbar();
  }


  /* =========================
     Scroll Reveal Animation
  ========================= */
  const revealTargets = new Set();
  const addRevealGroup = (selector, stagger = false) => {
    const siblingIndexes = new Map();

    document.querySelectorAll(selector).forEach((element) => {
      if (revealTargets.has(element)) return;

      revealTargets.add(element);
      element.classList.add("reveal-item");

      if (stagger) {
        const parent = element.parentElement;
        const siblingIndex = siblingIndexes.get(parent) || 0;
        siblingIndexes.set(parent, siblingIndex + 1);
        element.style.setProperty("--reveal-delay", `${Math.min(siblingIndex, 4) * 45}ms`);
      }
    });
  };

  addRevealGroup(".section-head > *", true);
  addRevealGroup(".pillar-card, .why-card, .service-card, .timeline li, .tech-badges > span", true);
  addRevealGroup(
    ".modern-tech-marquee, .about-visual, .about-copy > *, .ot-carousel, .cta-inner > *"
  );
  addRevealGroup(
    ".software-service-card, .project-card, .package-card, .benefit-card, " +
    ".software-process-grid > div, .software-tech-grid > div, " +
    ".business-automation .industry-marquee, .network-service-card, " +
    ".network-process-grid > div, .worker-card",
    true
  );

  const animationTargets = new Set(document.querySelectorAll(".hero, .modern-tech-marquee"));
  const animationObserverTargets = new Set([...revealTargets, ...animationTargets]);

  if ("IntersectionObserver" in window && animationObserverTargets.size) {
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const { target, isIntersecting } = entry;

          if (revealTargets.has(target)) {
            target.classList.toggle("is-revealed", isIntersecting);
          }

          if (animationTargets.has(target)) {
            target.classList.toggle("animation-visible", isIntersecting);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "100px 0px"
      }
    );

    animationObserverTargets.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom >= -100 && rect.top <= window.innerHeight + 100) {
        if (revealTargets.has(element)) element.classList.add("is-revealed");
        if (animationTargets.has(element)) element.classList.add("animation-visible");
      }
      animationObserver.observe(element);
    });
    document.documentElement.classList.add("scroll-reveal-enabled");
    document.documentElement.classList.add("animation-visibility-ready");
  }

  const marqueeTracks = document.querySelectorAll(".tech-marquee-track");
  const updateMarqueeDuration = (track) => {
    const distance = track.scrollWidth / 2;
    if (distance > 0) {
      track.style.setProperty("--marquee-duration", `${distance / 32}s`);
    }
  };

  marqueeTracks.forEach(updateMarqueeDuration);

  if ("ResizeObserver" in window && marqueeTracks.length) {
    const marqueeResizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => updateMarqueeDuration(entry.target));
    });
    marqueeTracks.forEach((track) => marqueeResizeObserver.observe(track));
  }

})();




/* ============================================================
   ORYTINGO — TEAM CAROUSEL
   Auto-play + Manual Controls + Swipe
============================================================ */
(() => {
  const root = document.querySelector("[data-ot-carousel]");
  if (!root || root.dataset.otInitialized === "true") return;

  root.dataset.otInitialized = "true";

  const TEAM = [
    {
      name: "Lakshan Ekanayake",
      role: "Founder & Software Engineer",
      bio: "Leads ORYTINGO's engineering direction and develops practical software solutions designed around real business needs.",
      image: "2025_01_23_19_59_IMG_1027.JPG",
      focus: "50% 22%",
      social: {
        linkedin: "https://www.linkedin.com/in/lakshan-ekanayake-164909296/",
        github: "https://github.com/Mrekanayake6",
        facebook: "https://www.facebook.com/OryTingo"
      }
    },
    {
      name: "Adhithya Kumarasinhe",
      role: "Software Engineer",
      bio: "Designs and supports reliable business networks, helping organizations stay connected, secure, and ready to grow.",
      image: "adi.jpeg",
      focus: "50% 22%",
      social: {
        linkedin: "",
        github: "",
        facebook: ""
      }
    },
    {
      name: "Avishka Wijekoon",
      role: "Software Engineer",
      bio: "Builds reliable software solutions with a focus on clean development, practical problem solving, and maintainable systems.",
      image: "IMG_3650.JPG.jpeg",
      focus: "50% 22%",
      social: {
        linkedin: "",
        github: "",
        facebook: "https://www.facebook.com/OryTingo"
      }
    },
    {
      name: "Hasitha Sudasinghe",
      role: "Software Engineer",
      bio: "Designs and supports reliable business networks, helping organizations stay connected, secure, and ready to grow.",
      image: "hasitha.jpeg",
      focus: "50% 22%",
      social: {
        linkedin: "",
        github: "",
        facebook: ""
      }
    },

    {
      name: "Isuru Sandaruwan",
      role: "Networking Engineer",
      bio: "Designs and supports reliable business networks, helping organizations stay connected, secure, and ready to grow.",
      image: "isuru.jpeg",
      focus: "50% 22%",
      social: {
        linkedin: "",
        github: "",
        facebook: ""
      }
    }
  ];

  /* ELEMENTS */
  const media = root.querySelector("[data-ot-media]");
  const bodies = root.querySelector("[data-ot-bodies]");
  const progress = root.querySelector("[data-ot-progress]");
  const previousButton = root.querySelector("[data-ot-prev]");
  const nextButton = root.querySelector("[data-ot-next]");

  if (!media || !bodies || !progress || !previousButton || !nextButton) {
    root.dataset.otInitialized = "false";
    return;
  }

  const total = TEAM.length;
  if (!total) return;

  let currentIndex = 0;
  let isAnimating = false;
  let carouselVisible = true;
  let queuedStep = 0;

  /* AUTO-PLAY SETTINGS */
  const AUTO_PLAY_DELAY = 6000;
  const ANIMATION_DURATION = 760;

  let autoPlayTimer = null;
  let animationTimer = null;
  let pausedByHover = false;
  let pausedByFocus = false;
  let touchStartX = null;
  let touchStartY = null;

  /* HELPERS */
  const padNumber = (number) => String(number).padStart(2, "0");

  const getInitials = (name) =>
    name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const createElement = (tag, className, text = "") => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  /* SOCIAL MEDIA ICONS */
  const SOCIAL_PLATFORMS = [
    {
      key: "linkedin",
      label: "LinkedIn",
      viewBox: "0 0 24 24",
      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.266 2.37 4.266 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"
    },
    {
      key: "github",
      label: "GitHub",
      viewBox: "0 0 24 24",
      path: "M12 .9a11.1 11.1 0 0 0-3.51 21.63c.555.102.758-.24.758-.533v-2.08c-3.085.671-3.736-1.31-3.736-1.31-.505-1.284-1.233-1.626-1.233-1.626-1.007-.688.076-.674.076-.674 1.113.078 1.699 1.143 1.699 1.143.99 1.696 2.597 1.206 3.23.922.1-.718.388-1.207.705-1.484-2.462-.28-5.05-1.231-5.05-5.482 0-1.211.434-2.201 1.143-2.977-.115-.281-.495-1.41.108-2.94 0 0 .932-.298 3.053 1.137a10.6 10.6 0 0 1 5.556 0c2.12-1.435 3.05-1.137 3.05-1.137.605 1.53.225 2.659.11 2.94.712.776 1.14 1.766 1.14 2.977 0 4.262-2.592 5.198-5.062 5.472.398.344.752 1.02.752 2.056v3.063c0 .296.2.64.765.532A11.1 11.1 0 0 0 12 .9Z"
    },
    {
      key: "facebook",
      label: "Facebook",
      viewBox: "0 0 24 24",
      path: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.023 4.388 11.019 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.49 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.092 24 18.096 24 12.073Z"
    }
  ];

  /* Returns the social-links container, or null when the member has no valid links */
  function createSocialLinks(member) {
    const socialContainer = createElement("div", "ot-carousel__social");
    socialContainer.setAttribute("aria-label", `${member.name} social media links`);

    SOCIAL_PLATFORMS.forEach((platform) => {
      const url = member.social?.[platform.key];
      if (typeof url !== "string" || !url.trim()) return;

      let parsedURL;
      try {
        parsedURL = new URL(url, window.location.href);
      } catch {
        return;
      }

      if (parsedURL.protocol !== "https:" && parsedURL.protocol !== "http:") return;

      const link = createElement("a", `ot-carousel__social-link ot-carousel__social-link--${platform.key}`);
      link.href = parsedURL.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `${member.name} on ${platform.label}`);
      link.setAttribute("title", platform.label);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", platform.viewBox);
      svg.setAttribute("width", "18");
      svg.setAttribute("height", "18");
      svg.setAttribute("fill", "currentColor");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", platform.path);

      svg.appendChild(path);
      link.appendChild(svg);
      socialContainer.appendChild(link);
    });

    /* No valid links: do not render an empty container (it would add dead space) */
    return socialContainer.children.length ? socialContainer : null;
  }

  /* CREATE TEAM IMAGES */
  const photoImages = [];

  TEAM.forEach((member, index) => {
    const figure = createElement("figure", "ot-carousel__photo");
    const image = new Image();

    image.alt = `${member.name}, ${member.role} at ORYTINGO Networks & Software Solutions`;
    image.decoding = "async";
    image.loading = "lazy";
    image.draggable = false;
    image.style.objectPosition = member.focus || "50% 25%";

    if (index > 0) image.src = member.image;

    image.addEventListener("error", () => {
      figure.classList.add("is-missing");
    });

    const fallback = createElement("span", "ot-carousel__fallback", getInitials(member.name));
    fallback.setAttribute("aria-hidden", "true");

    figure.append(image, fallback);
    media.appendChild(figure);
    photoImages.push(image);
  });

  /* CREATE TEAM MEMBER CONTENT + SOCIAL LINKS */
  TEAM.forEach((member, index) => {
    const article = createElement("article", "ot-carousel__body");
    article.setAttribute("aria-label", `Team member ${index + 1} of ${total}`);

    const count = createElement("p", "ot-carousel__count");
    const current = createElement("strong", "", padNumber(index + 1));
    count.append(current, document.createTextNode(` / ${padNumber(total)}`));

    const role = createElement("p", "ot-carousel__role", member.role);
    const name = createElement("h3", "ot-carousel__name", member.name);
    const bio = createElement("p", "ot-carousel__bio", member.bio);
    const socialLinks = createSocialLinks(member);

    article.append(count, role, name, bio);
    if (socialLinks) article.append(socialLinks);
    bodies.appendChild(article);
  });

  /* CREATE PROGRESS INDICATORS */
  TEAM.forEach(() => {
    const tick = createElement("span");
    progress.appendChild(tick);
  });

  const photos = [...media.querySelectorAll(".ot-carousel__photo")];
  const bodySlides = [...bodies.querySelectorAll(".ot-carousel__body")];
  const progressTicks = [...progress.querySelectorAll("span")];

  const loadFirstPhoto = () => {
    const firstImage = photoImages[0];
    if (!firstImage || firstImage.hasAttribute("src")) return;

    firstImage.loading = "eager";
    firstImage.src = TEAM[0].image;
  };

  if ("IntersectionObserver" in window) {
    const photoObserver = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadFirstPhoto();
          obs.disconnect();
        }
      },
      { rootMargin: "1200px 0px" }
    );
    photoObserver.observe(root);
  } else {
    loadFirstPhoto();
  }

  /* INITIAL STATE */
  photos.forEach((photo, index) => {
    photo.classList.toggle("is-active", index === 0);
  });

  bodySlides.forEach((body, index) => {
    if (index === 0) {
      body.classList.add("is-active");
      body.removeAttribute("aria-hidden");
    } else {
      body.setAttribute("aria-hidden", "true");
    }
  });

  progressTicks.forEach((tick, index) => {
    tick.classList.toggle("is-active", index === 0);
  });

  /* CHANGE MEMBER */
  function showMember(nextIndex, direction = "next") {
    if (isAnimating) {
      queuedStep += direction === "prev" ? -1 : 1;
      return;
    }

    nextIndex = (nextIndex + total) % total;
    if (nextIndex === currentIndex) return;

    isAnimating = true;
    root.dataset.direction = direction;

    const oldIndex = currentIndex;

    /* Old content */
    bodySlides[oldIndex].classList.remove("is-active");
    bodySlides[oldIndex].classList.add("is-leaving");
    bodySlides[oldIndex].setAttribute("aria-hidden", "true");
    photos[oldIndex].classList.remove("is-active");
    progressTicks[oldIndex].classList.remove("is-active");

    /* New content */
    currentIndex = nextIndex;
    bodySlides[currentIndex].classList.remove("is-leaving");
    bodySlides[currentIndex].classList.add("is-active");
    bodySlides[currentIndex].removeAttribute("aria-hidden");
    photos[currentIndex].classList.add("is-active");
    progressTicks[currentIndex].classList.add("is-active");

    /* Finish animation */
    clearTimeout(animationTimer);
    animationTimer = window.setTimeout(() => {
      bodySlides[oldIndex].classList.remove("is-leaving");
      isAnimating = false;

      if (queuedStep !== 0) {
        const step = queuedStep;
        queuedStep = 0;
        showMember(currentIndex + step, step < 0 ? "prev" : "next");
      }
    }, ANIMATION_DURATION);
  }

  /* NEXT / PREVIOUS */
  function nextMember() {
    showMember(currentIndex + 1, "next");
  }

  function previousMember() {
    showMember(currentIndex - 1, "prev");
  }

  /* AUTO-PLAY */
  function startAutoPlay() {
    clearTimeout(autoPlayTimer);
    if (document.hidden || !carouselVisible || pausedByHover || pausedByFocus) return;

    autoPlayTimer = window.setTimeout(() => {
      if (!document.hidden && carouselVisible && !pausedByHover && !pausedByFocus) {
        nextMember();
      }
      startAutoPlay();
    }, AUTO_PLAY_DELAY);
  }

  function resetAutoPlay() {
    startAutoPlay();
  }

  if ("IntersectionObserver" in window) {
    const rect = root.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    carouselVisible = rect.width > 0 && rect.height > 0 &&
      (visibleHeight * visibleWidth) / (rect.width * rect.height) >= 0.1;

    const carouselObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
          if (visible === carouselVisible) return;

          carouselVisible = visible;
          if (visible) {
            startAutoPlay();
          } else {
            clearTimeout(autoPlayTimer);
          }
        });
      },
      { threshold: 0.1 }
    );
    carouselObserver.observe(root);
  }

  /* BUTTON EVENTS */
  nextButton.addEventListener("click", () => {
    nextMember();
    resetAutoPlay();
  });

  previousButton.addEventListener("click", () => {
    previousMember();
    resetAutoPlay();
  });

  /* KEYBOARD NAVIGATION
     Arrow keys only act while the carousel is hovered or has focus,
     so normal page keyboard behaviour is untouched everywhere else. */
  document.addEventListener("keydown", (event) => {
    if (!pausedByHover && !pausedByFocus) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const target = event.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;

    if (event.key === "ArrowRight") {
      nextMember();
      resetAutoPlay();
    }
    if (event.key === "ArrowLeft") {
      previousMember();
      resetAutoPlay();
    }
  });

  /* Pause autoplay for mouse hover; touch input is handled by the swipe listeners. */
  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    pausedByHover = true;
    clearTimeout(autoPlayTimer);
  });

  root.addEventListener("pointerleave", (event) => {
    if (event.pointerType !== "mouse") return;
    pausedByHover = false;
    startAutoPlay();
  });

  /* FOCUS PAUSE */
  root.addEventListener("focusin", () => {
    pausedByFocus = true;
    clearTimeout(autoPlayTimer);
  });

  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) {
      pausedByFocus = false;
      startAutoPlay();
    }
  });

  /* TAB VISIBILITY */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(autoPlayTimer);
    } else {
      startAutoPlay();
    }
  });

  /* TOUCH SWIPE */
  root.addEventListener("touchstart", (event) => {
    if (!event.touches.length) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    clearTimeout(autoPlayTimer);
  }, { passive: true });

  root.addEventListener("touchend", (event) => {
    if (touchStartX === null || !event.changedTouches.length) return;

    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;

    const deltaX = endX - touchStartX;
    const deltaY = endY - touchStartY;

    touchStartX = null;
    touchStartY = null;

    if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 50) {
      startAutoPlay();
      return;
    }

    if (deltaX < 0) {
      nextMember();
    } else {
      previousMember();
    }
    resetAutoPlay();
  }, { passive: true });

  /* Touch interrupted (e.g. system gesture): resume auto-play instead of stalling */
  root.addEventListener("touchcancel", () => {
    touchStartX = null;
    touchStartY = null;
    startAutoPlay();
  }, { passive: true });

  /* START AUTO-PLAY */
  startAutoPlay();
})();

/* ============================================================
   [NEW ANIMATION / අලුතින් එක් කළ කොටස]
   Top-edge Robot Mascot Scroll Animation Logic
   (පිටුව scroll කරද්දී Robot Mascot එක smoothව දුවන JavaScript කොටස)
============================================================ */
(() => {
  const layer = document.getElementById('mascot');
  if (!layer) return;

  const svg = document.getElementById('mascot-trail');
  const base = document.getElementById('m-base');
  const glow = document.getElementById('m-glow');
  const robot = document.getElementById('robot');
  if (!svg || !base || !glow || !robot) return;

  const flip = robot.querySelector('.flip');
  const tilt = robot.querySelector('.tilt');
  const NS = 'http://www.w3.org/2000/svg';
  const root = document.documentElement;
  const CFG = { step: 8, idleMs: 140, particles: 10, tail: 4.5 };

  const dots = Array.from({ length: CFG.particles }, () => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('class', 'dot');
    svg.appendChild(c);
    return c;
  });

  let vw = 0, Wr = 0, Hr = 0, amp = 0, baseY = 0, wl = 0, x0 = 0, x1 = 0, lens = [], total = 0, maxScroll = 0;
  let cur = 0, dir = 1, lastY = 0, lastScroll = 0, lastSpawn = 0, di = 0, raf = 0, prevT = 0, running = false;
  let hasRevealed = false;

  const calcMax = () => Math.max(0, root.scrollHeight - root.clientHeight);
  const readY = () => Math.min(Math.max(window.pageYOffset || root.scrollTop || 0, 0), maxScroll);
  const yAt = (x) => baseY - amp * Math.sin(((x - x0) / wl) * Math.PI * 2);
  const slopeAt = (x) => -amp * Math.cos(((x - x0) / wl) * Math.PI * 2) * (Math.PI * 2 / wl);
  const targetX = () => x0 + (maxScroll ? readY() / maxScroll : 0) * (x1 - x0);

  /* [LOADER FIX] පිටුව සම්පූර්ණයෙන්ම load වී loader එක අයින් වූ පසු පමණක් robot පෙන්වීම */
  function revealMascot() {
    if (hasRevealed) return;
    if (root.classList.contains('page-loading')) {
      const observer = new MutationObserver(() => {
        if (!root.classList.contains('page-loading')) {
          observer.disconnect();
          hasRevealed = true;
          setTimeout(() => layer.classList.add('ready'), 180);
        }
      });
      observer.observe(root, { attributes: true, attributeFilter: ['class'] });

      window.addEventListener('load', () => {
        setTimeout(() => {
          if (!hasRevealed) {
            hasRevealed = true;
            layer.classList.add('ready');
          }
        }, 300);
      }, { once: true });
    } else {
      hasRevealed = true;
      setTimeout(() => layer.classList.add('ready'), 100);
    }
  }

  function build() {
    vw = layer.clientWidth || window.innerWidth;
    Wr = robot.offsetWidth || 26;
    Hr = robot.offsetHeight || 29;
    maxScroll = calcMax();

    const isSmall = vw < 640;
    // Mobile smooth wave amplitude & tail scaling
    amp = isSmall ? Math.max(1.4, Wr * 0.075) : Math.max(2, Wr * 0.1);
    CFG.tail = isSmall ? 3.5 : 4.5;
    CFG.idleMs = isSmall ? 180 : 140;

    baseY = Hr * 0.96 + amp + 1;
    layer.style.height = Math.ceil(baseY + amp + 3) + 'px';
    x0 = Wr * 0.6 + 4;
    x1 = Math.max(x0 + 40, vw - Wr * 0.6 - 4);
    wl = Math.max(140, (x1 - x0) / 2.2);

    let d = '', acc = 0, px, py;
    lens = [];
    for (let x = x0; ; x += CFG.step) {
      const xx = Math.min(x, x1), y = yAt(xx);
      if (px !== undefined) acc += Math.hypot(xx - px, y - py);
      d += (d ? 'L' : 'M') + xx.toFixed(1) + ' ' + y.toFixed(1);
      lens.push(acc);
      px = xx;
      py = y;
      if (xx >= x1) break;
    }
    total = acc;
    base.setAttribute('d', d);
    glow.setAttribute('d', d);
    lastY = readY();
    cur = targetX();
    render(true);

    revealMascot();
  }

  function sync() {
    if (!lens.length || layer.clientWidth !== vw || robot.offsetWidth !== Wr) return build();
    maxScroll = calcMax();
    if (!running) {
      cur = targetX();
      render(true);
    }
  }

  function spawn(x, y, now) {
    if (!dots.length || now - lastSpawn < 70) return;
    lastSpawn = now;
    const c = dots[di++ % dots.length];
    c.setAttribute('cx', x - dir * Wr * 0.3);
    c.setAttribute('cy', y - 1);
    c.setAttribute('r', 0.9 + Math.random() * 1.1);
    c.animate([
      { opacity: 0.85, transform: 'translate3d(0,0,0)' },
      { opacity: 0, transform: `translate3d(${-dir * (7 + Math.random() * 8)}px,${-Math.random() * 6}px,0)` }
    ], { duration: 550, easing: 'ease-out' });
  }

  function render(force) {
    const y = yAt(cur);
    robot.style.transform = `translate3d(${(cur - Wr / 2).toFixed(1)}px,${(y - Hr * 0.96).toFixed(1)}px,0)`;
    if (flip) flip.style.setProperty('--face', dir);
    if (tilt) tilt.style.transform = `rotate(${(Math.atan(slopeAt(cur)) * 57.3).toFixed(1)}deg)`;
    const i = Math.min(lens.length - 1, Math.max(0, Math.round((cur - x0) / CFG.step)));
    const l = lens[i] || 0, t = Wr * CFG.tail;
    const start = dir > 0 ? Math.max(0, l - t) : l;
    const len = dir > 0 ? l - start : Math.min(t, total - l);
    glow.style.strokeDasharray = `0 ${start} ${len} ${total + 10}`;
    if (!force && running) spawn(cur, y, performance.now());
  }

  function frame(t) {
    const dt = Math.min(0.05, (t - prevT) / 1000 || 0.016);
    prevT = t;
    const target = targetX();

    // Mobile butter-smooth lerp rate
    const lerpSpeed = vw < 640 ? 11 : 13.5;
    cur += (target - cur) * (1 - Math.exp(-dt * lerpSpeed));
    if (Math.abs(target - cur) < 0.15) cur = target;

    const isSmall = vw < 640;
    const idleThreshold = isSmall ? 260 : 160;
    const minDiff = isSmall ? 0.1 : 0.35;
    const moving = isTouching || (t - lastScroll < idleThreshold) || (Math.abs(target - cur) > minDiff);

    if (moving !== running) {
      running = moving;
      robot.classList.toggle('run', running);
      layer.classList.toggle('run', running);
    }
    render();
    raf = (running || cur !== target) ? requestAnimationFrame(frame) : 0;
  }

  const wake = () => {
    if (!raf) {
      prevT = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  let isTouching = false;
  window.addEventListener('touchstart', () => {
    isTouching = true;
    lastScroll = performance.now();
    wake();
  }, { passive: true });

  window.addEventListener('touchmove', () => {
    isTouching = true;
    lastScroll = performance.now();
    wake();
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isTouching = false;
    lastScroll = performance.now();
    wake();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const y = readY(), dy = y - lastY;
    lastScroll = performance.now();
    if (Math.abs(dy) >= 0.4) {
      dir = dy > 0 ? 1 : -1;
      lastY = y;
    }
    wake();
  }, { passive: true });

  let rz = 0;
  const onResize = () => {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(() => {
      sync();
      wake();
    });
  };

  window.addEventListener('resize', onResize);
  window.addEventListener('load', onResize);
  window.addEventListener('pageshow', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 250));
  if (window.visualViewport) visualViewport.addEventListener('resize', onResize);
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(document.body);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
/* ============ /MASCOT JS ============ */

/* =========================================================
   [NEW ANIMATION / අලුතින් එක් කළ කොටස]
   ORYTINGO – Robot Train Engine & Railway Road Scrollbar Logic
   (පිටුවේ දකුණු පසින් Scroll කරද්දී රෝද කැරකෙමින් දුම් දමමින් දිවෙන Robot Train Engine Scrollbar එක)
   ========================================================= */
(function () {
  'use strict';

  if (window.__otRobotBus) return;
  window.__otRobotBus = true;

  var SVG = '' +
    '<svg class="rbs-svg" viewBox="0 0 32 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
    '<defs>' +
      '<linearGradient id="rbs-body" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#3c424c"/><stop offset="0.45" stop-color="#1b1e24"/><stop offset="1" stop-color="#0a0c0f"/>' +
      '</linearGradient>' +
      '<linearGradient id="rbs-boiler" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#555d6b"/><stop offset="0.5" stop-color="#242830"/><stop offset="1" stop-color="#0e1014"/>' +
      '</linearGradient>' +
      '<linearGradient id="rbs-glass" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#24384d"/><stop offset="1" stop-color="#070c12"/>' +
      '</linearGradient>' +
      '<radialGradient id="rbs-glowg" cx="0.5" cy="0.5" r="0.5">' +
        '<stop offset="0" class="rbs-stop-accent" stop-opacity="0.6"/>' +
        '<stop offset="1" class="rbs-stop-accent" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<linearGradient id="rbs-beamg" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#fff0d4" stop-opacity="0.95"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<radialGradient id="rbs-rim" cx="0.5" cy="0.5" r="0.5">' +
        '<stop offset="0" stop-color="#67707e"/><stop offset="0.8" stop-color="#282d35"/><stop offset="1" stop-color="#ff813e"/>' +
      '</radialGradient>' +
    '</defs>' +
    '<g transform="translate(32 0) rotate(90)">' +
      /* Ambient track/engine glow */
      '<ellipse class="rbs-glow" cx="30" cy="16" rx="30" ry="16" fill="url(#rbs-glowg)"/>' +
      /* Powerful locomotive headlight beam */
      '<path class="rbs-beam" d="M53 14 L68 9 L68 19 Z" fill="url(#rbs-beamg)"/>' +
      /* Steam puffs from chimney */
      '<ellipse class="rbs-steam rbs-steam-1" cx="44" cy="1" rx="2.4" ry="1.6" fill="#fff"/>' +
      '<ellipse class="rbs-steam rbs-steam-2" cx="42" cy="-2.5" rx="3.5" ry="2" fill="#fff"/>' +
      /* Chimney / Smokestack */
      '<rect x="42" y="3.2" width="4.8" height="4.5" rx="0.8" fill="#1b1e24" stroke="#444a54" stroke-width="0.5"/>' +
      '<ellipse cx="44.4" cy="3.2" rx="3.2" ry="1" class="rbs-accent"/>' +
      /* Brass steam dome / whistle */
      '<path d="M26 4.5 Q28 2.5 30 4.5 L30 7.5 L26 7.5 Z" fill="var(--rbs-accent)" opacity="0.85"/>' +
      /* Cab roof curved overhang */
      '<rect x="3" y="2.5" width="16" height="2" rx="1" fill="#20242b" stroke="var(--rbs-accent)" stroke-width="0.5"/>' +
      /* Engineer Cab (driver cabin) */
      '<rect x="4" y="4" width="14" height="20" rx="3" fill="url(#rbs-body)" stroke="#444a54" stroke-width="0.5"/>' +
      /* Cab window with Robot driver face */
      '<rect x="6" y="6.5" width="9.5" height="7.5" rx="1.8" fill="url(#rbs-glass)"/>' +
      '<circle class="rbs-accent rbs-eye" cx="8.8" cy="9.8" r="1.15"/>' +
      '<circle class="rbs-accent rbs-eye" cx="12.8" cy="9.8" r="1.15"/>' +
      '<path d="M8.5 12 Q10.8 13.5 13 12" fill="none" stroke-width="0.7" stroke-linecap="round" class="rbs-accent-line"/>' +
      /* Cylindrical Locomotive Boiler Body */
      '<rect x="17" y="6.8" width="33" height="17.2" rx="3" fill="url(#rbs-boiler)" stroke="#444a54" stroke-width="0.5"/>' +
      /* Brass / orange boiler bands */
      '<line x1="26" y1="6.8" x2="26" y2="24" stroke="var(--rbs-accent)" stroke-width="0.8" opacity="0.75"/>' +
      '<line x1="36" y1="6.8" x2="36" y2="24" stroke="var(--rbs-accent)" stroke-width="0.8" opacity="0.75"/>' +
      '<line x1="46" y1="6.8" x2="46" y2="24" stroke="var(--rbs-accent)" stroke-width="0.8" opacity="0.75"/>' +
      /* Running board / chassis base */
      '<rect x="2" y="22" width="52" height="3" fill="#0d0f13" rx="1"/>' +
      '<circle class="rbs-light" cx="21" cy="23.5" r="0.8"/>' +
      '<circle class="rbs-light rbs-l2" cx="31" cy="23.5" r="0.8"/>' +
      '<circle class="rbs-light rbs-l3" cx="41" cy="23.5" r="0.8"/>' +
      /* Cowcatcher / Front Pilot wedge */
      '<polygon points="50,15 57,18.5 57,25 50,25" fill="#14181f" stroke="var(--rbs-accent)" stroke-width="0.6"/>' +
      '<line x1="51.5" y1="18" x2="56" y2="23" stroke="var(--rbs-accent)" stroke-width="0.5"/>' +
      '<line x1="51.5" y1="21" x2="54" y2="24" stroke="var(--rbs-accent)" stroke-width="0.5"/>' +
      /* Big Cyclops Train Lantern Headlight */
      '<rect x="49.5" y="10.5" width="3" height="6.5" rx="1.2" fill="#1b1e24" stroke="var(--rbs-accent)" stroke-width="0.6"/>' +
      '<circle cx="51" cy="13.7" r="2.2" fill="#fff2de"/>' +
      /* Wheel arch cutouts */
      '<circle cx="14" cy="25.5" r="5.6" fill="#050608"/>' +
      '<circle cx="28" cy="25.5" r="5.6" fill="#050608"/>' +
      '<circle cx="42" cy="25.5" r="5.6" fill="#050608"/>' +
      /* 3 rotating train wheels with spokes and steel rims */
      wheel('rbs-wheel', 14, 25.5) +
      wheel('rbs-wheel', 28, 25.5) +
      wheel('rbs-wheel', 42, 25.5) +
      /* Connecting / Side Coupling Rod across all 3 driving wheels */
      '<line class="rbs-rod" x1="14" y1="25.5" x2="42" y2="25.5" stroke="var(--rbs-accent)" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle cx="14" cy="25.5" r="1.1" fill="#ffe2bd"/>' +
      '<circle cx="28" cy="25.5" r="1.1" fill="#ffe2bd"/>' +
      '<circle cx="42" cy="25.5" r="1.1" fill="#ffe2bd"/>' +
    '</g>' +
    '</svg>';

  function wheel(cls, cx, cy) {
    return '<g class="' + cls + '" data-cx="' + cx + '" data-cy="' + cy + '">' +
      /* Outer train wheel flange */
      '<circle cx="' + cx + '" cy="' + cy + '" r="5.2" fill="#0f1115" stroke="#3d4450" stroke-width="0.5"/>' +
      /* Inner steel tyre / rim */
      '<circle cx="' + cx + '" cy="' + cy + '" r="4.2" fill="url(#rbs-rim)"/>' +
      /* Train wheel spokes */
      '<path d="M' + cx + ' ' + (cy - 3.8) + 'V' + (cy + 3.8) + 'M' + (cx - 3.8) + ' ' + cy + 'H' + (cx + 3.8) +
        'M' + (cx - 2.6) + ' ' + (cy - 2.6) + 'L' + (cx + 2.6) + ' ' + (cy + 2.6) +
        'M' + (cx - 2.6) + ' ' + (cy + 2.6) + 'L' + (cx + 2.6) + ' ' + (cy - 2.6) +
        '" stroke="var(--rbs-accent)" stroke-width="0.6" stroke-linecap="round" class="rbs-accent-line" fill="none"/>' +
      /* Axle pin */
      '<circle cx="' + cx + '" cy="' + cy + '" r="1.1" fill="#0a0b0d"/>' +
    '</g>';
  }

  function init() {
    var doc = document.documentElement;
    var body = document.body;
    if (!body || document.querySelector('.rbs-rail')) return;

    var rail = document.createElement('div');
    rail.className = 'rbs-rail rbs--hidden';
    rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML =
      '<div class="rbs-lane">' +
        '<div class="rbs-track"><div class="rbs-fill"></div></div>' +
        '<div class="rbs-hit"></div>' +
        '<div class="rbs-bus">' + SVG + '</div>' +
      '</div>';
    body.appendChild(rail);

    var lane = rail.querySelector('.rbs-lane');
    var fill = rail.querySelector('.rbs-fill');
    var hit = rail.querySelector('.rbs-hit');
    var bus = rail.querySelector('.rbs-bus');
    var wheels = rail.querySelectorAll('.rbs-wheel');

    var maxScroll = 0, laneH = 0, busH = 0, travel = 0, wheelPx = 4.6;
    var cur = 0, target = 0, curY = 0, prevY = 0;
    var raf = 0, lastT = 0, facingUp = false, moving = false, dragging = false;

    function scroller() {
      var se = document.scrollingElement || doc;
      if (se.scrollHeight - se.clientHeight <= 1 && body.scrollHeight - body.clientHeight > 1) {
        var oy = window.getComputedStyle(body).overflowY;
        if (oy === 'auto' || oy === 'scroll') return body;
      }
      return se;
    }
    function getTop() {
      var s = scroller();
      return s === body ? body.scrollTop : (window.pageYOffset || s.scrollTop || 0);
    }
    function setTop(top) {
      var s = scroller();
      if (s === body) { body.scrollTop = top; return; }
      try { window.scrollTo({ top: top, left: 0, behavior: 'instant' }); }
      catch (err) { window.scrollTo(0, top); }
    }

    function measure() {
      var s = scroller();
      var viewH = s === body ? body.clientHeight : (doc.clientHeight || window.innerHeight);
      maxScroll = Math.max(0, s.scrollHeight - viewH);
      laneH = lane.clientHeight;
      busH = bus.getBoundingClientRect().height;
      travel = Math.max(0, laneH - busH);
      wheelPx = (bus.getBoundingClientRect().width / 32) * 4.6;
      rail.classList.toggle('rbs--hidden', maxScroll <= 1);
      readTarget();
    }

    function readTarget() {
      target = maxScroll > 0 ? Math.min(1, Math.max(0, getTop() / maxScroll)) : 0;
    }

    function schedule() {
      if (!raf) { lastT = 0; raf = requestAnimationFrame(frame); }
    }

    function frame(t) {
      raf = 0;
      readTarget();
      var dt = lastT ? Math.min(50, t - lastT) : 16;
      lastT = t;

      var diffPx = (target - cur) * travel;

      if (dragging) {
        cur = target;
      } else if (Math.abs(diffPx) < 0.15) {
        cur = target;
      } else {
        cur += (target - cur) * (1 - Math.exp(-dt / 70));
      }

      curY = cur * travel;
      bus.style.transform = 'translate3d(0,' + curY.toFixed(2) + 'px,0)';
      fill.style.transform = 'scaleY(' + (travel > 0 ? Math.min(1, (curY + busH * 0.5) / laneH) : 0).toFixed(4) + ')';

      var deg = (curY / wheelPx) * 57.29578;
      var a = (facingUp ? -deg : deg).toFixed(2);
      for (var i = 0; i < wheels.length; i++) {
        var w = wheels[i];
        w.setAttribute('transform', 'rotate(' + a + ' ' + w.getAttribute('data-cx') + ' ' + w.getAttribute('data-cy') + ')');
      }

      var dy = curY - prevY;
      if (dy > 0.3 && facingUp) { facingUp = false; rail.classList.remove('rbs--up'); }
      else if (dy < -0.3 && !facingUp) { facingUp = true; rail.classList.add('rbs--up'); }
      prevY = curY;

      var isMoving = Math.abs(dy) > 0.05 || Math.abs(target - cur) * travel > 0.15;
      if (isMoving !== moving) {
        moving = isMoving;
        rail.classList.toggle('rbs--moving', moving);
      }

      if (cur !== target || dragging) schedule();
      else if (moving) { moving = false; rail.classList.remove('rbs--moving'); }
    }

    function onScroll(e) {
      var t = e.target;
      if (t === document || t === body || t === doc) schedule();
    }
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('scroll', schedule, { passive: true });

    function onResize() { measure(); schedule(); }
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    window.addEventListener('load', onResize);
    if (window.visualViewport) visualViewport.addEventListener('resize', onResize, { passive: true });
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(onResize);
      ro.observe(doc); ro.observe(body); ro.observe(lane);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

    var grab = 0;
    function posToScroll(clientY) {
      var r = lane.getBoundingClientRect();
      var p = travel > 0 ? (clientY - grab - r.top - busH / 2) / travel : 0;
      setTop(Math.min(1, Math.max(0, p)) * maxScroll);
      schedule();
    }
    function onDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      measure();
      var onBus = bus.contains(e.target);
      if (onBus) {
        var br = bus.getBoundingClientRect();
        grab = e.clientY - (br.top + br.height / 2);
      } else { grab = 0; }
      dragging = true;
      rail.classList.add('rbs--drag');
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
      posToScroll(e.clientY);
    }
    function onMove(e) { if (dragging) posToScroll(e.clientY); }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove('rbs--drag');
      schedule();
    }
    [bus, hit].forEach(function (el) {
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
      el.addEventListener('lostpointercapture', onUp);
    });

    measure();
    cur = target;
    curY = prevY = cur * travel;
    schedule();

    window.__otRobotBus = { refresh: onResize };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
/* ============ /ROBOT TRAIN SCROLLBAR JS ============ */