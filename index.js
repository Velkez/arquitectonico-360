/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

(function() {
  // ===========================================
  // CONFIGURACIÓN GLOBAL Y DEPENDENCIAS
  // ===========================================
  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;

  // Variables globales para el viewer y escenas
  var viewer, scenes, autorotate;

  // Elementos DOM principales
  var panoElement, sceneNameElement, sceneListElement, sceneElements,
      sceneListToggleElement, autorotateToggleElement, fullscreenToggleElement;

  // ===========================================
  // UTILIDADES
  // ===========================================

  /**
   * Sanitiza una cadena de texto para prevenir inyección de HTML.
   * @param {string} s - La cadena a sanitizar.
   * @returns {string} La cadena sanitizada.
   */
  function sanitize(s) {
    return s.replace('&', '&').replace('<', '<').replace('>', '>');
  }

  /**
   * Detiene la propagación de eventos táctiles y de scroll para evitar interferencias con controles de vista.
   * @param {HTMLElement} element - El elemento al que aplicar el bloqueo.
   */
  function stopTouchAndScrollEventPropagation(element) {
    var eventList = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel', 'mousewheel'];
    for (var i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function(event) {
        event.stopPropagation();
      });
    }
  }

  /**
   * Busca una escena por su ID en la lista de escenas.
   * @param {string} id - El ID de la escena a buscar.
   * @returns {Object|null} La escena encontrada o null si no existe.
   */
  function findSceneById(id) {
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].data.id === id) {
        return scenes[i];
      }
    }
    return null;
  }

  /**
   * Busca los datos de una escena por su ID en los datos globales.
   * @param {string} id - El ID de la escena a buscar.
   * @returns {Object|null} Los datos de la escena o null si no existe.
   */
  function findSceneDataById(id) {
    for (var i = 0; i < data.scenes.length; i++) {
      if (data.scenes[i].id === id) {
        return data.scenes[i];
      }
    }
    return null;
  }

  // ===========================================
  // AUDIO
  // ===========================================
  let backgroundAudio = null;
  let audioEnabled = false;

  /**
   * Inicializa el audio de fondo si está disponible.
   */
  function initBackgroundAudio() {
    try {
      backgroundAudio = new Audio('audio/background.mp3');
      backgroundAudio.loop = true;
      backgroundAudio.volume = 0.3;
    } catch (e) {
      console.log('Audio not available:', e);
    }
  }

  /**
   * Alterna el estado del audio de fondo (play/pause).
   */
  function toggleAudio() {
    if (!backgroundAudio) initBackgroundAudio();

    if (audioEnabled) {
      backgroundAudio.pause();
      audioEnabled = false;
    } else {
      backgroundAudio.play().catch(e => console.log('Audio autoplay blocked'));
      audioEnabled = true;
    }
  }

  // ===========================================
  // INICIALIZACIÓN DE LA APLICACIÓN
  // ===========================================

  /**
   * Inicializa la aplicación cuando el DOM está listo.
   */
  function initApp() {
    console.log('DOM loaded, initializing...');

    // Mostrar elementos iniciales
    const initialImage = document.getElementById('initialImage');
    const projectDetails = document.getElementById('projectDetails');

    if (initialImage) {
      initialImage.style.display = 'block';
      console.log('Initial image shown');
    }

    if (projectDetails) {
      projectDetails.style.display = 'block';
      console.log('Project details shown');
    }

    // Configurar botones de toggle
    toggleButton("autorotateToggle");
    toggleButton("sceneListToggle");
    document.getElementById("sceneListToggle").classList.add("enabled");

    // Configurar pantalla completa
    const fs = document.getElementById("fullscreenToggle");
    if (fs) {
      fs.addEventListener("click", () => {
        if (screenfull && screenfull.isEnabled) {
          screenfull.toggle();
          fs.classList.toggle("enabled");
        }
      });
    }

    // Inicializar audio si está disponible
    if (typeof Audio !== 'undefined') {
      initBackgroundAudio();
    }

    console.log('App initialized successfully');
  }

  /**
   * Oculta la pantalla de carga.
   */
  function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hide');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        console.log('Loading screen hidden');
      }, 500);
    }
  }

  // ===========================================
  // CONFIGURACIÓN DEL VIEWER Y ESCENAS
  // ===========================================

  /**
   * Configura el modo de dispositivo (desktop/mobile) y detección táctil.
   */
  function setupDeviceMode() {
    // Detectar desktop o mobile
    if (window.matchMedia) {
      var setMode = function() {
        if (mql.matches) {
          document.body.classList.remove('desktop');
          document.body.classList.add('mobile');
        } else {
          document.body.classList.remove('mobile');
          document.body.classList.add('desktop');
        }
      };
      var mql = matchMedia("(max-width: 500px), (max-height: 500px)");
      setMode();
      mql.addListener(setMode);
    } else {
      document.body.classList.add('desktop');
    }

    // Detectar dispositivo táctil
    document.body.classList.add('no-touch');
    window.addEventListener('touchstart', function() {
      document.body.classList.remove('no-touch');
      document.body.classList.add('touch');
    });

    // Fallback para tooltips en IE < 11
    if (bowser.msie && parseFloat(bowser.version) < 11) {
      document.body.classList.add('tooltip-fallback');
    }
  }

  /**
   * Inicializa el viewer de Marzipano y crea las escenas.
   */
  function initViewerAndScenes() {
    // Opciones del viewer
    var viewerOpts = {
      controls: {
        mouseViewMode: data.settings.mouseViewMode
      }
    };

    // Inicializar viewer
    viewer = new Marzipano.Viewer(panoElement, viewerOpts);

    // Crear escenas
    scenes = data.scenes.map(function(sceneData) {
      var urlPrefix = "tiles";
      var source = Marzipano.ImageUrlSource.fromString(
        urlPrefix + "/" + sceneData.id + "/{z}/{f}/{y}/{x}.jpg",
        { cubeMapPreviewUrl: urlPrefix + "/" + sceneData.id + "/preview.jpg" });
      var geometry = new Marzipano.CubeGeometry(sceneData.levels);

      var limiter = Marzipano.RectilinearView.limit.traditional(sceneData.faceSize, 100*Math.PI/180, 120*Math.PI/180);
      var view = new Marzipano.RectilinearView(sceneData.initialViewParameters, limiter);

      var scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: view,
        pinFirstLevel: true
      });

      // Crear hotspots de enlace
      sceneData.linkHotspots.forEach(function(hotspot) {
        var element = createLinkHotspotElement(hotspot);
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });

      // Crear hotspots de información
      sceneData.infoHotspots.forEach(function(hotspot) {
        var element = createInfoHotspotElement(hotspot);
        scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });

      return {
        data: sceneData,
        scene: scene,
        view: view
      };
    });
  }

  /**
   * Configura los controles de movimiento de la vista.
   */
  function setupViewControls() {
    var viewUpElement = document.querySelector('#viewUp');
    var viewDownElement = document.querySelector('#viewDown');
    var viewLeftElement = document.querySelector('#viewLeft');
    var viewRightElement = document.querySelector('#viewRight');
    var viewInElement = document.querySelector('#viewIn');
    var viewOutElement = document.querySelector('#viewOut');

    var velocity = 0.7;
    var friction = 0.1;

    var controls = viewer.controls();
    controls.registerMethod('upElement', new Marzipano.ElementPressControlMethod(viewUpElement, 'y', -velocity, friction), true);
    controls.registerMethod('downElement', new Marzipano.ElementPressControlMethod(viewDownElement, 'y', velocity, friction), true);
    controls.registerMethod('leftElement', new Marzipano.ElementPressControlMethod(viewLeftElement, 'x', -velocity, friction), true);
    controls.registerMethod('rightElement', new Marzipano.ElementPressControlMethod(viewRightElement, 'x', velocity, friction), true);
    controls.registerMethod('inElement', new Marzipano.ElementPressControlMethod(viewInElement, 'zoom', -velocity, friction), true);
    controls.registerMethod('outElement', new Marzipano.ElementPressControlMethod(viewOutElement, 'zoom', velocity, friction), true);
  }

  // ===========================================
  // MANEJO DE ESCENAS
  // ===========================================

  /**
   * Cambia a una escena específica, deteniendo y reiniciando autorotate si es necesario.
   * @param {Object} scene - La escena a la que cambiar.
   */
  function switchScene(scene) {
    stopAutorotate();
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    startAutorotate();
    updateSceneName(scene);
    updateSceneList(scene);
  }

  /**
   * Actualiza el nombre de la escena en la interfaz.
   * @param {Object} scene - La escena actual.
   */
  function updateSceneName(scene) {
    sceneNameElement.innerHTML = sanitize(scene.data.name);
  }

  /**
   * Actualiza la lista de escenas para resaltar la escena actual.
   * @param {Object} scene - La escena actual.
   */
  function updateSceneList(scene) {
    for (var i = 0; i < sceneElements.length; i++) {
      var el = sceneElements[i];
      if (el.getAttribute('data-id') === scene.data.id) {
        el.classList.add('current');
      } else {
        el.classList.remove('current');
      }
    }
  }

  /**
   * Inicia el tour cambiando a la primera escena.
   */
  window.startTour = function() {
    console.log('Starting tour...');
    if (scenes && scenes.length > 0) {
      switchScene(scenes[0]);
      console.log('Switched to first scene');
    } else {
      console.error('No scenes available');
    }
  };

  // ===========================================
  // CONTROLES DE UI
  // ===========================================

  /**
   * Agrega funcionalidad de toggle a un botón por ID.
   * @param {string} id - El ID del botón.
   */
  function toggleButton(id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", () => el.classList.toggle("enabled"));
  }

  /**
   * Muestra la lista de escenas.
   */
  function showSceneList() {
    sceneListElement.classList.add('enabled');
    sceneListToggleElement.classList.add('enabled');
  }

  /**
   * Oculta la lista de escenas.
   */
  function hideSceneList() {
    sceneListElement.classList.remove('enabled');
    sceneListToggleElement.classList.remove('enabled');
  }

  /**
   * Alterna la visibilidad de la lista de escenas.
   */
  function toggleSceneList() {
    sceneListElement.classList.toggle('enabled');
    sceneListToggleElement.classList.toggle('enabled');
  }

  /**
   * Inicia el autorotate si está habilitado.
   */
  function startAutorotate() {
    if (!autorotateToggleElement.classList.contains('enabled')) {
      return;
    }
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  /**
   * Detiene el autorotate.
   */
  function stopAutorotate() {
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
  }

  /**
   * Alterna el estado del autorotate.
   */
  function toggleAutorotate() {
    if (autorotateToggleElement.classList.contains('enabled')) {
      autorotateToggleElement.classList.remove('enabled');
      stopAutorotate();
    } else {
      autorotateToggleElement.classList.add('enabled');
      startAutorotate();
    }
  }

  // ===========================================
  // HOTSPOTS
  // ===========================================

  /**
   * Crea un elemento de hotspot de enlace.
   * @param {Object} hotspot - Los datos del hotspot.
   * @returns {HTMLElement} El elemento del hotspot.
   */
  function createLinkHotspotElement(hotspot) {
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot', 'link-hotspot');

    var icon = document.createElement('i');
    var iconClasses = getIconForScene(hotspot.target);
    icon.classList.add('fas', iconClasses);

    wrapper.addEventListener('click', function() {
      switchScene(findSceneById(hotspot.target));
    });

    stopTouchAndScrollEventPropagation(wrapper);
    wrapper.appendChild(icon);

    return wrapper;
  }

  /**
   * Crea un elemento de hotspot de información.
   * @param {Object} hotspot - Los datos del hotspot.
   * @returns {HTMLElement} El elemento del hotspot.
   */
  function createInfoHotspotElement(hotspot) {
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot', 'info-hotspot');

    var header = document.createElement('div');
    header.classList.add('info-hotspot-header');

    var iconWrapper = document.createElement('div');
    iconWrapper.classList.add('info-hotspot-icon-wrapper');
    var icon = document.createElement('img');
    icon.src = 'img/info.png';
    icon.classList.add('info-hotspot-icon');
    iconWrapper.appendChild(icon);

    var titleWrapper = document.createElement('div');
    titleWrapper.classList.add('info-hotspot-title-wrapper');
    var title = document.createElement('div');
    title.classList.add('info-hotspot-title');
    title.innerHTML = hotspot.title;
    titleWrapper.appendChild(title);

    var closeWrapper = document.createElement('div');
    closeWrapper.classList.add('info-hotspot-close-wrapper');
    var closeIcon = document.createElement('img');
    closeIcon.src = 'img/close.png';
    closeIcon.classList.add('info-hotspot-close-icon');
    closeWrapper.appendChild(closeIcon);

    header.appendChild(iconWrapper);
    header.appendChild(titleWrapper);
    header.appendChild(closeWrapper);

    var text = document.createElement('div');
    text.classList.add('info-hotspot-text');
    text.innerHTML = hotspot.text;

    wrapper.appendChild(header);
    wrapper.appendChild(text);

    var modal = document.createElement('div');
    modal.innerHTML = wrapper.innerHTML;
    modal.classList.add('info-hotspot-modal');
    document.body.appendChild(modal);

    var toggle = function() {
      wrapper.classList.toggle('visible');
      modal.classList.toggle('visible');
    };

    wrapper.querySelector('.info-hotspot-header').addEventListener('click', toggle);
    modal.querySelector('.info-hotspot-close-wrapper').addEventListener('click', toggle);
    stopTouchAndScrollEventPropagation(wrapper);

    return wrapper;
  }

  /**
   * Obtiene la clase de icono de Font Awesome para una escena específica.
   * @param {string} target - El ID de la escena objetivo.
   * @returns {string} La clase del icono.
   */
  function getIconForScene(target) {
    var iconMap = {
      '0-entrada': 'fa-door-open',
      '1-corredor': 'fa-person-walking',
      '2-sala': 'fa-couch',
      '3-entrada-cocina': 'fa-utensils',
      '4-cocina': 'fa-kitchen-set',
      '5-bao-auxiliar': 'fa-bath',
      '6-escaleras': 'fa-stairs',
      '7-cuarto': 'fa-bed',
      '8-bao-cuarto': 'fa-shower'
    };
    return iconMap[target] || 'fa-arrow-up';
  }

  // ===========================================
  // INICIALIZACIÓN PRINCIPAL
  // ===========================================

  // Fallback para screenfull
  if (typeof screenfull === 'undefined') {
    window.screenfull = {
      enabled: false,
      isEnabled: false,
      toggle: function() {},
      on: function() {}
    };
  }

  // Obtener elementos DOM
  panoElement = document.querySelector('#pano');
  sceneNameElement = document.querySelector('#titleBar .sceneName');
  sceneListElement = document.querySelector('#sceneList');
  sceneElements = document.querySelectorAll('#sceneList .scene');
  sceneListToggleElement = document.querySelector('#sceneListToggle');
  autorotateToggleElement = document.querySelector('#autorotateToggle');
  fullscreenToggleElement = document.querySelector('#fullscreenToggle');

  // Configurar modo de dispositivo
  setupDeviceMode();

  // Inicializar viewer y escenas
  initViewerAndScenes();

  // Configurar autorotate
  autorotate = Marzipano.autorotate({
    yawSpeed: 0.03,
    targetPitch: 0,
    targetFov: Math.PI/2
  });
  if (data.settings.autorotateEnabled) {
    autorotateToggleElement.classList.add('enabled');
  }

  // Configurar controles de UI
  autorotateToggleElement.addEventListener('click', toggleAutorotate);
  sceneListToggleElement.addEventListener('click', toggleSceneList);

  // Configurar pantalla completa
  if (screenfull.enabled && data.settings.fullscreenButton) {
    document.body.classList.add('fullscreen-enabled');
    fullscreenToggleElement.addEventListener('click', function() {
      screenfull.toggle();
    });
    screenfull.on('change', function() {
      if (screenfull.isFullscreen) {
        fullscreenToggleElement.classList.add('enabled');
      } else {
        fullscreenToggleElement.classList.remove('enabled');
      }
    });
  } else {
    document.body.classList.add('fullscreen-disabled');
  }

  // Mostrar lista de escenas en desktop
  if (!document.body.classList.contains('mobile')) {
    showSceneList();
  }

  // Configurar handlers para cambio de escena
  scenes.forEach(function(scene) {
    var el = document.querySelector('#sceneList .scene[data-id="' + scene.data.id + '"]');
    el.addEventListener('click', function() {
      switchScene(scene);
      if (document.body.classList.contains('mobile')) {
        hideSceneList();
      }
    });
  });

  // Configurar controles de vista
  setupViewControls();

  // Inicializar app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // Fallback de inicialización
  window.addEventListener('load', function() {
    if (!document.getElementById('sceneList').classList.contains('enabled')) {
      console.log('Fallback initialization');
      initApp();
    }
  });

  // Forzar ocultar pantalla de carga después de 5 segundos
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && !loadingScreen.classList.contains('hide')) {
      console.log('Force hiding loading screen');
      loadingScreen.classList.add('hide');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 5000);

  // Mostrar escena inicial después de un retraso
  setTimeout(() => {
    console.log('Switching to initial scene...');
    try {
      switchScene(scenes[0]);
      console.log('Scene switched successfully');
    } catch (error) {
      console.error('Error switching scene:', error);
    }

    console.log('Hiding loading screen...');
    hideLoadingScreen();
  }, 1500);

})();