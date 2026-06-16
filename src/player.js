const Player = (() => {
  let camera, scene;
  let yaw = 0, pitch = 0;
  let vx = 0, vy = 0, vz = 0;
  let onGround = false;
  let isLocked = false;

  const SPEED = 8;
  const JUMP = 6;
  const GRAVITY = -20;
  const HEIGHT = 1.7;
  const RADIUS = 0.3;

  const keys = {};

  function init(cam, sc) {
    camera = cam;
    scene = sc;
    camera.position.set(20, 2.7, -2);

    document.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (e.code === 'Space' && onGround) {
        vy = JUMP;
        onGround = false;
      }
      if (e.code === 'Escape') Game.togglePause();
      if (e.code === 'KeyE') UI.triggerInteract();
    });
    document.addEventListener('keyup', e => { keys[e.code] = false; });

    document.addEventListener('mousemove', e => {
      if (!isLocked) return;
      yaw   -= e.movementX * 0.002;
      pitch -= e.movementY * 0.002;
      pitch  = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, pitch));
    });

    document.addEventListener('pointerlockchange', () => {
      isLocked = document.pointerLockElement === document.getElementById('game-canvas');
    });
  }

  function requestLock() {
    document.getElementById('game-canvas').requestPointerLock();
  }

  function update(dt) {
    // On mobile skip pointer lock check
    if (!isLocked && !('ontouchstart' in window)) return;

    // Rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    // Movement direction
    const forward = new THREE.Vector3(
      -Math.sin(yaw), 0, -Math.cos(yaw)
    );
    const right = new THREE.Vector3(
      Math.cos(yaw), 0, -Math.sin(yaw)
    );

    let mx = 0, mz = 0;
    if (keys['KeyW']) { mx += forward.x; mz += forward.z; }
    if (keys['KeyS']) { mx -= forward.x; mz -= forward.z; }
    if (keys['KeyA']) { mx -= right.x;   mz -= right.z;   }
    if (keys['KeyD']) { mx += right.x;   mz += right.z;   }

    const len = Math.sqrt(mx*mx + mz*mz);
    if (len > 0) { mx /= len; mz /= len; }

    vx = mx * SPEED;
    vz = mz * SPEED;

    // Gravity
    vy += GRAVITY * dt;

    // Move & collide X
    camera.position.x += vx * dt;
    if (collidesHorizontal()) camera.position.x -= vx * dt;

    // Move & collide Z
    camera.position.z += vz * dt;
    if (collidesHorizontal()) camera.position.z -= vz * dt;

    // Move & collide Y
    camera.position.y += vy * dt;
    if (vy < 0 && collidesBelow()) {
      camera.position.y = Math.ceil(camera.position.y - HEIGHT) + HEIGHT;
      vy = 0;
      onGround = true;
    } else if (vy > 0 && collidesAbove()) {
      vy = 0;
    } else {
      onGround = false;
    }

    // Floor safety net
    if (camera.position.y < HEIGHT) {
      camera.position.y = HEIGHT;
      vy = 0;
      onGround = true;
    }
  }

  function collidesHorizontal() {
    const px = camera.position.x;
    const py = camera.position.y;
    const pz = camera.position.z;
    for (let dx = -RADIUS; dx <= RADIUS; dx += RADIUS) {
      for (let dz = -RADIUS; dz <= RADIUS; dz += RADIUS) {
        for (let dy = 0; dy <= HEIGHT; dy += 0.5) {
          if (World.hasBlock(
            Math.round(px + dx),
            Math.round(py - dy),
            Math.round(pz + dz)
          )) return true;
        }
      }
    }
    return false;
  }

  function collidesBelow() {
    return World.hasBlock(
      Math.round(camera.position.x),
      Math.round(camera.position.y - HEIGHT - 0.1),
      Math.round(camera.position.z)
    );
  }

  function collidesAbove() {
    return World.hasBlock(
      Math.round(camera.position.x),
      Math.round(camera.position.y + 0.1),
      Math.round(camera.position.z)
    );
  }

  function getPosition() { return camera.position.clone(); }
  function getLookDir() {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    return dir;
  }
  function unlock() { document.exitPointerLock(); }

  // ── MOBILE TOUCH CONTROLS ──────────────────────────────────────
  function initMobileControls() {
    const joystickDiv = document.createElement('div');
    joystickDiv.id = 'joystick-zone';
    joystickDiv.style.cssText = `
      position:fixed; bottom:120px; left:30px;
      width:120px; height:120px;
      background:rgba(255,255,255,0.1);
      border:2px solid rgba(255,255,255,0.3);
      border-radius:50%; z-index:50; touch-action:none;
    `;
    const knob = document.createElement('div');
    knob.style.cssText = `
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%);
      width:50px; height:50px;
      background:rgba(255,255,255,0.4);
      border-radius:50%;
    `;
    joystickDiv.appendChild(knob);
    document.body.appendChild(joystickDiv);

    // Look zone — right side of screen
    const lookDiv = document.createElement('div');
    lookDiv.id = 'look-zone';
    lookDiv.style.cssText = `
      position:fixed; top:0; right:0;
      width:50%; height:70%;
      z-index:50; touch-action:none;
    `;
    document.body.appendChild(lookDiv);

    // Interact button
    const interactBtn = document.createElement('button');
    interactBtn.textContent = 'E';
    interactBtn.style.cssText = `
      position:fixed; bottom:200px; right:40px;
      width:70px; height:70px;
      background:rgba(201,162,39,0.8);
      color:#000; font-size:24px; font-weight:700;
      border:none;
})();
