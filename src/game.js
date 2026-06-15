const Game = (() => {
  let renderer, scene, camera;
  let clock;
  let paused = false;
  let currentMap = 'parklands';
  let running = false;

  function init() {
    // Renderer
    const canvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.setClearColor(0x87CEEB); // sky blue

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 30, 80);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);

    // Clock
    clock = new THREE.Clock();

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5e0, 1.0);
    sun.position.set(30, 60, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    // Sky gradient (simple colored background)
    renderer.setClearColor(0x87CEEB);

    // Build world
    World.buildParklands(scene);

    // Spawn NPCs
    NPC.init(scene, 'parklands');

    // Init player
    Player.init(camera, scene);

    // UI
    UI.showHUD();
    UI.updateMission(Missions.getCurrentMission());

    // Window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    running = true;
    loop();
  }

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    if (paused) return;

    const dt = Math.min(clock.getDelta(), 0.05);

    Player.update(dt);
    NPC.update(dt, Player.getPosition());
    UI.checkNearbyInteractables();

    renderer.render(scene, camera);
  }

  function switchMap(mapName) {
    currentMap = mapName;

    // Clear old world
    World.clear(scene);

    if (mapName === 'parklands') {
      renderer.setClearColor(0x87CEEB);
      scene.fog = new THREE.Fog(0x87CEEB, 30, 80);
      World.buildParklands(scene);
      NPC.init(scene, 'parklands');
      camera.position.set(12, 2.7, 5);
    }

    if (mapName === 'baghdad') {
      renderer.setClearColor(0xD4A853);
      scene.fog = new THREE.Fog(0xC8853A, 30, 80);
      World.buildBaghdad(scene);
      NPC.init(scene, 'baghdad');
      camera.position.set(5, 2.7, 25);
    }
  }

  function togglePause() {
    paused = !paused;
    if (paused) {
      UI.showPause();
      Player.unlock();
    } else {
      UI.hidePause();
      Player.requestLock();
    }
  }

  function resume() {
    paused = false;
    UI.hidePause();
    Player.requestLock();
  }

  function triggerVictory() {
    paused = true;
    UI.showVictory();
  }

  function start() {
    document.getElementById('title-screen').classList.add('hidden');
    init();
    Player.requestLock();
  }

  return { start, switchMap, togglePause, resume, triggerVictory };
})();

// Start button
document.getElementById('start-btn').addEventListener('click', () => {
  Game.start();
});
