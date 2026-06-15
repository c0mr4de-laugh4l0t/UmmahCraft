const UI = (() => {
  let dialogueQueue = [];
  let currentDialogue = null;
  let dialogueStep = 0;
  let onDialogueDone = null;
  let interactCallback = null;

  function showHUD() {
    document.getElementById('hud').classList.remove('hidden');
  }

  function hideHUD() {
    document.getElementById('hud').classList.add('hidden');
  }

  function updateMission(text) {
    document.getElementById('mission-text').textContent = text;
  }

  function updateLocation(text) {
    document.getElementById('hud-location').textContent = text;
  }

  function updateInventory(items) {
    items.forEach((item, i) => {
      const slot = document.getElementById(`slot-${i}`);
      if (slot) slot.textContent = item.icon;
    });
  }

  function showInteractHint(show) {
    const hint = document.getElementById('interact-hint');
    if (show) hint.classList.remove('hidden');
    else hint.classList.add('hidden');
  }

  function startDialogue(lines, onDone) {
    currentDialogue = lines;
    dialogueStep = 0;
    onDialogueDone = onDone || null;
    showDialogueLine();
    Player.unlock();
  }

  function showDialogueLine() {
    if (!currentDialogue || dialogueStep >= currentDialogue.length) {
      endDialogue();
      return;
    }
    const line = currentDialogue[dialogueStep];
    document.getElementById('dialogue-speaker').textContent = line.speaker;
    document.getElementById('dialogue-text').textContent = line.text;
    document.getElementById('dialogue-box').classList.remove('hidden');
  }

  function triggerInteract() {
    // Advance dialogue if open
    if (!document.getElementById('dialogue-box').classList.contains('hidden')) {
      dialogueStep++;
      showDialogueLine();
      return;
    }

    // Check for nearby NPC
    const pos = Player.getPosition();
    const npc = NPC.getNearbyNPC(pos, 4);
    if (npc) {
      const dialogueKey = Missions.handleNPCInteract(npc.id);
      if (dialogueKey) {
        const lines = NPC.getDialogue(dialogueKey);
        startDialogue(lines, null);
      }
      return;
    }

    // Check for portal
    if (isNearPortal(pos)) {
      Missions.enterPortal();
      return;
    }
  }

  function isNearPortal(pos) {
    return (
      Math.abs(pos.x - 11) < 3 &&
      Math.abs(pos.z - (-14)) < 3
    ) || (
      Math.abs(pos.x - (-9)) < 3 &&
      Math.abs(pos.z - 31) < 3
    );
  }

  function endDialogue() {
    document.getElementById('dialogue-box').classList.add('hidden');
    currentDialogue = null;
    if (onDialogueDone) onDialogueDone();
    Player.requestLock();
  }

  function showVictory() {
    document.getElementById('victory-screen').classList.remove('hidden');
    Player.unlock();
  }

  function showPause() {
    document.getElementById('pause-menu').classList.remove('hidden');
  }

  function hidePause() {
    document.getElementById('pause-menu').classList.add('hidden');
  }

  function checkNearbyInteractables() {
    const pos = Player.getPosition();
    const npc = NPC.getNearbyNPC(pos, 4);
    showInteractHint(!!npc || isNearPortal(pos));
  }

  return {
    showHUD, hideHUD,
    updateMission, updateLocation, updateInventory,
    showInteractHint, triggerInteract,
    startDialogue, showVictory,
    showPause, hidePause,
    checkNearbyInteractables,
    isNearPortal,
  };
})();
