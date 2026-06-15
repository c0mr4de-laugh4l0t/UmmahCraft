const NPC = (() => {
  let scene;
  const npcs = [];

  const DIALOGUES = {
    imam: [
      { speaker: 'Imam Abdurrahman', text: 'As-salamu alaykum, my child! I am preparing Friday\'s Khutbah about the Islamic Golden Age — but the wind has scattered my manuscript pages across the neighbourhood!' },
      { speaker: 'Imam Abdurrahman', text: 'If you find all three pages and bring them back, I will show you something truly extraordinary behind this mosque. Something that will change your life forever, insha\'Allah.' },
    ],
    imam_pages: [
      { speaker: 'Imam Abdurrahman', text: 'SubhanAllah! You found all my pages! JazakAllah khayran. These words are about the scholars of Baghdad — the greatest minds in human history.' },
      { speaker: 'Imam Abdurrahman', text: 'Now look — behind the mimbar. Do you see that portal? The Key of Wisdom has opened it. Step through, and you will walk the streets of Baghdad, 830 AD.' },
    ],
    elder: [
      { speaker: 'Elder Fatuma', text: 'Habari yako, mtoto! You look like a young person with purpose. The Imam needs your help — some pages from his book blew away in the morning wind.' },
      { speaker: 'Elder Fatuma', text: 'I saw one page fly past Sarit Centre. Go look there. Baraka tele!' },
    ],
    amira: [
      { speaker: 'Amira', text: 'Ugh, I\'m so bored of staying home. Did you say there\'s a seminar at the mosque? About the Golden Age? That sounds actually interesting.' },
      { speaker: 'Amira', text: 'I\'ll come! Just let me grab my hijab. Save me a spot!' },
    ],
    bilal: [
      { speaker: 'Bilal', text: 'Bro, you came from the mosque? I was just thinking I should go today. Al-Khwarizmi is literally the reason we have algebra — did you know that?' },
      { speaker: 'Bilal', text: 'I\'m coming right now. Let\'s go together!' },
    ],
    khwarizmi: [
      { speaker: 'Al-Khwarizmi', text: 'Ahlan wa sahlan! I am Muhammad ibn Musa al-Khwarizmi. You have travelled far to reach us here in Baghdad.' },
      { speaker: 'Al-Khwarizmi', text: 'This is the Bayt al-Hikma — the House of Wisdom. We are translating ALL the world\'s knowledge into Arabic. Medicine, mathematics, astronomy, philosophy.' },
      { speaker: 'Al-Khwarizmi', text: 'My scrolls were scattered by a desert wind. Please help me collect them — then we must defend this library from those who wish to destroy knowledge itself.' },
    ],
    guard: [
      { speaker: 'Library Guard', text: 'Halt! Identify yourself... You are a friend of Al-Khwarizmi? Then you are welcome in the House of Wisdom.' },
      { speaker: 'Library Guard', text: 'Be warned — raiders have been spotted at the eastern gate. Stay alert.' },
    ],
  };

  function makeNPCMesh(skinColor, clothColor) {
    const group = new THREE.Group();

    function box(w, h, d, color, y) {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshLambertMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = y;
      group.add(mesh);
      return mesh;
    }

    // Body parts (Minecraft-style cube character)
    box(0.5, 0.6, 0.25, clothColor, 1.0);  // body
    box(0.5, 0.5, 0.5,  skinColor,  1.65); // head
    box(0.2, 0.55, 0.2, clothColor, 1.0);  // left arm
    box(0.2, 0.55, 0.2, clothColor, 1.0);  // right arm
    box(0.22, 0.6, 0.22, clothColor, 0.4); // left leg
    box(0.22, 0.6, 0.22, clothColor, 0.4); // right leg

    group.children[2].position.x =  0.35;
    group.children[3].position.x = -0.35;
    group.children[4].position.x =  0.13;
    group.children[5].position.x = -0.13;

    return group;
  }

  function spawnNPC(id, x, y, z, skinColor, clothColor, dialogueKey) {
    const mesh = makeNPCMesh(skinColor, clothColor);
    mesh.position.set(x, y, z);
    mesh.userData = { id, dialogueKey, isNPC: true };
    scene.add(mesh);
    npcs.push({ id, mesh, dialogueKey, baseX: x, baseZ: z, angle: 0 });
    return mesh;
  }

  function init(sc, mapName) {
    scene = sc;
    npcs.length = 0;

    if (mapName === 'parklands') {
      // Imam — inside mosque
      spawnNPC('imam',  12, 1, -4,  0xD4A574, 0x2D5A27, 'imam');
      // Elder Fatuma — outside near road
      spawnNPC('elder', -8, 1,  12, 0xC8956C, 0x8B6914, 'elder');
      // Students
      spawnNPC('amira', 35, 1, -15, 0xD4A574, 0x3A6A8A, 'amira');
      spawnNPC('bilal', -25, 1, -8, 0xC08050, 0x4A3A6A, 'bilal');
    }

    if (mapName === 'baghdad') {
      spawnNPC('khwarizmi', 8, 1, 18,  0xC8956C, 0x3A5A8A, 'khwarizmi');
      spawnNPC('guard',     -2, 1, 12, 0xB07840, 0x5A3A1A, 'guard');
    }
  }

  function update(dt, playerPos) {
    npcs.forEach(npc => {
      // Gentle idle bobbing
      npc.angle += dt * 0.8;
      npc.mesh.position.y = 0 + Math.sin(npc.angle) * 0.05;

      // Face player
      const dx = playerPos.x - npc.mesh.position.x;
      const dz = playerPos.z - npc.mesh.position.z;
      npc.mesh.rotation.y = Math.atan2(dx, dz);
    });
  }

  function getNearbyNPC(playerPos, range = 3) {
    for (const npc of npcs) {
      const dx = playerPos.x - npc.mesh.position.x;
      const dz = playerPos.z - npc.mesh.position.z;
      if (Math.sqrt(dx*dx + dz*dz) < range) return npc;
    }
    return null;
  }

  function getDialogue(key) {
    return DIALOGUES[key] || [];
  }

  function getAllNPCs() { return npcs; }

  return { init, update, getNearbyNPC, getDialogue, getAllNPCs };
})();
