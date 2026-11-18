/**
 * ORYTINGO — CLIENT PROJECT SHOWCASE GENERATOR
 * Reusable visual editor & high-resolution poster generator
 * Resolution: 1080 × 1350 px (4:5 social media portfolio standard)
 * 100% Vanilla JavaScript, HTML5 Canvas 2D
 */

(function () {
  'use strict';

  // =========================================================================
  // DEFAULT APPLICATION STATE
  // =========================================================================
  const DEFAULT_STATE = {
    // 1. Project Information
    project: {
      name: "ATUWA PROPERTY PORTAL",
      client: "Atuwa Real Estate (Pvt) Ltd",
      category: "Full-Stack Web & Mobile Platform",
      description: "Comprehensive property discovery & management ecosystem featuring interactive spatial mapping, instant viewing reservations, and mortgage syndication.",
      techStack: "Next.js, Node.js, PostgreSQL, Tailwind CSS, AWS",
      url: "atuwa.lk",
      align: "left", // 'left' | 'center'
      titleFontSize: 46,
    },
    // Visibility Toggles
    toggles: {
      showCompletedBadge: true,
      showDescription: true,
      showTechStack: true,
      showClientBadge: true,
      showUrl: true,
      showDeviceShadows: true,
      showReflections: true,
    },
    // 2. Desktop Screenshot & Laptop Mockup (Completely Independent)
    desktop: {
      imageData: null,       // Data URL or image source
      imageObj: null,        // HTMLImageElement
      fileName: "atuwa.png",
      fileSize: "1.4 MB",
      zoom: 100,             // 50% to 300%
      panX: 0,               // -800 to 800 px
      panY: 0,               // -800 to 800 px
      fitMode: "cover",      // 'cover' | 'contain' | 'free'
      style: "macbook-dark", // 'macbook-dark' | 'macbook-silver' | 'macbook-midnight' | 'minimal-dark' | 'cyber-glow'
      scale: 100,            // 50% to 150%
      posX: 480,             // Center X on 1080 canvas
      posY: 710,             // Center Y on 1350 canvas
      rotation: 0,           // -25 to +25 deg
    },
    // 3. Mobile Screenshot & Smartphone Mockup (Completely Independent)
    mobile: {
      imageData: null,
      imageObj: null,
      fileName: "atuwa-mobile.png",
      fileSize: "850 KB",
      zoom: 135,
      panX: -40,
      panY: 0,
      fitMode: "cover",
      style: "iphone-titanium", // 'iphone-titanium' | 'iphone-midnight' | 'iphone-silver' | 'iphone-orange' | 'minimal-bezel'
      scale: 100,
      posX: 770,
      posY: 790,
      rotation: 0,
    },
    // 4. Background & Brand Customization
    display: {
      theme: "cyber-slate", // 'cyber-slate' | 'obsidian-grid' | 'studio-spotlight' | 'electric-circuit' | 'deep-mesh' | 'clean-dark'
      bgBaseColor: "#08090b",
      bgSecondaryColor: "#12151b",
      accentColor: "#ff813e",
      accentGlowIntensity: 65, // %
      gridOverlay: true,
      gridOpacity: 8,          // %
      mobileLayerFront: true,  // Smartphone in front of Laptop
      logoVariant: "official", // 'official' | 'badge' | 'custom'
      customLogoData: null,
      customLogoObj: null,
      badgeText: "PROJECT COMPLETED",
    }
  };

  // Clone default state to working state
  let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

  // Canvas elements and context
  let canvas, ctx;
  let canvasWrapper, canvasContainer;

  // Interaction State
  let canvasMode = 'move'; // 'move' | 'pan'
  let activeDevice = 'desktop'; // 'desktop' | 'mobile' | null
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let dragInitialPosX = 0, dragInitialPosY = 0;
  let dragInitialPanX = 0, dragInitialPanY = 0;
  let currentZoom = 'fit'; // 'fit' | 0.5 | 0.75 | 1.0

  // Brand logo cache
  let brandLogoImg = null;
  let brandBadgeImg = null;

  // Preset Definitions
  const PRESETS = {
    atuwa: {
      name: "Atuwa Real Estate Portal",
      data: {
        project: {
          name: "ATUWA PROPERTY PORTAL",
          client: "Atuwa Real Estate (Pvt) Ltd",
          category: "Full-Stack Web & Mobile Platform",
          description: "Comprehensive property discovery & management ecosystem featuring interactive spatial mapping, instant viewing reservations, and mortgage syndication.",
          techStack: "Next.js, Node.js, PostgreSQL, Tailwind CSS, AWS",
          url: "atuwa.lk",
          align: "left",
          titleFontSize: 46,
        },
        desktopAssetKey: "atuwaDesktop",
        mobileAssetKey: "atuwaDesktop",
        desktop: { zoom: 100, panX: 0, panY: 0, scale: 100, posX: 480, posY: 710, rotation: 0, style: "macbook-dark" },
        mobile: { zoom: 135, panX: -40, panY: 0, scale: 100, posX: 770, posY: 790, rotation: 0, style: "iphone-titanium" },
        display: { theme: "cyber-slate", accentColor: "#ff813e", accentGlowIntensity: 65, mobileLayerFront: true }
      }
    },
    podijob: {
      name: "PodiJob Freelance Platform",
      data: {
        project: {
          name: "PODIJOB GIG MARKETPLACE",
          client: "PodiJob Global Network",
          category: "Micro-freelance & Gig Economy Platform",
          description: "High-throughput marketplace connecting localized service providers with real-time bidding, escrow payments, and verifiable badge credentials.",
          techStack: "Vue 3, Laravel, MySQL, Redis, WebSockets",
          url: "podijob.com",
          align: "left",
          titleFontSize: 46,
        },
        desktopAssetKey: "podijobDesktop",
        mobileAssetKey: "podijobDesktop",
        desktop: { zoom: 100, panX: 0, panY: 0, scale: 100, posX: 480, posY: 710, rotation: 0, style: "macbook-midnight" },
        mobile: { zoom: 130, panX: -50, panY: 0, scale: 100, posX: 770, posY: 790, rotation: 0, style: "iphone-midnight" },
        display: { theme: "obsidian-grid", accentColor: "#ff813e", accentGlowIntensity: 75, mobileLayerFront: true }
      }
    },
    kara: {
      name: "Kara Live Streaming Engine",
      data: {
        project: {
          name: "KARA LIVE MEDIA SUITE",
          client: "Kara Entertainment Ltd",
          category: "Interactive Streaming & Media Portal",
          description: "Ultra-low latency streaming broadcast suite supporting live peer-to-peer engagement, interactive gifting, and studio management.",
          techStack: "WebRTC, Go, React, FFmpeg, Docker, Kubernetes",
          url: "kara.live",
          align: "left",
          titleFontSize: 46,
        },
        desktopAssetKey: "karaLiveDesktop",
        mobileAssetKey: "karaLiveDesktop",
        desktop: { zoom: 100, panX: 0, panY: 0, scale: 100, posX: 480, posY: 710, rotation: 0, style: "macbook-dark" },
        mobile: { zoom: 140, panX: -30, panY: 0, scale: 100, posX: 770, posY: 790, rotation: 0, style: "iphone-orange" },
        display: { theme: "electric-circuit", accentColor: "#ff813e", accentGlowIntensity: 80, mobileLayerFront: true }
      }
    },
    orytingo: {
      name: "OryTingo Networks Core",
      data: {
        project: {
          name: "ORYTINGO ENTERPRISE PORTAL",
          client: "OryTingo Networks & Software Solutions",
          category: "Enterprise Cloud & Network Infrastructure",
          description: "Flagship digital hub delivering mission-critical software solutions, CCTV intelligence, network diagnostics, and high-security enterprise IT services.",
          techStack: "HTML5, Modern CSS, Node.js, Nginx, Cloudflare",
          url: "orytingo.lk",
          align: "left",
          titleFontSize: 46,
        },
        desktopAssetKey: "orytingoDesktop",
        mobileAssetKey: "orytingoDesktop",
        desktop: { zoom: 100, panX: 0, panY: 0, scale: 100, posX: 480, posY: 710, rotation: 0, style: "macbook-silver" },
        mobile: { zoom: 125, panX: -20, panY: 0, scale: 100, posX: 770, posY: 790, rotation: 0, style: "iphone-silver" },
        display: { theme: "studio-spotlight", accentColor: "#ff813e", accentGlowIntensity: 70, mobileLayerFront: true }
      }
    },
    blank: {
      name: "Blank Starter Showcase",
      data: {
        project: {
          name: "NEW CLIENT PROJECT",
          client: "Client Enterprise Name",
          category: "Custom Web Application",
          description: "Modern, high-performance software solution engineered by OryTingo Networks & Software Solutions.",
          techStack: "React, Node.js, PostgreSQL",
          url: "example.com",
          align: "left",
          titleFontSize: 48,
        },
        desktopAssetKey: null,
        mobileAssetKey: null,
        desktop: { zoom: 100, panX: 0, panY: 0, scale: 100, posX: 480, posY: 710, rotation: 0, style: "macbook-dark" },
        mobile: { zoom: 100, panX: 0, panY: 0, scale: 100, posX: 770, posY: 790, rotation: 0, style: "iphone-titanium" },
        display: { theme: "cyber-slate", accentColor: "#ff813e", accentGlowIntensity: 65, mobileLayerFront: true }
      }
    }
  };

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  window.addEventListener('DOMContentLoaded', initApp);

  function initApp() {
    canvas = document.getElementById('poster-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvasWrapper = document.getElementById('canvas-scaler-wrapper');
    canvasContainer = document.getElementById('canvas-container');

    // Preload logos
    loadBrandAssets();

    // Check localStorage for saved showcase state
    const saved = loadFromLocalStorage();
    if (saved) {
      Object.assign(state, saved);
    } else {
      // Default to Atuwa preset
      applyPreset('atuwa', false);
    }

    // Bind UI Events
    bindTabs();
    bindFormInputs();
    bindUploadHandlers();
    bindToolbarControls();
    bindCanvasMouseInteractions();
    bindModalHandlers();

    // Initial scale and draw
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);

    // Initial Render
    reloadImagesThenRender();
  }

  // Preload brand logo images
  function loadBrandAssets() {
    if (window.ORYTINGO_ASSETS) {
      if (window.ORYTINGO_ASSETS.logoPng) {
        brandLogoImg = new Image();
        brandLogoImg.src = window.ORYTINGO_ASSETS.logoPng;
        brandLogoImg.onload = requestRender;
      }
      if (window.ORYTINGO_ASSETS.badgeLogoJpg) {
        brandBadgeImg = new Image();
        brandBadgeImg.src = window.ORYTINGO_ASSETS.badgeLogoJpg;
        brandBadgeImg.onload = requestRender;
      }
    }
  }

  // Reload Image Objects from state.desktop.imageData & state.mobile.imageData
  function reloadImagesThenRender() {
    let pending = 0;

    if (state.desktop.imageData && (!state.desktop.imageObj || state.desktop.imageObj.src !== state.desktop.imageData)) {
      pending++;
      state.desktop.imageObj = new Image();
      state.desktop.imageObj.crossOrigin = "anonymous";
      state.desktop.imageObj.onload = () => {
        pending--;
        if (pending <= 0) renderPoster();
      };
      state.desktop.imageObj.onerror = () => {
        pending--;
        if (pending <= 0) renderPoster();
      };
      state.desktop.imageObj.src = state.desktop.imageData;
    }

    if (state.mobile.imageData && (!state.mobile.imageObj || state.mobile.imageObj.src !== state.mobile.imageData)) {
      pending++;
      state.mobile.imageObj = new Image();
      state.mobile.imageObj.crossOrigin = "anonymous";
      state.mobile.imageObj.onload = () => {
        pending--;
        if (pending <= 0) renderPoster();
      };
      state.mobile.imageObj.onerror = () => {
        pending--;
        if (pending <= 0) renderPoster();
      };
      state.mobile.imageObj.src = state.mobile.imageData;
    }

    if (pending === 0) {
      renderPoster();
    }
  }

  // Request Render via requestAnimationFrame
  let renderQueued = false;
  function requestRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderPoster();
    });
  }

  // =========================================================================
  // PRESET MANAGEMENT
  // =========================================================================
  function applyPreset(presetKey, shouldRender = true) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    // Apply text and toggles
    Object.assign(state.project, preset.data.project);
    Object.assign(state.desktop, preset.data.desktop);
    Object.assign(state.mobile, preset.data.mobile);
    Object.assign(state.display, preset.data.display);

    // Apply images from embedded assets if available
    if (window.ORYTINGO_ASSETS) {
      if (preset.data.desktopAssetKey && window.ORYTINGO_ASSETS[preset.data.desktopAssetKey]) {
        state.desktop.imageData = window.ORYTINGO_ASSETS[preset.data.desktopAssetKey];
        state.desktop.fileName = preset.data.desktopAssetKey + ".png";
      }
      if (preset.data.mobileAssetKey && window.ORYTINGO_ASSETS[preset.data.mobileAssetKey]) {
        state.mobile.imageData = window.ORYTINGO_ASSETS[preset.data.mobileAssetKey];
        state.mobile.fileName = preset.data.mobileAssetKey + ".png";
      }
    }

    syncStateToInputs();
    if (shouldRender) {
      reloadImagesThenRender();
      showToast(`Loaded ${preset.name}`);
    }
  }

  // =========================================================================
  // TAB NAVIGATION
  // =========================================================================
  function bindTabs() {
    const tabs = document.querySelectorAll('.sidebar-tab-btn');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const activePane = document.getElementById(`tab-${target}`);
        if (activePane) activePane.classList.add('active');

        // Highlight active device on canvas if switching to desktop or mobile tab
        if (target === 'desktop') activeDevice = 'desktop';
        else if (target === 'mobile') activeDevice = 'mobile';
        else activeDevice = null;
        requestRender();
      });
    });
  }

  // =========================================================================
  // FORM CONTROLS & TWO-WAY BINDING
  // =========================================================================
  function bindFormInputs() {
    // Project Info Inputs
    bindTextInput('project-name', val => state.project.name = val);
    bindTextInput('client-name', val => state.project.client = val);
    bindTextInput('project-category', val => state.project.category = val);
    bindTextInput('project-desc', val => state.project.description = val);
    bindTextInput('tech-stack', val => state.project.techStack = val);
    bindTextInput('website-url', val => state.project.url = val);
    bindTextInput('badge-text', val => state.display.badgeText = val);

    // Text Alignment
    document.querySelectorAll('input[name="text-align"]').forEach(r => {
      r.addEventListener('change', e => {
        state.project.align = e.target.value;
        saveToLocalStorage();
        requestRender();
      });
    });

    // Title Font Size
    bindSlider('title-size', 'title-size-val', val => state.project.titleFontSize = val, 'px');

    // Visibility Toggles
    bindToggle('toggle-badge', val => state.toggles.showCompletedBadge = val);
    bindToggle('toggle-desc', val => state.toggles.showDescription = val);
    bindToggle('toggle-tech', val => state.toggles.showTechStack = val);
    bindToggle('toggle-client', val => state.toggles.showClientBadge = val);
    bindToggle('toggle-url', val => state.toggles.showUrl = val);
    bindToggle('toggle-shadows', val => state.toggles.showDeviceShadows = val);
    bindToggle('toggle-reflections', val => state.toggles.showReflections = val);
    bindToggle('toggle-layer', val => state.display.mobileLayerFront = val);

    // Desktop Controls (100% Independent)
    bindSelect('desktop-style', val => state.desktop.style = val);
    bindSlider('desktop-scale', 'desktop-scale-val', val => state.desktop.scale = val, '%');
    bindSlider('desktop-pos-x', 'desktop-pos-x-val', val => state.desktop.posX = val, 'px');
    bindSlider('desktop-pos-y', 'desktop-pos-y-val', val => state.desktop.posY = val, 'px');
    bindSlider('desktop-rot', 'desktop-rot-val', val => state.desktop.rotation = val, '°');
    bindSlider('desktop-zoom', 'desktop-zoom-val', val => state.desktop.zoom = val, '%');
    bindSlider('desktop-pan-x', 'desktop-pan-x-val', val => state.desktop.panX = val, 'px');
    bindSlider('desktop-pan-y', 'desktop-pan-y-val', val => state.desktop.panY = val, 'px');
    bindSelect('desktop-fit', val => state.desktop.fitMode = val);

    // Mobile Controls (100% Independent)
    bindSelect('mobile-style', val => state.mobile.style = val);
    bindSlider('mobile-scale', 'mobile-scale-val', val => state.mobile.scale = val, '%');
    bindSlider('mobile-pos-x', 'mobile-pos-x-val', val => state.mobile.posX = val, 'px');
    bindSlider('mobile-pos-y', 'mobile-pos-y-val', val => state.mobile.posY = val, 'px');
    bindSlider('mobile-rot', 'mobile-rot-val', val => state.mobile.rotation = val, '°');
    bindSlider('mobile-zoom', 'mobile-zoom-val', val => state.mobile.zoom = val, '%');
    bindSlider('mobile-pan-x', 'mobile-pan-x-val', val => state.mobile.panX = val, 'px');
    bindSlider('mobile-pan-y', 'mobile-pan-y-val', val => state.mobile.panY = val, 'px');
    bindSelect('mobile-fit', val => state.mobile.fitMode = val);

    // Nudge Buttons (Desktop & Mobile)
    bindNudge('btn-desk-x-down', 'desktop-pos-x', -10);
    bindNudge('btn-desk-x-up', 'desktop-pos-x', 10);
    bindNudge('btn-desk-y-down', 'desktop-pos-y', -10);
    bindNudge('btn-desk-y-up', 'desktop-pos-y', 10);
    bindNudge('btn-desk-zoom-out', 'desktop-zoom', -10);
    bindNudge('btn-desk-zoom-in', 'desktop-zoom', 10);
    bindNudge('btn-desk-pan-left', 'desktop-pan-x', -20);
    bindNudge('btn-desk-pan-right', 'desktop-pan-x', 20);
    bindNudge('btn-desk-pan-up', 'desktop-pan-y', -20);
    bindNudge('btn-desk-pan-down', 'desktop-pan-y', 20);

    bindNudge('btn-mob-x-down', 'mobile-pos-x', -10);
    bindNudge('btn-mob-x-up', 'mobile-pos-x', 10);
    bindNudge('btn-mob-y-down', 'mobile-pos-y', -10);
    bindNudge('btn-mob-y-up', 'mobile-pos-y', 10);
    bindNudge('btn-mob-zoom-out', 'mobile-zoom', -10);
    bindNudge('btn-mob-zoom-in', 'mobile-zoom', 10);
    bindNudge('btn-mob-pan-left', 'mobile-pan-x', -20);
    bindNudge('btn-mob-pan-right', 'mobile-pan-x', 20);
    bindNudge('btn-mob-pan-up', 'mobile-pan-y', -20);
    bindNudge('btn-mob-pan-down', 'mobile-pan-y', 20);

    // Reset Image Positions
    const btnResetDesk = document.getElementById('btn-reset-desk-pos');
    if (btnResetDesk) {
      btnResetDesk.addEventListener('click', () => {
        state.desktop.zoom = 100;
        state.desktop.panX = 0;
        state.desktop.panY = 0;
        syncStateToInputs();
        requestRender();
        showToast('Reset desktop screenshot position');
      });
    }

    const btnResetMob = document.getElementById('btn-reset-mob-pos');
    if (btnResetMob) {
      btnResetMob.addEventListener('click', () => {
        state.mobile.zoom = 100;
        state.mobile.panX = 0;
        state.mobile.panY = 0;
        syncStateToInputs();
        requestRender();
        showToast('Reset mobile screenshot position');
      });
    }

    // Reset Device Layout
    const btnResetDeskDev = document.getElementById('btn-reset-desk-device');
    if (btnResetDeskDev) {
      btnResetDeskDev.addEventListener('click', () => {
        state.desktop.scale = 100;
        state.desktop.posX = 480;
        state.desktop.posY = 710;
        state.desktop.rotation = 0;
        syncStateToInputs();
        requestRender();
        showToast('Reset laptop device placement');
      });
    }

    const btnResetMobDev = document.getElementById('btn-reset-mob-device');
    if (btnResetMobDev) {
      btnResetMobDev.addEventListener('click', () => {
        state.mobile.scale = 100;
        state.mobile.posX = 770;
        state.mobile.posY = 790;
        state.mobile.rotation = 0;
        syncStateToInputs();
        requestRender();
        showToast('Reset phone device placement');
      });
    }

    // CRUCIAL REQUIREMENT: "Use Desktop Screenshot as Mobile Base"
    const btnUseDesktopAsBase = document.getElementById('btn-use-desktop-as-mobile-base');
    if (btnUseDesktopAsBase) {
      btnUseDesktopAsBase.addEventListener('click', () => {
        if (!state.desktop.imageData) {
          showToast('No desktop screenshot uploaded yet!');
          return;
        }
        // Clone desktop image to mobile while maintaining completely independent pan, zoom and device position!
        state.mobile.imageData = state.desktop.imageData;
        state.mobile.fileName = 'cloned-desktop-for-mobile.png';
        state.mobile.fileSize = state.desktop.fileSize;
        state.mobile.zoom = 135;
        state.mobile.panX = -40;
        state.mobile.panY = 0;

        updateThumbPreview('mobile');
        syncStateToInputs();
        reloadImagesThenRender();
        showToast('Copied desktop screenshot to mobile base with independent controls!');
      });
    }

    // Background & Themes
    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.display.theme = card.dataset.theme;
        saveToLocalStorage();
        requestRender();
      });
    });

    bindColorPicker('color-bg-base', 'color-bg-base-val', val => state.display.bgBaseColor = val);
    bindColorPicker('color-bg-secondary', 'color-bg-secondary-val', val => state.display.bgSecondaryColor = val);
    bindColorPicker('color-accent', 'color-accent-val', val => state.display.accentColor = val);
    bindSlider('accent-glow', 'accent-glow-val', val => state.display.accentGlowIntensity = val, '%');
    bindToggle('toggle-grid', val => state.display.gridOverlay = val);
    bindSlider('grid-opacity', 'grid-opacity-val', val => state.display.gridOpacity = val, '%');

    // Logo Variant
    bindSelect('logo-variant', val => state.display.logoVariant = val);

    // Preset Selector
    const presetSelect = document.getElementById('preset-selector');
    if (presetSelect) {
      presetSelect.addEventListener('change', e => {
        applyPreset(e.target.value);
      });
    }
  }

  function bindTextInput(id, onInput) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', e => {
      onInput(e.target.value);
      saveToLocalStorage();
      requestRender();
    });
  }

  function bindSlider(id, valId, onInput, unit = '') {
    const el = document.getElementById(id);
    const valEl = document.getElementById(valId);
    if (!el) return;
    el.addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (valEl) valEl.textContent = `${v}${unit}`;
      onInput(v);
      saveToLocalStorage();
      requestRender();
    });
  }

  function bindSelect(id, onChange) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', e => {
      onChange(e.target.value);
      saveToLocalStorage();
      requestRender();
    });
  }

  function bindToggle(id, onChange) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', e => {
      onChange(e.target.checked);
      saveToLocalStorage();
      requestRender();
    });
  }

  function bindColorPicker(id, valId, onChange) {
    const el = document.getElementById(id);
    const valEl = document.getElementById(valId);
    if (!el) return;
    el.addEventListener('input', e => {
      const val = e.target.value;
      if (valEl) valEl.textContent = val.toUpperCase();
      onChange(val);
      saveToLocalStorage();
      requestRender();
    });
  }

  function bindNudge(btnId, sliderId, delta) {
    const btn = document.getElementById(btnId);
    const slider = document.getElementById(sliderId);
    if (!btn || !slider) return;
    btn.addEventListener('click', () => {
      const current = parseFloat(slider.value) || 0;
      const min = parseFloat(slider.min) || -1000;
      const max = parseFloat(slider.max) || 1000;
      const next = Math.max(min, Math.min(max, current + delta));
      slider.value = next;
      slider.dispatchEvent(new Event('input'));
    });
  }

  // =========================================================================
  // UPLOAD HANDLERS (SEPARATE DESKTOP & MOBILE - GUARANTEED DECOUPLED)
  // =========================================================================
  function bindUploadHandlers() {
    setupUploadZone('dropzone-desktop', 'input-desktop-file', 'desktop');
    setupUploadZone('dropzone-mobile', 'input-mobile-file', 'mobile');
    setupUploadZone('dropzone-logo', 'input-logo-file', 'logo');
  }

  function setupUploadZone(zoneId, inputId, target) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', e => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processUploadedFile(e.dataTransfer.files[0], target);
      }
    });

    input.addEventListener('change', e => {
      if (e.target.files && e.target.files.length > 0) {
        processUploadedFile(e.target.files[0], target);
      }
    });
  }

  function processUploadedFile(file, target) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      const fileSizeStr = formatFileSize(file.size);

      if (target === 'desktop') {
        // Desktop ONLY - never touches mobile
        state.desktop.imageData = dataUrl;
        state.desktop.fileName = file.name;
        state.desktop.fileSize = fileSizeStr;
        state.desktop.zoom = 100;
        state.desktop.panX = 0;
        state.desktop.panY = 0;
        updateThumbPreview('desktop');
        reloadImagesThenRender();
        showToast('Desktop screenshot updated successfully!');
      } else if (target === 'mobile') {
        // Mobile ONLY - never touches desktop
        state.mobile.imageData = dataUrl;
        state.mobile.fileName = file.name;
        state.mobile.fileSize = fileSizeStr;
        state.mobile.zoom = 100;
        state.mobile.panX = 0;
        state.mobile.panY = 0;
        updateThumbPreview('mobile');
        reloadImagesThenRender();
        showToast('Mobile screenshot updated successfully!');
      } else if (target === 'logo') {
        state.display.customLogoData = dataUrl;
        state.display.logoVariant = 'custom';
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          state.display.customLogoObj = img;
          requestRender();
          showToast('Custom logo uploaded successfully!');
        };
      }
      saveToLocalStorage();
    };
    reader.readAsDataURL(file);
  }

  function updateThumbPreview(target) {
    if (target === 'desktop') {
      const thumb = document.getElementById('thumb-desktop-img');
      const title = document.getElementById('thumb-desktop-title');
      const size = document.getElementById('thumb-desktop-size');
      if (thumb && state.desktop.imageData) thumb.src = state.desktop.imageData;
      if (title) title.textContent = state.desktop.fileName || "desktop-shot.png";
      if (size) size.textContent = state.desktop.fileSize || "";
    } else if (target === 'mobile') {
      const thumb = document.getElementById('thumb-mobile-img');
      const title = document.getElementById('thumb-mobile-title');
      const size = document.getElementById('thumb-mobile-size');
      if (thumb && state.mobile.imageData) thumb.src = state.mobile.imageData;
      if (title) title.textContent = state.mobile.fileName || "mobile-shot.png";
      if (size) size.textContent = state.mobile.fileSize || "";
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // =========================================================================
  // TOOLBAR & VIEWPORT CONTROLS
  // =========================================================================
  function bindToolbarControls() {
    // Mode toggle: Move Devices vs Pan Screen Images
    const btnModeMove = document.getElementById('btn-tool-mode-move');
    const btnModePan = document.getElementById('btn-tool-mode-pan');

    if (btnModeMove && btnModePan) {
      btnModeMove.addEventListener('click', () => {
        canvasMode = 'move';
        btnModeMove.classList.add('active');
        btnModePan.classList.remove('active');
        canvasWrapper.className = 'canvas-scaler-wrapper mode-move';
        showToast('Mode: Move Devices (drag to reposition)');
      });

      btnModePan.addEventListener('click', () => {
        canvasMode = 'pan';
        btnModePan.classList.add('active');
        btnModeMove.classList.remove('active');
        canvasWrapper.className = 'canvas-scaler-wrapper mode-pan';
        showToast('Mode: Pan Screen Images (drag screenshot within screen)');
      });
    }

    // Zoom Controls
    document.querySelectorAll('.btn-zoom-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-zoom-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const z = btn.dataset.zoom;
        currentZoom = z === 'fit' ? 'fit' : parseFloat(z);
        applyCanvasScaling();
      });
    });

    // Reset Template Button
    const btnResetAll = document.getElementById('btn-reset-template');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => {
        openModal('modal-confirm-reset');
      });
    }

    const btnConfirmReset = document.getElementById('btn-confirm-reset-yes');
    if (btnConfirmReset) {
      btnConfirmReset.addEventListener('click', () => {
        localStorage.removeItem('orytingo_showcase_state');
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        applyPreset('atuwa', true);
        closeModal('modal-confirm-reset');
        showToast('Template reset to original state.');
      });
    }

    // Save Template JSON
    const btnSaveTpl = document.getElementById('btn-save-template');
    if (btnSaveTpl) {
      btnSaveTpl.addEventListener('click', exportTemplateJson);
    }

    // Load Template JSON
    const btnLoadTpl = document.getElementById('btn-load-template');
    const inputLoadTpl = document.getElementById('input-load-template-file');
    if (btnLoadTpl && inputLoadTpl) {
      btnLoadTpl.addEventListener('click', () => inputLoadTpl.click());
      inputLoadTpl.addEventListener('change', e => {
        if (e.target.files && e.target.files.length > 0) {
          importTemplateJson(e.target.files[0]);
        }
      });
    }

    // Export Modal Trigger
    const btnOpenExport = document.getElementById('btn-open-export');
    if (btnOpenExport) {
      btnOpenExport.addEventListener('click', openExportModal);
    }
  }

  // =========================================================================
  // INTERACTIVE CANVAS MANIPULATION (CLICK & DRAG)
  // =========================================================================
  function bindCanvasMouseInteractions() {
    canvas.addEventListener('mousedown', onCanvasMouseDown);
    window.addEventListener('mousemove', onCanvasMouseMove);
    window.addEventListener('mouseup', onCanvasMouseUp);

    // Touch support for tablets/hybrids
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        onCanvasMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
      }
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        onCanvasMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      }
    }, { passive: false });

    window.addEventListener('touchend', onCanvasMouseUp);
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function hitTestDevice(pos, deviceState, width, height) {
    // Check if point pos is inside rotated device bounding box
    const rad = -(deviceState.rotation * Math.PI) / 180;
    const s = deviceState.scale / 100;
    const dx = pos.x - deviceState.posX;
    const dy = pos.y - deviceState.posY;

    // Rotate point to local coordinates
    const localX = (dx * Math.cos(rad) - dy * Math.sin(rad)) / s;
    const localY = (dx * Math.sin(rad) + dy * Math.cos(rad)) / s;

    return Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2;
  }

  function onCanvasMouseDown(e) {
    const pos = getCanvasCoords(e);

    // Check hit: Phone vs Laptop (consider stacking order)
    const phoneHit = hitTestDevice(pos, state.mobile, 260, 540);
    const laptopHit = hitTestDevice(pos, state.desktop, 710, 440);

    let target = null;
    if (state.display.mobileLayerFront) {
      if (phoneHit) target = 'mobile';
      else if (laptopHit) target = 'desktop';
    } else {
      if (laptopHit) target = 'desktop';
      else if (phoneHit) target = 'mobile';
    }

    if (target) {
      isDragging = true;
      activeDevice = target;
      dragStartX = pos.x;
      dragStartY = pos.y;

      if (canvasMode === 'move') {
        dragInitialPosX = state[target].posX;
        dragInitialPosY = state[target].posY;
      } else {
        // 'pan' image mode
        dragInitialPanX = state[target].panX;
        dragInitialPanY = state[target].panY;
      }
      requestRender();
    }
  }

  function onCanvasMouseMove(e) {
    if (!isDragging || !activeDevice) return;
    const pos = getCanvasCoords(e);
    const deltaX = pos.x - dragStartX;
    const deltaY = pos.y - dragStartY;

    if (canvasMode === 'move') {
      state[activeDevice].posX = Math.round(dragInitialPosX + deltaX);
      state[activeDevice].posY = Math.round(dragInitialPosY + deltaY);

      // Sync sliders
      const sliderX = document.getElementById(`${activeDevice}-pos-x`);
      const sliderY = document.getElementById(`${activeDevice}-pos-y`);
      const valX = document.getElementById(`${activeDevice}-pos-x-val`);
      const valY = document.getElementById(`${activeDevice}-pos-y-val`);

      if (sliderX) sliderX.value = state[activeDevice].posX;
      if (sliderY) sliderY.value = state[activeDevice].posY;
      if (valX) valX.textContent = `${state[activeDevice].posX}px`;
      if (valY) valY.textContent = `${state[activeDevice].posY}px`;
    } else {
      // Pan screenshot inside screen
      state[activeDevice].panX = Math.round(dragInitialPanX + deltaX);
      state[activeDevice].panY = Math.round(dragInitialPanY + deltaY);

      const sliderPanX = document.getElementById(`${activeDevice}-pan-x`);
      const sliderPanY = document.getElementById(`${activeDevice}-pan-y`);
      const valPanX = document.getElementById(`${activeDevice}-pan-x-val`);
      const valPanY = document.getElementById(`${activeDevice}-pan-y-val`);

      if (sliderPanX) sliderPanX.value = state[activeDevice].panX;
      if (sliderPanY) sliderPanY.value = state[activeDevice].panY;
      if (valPanX) valPanX.textContent = `${state[activeDevice].panX}px`;
      if (valPanY) valPanY.textContent = `${state[activeDevice].panY}px`;
    }

    requestRender();
  }

  function onCanvasMouseUp() {
    if (isDragging) {
      isDragging = false;
      saveToLocalStorage();
      requestRender();
    }
  }

  // =========================================================================
  // RESPONSIVE CANVAS VIEWPORT SCALING
  // =========================================================================
  function handleWindowResize() {
    if (currentZoom === 'fit') {
      applyCanvasScaling();
    }
  }

  function applyCanvasScaling() {
    if (!canvasContainer || !canvasWrapper) return;
    const containerW = canvasContainer.clientWidth - 80;
    const containerH = canvasContainer.clientHeight - 80;

    let scale;
    if (currentZoom === 'fit') {
      const scaleW = containerW / 1080;
      const scaleH = containerH / 1350;
      scale = Math.min(scaleW, scaleH);
      scale = Math.max(0.2, Math.min(1.0, scale)); // Clamp between 0.2 and 1.0
    } else {
      scale = parseFloat(currentZoom);
    }

    canvasWrapper.style.transform = `scale(${scale})`;
    canvasWrapper.style.transformOrigin = 'center center';
  }

  // =========================================================================
  // STATE SYNC TO INPUTS
  // =========================================================================
  function syncStateToInputs() {
    setVal('project-name', state.project.name);
    setVal('client-name', state.project.client);
    setVal('project-category', state.project.category);
    setVal('project-desc', state.project.description);
    setVal('tech-stack', state.project.techStack);
    setVal('website-url', state.project.url);
    setVal('badge-text', state.display.badgeText);
    setVal('title-size', state.project.titleFontSize);
    setTxt('title-size-val', `${state.project.titleFontSize}px`);

    // Radio
    const alignRadio = document.querySelector(`input[name="text-align"][value="${state.project.align}"]`);
    if (alignRadio) alignRadio.checked = true;

    // Toggles
    setChecked('toggle-badge', state.toggles.showCompletedBadge);
    setChecked('toggle-desc', state.toggles.showDescription);
    setChecked('toggle-tech', state.toggles.showTechStack);
    setChecked('toggle-client', state.toggles.showClientBadge);
    setChecked('toggle-url', state.toggles.showUrl);
    setChecked('toggle-shadows', state.toggles.showDeviceShadows);
    setChecked('toggle-reflections', state.toggles.showReflections);
    setChecked('toggle-layer', state.display.mobileLayerFront);

    // Desktop
    setVal('desktop-style', state.desktop.style);
    setVal('desktop-scale', state.desktop.scale);
    setTxt('desktop-scale-val', `${state.desktop.scale}%`);
    setVal('desktop-pos-x', state.desktop.posX);
    setTxt('desktop-pos-x-val', `${state.desktop.posX}px`);
    setVal('desktop-pos-y', state.desktop.posY);
    setTxt('desktop-pos-y-val', `${state.desktop.posY}px`);
    setVal('desktop-rot', state.desktop.rotation);
    setTxt('desktop-rot-val', `${state.desktop.rotation}°`);
    setVal('desktop-zoom', state.desktop.zoom);
    setTxt('desktop-zoom-val', `${state.desktop.zoom}%`);
    setVal('desktop-pan-x', state.desktop.panX);
    setTxt('desktop-pan-x-val', `${state.desktop.panX}px`);
    setVal('desktop-pan-y', state.desktop.panY);
    setTxt('desktop-pan-y-val', `${state.desktop.panY}px`);
    setVal('desktop-fit', state.desktop.fitMode);

    // Mobile
    setVal('mobile-style', state.mobile.style);
    setVal('mobile-scale', state.mobile.scale);
    setTxt('mobile-scale-val', `${state.mobile.scale}%`);
    setVal('mobile-pos-x', state.mobile.posX);
    setTxt('mobile-pos-x-val', `${state.mobile.posX}px`);
    setVal('mobile-pos-y', state.mobile.posY);
    setTxt('mobile-pos-y-val', `${state.mobile.posY}px`);
    setVal('mobile-rot', state.mobile.rotation);
    setTxt('mobile-rot-val', `${state.mobile.rotation}°`);
    setVal('mobile-zoom', state.mobile.zoom);
    setTxt('mobile-zoom-val', `${state.mobile.zoom}%`);
    setVal('mobile-pan-x', state.mobile.panX);
    setTxt('mobile-pan-x-val', `${state.mobile.panX}px`);
    setVal('mobile-pan-y', state.mobile.panY);
    setTxt('mobile-pan-y-val', `${state.mobile.panY}px`);
    setVal('mobile-fit', state.mobile.fitMode);

    // Display
    setVal('color-bg-base', state.display.bgBaseColor);
    setTxt('color-bg-base-val', state.display.bgBaseColor.toUpperCase());
    setVal('color-bg-secondary', state.display.bgSecondaryColor);
    setTxt('color-bg-secondary-val', state.display.bgSecondaryColor.toUpperCase());
    setVal('color-accent', state.display.accentColor);
    setTxt('color-accent-val', state.display.accentColor.toUpperCase());
    setVal('accent-glow', state.display.accentGlowIntensity);
    setTxt('accent-glow-val', `${state.display.accentGlowIntensity}%`);
    setChecked('toggle-grid', state.display.gridOverlay);
    setVal('grid-opacity', state.display.gridOpacity);
    setTxt('grid-opacity-val', `${state.display.gridOpacity}%`);
    setVal('logo-variant', state.display.logoVariant);

    // Theme active card
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.toggle('active', c.dataset.theme === state.display.theme);
    });

    // Thumbnails
    updateThumbPreview('desktop');
    updateThumbPreview('mobile');
  }

  function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v; }
  function setTxt(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
  function setChecked(id, v) { const el = document.getElementById(id); if (el) el.checked = !!v; }

  // =========================================================================
  // HIGH-RESOLUTION CANVAS DRAWING ENGINE (1080 × 1350 PX)
  // =========================================================================
  function renderPoster() {
    if (!ctx) return;

    // Exact resolution
    canvas.width = 1080;
    canvas.height = 1350;

    // 1. Draw Background
    drawPosterBackground(ctx);

    // 2. Draw Subtle Brand Graphic Accents (Grid, Circles, Nodes)
    drawBackgroundPatterns(ctx);

    // 3. Draw Top Header (OryTingo Logo + Status Badge)
    drawTopHeader(ctx);

    // 4. Draw Project Title & Metadata Section
    drawProjectTitleSection(ctx);

    // 5. Draw Middle Stage Devices (Laptop & Smartphone with Screen Clipping)
    drawDevicesStage(ctx);

    // 6. Draw Bottom Showcase Card (Client Name, Category, Agency Credit, URL)
    drawBottomShowcaseCard(ctx);
  }

  // -------------------------------------------------------------------------
  // 1. BACKGROUND RENDERING
  // -------------------------------------------------------------------------
  function drawPosterBackground(ctx) {
    const w = 1080, h = 1350;
    const theme = state.display.theme;
    const baseColor = state.display.bgBaseColor || "#08090b";
    const secColor = state.display.bgSecondaryColor || "#12151b";
    const accent = state.display.accentColor || "#ff813e";
    const glowPct = state.display.accentGlowIntensity / 100;

    // Base background fill
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);

    if (theme === 'cyber-slate') {
      // Sleek radial gradient with warm orange ambient spotlight
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.52, 50, w * 0.5, h * 0.52, 750);
      grad.addColorStop(0, secColor);
      grad.addColorStop(0.65, baseColor);
      grad.addColorStop(1, '#050608');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Warm ambient flare behind mockups
      if (glowPct > 0) {
        const flare = ctx.createRadialGradient(w * 0.5, h * 0.54, 20, w * 0.5, h * 0.54, 420);
        flare.addColorStop(0, hexToRgba(accent, 0.22 * glowPct));
        flare.addColorStop(0.4, hexToRgba(accent, 0.08 * glowPct));
        flare.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = flare;
        ctx.fillRect(0, 0, w, h);
      }
    } else if (theme === 'obsidian-grid') {
      // Tech coordinate grid background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0a0d14');
      grad.addColorStop(0.5, baseColor);
      grad.addColorStop(1, '#050607');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Central amber flare
      if (glowPct > 0) {
        const flare = ctx.createRadialGradient(w * 0.5, h * 0.55, 30, w * 0.5, h * 0.55, 450);
        flare.addColorStop(0, hexToRgba(accent, 0.24 * glowPct));
        flare.addColorStop(0.5, hexToRgba(accent, 0.06 * glowPct));
        flare.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = flare;
        ctx.fillRect(0, 0, w, h);
      }
    } else if (theme === 'studio-spotlight') {
      // High-contrast photo studio overhead lighting
      const spot = ctx.createRadialGradient(w * 0.5, 200, 100, w * 0.5, 750, 750);
      spot.addColorStop(0, '#1c2230');
      spot.addColorStop(0.55, baseColor);
      spot.addColorStop(1, '#030406');
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);
    } else if (theme === 'electric-circuit') {
      // Subtle circuit aesthetic
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0e121a');
      grad.addColorStop(0.5, baseColor);
      grad.addColorStop(1, '#07080b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (glowPct > 0) {
        const flare = ctx.createRadialGradient(w * 0.5, h * 0.52, 10, w * 0.5, h * 0.52, 400);
        flare.addColorStop(0, hexToRgba(accent, 0.28 * glowPct));
        flare.addColorStop(0.6, hexToRgba(accent, 0.05 * glowPct));
        flare.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = flare;
        ctx.fillRect(0, 0, w, h);
      }
    } else if (theme === 'deep-mesh') {
      // Diagonal mesh gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#131822');
      grad.addColorStop(0.4, baseColor);
      grad.addColorStop(1, '#06070a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Pure clean dark
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, secColor);
      grad.addColorStop(1, baseColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // -------------------------------------------------------------------------
  // 2. BACKGROUND PATTERNS (GRID & TECH ACCENTS)
  // -------------------------------------------------------------------------
  function drawBackgroundPatterns(ctx) {
    if (!state.display.gridOverlay) return;
    const w = 1080, h = 1350;
    const opacity = (state.display.gridOpacity || 8) / 100;
    const theme = state.display.theme;

    ctx.save();
    if (theme === 'obsidian-grid') {
      // Precise 45px engineering grid
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
      ctx.lineWidth = 1;
      const step = 45;
      for (let x = 0; x <= w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Plus crosshairs at intersections
      ctx.fillStyle = hexToRgba(state.display.accentColor, opacity * 1.5);
      for (let x = 90; x < w; x += 180) {
        for (let y = 90; y < h; y += 180) {
          ctx.fillRect(x - 3, y - 0.5, 7, 1);
          ctx.fillRect(x - 0.5, y - 3, 1, 7);
        }
      }
    } else if (theme === 'electric-circuit') {
      // Tech circuit traces
      ctx.strokeStyle = hexToRgba(state.display.accentColor, opacity * 0.9);
      ctx.lineWidth = 1.5;
      ctx.fillStyle = hexToRgba(state.display.accentColor, opacity * 1.8);

      const traces = [
        [[60, 200], [180, 200], [220, 240], [220, 360]],
        [[w - 60, 240], [w - 180, 240], [w - 240, 300]],
        [[60, 1000], [160, 1000], [200, 1040], [200, 1100]],
        [[w - 60, 980], [w - 150, 980], [w - 200, 1030]]
      ];

      traces.forEach(pts => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();

        // Terminal circle node
        const end = pts[pts.length - 1];
        ctx.beginPath();
        ctx.arc(end[0], end[1], 4, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Refined micro-dot matrix
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
      const step = 36;
      for (let x = step; x < w; x += step) {
        for (let y = step; y < h; y += step) {
          // Subtle circular gradient mask for dots
          const distFromCenter = Math.hypot(x - w / 2, y - h / 2);
          if (distFromCenter < 580) {
            ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
          }
        }
      }
    }
    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 3. TOP HEADER (LOGO + COMPLETED BADGE)
  // -------------------------------------------------------------------------
  function drawTopHeader(ctx) {
    const leftMargin = 64;
    const rightMargin = 1080 - 64;
    const topY = 64;

    ctx.save();

    // 1. Draw OryTingo Logo
    drawOrytingoBrandLogo(ctx, leftMargin, topY);

    // 2. Draw "PROJECT COMPLETED" status pill badge on right
    if (state.toggles.showCompletedBadge) {
      const badgeText = state.display.badgeText || "PROJECT COMPLETED";
      ctx.font = "bold 13px 'Space Grotesk', -apple-system, sans-serif";
      const textMetrics = ctx.measureText(badgeText);
      const badgeW = textMetrics.width + 44;
      const badgeH = 34;
      const badgeX = rightMargin - badgeW;
      const badgeY = topY + 4;

      // Glass pill background
      ctx.fillStyle = "rgba(18, 21, 27, 0.85)";
      ctx.strokeStyle = "rgba(255, 129, 62, 0.35)";
      ctx.lineWidth = 1;
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
      ctx.fill();
      ctx.stroke();

      // Glowing dot
      const dotX = badgeX + 16;
      const dotY = badgeY + badgeH / 2;

      ctx.save();
      ctx.shadowColor = "#ff813e";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ff813e";
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Pulse ring around dot
      ctx.strokeStyle = "rgba(255, 129, 62, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
      ctx.stroke();

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "0.5px";
      ctx.fillText(badgeText, badgeX + 28, dotY);
    }

    ctx.restore();
  }

  // Draw OryTingo Brand Logo (Image or High-Res Vector Fallback)
  function drawOrytingoBrandLogo(ctx, x, y) {
    ctx.save();

    // If user uploaded custom logo
    if (state.display.logoVariant === 'custom' && state.display.customLogoObj) {
      const img = state.display.customLogoObj;
      const maxH = 46;
      const scale = maxH / img.height;
      ctx.drawImage(img, x, y, img.width * scale, maxH);
      ctx.restore();
      return;
    }

    // If official brand logo image is preloaded
    if (brandLogoImg && brandLogoImg.complete && brandLogoImg.naturalWidth > 0 && state.display.logoVariant !== 'badge') {
      const maxH = 44;
      const scale = maxH / brandLogoImg.naturalHeight;
      const w = brandLogoImg.naturalWidth * scale;
      ctx.drawImage(brandLogoImg, x, y, w, maxH);
      ctx.restore();
      return;
    }

    // High-Resolution Crisp Vector Fallback: OryTingo Emblem & Wordmark
    const emblemRadius = 18;
    const emblemCenterX = x + emblemRadius;
    const emblemCenterY = y + emblemRadius + 2;

    // Circuit lines extending left
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Middle trace
    ctx.beginPath();
    ctx.moveTo(emblemCenterX - emblemRadius * 1.5, emblemCenterY);
    ctx.lineTo(emblemCenterX - emblemRadius * 0.7, emblemCenterY);
    ctx.stroke();

    // Top trace
    ctx.beginPath();
    ctx.moveTo(emblemCenterX - emblemRadius * 1.2, emblemCenterY - 11);
    ctx.lineTo(emblemCenterX - emblemRadius * 0.7, emblemCenterY - 11);
    ctx.lineTo(emblemCenterX - emblemRadius * 0.3, emblemCenterY - 11);
    ctx.stroke();

    // Bottom trace
    ctx.beginPath();
    ctx.moveTo(emblemCenterX - emblemRadius * 1.2, emblemCenterY + 11);
    ctx.lineTo(emblemCenterX - emblemRadius * 0.7, emblemCenterY + 11);
    ctx.lineTo(emblemCenterX - emblemRadius * 0.3, emblemCenterY + 11);
    ctx.stroke();

    // Circuit connection node dots
    ctx.fillStyle = "#ffffff";
    [
      [emblemCenterX - emblemRadius * 1.5, emblemCenterY],
      [emblemCenterX - emblemRadius * 1.2, emblemCenterY - 11],
      [emblemCenterX - emblemRadius * 1.2, emblemCenterY + 11]
    ].forEach(([dotX, dotY]) => {
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Circular 'C' outer arch
    ctx.beginPath();
    ctx.arc(emblemCenterX, emblemCenterY, emblemRadius, -Math.PI * 0.75, Math.PI * 0.75, false);
    ctx.stroke();

    // Inner vibrant orange core dot
    ctx.fillStyle = "#ff813e";
    ctx.beginPath();
    ctx.arc(emblemCenterX, emblemCenterY, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Brand Wordmark
    const textX = emblemCenterX + emblemRadius + 16;
    ctx.font = "bold 24px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("ORYTINGO", textX, emblemCenterY - 7);

    // Subtitle tagline
    ctx.font = "bold 9px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.letterSpacing = "2px";
    ctx.fillText("NETWORKS & SOFTWARE SOLUTIONS", textX, emblemCenterY + 11);

    ctx.restore();
  }

  // -------------------------------------------------------------------------
  // 4. PROJECT TITLE & METADATA SECTION
  // -------------------------------------------------------------------------
  function drawProjectTitleSection(ctx) {
    ctx.save();
    const isCenter = state.project.align === 'center';
    const startX = isCenter ? 540 : 64;
    const startY = 145;
    ctx.textAlign = isCenter ? "center" : "left";

    // 1. Client & Category eyebrow tag
    ctx.font = "bold 13px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#ff813e";
    ctx.textBaseline = "top";
    const categoryUpper = (state.project.category || "ENTERPRISE SOLUTION").toUpperCase();
    ctx.fillText(categoryUpper, startX, startY);

    // 2. Project Title
    const titleSize = state.project.titleFontSize || 48;
    ctx.font = `bold ${titleSize}px 'Space Grotesk', -apple-system, sans-serif`;
    ctx.fillStyle = "#ffffff";

    const titleText = (state.project.name || "CLIENT PROJECT").toUpperCase();
    const titleY = startY + 24;

    // Handle multiline wrap for long titles
    const maxW = isCenter ? 900 : 760;
    const lines = getWrappedTextLines(ctx, titleText, maxW);
    let currY = titleY;

    lines.forEach((line, idx) => {
      // Subtle gradient highlight on first line
      if (idx === 0) {
        const textW = ctx.measureText(line).width;
        const gradX0 = isCenter ? startX - textW / 2 : startX;
        const gradX1 = isCenter ? startX + textW / 2 : startX + textW;
        const titleGrad = ctx.createLinearGradient(gradX0, 0, gradX1, 0);
        titleGrad.addColorStop(0, "#ffffff");
        titleGrad.addColorStop(1, "#ffbe98");
        ctx.fillStyle = titleGrad;
      } else {
        ctx.fillStyle = "#ffffff";
      }
      ctx.fillText(line, startX, currY);
      currY += titleSize * 1.15;
    });

    // 3. Short Project Description (Optional)
    if (state.toggles.showDescription && state.project.description) {
      ctx.font = "400 18px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#94a3b8";
      const descLines = getWrappedTextLines(ctx, state.project.description, isCenter ? 820 : 680);
      currY += 4;
      descLines.slice(0, 2).forEach(dLine => {
        ctx.fillText(dLine, startX, currY);
        currY += 24;
      });
    }

    // 4. Technologies Used Chips (Optional)
    if (state.toggles.showTechStack && state.project.techStack) {
      currY += 8;
      const tags = state.project.techStack.split(',').map(t => t.trim()).filter(Boolean);
      if (tags.length > 0) {
        drawTechChips(ctx, tags, startX, currY, isCenter);
      }
    }

    ctx.restore();
  }

  function drawTechChips(ctx, tags, x, y, isCenter) {
    ctx.font = "600 12px 'Space Grotesk', monospace";
    ctx.textBaseline = "middle";

    const chipH = 26;
    const chipPadX = 12;
    const chipGap = 8;

    // Calculate total width if centered
    let totalW = 0;
    const chipWidths = tags.map(tag => {
      const tw = ctx.measureText(tag).width + chipPadX * 2;
      totalW += tw + chipGap;
      return tw;
    });
    totalW -= chipGap;

    let curX = isCenter ? x - totalW / 2 : x;

    tags.forEach((tag, i) => {
      const cw = chipWidths[i];
      // Chip Background
      ctx.fillStyle = "rgba(18, 21, 27, 0.75)";
      ctx.strokeStyle = "rgba(255, 129, 62, 0.25)";
      ctx.lineWidth = 1;
      roundRect(ctx, curX, y, cw, chipH, 6);
      ctx.fill();
      ctx.stroke();

      // Chip Text
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      ctx.fillText(tag, curX + cw / 2, y + chipH / 2);

      curX += cw + chipGap;
    });
  }

  function getWrappedTextLines(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // -------------------------------------------------------------------------
  // 5. MIDDLE STAGE: LAPTOP & SMARTPHONE MOCKUPS
  // -------------------------------------------------------------------------
  function drawDevicesStage(ctx) {
    // Determine layering order
    const isMobileFront = state.display.mobileLayerFront;

    if (isMobileFront) {
      // Laptop behind, Mobile in front (default)
      drawLaptopMockup(ctx, state.desktop, activeDevice === 'desktop');
      drawSmartphoneMockup(ctx, state.mobile, activeDevice === 'mobile');
    } else {
      // Mobile behind, Laptop in front
      drawSmartphoneMockup(ctx, state.mobile, activeDevice === 'mobile');
      drawLaptopMockup(ctx, state.desktop, activeDevice === 'desktop');
    }
  }

  // -------------------------------------------------------------------------
  // REALISTIC VECTOR LAPTOP MOCKUP
  // -------------------------------------------------------------------------
  function drawLaptopMockup(ctx, dState, isSelected) {
    ctx.save();
    ctx.translate(dState.posX, dState.posY);
    ctx.rotate((dState.rotation * Math.PI) / 180);
    const s = dState.scale / 100;
    ctx.scale(s, s);

    // MacBook Pro 16 Proportions (660 x 415 lid, 710 x 20 base)
    const lidW = 660;
    const lidH = 415;
    const baseW = 710;
    const baseH = 20;
    const screenBorder = 14;
    const screenTopBorder = 18;
    const screenW = lidW - (screenBorder * 2); // 632px
    const screenH = lidH - screenTopBorder - screenBorder; // 383px

    const lidX = -lidW / 2;
    const lidY = -lidH / 2 - 8;

    // 1. Drop Shadow under laptop
    if (state.toggles.showDeviceShadows) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 26;
      ctx.fillStyle = '#000000';
      roundRect(ctx, -baseW / 2 + 15, lidY + lidH - 6, baseW - 30, baseH + 6, 8);
      ctx.fill();
      ctx.restore();

      // Ambient warm underglow
      if (state.display.accentGlowIntensity > 0) {
        ctx.save();
        ctx.shadowColor = hexToRgba(state.display.accentColor, 0.28);
        ctx.shadowBlur = 55;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 16;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
        roundRect(ctx, -baseW / 2 + 30, lidY + lidH - 4, baseW - 60, baseH, 8);
        ctx.fill();
        ctx.restore();
      }
    }

    // 2. Outer Aluminum Lid Frame
    const styleColors = getLaptopStyleColors(dState.style);
    const lidGrad = ctx.createLinearGradient(lidX, lidY, lidX, lidY + lidH);
    lidGrad.addColorStop(0, styleColors.lidTop);
    lidGrad.addColorStop(1, styleColors.lidBottom);
    ctx.fillStyle = lidGrad;
    roundRect(ctx, lidX, lidY, lidW, lidH, [16, 16, 4, 4]);
    ctx.fill();

    // Metallic rim stroke
    ctx.strokeStyle = styleColors.highlightStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Inner Bezel (MacBook deep black glass bezel)
    ctx.fillStyle = '#0a0b0d';
    roundRect(ctx, lidX + 3, lidY + 3, lidW - 6, lidH - 6, [14, 14, 2, 2]);
    ctx.fill();

    // Camera Notch / FaceTime Lens
    const notchW = 44;
    const notchH = 10;
    ctx.fillStyle = '#050505';
    roundRect(ctx, -notchW / 2, lidY + 3, notchW, notchH, [0, 0, 4, 4]);
    ctx.fill();

    // Lens dot & indicator
    ctx.fillStyle = '#10151c';
    ctx.beginPath();
    ctx.arc(0, lidY + 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(6, lidY + 8, 1, 0, Math.PI * 2);
    ctx.fill();

    // 4. Screen Area (Clipped for Screenshot)
    const scrX = lidX + screenBorder;
    const scrY = lidY + screenTopBorder;

    ctx.save();
    roundRect(ctx, scrX, scrY, screenW, screenH, 4);
    ctx.clip();

    // Screen Background
    ctx.fillStyle = '#05070a';
    ctx.fillRect(scrX, scrY, screenW, screenH);

    // Render Uploaded Screenshot
    if (dState.imageObj && dState.imageObj.complete && (dState.imageObj.naturalWidth || dState.imageObj.width)) {
      drawScreenshotInScreen(ctx, dState.imageObj, scrX, scrY, screenW, screenH, dState.zoom, dState.panX, dState.panY, dState.fitMode);
    } else {
      drawPlaceholder(ctx, scrX, scrY, screenW, screenH, 'Upload Desktop Screenshot', '🖥️');
    }

    // Glass Specular Sheen Reflection
    if (state.toggles.showReflections) {
      const sheenGrad = ctx.createLinearGradient(scrX, scrY, scrX + screenW * 0.7, scrY + screenH);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      sheenGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.03)');
      sheenGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(scrX, scrY, screenW, screenH);
    }
    ctx.restore();

    // Inner screen border line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    roundRect(ctx, scrX, scrY, screenW, screenH, 4);
    ctx.stroke();

    // 5. Laptop Lower Deck / Base
    const baseY = lidY + lidH - 4;
    const baseGrad = ctx.createLinearGradient(-baseW / 2, baseY, -baseW / 2, baseY + baseH);
    baseGrad.addColorStop(0, styleColors.baseTop);
    baseGrad.addColorStop(0.4, styleColors.baseMid);
    baseGrad.addColorStop(1, styleColors.baseBottom);

    ctx.fillStyle = baseGrad;
    roundRect(ctx, -baseW / 2, baseY, baseW, baseH, [4, 4, 10, 10]);
    ctx.fill();

    // Top edge highlight line
    ctx.strokeStyle = styleColors.baseHighlight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-baseW / 2 + 4, baseY);
    ctx.lineTo(baseW / 2 - 4, baseY);
    ctx.stroke();

    // Center Opening Thumb Notch
    const notchBaseW = 76;
    const notchBaseH = 5;
    ctx.fillStyle = '#08090b';
    roundRect(ctx, -notchBaseW / 2, baseY, notchBaseW, notchBaseH, [0, 0, 4, 4]);
    ctx.fill();

    // Base bottom shadow line
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-baseW / 2 + 10, baseY + baseH - 2, baseW - 20, 2);

    // Selection highlight if selected
    if (isSelected) {
      ctx.strokeStyle = '#ff813e';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      roundRect(ctx, -baseW / 2 - 10, lidY - 10, baseW + 20, lidH + baseH + 20, 14);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  function getLaptopStyleColors(style) {
    switch (style) {
      case 'macbook-silver':
        return {
          lidTop: '#cbd5e1',
          lidBottom: '#94a3b8',
          highlightStroke: 'rgba(255, 255, 255, 0.6)',
          baseTop: '#e2e8f0',
          baseMid: '#94a3b8',
          baseBottom: '#64748b',
          baseHighlight: '#ffffff'
        };
      case 'macbook-midnight':
        return {
          lidTop: '#171e2e',
          lidBottom: '#0c1018',
          highlightStroke: 'rgba(56, 189, 248, 0.25)',
          baseTop: '#1e293b',
          baseMid: '#0f172a',
          baseBottom: '#080c14',
          baseHighlight: 'rgba(56, 189, 248, 0.4)'
        };
      case 'cyber-glow':
        return {
          lidTop: '#2d1b14',
          lidBottom: '#180d09',
          highlightStroke: '#ff813e',
          baseTop: '#3a2016',
          baseMid: '#24130b',
          baseBottom: '#150a06',
          baseHighlight: '#ff9c67'
        };
      case 'minimal-dark':
        return {
          lidTop: '#1c1d21',
          lidBottom: '#101114',
          highlightStroke: 'rgba(255, 255, 255, 0.1)',
          baseTop: '#24262c',
          baseMid: '#16171b',
          baseBottom: '#0d0d10',
          baseHighlight: 'rgba(255, 255, 255, 0.15)'
        };
      case 'macbook-dark':
      default: // MacBook Space Gray
        return {
          lidTop: '#2d3139',
          lidBottom: '#1c1f26',
          highlightStroke: 'rgba(255, 255, 255, 0.22)',
          baseTop: '#3a3f4a',
          baseMid: '#232730',
          baseBottom: '#14161c',
          baseHighlight: 'rgba(255, 255, 255, 0.3)'
        };
    }
  }

  // -------------------------------------------------------------------------
  // REALISTIC VECTOR SMARTPHONE MOCKUP
  // -------------------------------------------------------------------------
  function drawSmartphoneMockup(ctx, mState, isSelected) {
    ctx.save();
    ctx.translate(mState.posX, mState.posY);
    ctx.rotate((mState.rotation * Math.PI) / 180);
    const s = mState.scale / 100;
    ctx.scale(s, s);

    // iPhone 16 Pro Flagship Proportions (260 x 536 px)
    const phoneW = 260;
    const phoneH = 536;
    const outerRadius = 46;
    const bezelWidth = 9;
    const screenRadius = 38;
    const screenW = phoneW - (bezelWidth * 2); // 242px
    const screenH = phoneH - (bezelWidth * 2); // 518px

    const phoneX = -phoneW / 2;
    const phoneY = -phoneH / 2;

    // 1. 3D Drop Shadow behind phone (casts dramatic depth onto laptop/background)
    if (state.toggles.showDeviceShadows) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 48;
      ctx.shadowOffsetX = 18;
      ctx.shadowOffsetY = 30;
      ctx.fillStyle = '#000000';
      roundRect(ctx, phoneX, phoneY, phoneW, phoneH, outerRadius);
      ctx.fill();
      ctx.restore();

      // Ambient contact shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 6;
      ctx.shadowOffsetY = 12;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
      roundRect(ctx, phoneX, phoneY, phoneW, phoneH, outerRadius);
      ctx.fill();
      ctx.restore();
    }

    // 2. Outer Rim Buttons (Volume left, Power right)
    const styleColors = getPhoneStyleColors(mState.style);
    ctx.fillStyle = styleColors.buttonColor;

    // Left buttons
    roundRect(ctx, phoneX - 2.5, phoneY + 90, 3, 24, 1.5); // Action button
    ctx.fill();
    roundRect(ctx, phoneX - 2.5, phoneY + 126, 3, 44, 1.5); // Volume up
    ctx.fill();
    roundRect(ctx, phoneX - 2.5, phoneY + 180, 3, 44, 1.5); // Volume down
    ctx.fill();

    // Right button
    roundRect(ctx, phoneX + phoneW - 0.5, phoneY + 140, 3, 64, 1.5); // Power
    ctx.fill();

    // 3. Titanium Outer Band / Chassis
    const frameGrad = ctx.createLinearGradient(phoneX, phoneY, phoneX + phoneW, phoneY + phoneH);
    frameGrad.addColorStop(0, styleColors.frame1);
    frameGrad.addColorStop(0.5, styleColors.frame2);
    frameGrad.addColorStop(1, styleColors.frame3);
    ctx.fillStyle = frameGrad;
    roundRect(ctx, phoneX, phoneY, phoneW, phoneH, outerRadius);
    ctx.fill();

    // Metallic rim highlight stroke
    ctx.strokeStyle = styleColors.highlightRim;
    ctx.lineWidth = 1.5;
    roundRect(ctx, phoneX, phoneY, phoneW, phoneH, outerRadius);
    ctx.stroke();

    // 4. Dark Bezel Band
    ctx.fillStyle = '#08080a';
    roundRect(ctx, phoneX + 2, phoneY + 2, phoneW - 4, phoneH - 4, outerRadius - 2);
    ctx.fill();

    // 5. Screen Clipping Area
    const scrX = phoneX + bezelWidth;
    const scrY = phoneY + bezelWidth;

    ctx.save();
    roundRect(ctx, scrX, scrY, screenW, screenH, screenRadius);
    ctx.clip();

    // Screen Background
    ctx.fillStyle = '#020305';
    ctx.fillRect(scrX, scrY, screenW, screenH);

    // Render Uploaded Screenshot
    if (mState.imageObj && mState.imageObj.complete && (mState.imageObj.naturalWidth || mState.imageObj.width)) {
      drawScreenshotInScreen(ctx, mState.imageObj, scrX, scrY, screenW, screenH, mState.zoom, mState.panX, mState.panY, mState.fitMode);
    } else {
      drawPlaceholder(ctx, scrX, scrY, screenW, screenH, 'Upload Mobile Screenshot', '📱');
    }

    // Dynamic Island
    const islandW = 86;
    const islandH = 24;
    const islandY = scrY + 12;
    ctx.fillStyle = '#000000';
    roundRect(ctx, -islandW / 2, islandY, islandW, islandH, 12);
    ctx.fill();

    // Camera lens inside Dynamic Island
    ctx.fillStyle = '#0d131f';
    ctx.beginPath();
    ctx.arc(islandW / 2 - 18, islandY + 12, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c2d47';
    ctx.beginPath();
    ctx.arc(islandW / 2 - 18, islandY + 12, 2, 0, Math.PI * 2);
    ctx.fill();

    // Sensor dot
    ctx.fillStyle = '#080c14';
    ctx.beginPath();
    ctx.arc(-islandW / 2 + 18, islandY + 12, 3, 0, Math.PI * 2);
    ctx.fill();

    // Home Indicator Bar at bottom of screen
    const homeW = 96;
    const homeH = 4;
    const homeY = scrY + screenH - 14;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    roundRect(ctx, -homeW / 2, homeY, homeW, homeH, 2);
    ctx.fill();

    // Glass Specular Sheen Reflection
    if (state.toggles.showReflections) {
      const sheenGrad = ctx.createLinearGradient(scrX, scrY, scrX + screenW * 0.7, scrY + screenH);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      sheenGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.04)');
      sheenGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(scrX, scrY, screenW, screenH);
    }
    ctx.restore();

    // Subtle Screen Edge Inner Stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    roundRect(ctx, scrX, scrY, screenW, screenH, screenRadius);
    ctx.stroke();

    // Selection highlight if selected
    if (isSelected) {
      ctx.strokeStyle = '#ff813e';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      roundRect(ctx, phoneX - 10, phoneY - 10, phoneW + 20, phoneH + 20, outerRadius + 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  function getPhoneStyleColors(style) {
    switch (style) {
      case 'iphone-midnight':
        return {
          frame1: '#1b1d24',
          frame2: '#101217',
          frame3: '#08090d',
          highlightRim: 'rgba(255, 255, 255, 0.18)',
          buttonColor: '#171920'
        };
      case 'iphone-silver':
        return {
          frame1: '#e2e8f0',
          frame2: '#cbd5e1',
          frame3: '#94a3b8',
          highlightRim: '#ffffff',
          buttonColor: '#cbd5e1'
        };
      case 'iphone-orange':
        return {
          frame1: '#ff9c67',
          frame2: '#ff813e',
          frame3: '#b4460e',
          highlightRim: '#ffbe98',
          buttonColor: '#e06928'
        };
      case 'minimal-bezel':
        return {
          frame1: '#26282e',
          frame2: '#18191e',
          frame3: '#0e0f12',
          highlightRim: 'rgba(255, 255, 255, 0.12)',
          buttonColor: '#1a1b20'
        };
      case 'iphone-titanium':
      default:
        return {
          frame1: '#4a4b4f',
          frame2: '#35363a',
          frame3: '#222326',
          highlightRim: 'rgba(255, 255, 255, 0.28)',
          buttonColor: '#3d3e42'
        };
    }
  }

  // Draw Screenshot within Screen Bounds with Zoom, Pan, and Fit Mode
  function drawScreenshotInScreen(ctx, img, scrX, scrY, scrW, scrH, zoomPercent, panX, panY, fitMode) {
    const zoom = (zoomPercent || 100) / 100;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    if (!imgW || !imgH) return;

    let drawW, drawH;
    if (fitMode === 'contain') {
      const scale = Math.min(scrW / imgW, scrH / imgH);
      drawW = imgW * scale * zoom;
      drawH = imgH * scale * zoom;
    } else if (fitMode === 'free') {
      drawW = imgW * zoom;
      drawH = imgH * zoom;
    } else {
      // 'cover' default: fills screen area completely
      const scale = Math.max(scrW / imgW, scrH / imgH);
      drawW = imgW * scale * zoom;
      drawH = imgH * scale * zoom;
    }

    const drawX = scrX + (scrW - drawW) / 2 + (panX || 0);
    const drawY = scrY + (scrH - drawH) / 2 + (panY || 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // Empty Screen Placeholder
  function drawPlaceholder(ctx, x, y, w, h, text, icon) {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(x, y, w, h);

    // Subtle dashed frame
    ctx.strokeStyle = 'rgba(255, 129, 62, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    roundRect(ctx, x + 16, y + 16, w - 32, h - 32, 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // Icon
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, x + w / 2, y + h / 2 - 16);

    // Text
    ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = '#ff9c67';
    ctx.fillText(text, x + w / 2, y + h / 2 + 20);
  }

  // -------------------------------------------------------------------------
  // 6. BOTTOM SHOWCASE CARD
  // -------------------------------------------------------------------------
  function drawBottomShowcaseCard(ctx) {
    const cardX = 64;
    const cardY = 1130;
    const cardW = 1080 - 128; // 952px
    const cardH = 156;

    ctx.save();

    // 1. Card Container (Sleek Frosted Glassmorphism)
    ctx.fillStyle = "rgba(18, 21, 27, 0.88)";
    ctx.strokeStyle = "rgba(255, 129, 62, 0.25)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, cardX, cardY, cardW, cardH, 18);
    ctx.fill();
    ctx.stroke();

    // Subtle accent highlight at top edge of card
    const borderGrad = ctx.createLinearGradient(cardX + 40, cardY, cardX + cardW - 40, cardY);
    borderGrad.addColorStop(0, "rgba(255, 129, 62, 0.0)");
    borderGrad.addColorStop(0.5, "rgba(255, 129, 62, 0.8)");
    borderGrad.addColorStop(1, "rgba(255, 129, 62, 0.0)");
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardX + 40, cardY);
    ctx.lineTo(cardX + cardW - 40, cardY);
    ctx.stroke();

    // 2. Left Column: Client Name & Category
    const leftPadX = cardX + 32;

    // Label: DEVELOPED FOR
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.letterSpacing = "1.5px";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("DEVELOPED FOR:", leftPadX, cardY + 26);

    // Client Name
    ctx.font = "bold 22px 'Space Grotesk', -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    const clientName = (state.project.client || "Valued Enterprise Client").toUpperCase();
    ctx.fillText(clientName, leftPadX, cardY + 44);

    // Label: PROJECT CATEGORY
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("PROJECT CATEGORY:", leftPadX, cardY + 86);

    // Category Value
    ctx.font = "600 16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillStyle = "#ff9c67";
    const catName = state.project.category || "Full-Stack Custom Web Solution";
    ctx.fillText(catName, leftPadX, cardY + 104);

    // 3. Right Column: Developed By OryTingo & Website URL
    const rightPadX = cardX + cardW - 32;
    ctx.textAlign = "right";

    // Developed by label
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("DEVELOPED BY", rightPadX, cardY + 26);

    // Agency Full Name with Verified Accent
    ctx.font = "bold 16px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("ORYTINGO NETWORKS & SOFTWARE SOLUTIONS", rightPadX, cardY + 46);

    // Website URL Pill
    if (state.toggles.showUrl && state.project.url) {
      const urlText = state.project.url;
      ctx.font = "600 13px 'Plus Jakarta Sans', monospace";
      const urlW = ctx.measureText(urlText).width + 38;
      const urlH = 32;
      const urlX = rightPadX - urlW;
      const urlY = cardY + 88;

      // URL Pill BG
      ctx.fillStyle = "rgba(255, 129, 62, 0.08)";
      ctx.strokeStyle = "rgba(255, 129, 62, 0.35)";
      ctx.lineWidth = 1;
      roundRect(ctx, urlX, urlY, urlW, urlH, 16);
      ctx.fill();
      ctx.stroke();

      // Globe Icon + URL Text
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = "12px sans-serif";
      ctx.fillText("🌐", urlX + 10, urlY + urlH / 2);

      ctx.font = "600 13px 'Plus Jakarta Sans', monospace";
      ctx.fillStyle = "#ff813e";
      ctx.fillText(urlText, urlX + 28, urlY + urlH / 2);
    } else {
      // Slogan fallback
      ctx.font = "italic 13px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText("Code. Innovate. Elevate.", rightPadX, cardY + 98);
    }

    // 4. Subtle Bottom Footer Sub-line
    ctx.font = "500 11px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#475569";
    ctx.textAlign = "center";
    ctx.letterSpacing = "1px";
    ctx.fillText("ORYTINGO.LK • ENTERPRISE SOFTWARE PORTFOLIO SHOWCASE", 540, 1318);

    ctx.restore();
  }

  // =========================================================================
  // UTILITY CANVAS DRAWING HELPERS
  // =========================================================================
  function roundRect(ctx, x, y, width, height, radii) {
    if (typeof radii === 'number') {
      radii = [radii, radii, radii, radii];
    } else if (Array.isArray(radii)) {
      if (radii.length === 1) radii = [radii[0], radii[0], radii[0], radii[0]];
      else if (radii.length === 2) radii = [radii[0], radii[1], radii[0], radii[1]];
      else if (radii.length === 3) radii = [radii[0], radii[1], radii[2], radii[1]];
    } else {
      radii = [0, 0, 0, 0];
    }

    const [tl, tr, br, bl] = radii;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + width - tr, y);
    ctx.arcTo(x + width, y, x + width, y + tr, tr);
    ctx.lineTo(x + width, y + height - br);
    ctx.arcTo(x + width, y + height, x + width - br, y + height, br);
    ctx.lineTo(x + bl, y + height);
    ctx.arcTo(x, y + height, x, y + height - bl, bl);
    ctx.lineTo(x, y + tl);
    ctx.arcTo(x, y, x + tl, y, tl);
    ctx.closePath();
  }

  function hexToRgba(hex, alpha) {
    hex = (hex || "#ff813e").replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // =========================================================================
  // LOCALSTORAGE PERSISTENCE
  // =========================================================================
  function saveToLocalStorage() {
    try {
      const stateToSave = JSON.parse(JSON.stringify(state));
      // Exclude HTMLImageElement objects
      delete stateToSave.desktop.imageObj;
      delete stateToSave.mobile.imageObj;
      delete stateToSave.display.customLogoObj;
      localStorage.setItem('orytingo_showcase_state', JSON.stringify(stateToSave));
    } catch (e) {
      // Quota exceeded if heavy data URLs are present; fallback silently
    }
  }

  function loadFromLocalStorage() {
    try {
      const str = localStorage.getItem('orytingo_showcase_state');
      if (str) return JSON.parse(str);
    } catch (e) {
      return null;
    }
    return null;
  }

  // =========================================================================
  // TEMPLATE JSON EXPORT & IMPORT
  // =========================================================================
  function exportTemplateJson() {
    const stateToSave = JSON.parse(JSON.stringify(state));
    delete stateToSave.desktop.imageObj;
    delete stateToSave.mobile.imageObj;
    delete stateToSave.display.customLogoObj;

    const jsonStr = JSON.stringify(stateToSave, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (state.project.name || 'showcase').toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `orytingo-showcase-${safeName}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Project template exported as JSON file!');
  }

  function importTemplateJson(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const imported = JSON.parse(e.target.result);
        Object.assign(state, imported);
        syncStateToInputs();
        reloadImagesThenRender();
        showToast('Template JSON successfully imported!');
      } catch (err) {
        showToast('Invalid template JSON file.');
      }
    };
    reader.readAsText(file);
  }

  // =========================================================================
  // EXPORT MODAL & PNG / CLIPBOARD EXPORT
  // =========================================================================
  let exportFormat = 'png';

  function openExportModal() {
    // Generate high-res image data for preview in modal
    const previewImg = document.getElementById('export-modal-preview-img');
    const safeName = (state.project.name || 'client-project').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filenameInput = document.getElementById('export-filename-input');
    if (filenameInput) filenameInput.value = `orytingo-${safeName}-showcase`;

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    if (previewImg) previewImg.src = dataUrl;

    // Estimate file size
    const estSize = Math.round((dataUrl.length * (3 / 4)) / 1024);
    const sizeEl = document.getElementById('export-filesize-est');
    if (sizeEl) sizeEl.textContent = `${estSize} KB (High Quality)`;

    openModal('modal-export');
  }

  function bindModalHandlers() {
    // Close modal buttons
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal(btn.dataset.modal);
      });
    });

    // Format selection buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        exportFormat = btn.dataset.format;
      });
    });

    // Download button
    const btnDownload = document.getElementById('btn-execute-download');
    if (btnDownload) {
      btnDownload.addEventListener('click', executeDownload);
    }

    // Copy to clipboard button
    const btnCopyClipboard = document.getElementById('btn-copy-clipboard');
    if (btnCopyClipboard) {
      btnCopyClipboard.addEventListener('click', executeCopyClipboard);
    }
  }

  function executeDownload() {
    const filenameInput = document.getElementById('export-filename-input');
    let filename = filenameInput ? filenameInput.value.trim() : 'orytingo-showcase';
    if (!filename) filename = 'orytingo-showcase';

    const mime = exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    const ext = exportFormat === 'jpeg' ? '.jpg' : '.png';

    canvas.toBlob(blob => {
      if (!blob) {
        showToast('Export failed: Canvas buffer unavailable.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename + ext;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      closeModal('modal-export');
      showToast(`Poster exported as ${filename}${ext}!`);
    }, mime, 0.95);
  }

  function executeCopyClipboard() {
    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast('Clipboard image copying is not supported in this browser.');
      return;
    }

    canvas.toBlob(blob => {
      if (!blob) return;
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        showToast('High-resolution 1080×1350 poster copied to clipboard!');
      }).catch(err => {
        showToast('Could not copy to clipboard: ' + err.message);
      });
    }, 'image/png');
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

})();
