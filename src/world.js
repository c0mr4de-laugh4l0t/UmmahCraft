const World = (() => {
  let scene;
  const blocks = new Map();

  function key(x, y, z) { return `${x},${y},${z}`; }

  function placeBlock(x, y, z, type) {
    if (blocks.has(key(x, y, z))) return;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = Textures.getMaterial(type);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { type, x, y, z };
    scene.add(mesh);
    blocks.set(key(x, y, z), mesh);
    return mesh;
  }

  function placePlatform(x1, z1, x2, z2, y, type) {
    for (let x = x1; x <= x2; x++)
      for (let z = z1; z <= z2; z++)
        placeBlock(x, y, z, type);
  }

  function placeWallX(x1, x2, z, y1, y2, type) {
    for (let x = x1; x <= x2; x++)
      for (let y = y1; y <= y2; y++)
        placeBlock(x, y, z, type);
  }

  function placeWallZ(x, z1, z2, y1, y2, type) {
    for (let z = z1; z <= z2; z++)
      for (let y = y1; y <= y2; y++)
        placeBlock(x, y, z, type);
  }

  function placeColumn(x, z, y1, y2, type) {
    for (let y = y1; y <= y2; y++) placeBlock(x, y, z, type);
  }

  // ── ROAD BUILDERS ──────────────────────────────────────────────

  // Road running along X axis (East-West)
  function roadEW(x1, x2, z, y = 0) {
    for (let x = x1; x <= x2; x++) {
      placeBlock(x, y, z,   'road');
      placeBlock(x, y, z+1, 'roadplain');
      placeBlock(x, y, z+2, 'roadplain');
      placeBlock(x, y, z+3, 'roadplain');
      placeBlock(x, y, z+4, 'road');
      // Pavements either side
      placeBlock(x, y, z-1, 'sidewalk');
      placeBlock(x, y, z+5, 'sidewalk');
    }
  }

  // Road running along Z axis (North-South)
  function roadNS(z1, z2, x, y = 0) {
    for (let z = z1; z <= z2; z++) {
      placeBlock(x,   y, z, 'road');
      placeBlock(x+1, y, z, 'roadplain');
      placeBlock(x+2, y, z, 'roadplain');
      placeBlock(x+3, y, z, 'roadplain');
      placeBlock(x+4, y, z, 'road');
      // Pavements
      placeBlock(x-1, y, z, 'sidewalk');
      placeBlock(x+5, y, z, 'sidewalk');
    }
  }

  function buildTree(x, z) {
    placeColumn(x, z, 1, 4, 'wood');
    for (let dx = -2; dx <= 2; dx++)
      for (let dz = -2; dz <= 2; dz++)
        for (let dy = 3; dy <= 6; dy++)
          if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy - 4) < 5)
            placeBlock(x+dx, dy, z+dz, 'leaves');
  }

  function buildStreetLamp(x, z) {
    placeColumn(x, z, 1, 5, 'stone');
    placeBlock(x, 6, z, 'glass');
    placeBlock(x+1, 5, z, 'stone');
    placeBlock(x+1, 6, z, 'glass');
  }

  // ── PARKLANDS MOSQUE ───────────────────────────────────────────
  // Real: 4 floors, mashrabiya geometric screens, arched ground
  // floor openings, gold dome, two minarets, 3rd Parklands Ave
  function buildParklandsMosque(ox, oz) {
    // Ground floor footprint — 20 wide x 16 deep
    placePlatform(ox, oz, ox+20, oz+16, 0, 'sidewalk');

    // FLOOR 1 — arched ground floor (open feel)
    placeWallX(ox, ox+20, oz,    1, 4, 'mosque');
    placeWallX(ox, ox+20, oz+16, 1, 4, 'mosque');
    placeWallZ(ox,    oz, oz+16, 1, 4, 'mosque');
    placeWallZ(ox+20, oz, oz+16, 1, 4, 'mosque');
    // Arch openings on front face (south wall)
    // Leave gaps at x+4, x+8, x+12, x+16 for arches
    for (let ax of [ox+4, ox+8, ox+12, ox+16]) {
      placeBlock(ax,   1, oz, 'glass');
      placeBlock(ax,   2, oz, 'glass');
      placeBlock(ax,   3, oz, 'glass');
      placeBlock(ax+1, 1, oz, 'glass');
      placeBlock(ax+1, 2, oz, 'glass');
      placeBlock(ax+1, 3, oz, 'glass');
    }
    // Ceiling of floor 1
    placePlatform(ox, oz, ox+20, oz+16, 5, 'mosque');

    // FLOOR 2
    placeWallX(ox, ox+20, oz,    6, 9, 'mosque');
    placeWallX(ox, ox+20, oz+16, 6, 9, 'mosque');
    placeWallZ(ox,    oz, oz+16, 6, 9, 'mosque');
    placeWallZ(ox+20, oz, oz+16, 6, 9, 'mosque');
    // Mashrabiya screens — geometric pattern on floor 2
    for (let x = ox+2; x <= ox+18; x += 2) {
      placeBlock(x, 7, oz, 'glass');
      placeBlock(x, 8, oz, 'glass');
    }
    placePlatform(ox, oz, ox+20, oz+16, 10, 'mosque');

    // FLOOR 3
    placeWallX(ox, ox+20, oz,    11, 14, 'mosque');
    placeWallX(ox, ox+20, oz+16, 11, 14, 'mosque');
    placeWallZ(ox,    oz, oz+16, 11, 14, 'mosque');
    placeWallZ(ox+20, oz, oz+16, 11, 14, 'mosque');
    for (let x = ox+2; x <= ox+18; x += 2) {
      placeBlock(x, 12, oz, 'glass');
      placeBlock(x, 13, oz, 'glass');
    }
    placePlatform(ox, oz, ox+20, oz+16, 15, 'mosque');

    // FLOOR 4
    placeWallX(ox, ox+20, oz,    16, 19, 'mosque');
    placeWallX(ox, ox+20, oz+16, 16, 19, 'mosque');
    placeWallZ(ox,    oz, oz+16, 16, 19, 'mosque');
    placeWallZ(ox+20, oz, oz+16, 16, 19, 'mosque');
    placePlatform(ox, oz, ox+20, oz+16, 20, 'mosque');

    // CENTRAL DOME — gold, rises above floor 4
    placePlatform(ox+7,  oz+5,  ox+13, oz+11, 21, 'dome');
    placePlatform(ox+8,  oz+4,  ox+12, oz+12, 21, 'dome');
    placePlatform(ox+8,  oz+5,  ox+12, oz+11, 22, 'dome');
    placePlatform(ox+9,  oz+6,  ox+11, oz+10, 23, 'dome');
    placePlatform(ox+9,  oz+6,  ox+11, oz+10, 24, 'dome');
    placeColumn(ox+10, oz+8, 21, 27, 'dome');
    // Dome finial
    placeBlock(ox+10, 28, oz+8, 'dome');

    // TWO MINARETS — tall slender towers at front corners
    placeColumn(ox,    oz,    1, 30, 'mosque');
    placeColumn(ox+1,  oz,    1, 30, 'mosque');
    placeColumn(ox+20, oz,    1, 30, 'mosque');
    placeColumn(ox+19, oz,    1, 30, 'mosque');
    // Minaret tops
    placeBlock(ox,    31, oz,    'dome');
    placeBlock(ox+1,  31, oz,    'dome');
    placeBlock(ox+20, 31, oz,    'dome');
    placeBlock(ox+19, 31, oz,    'dome');
    placeBlock(ox,    32, oz,    'dome');
    placeBlock(ox+20, 32, oz,    'dome');

    // Compound wall around mosque
    placeWallX(ox-3, ox+23, oz-3,  1, 2, 'mosque');
    placeWallX(ox-3, ox+23, oz+19, 1, 2, 'mosque');
    placeWallZ(ox-3, oz-3, oz+19,  1, 2, 'mosque');
    placeWallZ(ox+23, oz-3, oz+19, 1, 2, 'mosque');

    // Compound ground
    placePlatform(ox-3, oz-3, ox+23, oz+19, 0, 'sidewalk');

    // Trees in compound
    buildTree(ox-2, oz+5);
    buildTree(ox-2, oz+11);
    buildTree(ox+22, oz+5);
    buildTree(ox+22, oz+11);

    // Street lamps at gate
    buildStreetLamp(ox+8,  oz-4);
    buildStreetLamp(ox+12, oz-4);

    // Sign label blocks above gate
    placeBlock(ox+9,  3, oz-3, 'dome');
    placeBlock(ox+10, 3, oz-3, 'dome');
    placeBlock(ox+11, 3, oz-3, 'dome');
  }

  // ── MP SHAH HOSPITAL ───────────────────────────────────────────
  // Large white/cream building, 3rd Parklands Ave, east of mosque
  function buildMPShah(ox, oz) {
    placePlatform(ox, oz, ox+18, oz+14, 0, 'sidewalk');
    // Main block — 5 floors
    for (let floor = 0; floor < 5; floor++) {
      const y1 = floor * 4 + 1;
      const y2 = y1 + 3;
      placeWallX(ox, ox+18, oz,    y1, y2, 'mosqueWall');
      placeWallX(ox, ox+18, oz+14, y1, y2, 'mosqueWall');
      placeWallZ(ox,    oz, oz+14, y1, y2, 'mosqueWall');
      placeWallZ(ox+18, oz, oz+14, y1, y2, 'mosqueWall');
      placePlatform(ox, oz, ox+18, oz+14, y2, 'mosqueWall');
      // Windows each floor
      for (let x = ox+2; x <= ox+16; x += 3) {
        placeBlock(x,   y1+1, oz, 'glass');
        placeBlock(x+1, y1+1, oz, 'glass');
      }
    }
    // Rooftop water tower
    placeColumn(ox+8, oz+6, 22, 25, 'stone');
    placeColumn(ox+9, oz+6, 22, 25, 'stone');
    placeColumn(ox+8, oz+7, 22, 25, 'stone');
    placeColumn(ox+9, oz+7, 22, 25, 'stone');
    // Red cross sign on front
    placeBlock(ox+9,  10, oz, 'glass');
    placeBlock(ox+9,  11, oz, 'glass');
    placeBlock(ox+8,  11, oz, 'glass');
    placeBlock(ox+10, 11, oz, 'glass');
    placeBlock(ox+9,  12, oz, 'glass');
    // Trees in front
    buildTree(ox-2, oz+3);
    buildTree(ox-2, oz+10);
    buildTree(ox+20, oz+3);
  }

  // ── SARIT CENTRE ───────────────────────────────────────────────
  // Kenya's first mall, Peponi Road junction, 6 floors, huge
  function buildSaritCentre(ox, oz) {
    // Giant footprint — 30 wide x 25 deep
    placePlatform(ox-2, oz-2, ox+32, oz+27, 0, 'sidewalk');

    for (let floor = 0; floor < 6; floor++) {
      const y1 = floor * 4 + 1;
      const y2 = y1 + 3;
      placeWallX(ox, ox+30, oz,    y1, y2, 'sarit');
      placeWallX(ox, ox+30, oz+25, y1, y2, 'sarit');
      placeWallZ(ox,    oz, oz+25, y1, y2, 'sarit');
      placeWallZ(ox+30, oz, oz+25, y1, y2, 'sarit');
      placePlatform(ox, oz, ox+30, oz+25, y2, 'sarit');
      // Large glass windows — Sarit's signature look
      for (let x = ox+2; x <= ox+28; x += 4) {
        placeBlock(x,   y1+1, oz, 'glass');
        placeBlock(x+1, y1+1, oz, 'glass');
        placeBlock(x+2, y1+1, oz, 'glass');
        placeBlock(x,   y1+2, oz, 'glass');
        placeBlock(x+1, y1+2, oz, 'glass');
        placeBlock(x+2, y1+2, oz, 'glass');
      }
      // Back windows
      for (let x = ox+2; x <= ox+28; x += 4) {
        placeBlock(x,   y1+1, oz+25, 'glass');
        placeBlock(x+1, y1+1, oz+25, 'glass');
      }
    }

    // Rooftop — flat roof with AC units (stone blocks)
    for (let x = ox+3; x <= ox+27; x += 6)
      placeBlock(x, 25, oz+5, 'stone');

    // Sarit signage — distinctive blocks at top front
    for (let x = ox+10; x <= ox+20; x++)
      placeBlock(x, 26, oz, 'dome');

    // Car park ramps either side
    placePlatform(ox+32, oz, ox+38, oz+10, 0, 'road');
    placePlatform(ox+32, oz, ox+38, oz+10, 1, 'roadplain');

    // Street trees along front
    for (let x = ox; x <= ox+28; x += 7)
      buildTree(x, oz-4);

    // Street lamps
    buildStreetLamp(ox+5,  oz-5);
    buildStreetLamp(ox+15, oz-5);
    buildStreetLamp(ox+25, oz-5);

    // Matatu stage area
    placePlatform(ox-5, oz, ox-2, oz+8, 0, 'road');
  }

  // ── THE PROMENADE ──────────────────────────────────────────────
  // 6-floor mixed use, General Mathenge Drive
  function buildPromenade(ox, oz) {
    placePlatform(ox, oz, ox+14, oz+10, 0, 'sidewalk');

    for (let floor = 0; floor < 6; floor++) {
      const y1 = floor * 4 + 1;
      const y2 = y1 + 3;
      placeWallX(ox, ox+14, oz,    y1, y2, 'sarit');
      placeWallX(ox, ox+14, oz+10, y1, y2, 'sarit');
      placeWallZ(ox,    oz, oz+10, y1, y2, 'sarit');
      placeWallZ(ox+14, oz, oz+10, y1, y2, 'sarit');
      placePlatform(ox, oz, ox+14, oz+10, y2, 'sarit');
      // Full glass facade — modern office look
      for (let x = ox+1; x <= ox+13; x++) {
        placeBlock(x, y1+1, oz, 'glass');
        placeBlock(x, y1+2, oz, 'glass');
      }
      // Balconies
      if (floor > 0) {
        for (let x = ox+2; x <= ox+12; x += 3)
          placeBlock(x, y1, oz-1, 'stone');
      }
    }
    buildStreetLamp(ox-1, oz+5);
    buildStreetLamp(ox+15, oz+5);
  }

  // ── MARWA HEIGHTS ──────────────────────────────────────────────
  // 3 residential towers, General Mathenge Drive
  // Contemporary high-rise apartments with green space between
  function buildMarwaHeights(ox, oz) {
    // Green space between towers
    placePlatform(ox-2, oz-2, ox+42, oz+22, 0, 'grass');
    // Perimeter sidewalk
    placePlatform(ox-2, oz-2, ox+42, oz-1, 0, 'sidewalk');

    // 3 towers — 12 floors each
    const towerPositions = [
      [ox, oz], [ox+16, oz], [ox+32, oz]
    ];

    towerPositions.forEach(([tx, tz]) => {
      // Foundation
      placePlatform(tx, tz, tx+10, tz+18, 0, 'sidewalk');

      for (let floor = 0; floor < 12; floor++) {
        const y1 = floor * 3 + 1;
        const y2 = y1 + 2;
        placeWallX(tx, tx+10, tz,    y1, y2, 'sarit');
        placeWallX(tx, tx+10, tz+18, y1, y2, 'sarit');
        placeWallZ(tx,    tz, tz+18, y1, y2, 'sarit');
        placeWallZ(tx+10, tz, tz+18, y1, y2, 'sarit');
        placePlatform(tx, tz, tx+10, tz+18, y2, 'sarit');
        // Windows every floor
        for (let x = tx+1; x <= tx+9; x += 2) {
          placeBlock(x, y1+1, tz,    'glass');
          placeBlock(x, y1+1, tz+18, 'glass');
        }
        for (let z = tz+2; z <= tz+16; z += 3) {
          placeBlock(tx,    y1+1, z, 'glass');
          placeBlock(tx+10, y1+1, z, 'glass');
        }
      }
      // Rooftop water tank
      placeColumn(tx+4, tz+8, 37, 39, 'stone');
      placeColumn(tx+5, tz+8, 37, 39, 'stone');
      placeColumn(tx+4, tz+9, 37, 39, 'stone');
      placeColumn(tx+5, tz+9, 37, 39, 'stone');
    });

    // Trees between towers
    buildTree(ox+13, oz+8);
    buildTree(ox+29, oz+8);

    // Gate and security booth at entrance
    placeBlock(ox+18, 1, oz-3, 'stone');
    placeBlock(ox+18, 2, oz-3, 'stone');
    placeBlock(ox+22, 1, oz-3, 'stone');
    placeBlock(ox+22, 2, oz-3, 'stone');
    placeBlock(ox+19, 2, oz-3, 'road');
    placeBlock(ox+20, 2, oz-3, 'road');
    placeBlock(ox+21, 2, oz-3, 'road');
    // Guard booth
    placePlatform(ox+23, oz-4, ox+25, oz-2, 0, 'stone');
    placeWallX(ox+23, ox+25, oz-4, 1, 2, 'stone');
    placeWallX(ox+23, ox+25, oz-2, 1, 2, 'stone');
    placeWallZ(ox+23, oz-4, oz-2, 1, 2, 'stone');
    placeWallZ(ox+25, oz-4, oz-2, 1, 2, 'stone');
    placeBlock(ox+24, 3, oz-3, 'glass');
  }

  // ── AR-RISALAH JUNIOR HIGH ─────────────────────────────────────
  // General Mathenge Drive — the most important building
  // School gate, main block, primary section separate
  function buildArRisalahJuniorHigh(ox, oz) {
    // School compound — big ground
    placePlatform(ox-5, oz-5, ox+45, oz+40, 0, 'grass');
    placePlatform(ox-5, oz-5, ox+45, oz-1,  0, 'sidewalk');

    // ── MAIN GATE ──
    // Two gate pillars
    placeColumn(ox+14, oz-3, 0, 5, 'mosque');
    placeColumn(ox+15, oz-3, 0, 5, 'mosque');
    placeColumn(ox+20, oz-3, 0, 5, 'mosque');
    placeColumn(ox+21, oz-3, 0, 5, 'mosque');
    // Gate arch
    for (let x = ox+15; x <= ox+21; x++)
      placeBlock(x, 5, oz-3, 'mosque');
    // Gate sign blocks
    for (let x = ox+16; x <= ox+19; x++)
      placeBlock(x, 6, oz-3, 'dome');
    // Gate panels (open gate look)
    placeBlock(ox+16, 1, oz-3, 'road');
    placeBlock(ox+16, 2, oz-3, 'road');
    placeBlock(ox+16, 3, oz-3, 'road');
    placeBlock(ox+19, 1, oz-3, 'road');
    placeBlock(ox+19, 2, oz-3, 'road');
    placeBlock(ox+19, 3, oz-3, 'road');

    // Compound perimeter wall
    placeWallX(ox-5, ox+45, oz-5,  1, 3, 'stone');
    placeWallX(ox-5, ox+45, oz+40, 1, 3, 'stone');
    placeWallZ(ox-5, oz-5, oz+40,  1, 3, 'stone');
    placeWallZ(ox+45, oz-5, oz+40, 1, 3, 'stone');

    // ── MAIN SCHOOL BUILDING (3 floors) ──
    // Front block
    placePlatform(ox, oz, ox+40, oz+12, 0, 'sidewalk');
    for (let floor = 0; floor < 3; floor++) {
      const y1 = floor * 4 + 1;
      const y2 = y1 + 3;
      placeWallX(ox, ox+40, oz,    y1, y2, 'mosqueWall');
      placeWallX(ox, ox+40, oz+12, y1, y2, 'mosqueWall');
      placeWallZ(ox,    oz, oz+12, y1, y2, 'mosqueWall');
      placeWallZ(ox+40, oz, oz+12, y1, y2, 'mosqueWall');
      placePlatform(ox, oz, ox+40, oz+12, y2, 'mosqueWall');
      // Classroom windows
      for (let x = ox+2; x <= ox+38; x += 5) {
        placeBlock(x,   y1+1, oz, 'glass');
        placeBlock(x+1, y1+1, oz, 'glass');
        placeBlock(x+2, y1+1, oz, 'glass');
        placeBlock(x,   y1+2, oz, 'glass');
        placeBlock(x+1, y1+2, oz, 'glass');
        placeBlock(x+2, y1+2, oz, 'glass');
      }
    }

    // ── CORRIDOR connecting front + back block ──
    placePlatform(ox+15, oz+12, ox+25, oz+20, 0, 'sidewalk');
    placeWallZ(ox+15, oz+12, oz+20, 1, 4, 'mosqueWall');
    placeWallZ(ox+25, oz+12, oz+20, 1, 4, 'mosqueWall');
    placePlatform(ox+15, oz+12, ox+25, oz+20, 5, 'mosqueWall');

    // ── BACK BLOCK (classrooms + labs) ──
    placePlatform(ox, oz+20, ox+40, oz+35, 0, 'sidewalk');
    for (let floor = 0; floor < 3; floor++) {
      const y1 = floor * 4 + 1;
      const y2 = y1 + 3;
      placeWallX(ox, ox+40, oz+20, y1, y2, 'mosqueWall');
      placeWallX(ox, ox+40, oz+35, y1, y2, 'mosqueWall');
      placeWallZ(ox,    oz+20, oz+35, y1, y2, 'mosqueWall');
      placeWallZ(ox+40, oz+20, oz+35, y1, y2, 'mosqueWall');
      placePlatform(ox, oz+20, ox+40, oz+35, y2, 'mosqueWall');
      // Back windows
      for (let x = ox+2; x <= ox+38; x += 5) {
        placeBlock(x,   y1+1, oz+35, 'glass');
        placeBlock(x+1, y1+1, oz+35, 'glass');
        placeBlock(x+2, y1+1, oz+35, 'glass');
      }
    }

    // ── SPORTS COURT / FIELD ──
    placePlatform(ox, oz+12, ox+14, oz+20, 0, 'road');
    placePlatform(ox+26, oz+12, ox+40, oz+20, 0, 'road');

    // Basketball hoop poles
    placeColumn(ox+5,  oz+14, 1, 5, 'wood');
    placeColumn(ox+35, oz+14, 1, 5, 'wood');
    placeBlock(ox+5,  6, oz+14, 'stone');
    placeBlock(ox+35, 6, oz+14, 'stone');
    placeBlock(ox+4,  6, oz+14, 'stone');
    placeBlock(ox+36, 6, oz+14, 'stone');

    // ── FLAGPOLE ──
    placeColumn(ox+20, oz+5, 1, 12, 'stone');
    placeBlock(ox+21, 12, oz+5, 'leaves');
    placeBlock(ox+22, 12, oz+5, 'leaves');
    placeBlock(ox+21, 11, oz+5, 'leaves');

    // Trees inside compound
    buildTree(ox+2,  oz+3);
    buildTree(ox+38, oz+3);
    buildTree(ox+2,  oz+32);
    buildTree(ox+38, oz+32);

    // Street lamps inside
    buildStreetLamp(ox+8,  oz+2);
    buildStreetLamp(ox+32, oz+2);
  }

  // ── FULL PARKLANDS MAP ─────────────────────────────────────────
  // Route: Parklands Mosque → 3rd Pklands Ave → Limuru Rd →
  //        Peponi Rd (Sarit) → General Mathenge → Ar-Risalah JH
  function buildParklands(sc) {
    scene = sc;

    // ── GROUND ──
    // Grass base everywhere
    placePlatform(-20, -20, 200, 160, -1, 'grass');
    placePlatform(-20, -20, 200, 160,  0, 'grass');

    // ── 3RD PARKLANDS AVENUE (runs East-West, Z = 0 to 4) ──
    // Player starts at mosque, walks west along this road
    roadEW(-20, 120, 0);

    // ── LIMURU ROAD (runs North-South, X = -5 to -1) ──
    // Connects 3rd Pklands Ave north toward Westlands/Sarit
    roadNS(-30, 130, -5);

    // ── PEPONI ROAD (runs E-W at Z = 55, leads to Sarit) ──
    roadEW(-20, 80, 55);

    // ── GENERAL MATHENGE DRIVE (runs N-S, X = 40 to 46) ──
    // Sarit is near the junction; Ar-Risalah JH is further north
    roadNS(-20, 130, 40);

    // ── JUNCTION FILLERS (smooth road intersections) ──
    placePlatform(-5, 0, 0, 5,   0, 'roadplain');
    placePlatform(-5, 55, 0, 60, 0, 'roadplain');
    placePlatform(40, 55, 45, 60, 0, 'roadplain');

    // ── PARKLANDS MOSQUE ──
    // 3rd Parklands Ave, right side (north of road)
    // Player spawns facing this
    buildParklandsMosque(10, 8);

    // ── MP SHAH HOSPITAL ──
    // East of mosque along 3rd Parklands Ave
    buildMPShah(60, 8);

    // ── SARIT CENTRE ──
    // At Peponi Road / General Mathenge junction
    buildSaritCentre(46, 60);

    // ── THE PROMENADE ──
    // General Mathenge Drive, just north of Sarit
    buildPromenade(46, 95);

    // ── MARWA HEIGHTS ──
    // General Mathenge Drive, residential towers
    buildMarwaHeights(46, 112);

    // ── AR-RISALAH JUNIOR HIGH ──
    // General Mathenge Drive — end destination
    buildArRisalahJuniorHigh(46, 142);

    // ── STREET DETAIL ──
    // Trees lining 3rd Parklands Ave
    for (let x = 0; x <= 50; x += 8) {
      buildTree(x, -3);
      buildTree(x, 7);
    }
    // Trees lining General Mathenge
    for (let z = 60; z <= 140; z += 10) {
      buildTree(38, z);
      buildTree(48, z);
    }
    // Street lamps along 3rd Pklands Ave
    for (let x = 5; x <= 55; x += 12) {
      buildStreetLamp(x, -4);
      buildStreetLamp(x,  7);
    }
    // Street lamps along General Mathenge
    for (let z = 65; z <= 140; z += 15) {
      buildStreetLamp(39, z);
      buildStreetLamp(47, z);
    }

    // ── NEIGHBOURHOOD BUILDINGS ──
    // Houses and apartments either side of the roads
    // South side of 3rd Pklands Ave
    buildHouse(5,  -18, 'stone');
    buildHouse(16, -18, 'mosque');
    buildHouse(27, -18, 'stone');
    buildHouse(38, -18, 'mosque');
    // North of 3rd Pklands Ave (between road and mosque compound)
    buildHouse(-15, 12, 'stone');
    buildHouse(-15, 22, 'mosque');
    // Along Limuru Road
    buildHouse(-18, 20, 'stone');
    buildHouse(-18, 35, 'mosque');
    buildHouse(-18, 50, 'stone');
    // West of General Mathenge
    buildHouse(28, 70,  'mosque');
    buildHouse(28, 82,  'stone');
    buildHouse(28, 94,  'mosque');
    buildHouse(28, 106, 'stone');
    buildHouse(28, 118, 'mosque');
    buildHouse(28, 130, 'stone');

    // ── TIME PORTAL ──
    // Behind the mosque — player walks through after missions
    buildPortal(10, 1, 5);
  }

  // ── SIMPLE HOUSE ──
  function buildHouse(ox, oz, wallType = 'stone') {
    placePlatform(ox, oz, ox+8, oz+8, 0, wallType);
    placeWallX(ox, ox+8, oz,   1, 4, wallType);
    placeWallX(ox, ox+8, oz+8, 1, 4, wallType);
    placeWallZ(ox,    oz, oz+8, 1, 4, wallType);
    placeWallZ(ox+8,  oz, oz+8, 1, 4, wallType);
    placePlatform(ox, oz, ox+8, oz+8, 5, wallType);
    // Sloped roof suggestion
    for (let x = ox; x <= ox+8; x++) placeBlock(x, 6, oz+4, wallType);
    // Door
    placeBlock(ox+4, 1, oz, 'dirt');
    placeBlock(ox+4, 2, oz, 'dirt');
    // Windows
    placeBlock(ox+2, 3, oz, 'glass');
    placeBlock(ox+6, 3, oz, 'glass');
  }

  // ── PORTAL ──
  function buildPortal(x, y, z) {
    for (let dy = 0; dy <= 4; dy++) {
      placeBlock(x,   y+dy, z, 'portal');
      placeBlock(x+3, y+dy, z, 'portal');
    }
    for (let dx = 0; dx <= 3; dx++) {
      placeBlock(x+dx, y,   z, 'portal');
      placeBlock(x+dx, y+4, z, 'portal');
    }
    placeBlock(x+1, y+1, z, 'portal');
    placeBlock(x+1, y+2, z, 'portal');
    placeBlock(x+1, y+3, z, 'portal');
    placeBlock(x+2, y+1, z, 'portal');
    placeBlock(x+2, y+2, z, 'portal');
    placeBlock(x+2, y+3, z, 'portal');
  }

  // ── BAGHDAD MAP ──
  function buildBaghdad(sc) {
    scene = sc;
    placePlatform(-30, -30, 120, 120, -1, 'sand');
    placePlatform(-30, -30, 120, 120,  0, 'sand');
    roadNS(-20, 80, -5);
    roadEW(-20, 80, 20);
    buildHouseOfWisdom(10, 5);
    buildPortalReturn(-8, 1, 40);
    buildPalmTree(30, 40);
    buildPalmTree(-10, 30);
    buildPalmTree(50, 15);
    buildPalmTree(-10, 55);
    buildPalmTree(45, 50);
  }

  function buildHouseOfWisdom(ox, oz) {
    placePlatform(ox-3, oz-3, ox+28, oz+28, 0, 'how');
    placeWallX(ox, ox+25, oz,    1, 10, 'how');
    placeWallX(ox, ox+25, oz+25, 1, 10, 'how');
    placeWallZ(ox,    oz, oz+25, 1, 10, 'how');
    placeWallZ(ox+25, oz, oz+25, 1, 10, 'how');
    placePlatform(ox, oz, ox+25, oz+25, 11, 'how');
    // Grand dome
    placePlatform(ox+8, oz+8, ox+17, oz+17, 12, 'dome');
    placePlatform(ox+9, oz+7, ox+16, oz+18, 12, 'dome');
    placePlatform(ox+9, oz+9, ox+16, oz+16, 13, 'dome');
    placePlatform(ox+10, oz+10, ox+15, oz+15, 14, 'dome');
    placeColumn(ox+12, oz+12, 12, 18, 'dome');
    // Arched windows
    for (let x = ox+3; x <= ox+22; x += 5) {
      placeBlock(x,   3, oz, 'glass');
      placeBlock(x+1, 3, oz, 'glass');
      placeBlock(x,   4, oz, 'glass');
      placeBlock(x+1, 4, oz, 'glass');
      placeBlock(x,   5, oz, 'glass');
    }
    // Corner columns
    placeColumn(ox-1,    oz-1,    1, 10, 'baghdad');
    placeColumn(ox+26,   oz-1,    1, 10, 'baghdad');
    placeColumn(ox-1,    oz+26,   1, 10, 'baghdad');
    placeColumn(ox+26,   oz+26,   1, 10, 'baghdad');
  }

  function buildPalmTree(x, z) {
    placeColumn(x, z, 1, 8, 'wood');
    for (let dx = -3; dx <= 3; dx++)
      for (let dz = -3; dz <= 3; dz++)
        if (Math.abs(dx) + Math.abs(dz) <= 4)
          placeBlock(x+dx, 9, z+dz, 'leaves');
  }

  function buildPortalReturn(x, y, z) {
    for (let dy = 0; dy <= 4; dy++) {
      placeBlock(x,   y+dy, z, 'portal');
      placeBlock(x+3, y+dy, z, 'portal');
    }
    for (let dx = 0; dx <= 3; dx++) {
      placeBlock(x+dx, y,   z, 'portal');
      placeBlock(x+dx, y+4, z, 'portal');
    }
    placeBlock(x+1, y+1, z, 'portal');
    placeBlock(x+2, y+1, z, 'portal');
    placeBlock(x+1, y+2, z, 'portal');
    placeBlock(x+2, y+2, z, 'portal');
    placeBlock(x+1, y+3, z, 'portal');
    placeBlock(x+2, y+3, z, 'portal');
  }

  // ── UTILS ──
  function hasBlock(x, y, z) {
    return blocks.has(key(
      Math.round(x), Math.round(y), Math.round(z)
    ));
  }

  function clear(sc) {
    blocks.forEach(m => sc.remove(m));
    blocks.clear();
  }

  return {
    buildParklands,
    buildBaghdad,
    hasBlock,
    clear,
    placeBlock,
  };
})();
