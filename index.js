/**
 * Tour Virtual 360° - ARQUITECTÓNICO
 * Powered by Marzipano.js
 */

(function() {
  'use strict';

  // Dependencies
  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;

  // Configuration
  var TRANSITION_DURATION = 800; // ms
  var IDLE_TIMEOUT = 3000; // ms

  // State
  var viewer, scenes, autorotate;
  var currentScene = null;
  var isAutorotating = false;

  // DOM Elements
  var elements = {};

  // Scene icon mapping
  var sceneIcons = {
    '0-entrada': 'fa-door-open',
    '1-corredor': 'fa-walking',
    '2-sala': 'fa-couch',
    '3-entrada-cocina': 'fa-door-open',
    '4-cocina': 'fa-kitchen-set',
    '5-bao-auxiliar': 'fa-bath',
    '6-escaleras': 'fa-stairs',
    '7-cuarto': 'fa-bed',
    '8-bao-cuarto': 'fa-shower'
  };

  // ============ Initialization ============

  function init() {
    console.log('Initializing 360° Tour...');
    
    // Cache DOM elements
    cacheElements();

    // Setup device detection
    setupDeviceMode();

    // Build scene list UI
    buildSceneList();

    // Initialize Marzipano viewer
    initViewer();

    // Setup event handlers
    setupEventHandlers();

    // Hide loading screen
    hideLoadingScreen();

    console.log('Tour initialized');
  }

  function cacheElements() {
    elements = {
      loadingScreen: document.getElementById('loadingScreen'),
      startMenu: document.getElementById('startMenu'),
      startBtn: document.getElementById('startExperienceBtn'),
      pano: document.getElementById('pano'),
      topBar: document.getElementById('topBar'),
      sceneTitle: document.querySelector('.title-text'),
      sidebar: document.getElementById('sidebar'),
      sidebarOverlay: document.getElementById('sidebarOverlay'),
      menuToggle: document.getElementById('menuToggle'),
      closeSidebar: document.getElementById('closeSidebar'),
      sceneList: document.getElementById('sceneList'),
      mobileBar: document.getElementById('mobileBar'),
      logo: document.getElementById('logo'),
      autorotateBtn: document.getElementById('autorotateBtn'),
      fullscreenBtn: document.getElementById('fullscreenBtn')
    };
  }

  // ============ Device Detection ============

  function setupDeviceMode() {
    var isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      document.body.classList.add('is-mobile');
      document.body.classList.remove('is-desktop');
    } else {
      document.body.classList.add('is-desktop');
      document.body.classList.remove('is-mobile');
    }

    // Listen for resize
    window.addEventListener('resize', function() {
      var mobile = window.innerWidth < 768;
      document.body.classList.toggle('is-mobile', mobile);
      document.body.classList.toggle('is-desktop', !mobile);
    });
  }

  // ============ Scene List UI ============

  function buildSceneList() {
    if (!elements.sceneList || !data.scenes) return;

    data.scenes.forEach(function(sceneData) {
      var item = document.createElement('div');
      item.className = 'sidebar-item';
      item.dataset.sceneId = sceneData.id;

      var icon = sceneIcons[sceneData.id] || 'fa-compass';
      item.innerHTML = '<i class="fas ' + icon + '"></i><span>' + sceneData.name + '</span>';

      item.addEventListener('click', function() {
        switchToScene(sceneData.id);
        if (window.innerWidth < 1024) {
          closeSidebar();
        }
      });

      elements.sceneList.appendChild(item);
    });

    // Mobile scenes are in HTML, add listeners
    document.querySelectorAll('.mobile-scene').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var sceneId = this.dataset.scene;
        switchToScene(sceneId);
      });
    });
  }

  // ============ Marzipano Viewer ============

  function initViewer() {
    // Create viewer
    var viewerOpts = {
      controls: {
        mouseViewMode: data.settings?.mouseViewMode || 'drag'
      }
    };

    viewer = new Marzipano.Viewer(elements.pano, viewerOpts);

    // Calculate base path
    var basePath = getBasePath();

    // Create scenes
    scenes = data.scenes.map(function(sceneData) {
      // Source with preview
      var urlPrefix = basePath + 'tiles/' + sceneData.id;
      var source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + '/{z}/{f}/{y}/{x}.jpg',
        { cubeMapPreviewUrl: urlPrefix + '/preview.jpg' }
      );

      // Geometry
      var geometry = new Marzipano.CubeGeometry(sceneData.levels);

      // View with limits
      var limiter = Marzipano.RectilinearView.limit.traditional(
        sceneData.faceSize || 1024,
        100 * Math.PI / 180,
        120 * Math.PI / 180
      );
      var view = new Marzipano.RectilinearView(
        sceneData.initialViewParameters || {},
        limiter
      );

      // Create scene
      var scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: view,
        pinFirstLevel: true
      });

      // Add link hotspots
      (sceneData.linkHotspots || []).forEach(function(hotspot) {
        addLinkHotspot(scene, hotspot);
      });

      // Add info hotspots
      (sceneData.infoHotspots || []).forEach(function(hotspot) {
        addInfoHotspot(scene, hotspot);
      });

      return {
        id: sceneData.id,
        name: sceneData.name,
        scene: scene,
        view: view
      };
    });

    // Setup autorotate
    autorotate = Marzipano.autorotate({
      yawSpeed: 0.03,
      targetPitch: 0,
      targetFov: Math.PI / 2
    });
  }

  function getBasePath() {
    var path = window.location.pathname;
    var lastSlash = path.lastIndexOf('/');
    return lastSlash > 0 ? path.substring(0, lastSlash + 1) : '/';
  }

  // ============ Hotspots ============

  function addLinkHotspot(scene, hotspot) {
    var el = document.createElement('button');
    el.className = 'hotspot link-hotspot';
    
    var iconClass = sceneIcons[hotspot.target] || 'fa-arrow-right';
    el.innerHTML = '<i class="fas ' + iconClass + '"></i>';

    el.addEventListener('click', function(e) {
      e.stopPropagation();
      switchToScene(hotspot.target);
    });

    scene.hotspotContainer().createHotspot(el, {
      yaw: hotspot.yaw,
      pitch: hotspot.pitch
    });
  }

  function addInfoHotspot(scene, hotspot) {
    // Info hotspots implementation if needed
  }

  // ============ Scene Switching ============

  function switchToScene(sceneId) {
    var scene = findScene(sceneId);
    if (!scene || scene === currentScene) return;

    console.log('Switching to:', scene.name);

    // Stop current autorotate
    stopAutorotate();

    // Set view parameters
    scene.view.setParameters(scene.scene.view()._initialViewParameters || {});

    // Switch with transition
    scene.scene.switchTo({
      transitionDuration: TRANSITION_DURATION
    });

    // Update state
    currentScene = scene;
    isAutorotating = false;

    // Update UI
    updateSceneUI(sceneId);

    // Resume autorotate if was active
    if (elements.autorotateBtn?.classList.contains('active')) {
      startAutorotate();
    }
  }

  function findScene(id) {
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].id === id) return scenes[i];
    }
    return null;
  }

  function updateSceneUI(sceneId) {
    // Update title
    var scene = findScene(sceneId);
    if (scene && elements.sceneTitle) {
      elements.sceneTitle.textContent = scene.name;
    }

    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(function(item) {
      item.classList.toggle('active', item.dataset.sceneId === sceneId);
    });

    // Update mobile active state
    document.querySelectorAll('.mobile-scene').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.scene === sceneId);
    });
  }

  // ============ Autorotate ============

  function startAutorotate() {
    if (!viewer) return;
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(IDLE_TIMEOUT, autorotate);
    isAutorotating = true;
  }

  function stopAutorotate() {
    if (!viewer) return;
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
    isAutorotating = false;
  }

  function toggleAutorotate() {
    if (isAutorotating) {
      stopAutorotate();
      elements.autorotateBtn?.classList.remove('active');
      elements.autorotateBtn?.querySelector('i')?.classList.replace('fa-pause', 'fa-play');
    } else {
      startAutorotate();
      elements.autorotateBtn?.classList.add('active');
      elements.autorotateBtn?.querySelector('i')?.classList.replace('fa-play', 'fa-pause');
    }
  }

  // ============ Fullscreen ============

  function toggleFullscreen() {
    if (!screenfull || !screenfull.enabled) return;

    screenfull.toggle();
    
    var isFullscreen = screenfull.isFullscreen;
    elements.fullscreenBtn?.classList.toggle('active', isFullscreen);
    elements.fullscreenBtn?.querySelector('i')?.classList.toggle('fa-expand', !isFullscreen);
    elements.fullscreenBtn?.querySelector('i')?.classList.toggle('fa-compress', isFullscreen);
  }

  // ============ Sidebar ============

  function toggleSidebar() {
    elements.sidebar?.classList.toggle('open');
    elements.sidebarOverlay?.classList.toggle('visible');
    elements.sidebarOverlay?.classList.toggle('hidden');
  }

  function closeSidebar() {
    elements.sidebar?.classList.remove('open');
    elements.sidebarOverlay?.classList.remove('visible');
    elements.sidebarOverlay?.classList.add('hidden');
  }

  function openSidebar() {
    elements.sidebar?.classList.add('open');
    elements.sidebarOverlay?.classList.add('visible');
    elements.sidebarOverlay?.classList.remove('hidden');
  }

  // ============ Start Experience ============

  function startExperience() {
    // Hide start menu
    elements.startMenu?.classList.add('hidden');

    // Show UI elements
    elements.topBar?.classList.remove('hidden');
    elements.mobileBar?.classList.remove('hidden');
    elements.logo?.classList.remove('hidden');

    // Open sidebar on desktop
    if (window.innerWidth >= 1024) {
      openSidebar();
    }

    // Switch to first scene
    if (scenes && scenes.length > 0) {
      switchToScene('0-entrada');
    }
  }

  // ============ Loading ============

  function hideLoadingScreen() {
    setTimeout(function() {
      elements.loadingScreen?.classList.add('hidden');
    }, 500);
  }

  // ============ Event Handlers ============

  function setupEventHandlers() {
    // Start button
    elements.startBtn?.addEventListener('click', startExperience);

    // Menu toggle
    elements.menuToggle?.addEventListener('click', toggleSidebar);

    // Close sidebar
    elements.closeSidebar?.addEventListener('click', closeSidebar);
    elements.sidebarOverlay?.addEventListener('click', closeSidebar);

    // Autorotate
    elements.autorotateBtn?.addEventListener('click', toggleAutorotate);

    // Fullscreen
    elements.fullscreenBtn?.addEventListener('click', toggleFullscreen);

    // Screenfull change event
    if (screenfull && screenfull.on) {
      screenfull.on('change', function() {
        if (!screenfull.isFullscreen) {
          elements.fullscreenBtn?.classList.remove('active');
          elements.fullscreenBtn?.querySelector('i')?.classList.replace('fa-compress', 'fa-expand');
        }
      });
    }

    // Keyboard
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeSidebar();
      }
    });

    // Fallback: hide loading after timeout
    setTimeout(hideLoadingScreen, 5000);
  }

  // ============ Start ============

  // Screenfull fallback
  if (typeof screenfull === 'undefined') {
    window.screenfull = {
      enabled: false,
      isFullscreen: false,
      toggle: function() {},
      on: function() {}
    };
  }

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
