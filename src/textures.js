const Textures = (() => {
  function makeCanvas(size, drawFn) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    drawFn(c.getContext('2d'), size);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    return t;
  }

  function pixelNoise(ctx, size, base, vary, alpha=1) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = Math.floor(base + (Math.random() - 0.5) * vary);
        ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  const grass = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const g = 80 + Math.floor(Math.random() * 40);
        const r = 30 + Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${r},${g},${r-10})`;
        ctx.fillRect(x, y, 1, 1);
      }
  });

  const grassSide = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        if (y < 4) {
          const g = 80 + Math.floor(Math.random() * 30);
          ctx.fillStyle = `rgb(30,${g},20)`;
        } else {
          const v = 110 + Math.floor(Math.random() * 30);
          ctx.fillStyle = `rgb(${v},${Math.floor(v*0.8)},${Math.floor(v*0.6)})`;
        }
        ctx.fillRect(x, y, 1, 1);
      }
  });

  const dirt = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = 110 + Math.floor(Math.random() * 40);
        ctx.fillStyle = `rgb(${v},${Math.floor(v*0.75)},${Math.floor(v*0.55)})`;
        ctx.fillRect(x, y, 1, 1);
      }
  });

  const stone = makeCanvas(16, (ctx) => {
    pixelNoise(ctx, 16, 140, 40);
    ctx.fillStyle = 'rgba(80,80,80,0.3)';
    ctx.fillRect(0, 7, 16, 1);
    ctx.fillRect(8, 0, 1, 7);
    ctx.fillRect(0, 14, 8, 1);
  });

  const sand = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = Math.floor(Math.random() * 30);
        ctx.fillStyle = `rgb(${210+v},${185+v},${120+v})`;
        ctx.fillRect(x, y, 1, 1);
      }
  });

  const mosqueWall = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${210+v},${195+v},${165+v})`;
        ctx.fillRect(x, y, 1, 1);
      }
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let y = 0; y < 16; y += 4) ctx.fillRect(0, y, 16, 1);
    for (let x = 0; x < 16; x += 8) ctx.fillRect(x, 0, 1, 16);
  });

  const mosqueDome = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = Math.floor(Math.random() * 15);
        ctx.fillStyle = `rgb(${180+v},${145+v},${20+v})`;
        ctx.fillRect(x, y, 1, 1);
      }
  });

  const road = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = 55 + Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 1, 1);
      }
    ctx.fillStyle = 'rgba(255,255,200,0.4)';
    ctx.fillRect(7, 0, 2, 16);
  });

  const roadPlain = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = 55 + Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 1, 1);
      }
  });

  const wood = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = Math.floor(Math.random() * 25);
        ctx.fillStyle = `rgb(${140+v},${90+v},${40+v})`;
        ctx.fillRect(x, y, 1, 1);
      }
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let y = 0; y < 16; y += 2) ctx.fillRect(0, y, 16, 1);
  });

  const leaves = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = Math.floor(Math.random() * 40);
        ctx.fillStyle = Math.random() > 0.15
          ? `rgb(${30+v},${100+v},${20+v})`
          : 'rgba(0,0,0,0)';
        ctx.fillRect(x, y, 1, 1);
      }
  });

  const glass = makeCanvas(16, (ctx) => {
    ctx.fillStyle = 'rgba(150,200,255,0.25)';
    ctx.fillRect(0, 0, 16, 16);
    ctx.strokeStyle = 'rgba(200,230,255,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, 14, 14);
    ctx.beginPath();
    ctx.moveTo(1,1); ctx.lineTo(15,15);
    ctx.moveTo(15,1); ctx.lineTo(1,15);
    ctx.stroke();
  });

  const saritWall = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = Math.floor(Math.random() * 15);
        ctx.fillStyle = `rgb(${60+v},${80+v},${110+v})`;
        ctx.fillRect(x, y, 1, 1);
      }
    ctx.fillStyle = 'rgba(150,200,255,0.2)';
    for (let y = 2; y < 16; y += 5)
      for (let x = 2; x < 16; x += 5)
        ctx.fillRect(x, y, 3, 3);
  });

  const water = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${20+v},${80+v},${180+v})`;
        ctx.fillRect(x, y, 1, 1);
      }
  });

  const baghdadStone = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = Math.floor(Math.random() * 25);
        ctx.fillStyle = `rgb(${190+v},${160+v},${100+v})`;
        ctx.fillRect(x, y, 1, 1);
      }
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = 0; y < 16; y += 5) ctx.fillRect(0, y, 16, 1);
    for (let x = 0; x < 16; x += 8) ctx.fillRect(x, 0, 1, 16);
  });

  const howWall = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${160+v},${130+v},${70+v})`;
        ctx.fillRect(x, y, 1, 1);
      }
    ctx.fillStyle = 'rgba(255,200,50,0.15)';
    ctx.fillRect(0, 0, 16, 16);
  });

  const portal = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const dist = Math.sqrt((x-8)**2 + (y-8)**2);
        const v = Math.max(0, 1 - dist/8);
        ctx.fillStyle = `rgba(120,50,255,${v * (0.5 + Math.random()*0.5)})`;
        ctx.fillRect(x, y, 1, 1);
      }
  });

  const sidewalk = makeCanvas(16, (ctx) => {
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const v = 170 + Math.floor(Math.random() * 30);
        ctx.fillStyle = `rgb(${v},${v},${v-10})`;
        ctx.fillRect(x, y, 1, 1);
      }
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let y = 0; y < 16; y += 8) ctx.fillRect(0, y, 16, 1);
    for (let x = 0; x < 16; x += 8) ctx.fillRect(x, 0, 1, 16);
  });

  function makeMat(texture, options = {}) {
    return new THREE.MeshLambertMaterial({ map: texture, ...options });
  }

  return {
    grass, grassSide, dirt, stone, sand,
    mosqueWall, mosqueDome, road, roadPlain,
    wood, leaves, glass, saritWall, water,
    baghdadStone, howWall, portal, sidewalk,

    getMaterial(type) {
      switch(type) {
        case 'grass':
          return [
            makeMat(grassSide), makeMat(grassSide),
            makeMat(grass),     makeMat(dirt),
            makeMat(grassSide), makeMat(grassSide),
          ];
        case 'dirt':       return makeMat(dirt);
        case 'stone':      return makeMat(stone);
        case 'sand':       return makeMat(sand);
        case 'road':       return makeMat(road);
        case 'roadplain':  return makeMat(roadPlain);
        case 'sidewalk':   return makeMat(sidewalk);
        case 'mosque':     return makeMat(mosqueWall);
        case 'dome':       return makeMat(mosqueDome);
        case 'wood':       return makeMat(wood);
        case 'leaves':     return makeMat(leaves, { transparent: true, alphaTest: 0.5 });
        case 'glass':      return makeMat(glass, { transparent: true, opacity: 0.5 });
        case 'sarit':      return makeMat(saritWall);
        case 'water':      return makeMat(water, { transparent: true, opacity: 0.7 });
        case 'baghdad':    return makeMat(baghdadStone);
        case 'how':        return makeMat(howWall);
        case 'portal':     return makeMat(portal, { transparent: true, opacity: 0.85 });
        default:           return makeMat(stone);
      }
    }
  };
})();
