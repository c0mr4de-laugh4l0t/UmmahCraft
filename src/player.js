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
    border:none; border-radius:50%; z-index:50;
    font-family:'Courier New',monospace;
  `;
  interactBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    UI.triggerInteract();
  });
  document.body.appendChild(interactBtn);

  // Jump button
  const jumpBtn = document.createElement('button');
  jumpBtn.textContent = '↑';
  jumpBtn.style.cssText = `
    position:fixed; bottom:200px; right:130px;
    width:70px; height:70px;
    background:rgba(255,255,255,0.3);
    color:#fff; font-size:24px;
    border:2px solid rgba(255,255,255,0.4);
    border-radius:50%; z-index:50;
    font-family:'Courier New',monospace;
  `;
  jumpBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    keys['Space'] = true;
  });
  jumpBtn.addEventListener('touchend', e => {
    e.preventDefault();
    keys['Space'] = false;
  });
  document.body.appendChild(jumpBtn);

  // Joystick logic
  let joyActive = false;
  let joyStartX = 0, joyStartY = 0;
  let joyDX = 0, joyDZ = 0;

  joystickDiv.addEventListener('touchstart', e => {
    e.preventDefault();
    joyActive = true;
    const t = e.touches[0];
    const rect = joystickDiv.getBoundingClientRect();
    joyStartX = rect.left + rect.width / 2;
    joyStartY = rect.top + rect.height / 2;
  });

  joystickDiv.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!joyActive) return;
    const t = e.touches[0];
    const dx = t.clientX - joyStartX;
    const dy = t.clientY - joyStartY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const maxDist = 40;
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * clampedDist;
    const ny = Math.sin(angle) * clampedDist;
    knob.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
    joyDX = nx / maxDist;
    joyDZ = ny / maxDist;
    // Map joystick to keys
    keys['KeyW'] = joyDZ < -0.3;
    keys['KeyS'] = joyDZ >  0.3;
    keys['KeyA'] = joyDX < -0.3;
    keys['KeyD'] = joyDX >  0.3;
  });

  joystickDiv.addEventListener('touchend', e => {
    e.preventDefault();
    joyActive = false;
    joyDX = 0; joyDZ = 0;
    knob.style.transform = 'translate(-50%, -50%)';
    keys['KeyW'] = false;
    keys['KeyS'] = false;
    keys['KeyA'] = false;
    keys['KeyD'] = false;
  });

  // Look/camera drag on right side
  let lookLastX = 0, lookLastY = 0;
  lookDiv.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    lookLastX = t.clientX;
    lookLastY = t.clientY;
  });

  lookDiv.addEventListener('touchmove', e => {
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - lookLastX;
    const dy = t.clientY - lookLastY;
    yaw   -= dx * 0.005;
    pitch -= dy * 0.005;
    pitch  = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, pitch));
    lookLastX = t.clientX;
    lookLastY = t.clientY;
  });
}

// Auto-init mobile controls on touch devices
if ('ontouchstart' in window) {
  window.addEventListener('load', initMobileControls);
}
