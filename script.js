/* ============================================================
   ORYTINGO — site scripts
   (loaded with `defer` after document parsing)
============================================================ */

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
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        setTimeout(() => {
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
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
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
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

  if (!motionPreference.matches && "IntersectionObserver" in window && revealTargets.size) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.01,
        rootMargin: "100px 0px"
      }
    );

    revealTargets.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom >= -100 && rect.top <= window.innerHeight + 100) {
        element.classList.add("is-revealed");
      }
      revealObserver.observe(element);
    });

    document.documentElement.classList.add("scroll-reveal-enabled");
  }

  const animationSections = document.querySelectorAll(".hero, .modern-tech-marquee");

  if ("IntersectionObserver" in window && animationSections.length) {
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("animation-visible", entry.isIntersecting);
        });
      },
      { rootMargin: "100px 0px" }
    );

    animationSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom >= -100 && rect.top <= window.innerHeight + 100) {
        section.classList.add("animation-visible");
      }
      animationObserver.observe(section);
    });
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
      role: "Networking Engineer",
      bio: "Designs and supports reliable business networks, helping organizations stay connected, secure, and ready to grow.",
      image: "hasitha.jpeg",
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

  /* AUTO-PLAY SETTINGS */
  const AUTO_PLAY_DELAY = 6000;
  const ANIMATION_DURATION = 760;

  let autoPlayTimer = null;
  let animationTimer = null;
  let pausedByHover = false;
  let pausedByFocus = false;
  let touchStartX = null;
  let touchStartY = null;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
    if (isAnimating) return;

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

    if (prefersReducedMotion.matches) {
      bodySlides[oldIndex].classList.remove("is-leaving");
      isAnimating = false;
      return;
    }

    /* Finish animation */
    clearTimeout(animationTimer);
    animationTimer = window.setTimeout(() => {
      bodySlides[oldIndex].classList.remove("is-leaving");
      isAnimating = false;
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
    if (prefersReducedMotion.matches || document.hidden || !carouselVisible || pausedByHover || pausedByFocus) return;

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

  /* REDUCED MOTION CHANGES */
  prefersReducedMotion.addEventListener("change", () => {
    if (prefersReducedMotion.matches) {
      clearTimeout(autoPlayTimer);
      clearTimeout(animationTimer);
      bodySlides.forEach((body) => body.classList.remove("is-leaving"));
      isAnimating = false;
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