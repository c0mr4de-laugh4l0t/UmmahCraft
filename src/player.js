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
    camera.position.set(12, HEIGHT + 1, 5);

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
    if (!isLocked) return;

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

    // Floor safety
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
    const px = camera.position.x;
    const py = camera.position.y;
    const pz = camera.position.z;
    return World.hasBlock(Math.round(px), Math.round(py - HEIGHT - 0.1), Math.round(pz));
  }

  function collidesAbove() {
    const px = camera.position.x;
    const py = camera.position.y;
    const pz = camera.position.z;
    return World.hasBlock(Math.round(px), Math.round(py + 0.1), Math.round(pz));
  }

  function getPosition() { return camera.position.clone(); }
  function getLookDir() {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    return dir;
  }
  function unlock() { document.exitPointerLock(); }

  return { init, update, requestLock, getPosition, getLookDir, unlock };
})();
