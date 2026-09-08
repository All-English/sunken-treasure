/**
 * shared-class-sync.js
 * Universal schedule parsing, time-matching, and unit translation
 * Shared across Phonics Flash, Word-Tac-Toe, MatchMaker, and Treasure Hunt.
 */
(function (root, factory) {
  const lib = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = lib;
  }
  if (typeof root !== 'undefined') {
    root.SharedClassSync = lib;
  }
  if (typeof window !== 'undefined') {
    window.SharedClassSync = lib;
  }
})(typeof self !== 'undefined' ? self : this, function () {

  const SHARED_SETS_KEY = 'shared_player_sets';
  const SHARED_ACTIVE_PLAYERS_KEY = 'shared_active_players';
  const SHARED_CLASS_PROFILES_KEY = 'shared_class_profiles';
  const UPSTASH_URL_KEY = 'upstash_redis_url';
  const UPSTASH_TOKEN_KEY = 'upstash_redis_token';

  // ── 1. Schedule Parsing from Class Name ────────────────────────
  function parseScheduleFromName(className) {
    if (!className || typeof className !== 'string') {
      return { days: ['Mon', 'Wed', 'Fri'], startTime: '15:00', endTime: '16:00' };
    }

    // 1. Extract Days
    const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let matchedDays = null;

    // A. Check range patterns (e.g., Mon-Fri, M-F, Mon-Thu, M-Th, Daily, Weekend)
    if (/\b(Mon(day)?\s*-\s*Fri(day)?|M-F|MTWThF|MTWTF)\b/i.test(className)) {
      matchedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    } else if (/\b(Mon(day)?\s*-\s*Thu(rs|rsday)?|M-Th|MTWTh|MTWT)\b/i.test(className)) {
      matchedDays = ['Mon', 'Tue', 'Wed', 'Thu'];
    } else if (/\b(Daily|Everyday|Weekdays?)\b/i.test(className)) {
      matchedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    } else if (/\b(Weekend|Sat(urday)?\s*[-/&]\s*Sun(day)?|SatSun|SS)\b/i.test(className)) {
      matchedDays = ['Sat', 'Sun'];
    }

    // B. Check for multiple full/abbreviated day words (e.g., "Mon, Fri", "Mon & Wed", "Tue/Thu", "Monday/Friday")
    if (!matchedDays) {
      const dayWordMatches = new Set();
      const wordChecks = [
        { day: 'Mon', pattern: /\bMon(day)?\b/i },
        { day: 'Tue', pattern: /\bTue(s|sday)?\b/i },
        { day: 'Wed', pattern: /\bWed(nesday)?\b/i },
        { day: 'Thu', pattern: /\bThu(r|rs|rsday)?\b/i },
        { day: 'Fri', pattern: /\bFri(day)?\b/i },
        { day: 'Sat', pattern: /\bSat(urday)?\b/i },
        { day: 'Sun', pattern: /\bSun(day)?\b/i }
      ];

      wordChecks.forEach(({ day, pattern }) => {
        if (pattern.test(className)) dayWordMatches.add(day);
      });

      if (dayWordMatches.size > 0) {
        matchedDays = ALL_DAYS.filter((d) => dayWordMatches.has(d));
      }
    }

    // C. Check multi-day acronyms (e.g. MWF, MF, TTh, TT, WF, MW, TF, etc.)
    if (!matchedDays) {
      const ACRONYM_PATTERNS = [
        { pattern: /\b(MWF|M[/&+, ]*W[/&+, ]*F)\b/i, days: ['Mon', 'Wed', 'Fri'] },
        { pattern: /\b(MWFS|MWFSa|MWFSat)\b/i, days: ['Mon', 'Wed', 'Fri', 'Sat'] },
        { pattern: /\b(TThS|TThSat|TTS|TTSat)\b/i, days: ['Tue', 'Thu', 'Sat'] },
        { pattern: /\b(MTW|M[/&+, ]*T[/&+, ]*W)\b/i, days: ['Mon', 'Tue', 'Wed'] },
        { pattern: /\b(TWTh|TWT|T[/&+, ]*W[/&+, ]*Th)\b/i, days: ['Tue', 'Wed', 'Thu'] },
        { pattern: /\b(WThF|WTF|W[/&+, ]*Th[/&+, ]*F)\b/i, days: ['Wed', 'Thu', 'Fri'] },
        { pattern: /\b(TTh|TuTh|TT|T[/&+, ]*Th|Tu[/&+, ]*Th|T[/&+, ]*T)\b/i, days: ['Tue', 'Thu'] },
        { pattern: /\b(MW|M[/&+, ]*W)\b/i, days: ['Mon', 'Wed'] },
        { pattern: /\b(WF|W[/&+, ]*F)\b/i, days: ['Wed', 'Fri'] },
        { pattern: /\b(MF|M[/&+, ]*F)\b/i, days: ['Mon', 'Fri'] },
        { pattern: /\b(TF|TuF|T[/&+, ]*F|Tu[/&+, ]*F)\b/i, days: ['Tue', 'Fri'] },
        { pattern: /\b(MTh|MuTh|M[/&+, ]*Th)\b/i, days: ['Mon', 'Thu'] },
        { pattern: /\b(ThF|Th[/&+, ]*F)\b/i, days: ['Thu', 'Fri'] },
        { pattern: /\b(MT|MTu|M[/&+, ]*T)\b/i, days: ['Mon', 'Tue'] },
        { pattern: /\b(WTh|W[/&+, ]*Th)\b/i, days: ['Wed', 'Thu'] },
        { pattern: /\b(SatSun|SS|Sat[/&+, ]*Sun)\b/i, days: ['Sat', 'Sun'] },
        // Standalone single-letter days
        { pattern: /\bM\b/i, days: ['Mon'] },
        { pattern: /\b(Tu|Tue)\b/i, days: ['Tue'] },
        { pattern: /\bW\b/i, days: ['Wed'] },
        { pattern: /\bTh\b/i, days: ['Thu'] },
        { pattern: /\bF\b/i, days: ['Fri'] },
        { pattern: /\bSa\b/i, days: ['Sat'] },
        { pattern: /\bSu\b/i, days: ['Sun'] }
      ];

      for (const entry of ACRONYM_PATTERNS) {
        if (entry.pattern.test(className)) {
          matchedDays = entry.days;
          break;
        }
      }
    }

    if (!matchedDays || matchedDays.length === 0) {
      matchedDays = ['Mon', 'Wed', 'Fri'];
    }

    // 2. Extract Time
    function parseHourMinMeridiem(hStr, mStr, meridiem) {
      let h = parseInt(hStr, 10);
      const m = mStr ? parseInt(mStr, 10) : 0;
      const isPM = meridiem && /pm/i.test(meridiem);
      const isAM = meridiem && /am/i.test(meridiem);

      if (isPM) {
        if (h < 12) h += 12;
      } else if (isAM) {
        if (h === 12) h = 0;
      } else {
        // Academy / hagwon hours 1..7 without AM/PM default to PM (13:00 to 19:00)
        if (h >= 1 && h <= 7) {
          h += 12;
        }
      }
      return { h: h % 24, m: Math.min(Math.max(m, 0), 59) };
    }

    const formatTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    let startHour = 15;
    let startMin = 0;
    let endHour = 16;
    let endMin = 0;

    // A. Check for time ranges e.g. "2:00-2:50", "2:00 - 3:00pm", "2pm-3pm", "2:00~3:00"
    const rangeMatch = className.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|~|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (rangeMatch && (rangeMatch[2] !== undefined || rangeMatch[5] !== undefined || rangeMatch[3] !== undefined || rangeMatch[6] !== undefined)) {
      const sH = rangeMatch[1];
      const sM = rangeMatch[2];
      let sMer = rangeMatch[3];
      const eH = rangeMatch[4];
      const eM = rangeMatch[5];
      const eMer = rangeMatch[6];

      // If end has PM and start has no meridiem, start shares PM if it comes earlier or equal in 12h clock
      if (!sMer && eMer && /pm/i.test(eMer) && parseInt(sH, 10) <= parseInt(eH, 10)) {
        sMer = eMer;
      }

      const startParsed = parseHourMinMeridiem(sH, sM, sMer);
      const endParsed = parseHourMinMeridiem(eH, eM, eMer);

      startHour = startParsed.h;
      startMin = startParsed.m;
      endHour = endParsed.h;
      endMin = endParsed.m;

      if (endHour * 60 + endMin <= startHour * 60 + startMin) {
        const fallbackEnd = startHour * 60 + startMin + 60;
        endHour = Math.floor(fallbackEnd / 60) % 24;
        endMin = fallbackEnd % 60;
      }
    } else {
      // B. Single time match e.g. "2:00", "2:00pm", "2pm"
      const colonMatch = className.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      const hourOnlyMatch = !colonMatch && className.match(/\b(\d{1,2})\s*(am|pm)\b/i);

      if (colonMatch) {
        const startParsed = parseHourMinMeridiem(colonMatch[1], colonMatch[2], colonMatch[3]);
        startHour = startParsed.h;
        startMin = startParsed.m;
        const totalEndMinutes = startHour * 60 + startMin + 60;
        endHour = Math.floor(totalEndMinutes / 60) % 24;
        endMin = totalEndMinutes % 60;
      } else if (hourOnlyMatch) {
        const startParsed = parseHourMinMeridiem(hourOnlyMatch[1], '00', hourOnlyMatch[2]);
        startHour = startParsed.h;
        startMin = startParsed.m;
        const totalEndMinutes = startHour * 60 + startMin + 60;
        endHour = Math.floor(totalEndMinutes / 60) % 24;
        endMin = totalEndMinutes % 60;
      }
    }

    return {
      days: matchedDays,
      startTime: formatTime(startHour, startMin),
      endTime: formatTime(endHour, endMin)
    };
  }

  // ── 2. Strict In-Session Time Matching ─────────────────────────
  /**
   * Finds the active scheduled class strictly during its in-session window:
   * startTime <= currentTime < endTime.
   * Never activates before startTime. No post-class grace bleed.
   */
  function findActiveScheduledClass(classProfiles, date = new Date()) {
    if (!classProfiles || typeof classProfiles !== 'object') return null;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = dayNames[date.getDay()];
    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    const candidates = [];

    for (const [className, profile] of Object.entries(classProfiles)) {
      const schedule = profile.schedule || parseScheduleFromName(className);
      if (!schedule || !Array.isArray(schedule.days) || !schedule.days.includes(currentDay)) {
        continue;
      }

      const startParts = (schedule.startTime || '00:00').split(':').map(Number);
      const endParts = (schedule.endTime || '23:59').split(':').map(Number);

      const startMin = (startParts[0] || 0) * 60 + (startParts[1] || 0);
      let endMin = (endParts[0] || 0) * 60 + (endParts[1] || 0);
      if (endMin <= startMin) {
        endMin = startMin + 60; // 60 min default
      }

      // Strictly in-session check
      if (currentMinutes >= startMin && currentMinutes < endMin) {
        candidates.push({
          className,
          profile,
          startMin,
          endMin
        });
      }
    }

    if (candidates.length === 0) return null;

    // If multiple overlap on a boundary, pick the most recent start time
    candidates.sort((a, b) => b.startMin - a.startMin);
    return candidates[0];
  }

  // ── 3. Universal Smart Phonics Unit Translators ────────────────
  /**
   * Normalizes any app's unit string to a canonical object:
   * { level: 2, unit: 3, id: "L2U3" }
   *
   * Handles:
   * - "L2U3", "L2U03" (Phonics Flash)
   * - "Book2|Unit3" (Word-Tac-Toe)
   * - "SmartPhonics|2|3" (MatchMaker)
   * - "level2:unit3" (Treasure Hunt)
   */
  function toCanonicalUnit(unitStr) {
    if (!unitStr || typeof unitStr !== 'string') return null;
    const str = unitStr.trim();

    // 1. Phonics Flash: L2U3
    let m = str.match(/L(\d+)U(\d+)/i);
    if (m) {
      const level = parseInt(m[1], 10);
      const unit = parseInt(m[2], 10);
      return { level, unit, id: `L${level}U${unit}` };
    }

    // 2. Word-Tac-Toe: Book2|Unit3
    m = str.match(/Book(\d+)\|Unit(\d+)/i);
    if (m) {
      const level = parseInt(m[1], 10);
      const unit = parseInt(m[2], 10);
      return { level, unit, id: `L${level}U${unit}` };
    }

    // 3. MatchMaker: SmartPhonics|2|3
    m = str.match(/(?:SmartPhonics|SP)\|(\d+)\|(\d+)/i);
    if (m) {
      const level = parseInt(m[1], 10);
      const unit = parseInt(m[2], 10);
      return { level, unit, id: `L${level}U${unit}` };
    }

    // 4. Treasure Hunt: level2:unit3
    m = str.match(/level(\d+):unit(\d+)/i);
    if (m) {
      const level = parseInt(m[1], 10);
      const unit = parseInt(m[2], 10);
      return { level, unit, id: `L${level}U${unit}` };
    }

    return null;
  }

  function toPhonicsFlash(canonical) {
    if (!canonical) return null;
    const c = typeof canonical === 'string' ? toCanonicalUnit(canonical) : canonical;
    return c ? `L${c.level}U${c.unit}` : null;
  }

  function toTicTacToe(canonical) {
    if (!canonical) return null;
    const c = typeof canonical === 'string' ? toCanonicalUnit(canonical) : canonical;
    return c ? `Book${c.level}|Unit${c.unit}` : null;
  }

  function toMatchMaker(canonical) {
    if (!canonical) return null;
    const c = typeof canonical === 'string' ? toCanonicalUnit(canonical) : canonical;
    return c ? `SmartPhonics|${c.level}|${c.unit}` : null;
  }

  function toTreasureHunt(canonical) {
    if (!canonical) return null;
    const c = typeof canonical === 'string' ? toCanonicalUnit(canonical) : canonical;
    return c ? `level${c.level}:unit${c.unit}` : null;
  }

  /**
   * For single-select dropdowns (like Treasure Hunt),
   * returns the highest level and unit from an array of units.
   */
  function getHighestUnit(unitsArray) {
    if (!Array.isArray(unitsArray) || unitsArray.length === 0) return null;
    const parsed = unitsArray
      .map(toCanonicalUnit)
      .filter(Boolean);

    if (parsed.length === 0) return null;

    // Sort descending: highest level first, then highest unit
    parsed.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.unit - a.unit;
    });

    return parsed[0];
  }

  // ── 4. Upstash REST API Helper ─────────────────────────────────
  function getCredentials() {
    let url = '';
    let token = '';

    if (typeof localStorage !== 'undefined') {
      url = localStorage.getItem(UPSTASH_URL_KEY) || '';
      token = localStorage.getItem(UPSTASH_TOKEN_KEY) || '';
    }

    if (!url && typeof window !== 'undefined' && window.UPSTASH_CONFIG) {
      url = window.UPSTASH_CONFIG.url || '';
      token = window.UPSTASH_CONFIG.token || '';
    }

    if (url && url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    return { url, token };
  }

  async function fetchUpstash(key) {
    const { url, token } = getCredentials();
    if (!url || !token) return null;

    try {
      const res = await fetch(`${url}/get/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.result === null || data.result === undefined) return null;

      if (typeof data.result === 'string') {
        try {
          return JSON.parse(data.result);
        } catch {
          return data.result;
        }
      }
      return data.result;
    } catch (err) {
      console.warn(`[SharedClassSync] Fetch error for key "${key}":`, err);
      return null;
    }
  }

  async function syncUpstash(key, value) {
    const { url, token } = getCredentials();
    if (!url || !token) return false;

    try {
      const payload = typeof value === 'string' ? value : JSON.stringify(value);
      const res = await fetch(`${url}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: payload
      });
      return res.ok;
    } catch (err) {
      console.warn(`[SharedClassSync] Sync error for key "${key}":`, err);
      return false;
    }
  }

  // ── 5. Unified Profile Loader & Manager ────────────────────────
  /**
   * Merges rosters from shared_player_sets and profiles from shared_class_profiles.
   * Auto-generates initial schedule if missing.
   */
  async function loadAllClasses() {
    let playerSets = {};
    let classProfiles = {};

    // 1. Try local storage first
    if (typeof localStorage !== 'undefined') {
      try {
        const localSets = localStorage.getItem(SHARED_SETS_KEY);
        if (localSets) playerSets = JSON.parse(localSets) || {};
        const localProfiles = localStorage.getItem(SHARED_CLASS_PROFILES_KEY);
        if (localProfiles) classProfiles = JSON.parse(localProfiles) || {};
      } catch (e) {
        console.warn('[SharedClassSync] Error reading local storage:', e);
      }
    }

    // 2. Fetch from Upstash
    const cloudSets = await fetchUpstash(SHARED_SETS_KEY);
    if (cloudSets && typeof cloudSets === 'object') {
      playerSets = cloudSets;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SHARED_SETS_KEY, JSON.stringify(cloudSets));
      }
    }

    const cloudProfiles = await fetchUpstash(SHARED_CLASS_PROFILES_KEY);
    if (cloudProfiles && typeof cloudProfiles === 'object') {
      classProfiles = cloudProfiles;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SHARED_CLASS_PROFILES_KEY, JSON.stringify(cloudProfiles));
      }
    }

    // 3. Ensure every class in playerSets has a valid profile
    let profilesChanged = false;
    for (const className of Object.keys(playerSets)) {
      if (!classProfiles[className]) {
        classProfiles[className] = {
          schedule: parseScheduleFromName(className),
          units: [],
          updatedAt: Date.now()
        };
        profilesChanged = true;
      } else if (!classProfiles[className].schedule) {
        classProfiles[className].schedule = parseScheduleFromName(className);
        profilesChanged = true;
      }
    }

    if (profilesChanged) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SHARED_CLASS_PROFILES_KEY, JSON.stringify(classProfiles));
      }
      syncUpstash(SHARED_CLASS_PROFILES_KEY, classProfiles);
    }

    return { playerSets, classProfiles };
  }

  /**
   * Save units for a specific class and push to Upstash
   */
  async function saveClassUnits(className, canonicalUnitsArray) {
    if (!className) return false;
    let profiles = {};
    if (typeof localStorage !== 'undefined') {
      try {
        profiles = JSON.parse(localStorage.getItem(SHARED_CLASS_PROFILES_KEY) || '{}');
      } catch {}
    }

    if (!profiles[className]) {
      profiles[className] = {
        schedule: parseScheduleFromName(className),
        units: [],
        updatedAt: Date.now()
      };
    }

    profiles[className].units = canonicalUnitsArray;
    profiles[className].updatedAt = Date.now();

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SHARED_CLASS_PROFILES_KEY, JSON.stringify(profiles));
    }
    return syncUpstash(SHARED_CLASS_PROFILES_KEY, profiles);
  }

  return {
    SHARED_SETS_KEY,
    SHARED_ACTIVE_PLAYERS_KEY,
    SHARED_CLASS_PROFILES_KEY,
    UPSTASH_URL_KEY,
    UPSTASH_TOKEN_KEY,
    parseScheduleFromName,
    findActiveScheduledClass,
    toCanonicalUnit,
    toPhonicsFlash,
    toTicTacToe,
    toMatchMaker,
    toTreasureHunt,
    getHighestUnit,
    getCredentials,
    fetchUpstash,
    syncUpstash,
    loadAllClasses,
    saveClassUnits
  };
});
