const Missions = (() => {
  let state = {
    act: 1,
    step: 0,
    pagesFound: 0,
    youthFound: 0,
    scrollsFound: 0,
    inventory: [],
    completedNPCs: new Set(),
  };

  const MISSION_TEXT = {
    0:  'Talk to Imam Sheikh Hassan at the mosque.',
    1:  'Find 3 manuscript pages around Parklands.',
    2:  'Return the pages to Imam Sheikh Hassan.',
    3:  'Find Amira and Bilal — tell them about the seminar.',
    4:  'Step through the time portal behind the mosque.',
    5:  'Find Al-Khwarizmi at the House of Wisdom.',
    6:  'Collect 3 scattered scrolls in Baghdad.',
    7:  'Defend the House of Wisdom from raiders!',
    8:  'Return through the portal to Parklands.',
    9:  'Bring the ancient compass to Imam Sheikh Hassan.',
  };

  function getCurrentMission() {
    return MISSION_TEXT[state.step] || 'Journey complete. Alhamdulillah!';
  }

  function getAct() { return state.act; }
  function getStep() { return state.step; }

  function advanceStep() {
    state.step++;
    UI.updateMission(getCurrentMission());
  }

  function handleNPCInteract(npcId) {
    if (state.completedNPCs.has(npcId + '_done')) return null;

    // Imam interactions
    if (npcId === 'imam') {
      if (state.step === 0) {
        advanceStep();
        return 'imam';
      }
      if (state.step === 2 && state.pagesFound >= 3) {
        advanceStep();
        addItem('📄', 'Key of Wisdom');
        return 'imam_pages';
      }
      if (state.step === 9) {
        state.completedNPCs.add('imam_done');
        Game.triggerVictory();
        return 'imam';
      }
    }

    if (npcId === 'elder' && state.step <= 2) return 'elder';

    if (npcId === 'amira' && state.step === 3) {
      state.completedNPCs.add('amira_done');
      state.youthFound++;
      checkYouthDone();
      return 'amira';
    }

    if (npcId === 'bilal' && state.step === 3) {
      state.completedNPCs.add('bilal_done');
      state.youthFound++;
      checkYouthDone();
      return 'bilal';
    }

    if (npcId === 'khwarizmi') {
      if (state.step === 5) { advanceStep(); return 'khwarizmi'; }
    }

    if (npcId === 'guard') return 'guard';

    return null;
  }

  function checkYouthDone() {
    if (state.youthFound >= 2) advanceStep();
  }

  function foundPage() {
    state.pagesFound++;
    addItem('📄', `Manuscript Page ${state.pagesFound}`);
    UI.updateMission(`Found ${state.pagesFound}/3 pages. Keep searching!`);
    if (state.pagesFound >= 3) {
      advanceStep();
      UI.updateMission('All pages found! Return to Imam Sheikh Hassan.');
    }
  }

  function foundScroll() {
    state.scrollsFound++;
    addItem('📜', `Scroll ${state.scrollsFound}`);
    if (state.scrollsFound >= 3) advanceStep();
  }

  function addItem(icon, name) {
    state.inventory.push({ icon, name });
    UI.updateInventory(state.inventory);
  }

  function enterPortal() {
    if (state.act === 1 && state.step >= 4) {
      state.act = 2;
      state.step = 5;
      Game.switchMap('baghdad');
      UI.updateLocation('🕌 Bayt al-Hikma, Baghdad — 830 AD');
      UI.updateMission(getCurrentMission());
    } else if (state.act === 2 && state.step >= 8) {
      state.act = 1;
      state.step = 9;
      Game.switchMap('parklands');
      UI.updateLocation('📍 Parklands Mosque, Nairobi');
      UI.updateMission(getCurrentMission());
    }
  }

  function getState() { return state; }

  return {
    getCurrentMission,
    handleNPCInteract,
    foundPage,
    foundScroll,
    enterPortal,
    getAct,
    getStep,
    getState,
    addItem,
  };
})();
