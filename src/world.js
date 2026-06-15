const World = (() => {
  let scene;
  const blocks = new Map();
  const BLOCK_SIZE = 1;

  function key(x, y, z) { return `${x},${y},${z}`; }

  function placeBlock(x, y, z, type) {
    const geo = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const mat = Textures.getMaterial(type);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.userData = { type, x, y, z };
    scene.add(mesh);
    blocks.set(key(x, y, z), mesh);
    return mesh;
  }

  function placeColumn(x, z, fromY, toY, type) {
    for (let y = fromY; y <= toY; y++) placeBlock(x, y, z, type);
  }

  function placePlatform(x1, z1, x2, z2, y, type) {
    for (let x = x1; x <= x2; x++)
      for (let z = z1; z <= z2; z++)
        placeBlock(x, y, z, type);
  }

  function placeWall(x1, z, x2, fromY, toY, type) {
    for (let x = x1; x <= x2; x++)
      for (let y = fromY; y <= toY; y++)
        placeBlock(x, y, z, type);
  }

  function placeWallZ(x, z1, z2, fromY, toY, type) {
    for (let z = z1; z <= z2; z++)
      for (let y = fromY; y <= toY; y++)
        placeBlock(x, y, z, type);
  }

  function buildTree(x, z) {
    placeColumn(x, z, 1, 4, 'wood');
    for (let dx = -2; dx <= 2; dx++)
      for (let dz = -2; dz <= 2; dz++)
        for (let dy = 3; dy <= 6; dy++)
          if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy-4) < 5)
            placeBlock(x+dx, dy, z+dz, 'leaves');
  }

  function buildMosque(ox, oz) {
    // Ground floor
    placePlatform(ox, oz, ox+16, oz+14, 0, 'mosque');
    // Walls
    placeWall(ox, oz, ox+16, 1, 6, 'mosque');
    placeWall(ox, oz+14, ox+16, 1, 6, 'mosque');
    placeWallZ(ox, oz, oz+14, 1, 6, 'mosque');
    placeWallZ(ox+16, oz, oz+14, 1, 6, 'mosque');
    // Roof
    placePlatform(ox, oz, ox+16, oz+14, 7, 'mosque');
    // Dome base
    placePlatform(ox+5, oz+4, ox+11, oz+10, 8, 'dome');
    placePlatform(ox+6, oz+3, ox+10, oz+11, 8, 'dome');
    placeColumn(ox+8, oz+7, 8, 13, 'dome');
    placePlatform(ox+6, oz+5, ox+10, oz+9, 9, 'dome');
    placePlatform(ox+7, oz+5, ox+9, oz+9, 10, 'dome');
    placePlatform(ox+7, oz+6, ox+9, oz+8, 11, 'dome');
    // Minarets
    placeColumn(ox, oz, 1, 12, 'mosque');
    placeColumn(ox+16, oz, 1, 12, 'mosque');
    placeColumn(ox, oz+14, 1, 12, 'mosque');
    placeColumn(ox+16, oz+14, 1, 12, 'mosque');
    // Door opening (leave gaps in front wall)
    // Windows (glass)
    placeBlock(ox+4, 3, oz, 'glass');
    placeBlock(ox+8, 3, oz, 'glass');
    placeBlock(ox+12, 3, oz, 'glass');
    placeBlock(ox+4, 4, oz, 'glass');
    placeBlock(ox+8, 4, oz, 'glass');
    placeBlock(ox+12, 4, oz, 'glass');
  }

  function buildSaritCentre(ox, oz) {
    // Multi-story mall — 20x20 footprint, 8 floors
    placePlatform(ox, oz, ox+20, oz+20, 0, 'sidewalk');
    for (let floor = 0; floor < 8; floor++) {
      const y = floor * 4 + 1;
      placeWall(ox, oz, ox+20, y, y+3, 'sarit');
      placeWall(ox, oz+20, ox+20, y, y+3, 'sarit');
      placeWallZ(ox, oz, oz+20, y, y+3, 'sarit');
      placeWallZ(ox+20, oz, oz+20, y, y+3, 'sarit');
      placePlatform(ox, oz, ox+20, oz+20, y+3, 'sarit');
      // Glass windows on each floor
      for (let x = ox+2; x <= ox+18; x += 3) {
        placeBlock(x, y+1, oz, 'glass');
        placeBlock(x, y+2, oz, 'glass');
        placeBlock(x, y+1, oz+20, 'glass');
        placeBlock(x, y+2, oz+20, 'glass');
      }
    }
    // Rooftop
    placePlatform(ox, oz, ox+20, oz+20, 33, 'sarit');
  }

  function buildHouse(ox, oz, wallType='stone') {
    placePlatform(ox, oz, ox+6, oz+6, 0, wallType);
    placeWall(ox, oz, ox+6, 1, 4, wallType);
    placeWall(ox, oz+6, ox+6, 1, 4, wallType);
    placeWallZ(ox, oz, oz+6, 1, 4, wallType);
    placeWallZ(ox+6, oz, oz+6, 1, 4, wallType);
    placePlatform(ox, oz, ox+6, oz+6, 5, wallType);
    // Door gap
    placeBlock(ox+3, 1, oz, 'dirt');
    placeBlock(ox+3, 2, oz, 'dirt');
    // Windows
    placeBlock(ox+1, 3, oz, 'glass');
    placeBlock(ox+5, 3, oz, 'glass');
  }

  function buildRoad(x1, z, x2, y=0) {
    for (let x = x1; x <= x2; x++) {
      placeBlock(x, y, z, 'road');
      placeBlock(x, y, z+1, 'roadplain');
      placeBlock(x, y, z+2, 'roadplain');
      placeBlock(x, y, z+3, 'road');
    }
  }

  function buildRoadZ(x, z1, z2, y=0) {
    for (let z = z1; z <= z2; z++) {
      placeBlock(x, y, z, 'road');
      placeBlock(x+1, y, z, 'roadplain');
      placeBlock(x+2, y, z, 'roadplain');
      placeBlock(x+3, y, z, 'road');
    }
  }

  function buildPortal(x, y, z) {
    // Obsidian-style portal frame
    for (let dy = 0; dy <= 4; dy++) {
      placeBlock(x, y+dy, z, 'portal');
      placeBlock(x+2, y+dy, z, 'portal');
    }
    for (let dx = 0; dx <= 2; dx++) {
      placeBlock(x+dx, y, z, 'portal');
      placeBlock(x+dx, y+4, z, 'portal');
    }
    // Portal fill
    placeBlock(x+1, y+1, z, 'portal');
    placeBlock(x+1, y+2, z, 'portal');
    placeBlock(x+1, y+3, z, 'portal');
  }

  // ── PARKLANDS MAP ──────────────────────────────────────────────
  function buildParklands(sc) {
    scene = sc;

    // Ground
    placePlatform(-60, -60, 80, 80, -1, 'grass');
    placePlatform(-60, -60, 80, 80, 0, 'grass');

    // Main road (Limuru Road) — runs Z axis
    buildRoadZ(-2, -50, 60, 0);

    // 3rd Parklands Ave — runs X axis
    buildRoad(-50, 10, 70, 0);

    // Mosque (center of map)
    buildMosque(4, -10);

    // Mosque compound (sidewalk around)
    placePlatform(2, -12, 22, 6, 0, 'sidewalk');

    // Portal behind mosque
    buildPortal(10, 1, -14);

    // Trees around mosque compound
    buildTree(-5, -5);
    buildTree(-5, 5);
    buildTree(25, -5);
    buildTree(25, 5);
    buildTree(0, -20);
    buildTree(22, -20);

    // Sarit Centre (north of mosque)
    buildSaritCentre(30, 20);

    // Houses — Parklands neighborhood
    buildHouse(-20, -20, 'mosque');
    buildHouse(-20, -5, 'stone');
    buildHouse(-20, 15, 'mosque');
    buildHouse(-30, -20, 'stone');
    buildHouse(-30, 0, 'mosque');
    buildHouse(30, -20, 'stone');
    buildHouse(40, -20, 'mosque');
    buildHouse(30, -35, 'stone');
    buildHouse(40, -35, 'stone');

    // Street trees
    buildTree(-10, 14);
    buildTree(5, 14);
    buildTree(20, 14);
    buildTree(-10, -15);
    buildTree(5, -25);

    // Sidewalks along roads
    placePlatform(-50, 7, 70, 9, 0, 'sidewalk');
    placePlatform(-50, 15, 70, 17, 0, 'sidewalk');
    placePlatform(-5, -50, -1, 60, 0, 'sidewalk');
    placePlatform(5, -50, 8, 60, 0, 'sidewalk');

    // Lighting pillars
    for (let z = -40; z <= 60; z += 15) {
      placeColumn(-6, z, 1, 5, 'stone');
      placeColumn(9, z, 1, 5, 'stone');
    }
  }

  // ── BAGHDAD MAP ────────────────────────────────────────────────
  function buildBaghdad(sc) {
    scene = sc;

    // Desert ground
    placePlatform(-60, -60, 80, 80, -1, 'sand');
    placePlatform(-60, -60, 80, 80, 0, 'sand');

    // House of Wisdom — grand structure
    buildHouseOfWisdom(0, 0);

    // Baghdad streets (sandstone)
    for (let x = -40; x <= 60; x++)
      placeBlock(x, 0, 10, 'baghdad');
    for (let z = -40; z <= 60; z++)
      placeBlock(10, 0, z, 'baghdad');

    // Return portal
    buildPortal(-10, 1, 30);

    // Palm trees
    buildPalmTree(20, 20);
    buildPalmTree(-15, 15);
    buildPalmTree(35, -10);
    buildPalmTree(-10, -20);
    buildPalmTree(40, 25);
  }

  function buildHouseOfWisdom(ox, oz) {
    // Grand library building
    placePlatform(ox-2, oz-2, ox+24, oz+24, 0, 'how');
    placeWall(ox, oz, ox+22, 1, 8, 'how');
    placeWall(ox, oz+22, ox+22, 1, 8, 'how');
    placeWallZ(ox, oz, oz+22, 1, 8, 'how');
    placeWallZ(ox+22, oz, oz+22, 1, 8, 'how');
    placePlatform(ox, oz, ox+22, oz+22, 9, 'how');
    // Golden dome
    placePlatform(ox+7, oz+7, ox+15, oz+15, 10, 'dome');
    placePlatform(ox+8, oz+6, ox+14, oz+16, 10, 'dome');
    placePlatform(ox+9, oz+9, ox+13, oz+13, 11, 'dome');
    placeColumn(ox+11, oz+11, 10, 16, 'dome');
    // Arched windows
    for (let x = ox+3; x <= ox+19; x += 4) {
      placeBlock(x, 3, oz, 'glass');
      placeBlock(x, 4, oz, 'glass');
      placeBlock(x, 5, oz, 'glass');
    }
    // Columns outside
    placeColumn(ox-1, oz-1, 1, 7, 'baghdad');
    placeColumn(ox+23, oz-1, 1, 7, 'baghdad');
    placeColumn(ox-1, oz+23, 1, 7, 'baghdad');
    placeColumn(ox+23, oz+23, 1, 7, 'baghdad');
  }

  function buildPalmTree(x, z) {
    placeColumn(x, z, 1, 7, 'wood');
    for (let dx = -3; dx <= 3; dx++)
      for (let dz = -3; dz <= 3; dz++)
        if (Math.abs(dx) + Math.abs(dz) <= 3)
          placeBlock(x+dx, 8, z+dz, 'leaves');
  }

  function getBlock(x, y, z) {
    return blocks.get(key(x, y, z)) || null;
  }

  function hasBlock(x, y, z) {
    return blocks.has(key(Math.round(x), Math.round(y), Math.round(z)));
  }

  function getAllMeshes() {
    return Array.from(blocks.values());
  }

  function clear(sc) {
    blocks.forEach(mesh => sc.remove(mesh));
    blocks.clear();
  }

  return {
    buildParklands,
    buildBaghdad,
    getBlock,
    hasBlock,
    getAllMeshes,
    clear,
    placeBlock,
  };
})();
