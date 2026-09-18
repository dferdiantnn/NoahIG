/**
 * NoahIG - Instagram Follower & Unfollower Navigator
 * 100% In-Memory & Client-Side Engine (Zero Server Upload, Zero Credentials)
 */

// Application State
const state = {
  followers: new Map(),
  following: new Map(),
  activeTab: 'unfollowers',
  classificationFilter: 'all', // 'all' | 'friends' | 'official' | 'private'
  officialThreshold: 10000,
  userOverrides: JSON.parse(localStorage.getItem('noahig_custom_overrides') || '{}'),
  searchQuery: '',
  stats: {
    totalFollowers: 0,
    totalFollowing: 0,
    notFollowingBack: [],
    fans: [],
    mutuals: [],
    ratio: '0%',
    splitFriends: 0,
    splitOfficial: 0,
    splitPrivate: 0
  },
  hasAnalyzed: false
};

// Bulletproof Sat-Set Script (100% Safari & Chrome Safe - Zero Native Alert Crash)
const SATSET_SCRIPT = `
(async function extractNoahIG() {
  // 1. Buat floating banner keren di halaman Instagram (Bebas crash Safari alert)
  const existing = document.getElementById('noahig-overlay');
  if (existing) existing.remove();

  const box = document.createElement('div');
  box.id = 'noahig-overlay';
  box.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;background:#090d1a;color:#fff;padding:20px;border-radius:18px;box-shadow:0 20px 50px rgba(0,0,0,0.8);border:2px solid #e1306c;font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:360px;min-width:300px;';
  box.innerHTML = \`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#833ab4,#e1306c,#fd1d1d,#fcaf45);display:flex;align-items:center;justify-content:center;font-size:18px;">⛵</div>
      <div>
        <div style="font-weight:800;font-size:14px;background:linear-gradient(135deg,#c13584,#fd1d1d,#fcaf45);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">NOAHIG SAT-SET v2.1</div>
        <div id="noahig-status" style="font-size:12px;color:#94a3b8;">Menghubungkan ke Instagram...</div>
      </div>
    </div>
    <div id="noahig-progress" style="font-size:12px;color:#38bdf8;margin-bottom:14px;background:#030712;padding:10px;border-radius:10px;font-family:monospace;">Memulai ekstraksi...</div>
    <button id="noahig-btn-copy" style="display:none;width:100%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:10px;border-radius:12px;font-weight:bold;cursor:pointer;font-size:13px;">📋 Salin Data ke NoahIG</button>
  \`;
  document.body.appendChild(box);

  const statusEl = document.getElementById('noahig-status');
  const progressEl = document.getElementById('noahig-progress');
  const copyBtn = document.getElementById('noahig-btn-copy');

  const ds_user_id = document.cookie.match(/ds_user_id=([0-9]+)/)?.[1];
  const csrfToken = document.cookie.match(/csrftoken=([a-zA-Z0-9_-]+)/)?.[1] || '';

  if (!ds_user_id) {
    statusEl.textContent = '❌ Belum login!';
    progressEl.textContent = 'Silakan login dulu di tab Instagram ini.';
    return;
  }

  const followers = [];
  const following = [];

  const headers = {
    'x-ig-app-id': '936619743392459',
    'x-asbd-id': '129477',
    'x-csrftoken': csrfToken,
    'x-requested-with': 'XMLHttpRequest'
  };

  async function fetchRest(endpoint, targetArray, label) {
    let maxId = null;
    let count = 0;
    statusEl.textContent = \`Mengambil \${label}...\`;

    while (true) {
      let url = \`https://www.instagram.com/api/v1/friendships/\${ds_user_id}/\${endpoint}/?count=50\`;
      if (maxId) url += \`&max_id=\${encodeURIComponent(maxId)}\`;

      try {
        const res = await fetch(url, { headers, credentials: 'include' });
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        const data = await res.json();
        
        const users = data.users || [];
        for (const u of users) {
          targetArray.push({
            username: u.username,
            href: \`https://www.instagram.com/\${u.username}\`,
            full_name: u.full_name || '',
            is_verified: !!u.is_verified,
            is_private: !!u.is_private,
            profile_pic_url: u.profile_pic_url || '',
            follower_count: typeof u.follower_count === 'number' ? u.follower_count : null,
            timestamp: null
          });
          count++;
        }

        progressEl.textContent = \`⚓ \${label}: \${count} akun dimuat...\`;
        if (!data.next_max_id || users.length === 0) break;
        maxId = data.next_max_id;
        await new Promise(r => setTimeout(r, 350));
      } catch (err) {
        console.warn(err);
        break;
      }
    }
  }

  await fetchRest('following', following, 'Following');
  await fetchRest('followers', followers, 'Followers');

  // Deteksi akun yang tidak follow back
  const followersSet = new Set(followers.map(u => (u.username || '').toLowerCase()));
  const unfollowers = following.filter(u => !followersSet.has((u.username || '').toLowerCase()));

  // Cek followers asli (pengikut si akun) untuk akun yang tidak follow back
  if (unfollowers.length > 0) {
    statusEl.textContent = 'Menganalisis pengikut unfollower...';
    let checked = 0;
    
    for (const u of unfollowers) {
      checked++;
      progressEl.innerHTML = \`🔍 Cek Pengikut (\${checked}/\${unfollowers.length}):<br><b style="color:#f472b6;">@\${u.username}</b>\`;

      // Jika akun sudah centang biru (verified), sudah pasti official!
      if (u.is_verified) {
        if (!u.follower_count) u.follower_count = 1000000;
        continue;
      }

      // Jika akun privat/gembok, pasti akun personal (<10k)
      if (u.is_private) {
        if (!u.follower_count) u.follower_count = 500;
        continue;
      }

      // Ambil angka pengikut asli dari profile endpoint
      try {
        const uRes = await fetch(\`https://www.instagram.com/api/v1/users/web_profile_info/?username=\${encodeURIComponent(u.username)}\`, { headers, credentials: 'include' });
        if (uRes.ok) {
          const uJson = await uRes.json();
          const userObj = uJson?.data?.user;
          if (userObj) {
            if (typeof userObj.edge_followed_by?.count === 'number') {
              u.follower_count = userObj.edge_followed_by.count;
            }
            if (userObj.is_verified) u.is_verified = true;
            if (userObj.profile_pic_url) u.profile_pic_url = userObj.profile_pic_url;
            if (userObj.full_name) u.full_name = userObj.full_name;
          }
        }
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        // Safe continue
      }
    }
  }

  const payload = {
    source: 'NoahIG_SatSet',
    timestamp: Date.now(),
    following,
    followers
  };

  const payloadStr = JSON.stringify(payload);

  statusEl.textContent = '✅ Selesai Sat-Set v2.0!';
  progressEl.innerHTML = \`Following: <b>\${following.length}</b> &bull; Followers: <b>\${followers.length}</b><br>Tidak Follback: <b>\${unfollowers.length}</b> akun<br><span style="color:#10b981;">Data siap dimasukkan ke NoahIG!</span>\`;
  
  try {
    await navigator.clipboard.writeText(payloadStr);
    progressEl.innerHTML += '<br>✨ <i>Otomatis tersalin ke Clipboard!</i>';
  } catch (e) {}

  copyBtn.style.display = 'block';
  copyBtn.onclick = async () => {
    await navigator.clipboard.writeText(payloadStr);
    copyBtn.textContent = '✅ Berhasil Disalin!';
  };
})();
`.trim();

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', () => {
  initDropzone();
  initTabs();
  initSearch();
  initActions();
  initDemoButton();
  initSatSetFeature();
  lucide.createIcons();
});

/**
 * Initialize Sat-Set Feature (Script Generator & Paste Parser)
 */
function initSatSetFeature() {
  const satsetScriptCode = document.getElementById('satset-script-code');
  if (satsetScriptCode) {
    satsetScriptCode.textContent = SATSET_SCRIPT;
  }

  const copyScriptBtn = document.getElementById('btn-copy-satset-script');
  if (copyScriptBtn) {
    copyScriptBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(SATSET_SCRIPT);
        showToast('📋 Script Sat-Set disalin! Buka Console di Instagram.', 'success');
      } catch (e) {
        showToast('❌ Gagal menyalin script', 'error');
      }
    });
  }

  const pasteDataBtn = document.getElementById('btn-paste-satset-data');
  if (pasteDataBtn) {
    pasteDataBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (!text || (!text.includes('followers') && !text.includes('following'))) {
          showToast('⚠️ Clipboard belum berisi data. Jalankan script di Instagram dulu!', 'warning');
          return;
        }

        const json = JSON.parse(text);
        if (json.source === 'NoahIG_SatSet' || (json.followers && json.following)) {
          state.followers.clear();
          state.following.clear();

          if (Array.isArray(json.followers)) {
            json.followers.forEach(u => state.followers.set(u.username, u));
          }
          if (Array.isArray(json.following)) {
            json.following.forEach(u => state.following.set(u.username, u));
          }

          updateFileBadges();
          runAnalysis();
          toggleSatSetModal(false);
          showToast(`⚡ Sukses Sat-Set! ${state.following.size} following & ${state.followers.size} followers termuat.`, 'success');
        } else {
          showToast('⚠️ Format data tidak dikenali.', 'warning');
        }
      } catch (e) {
        showToast('❌ Gagal membaca clipboard: ' + e.message, 'error');
      }
    });
  }
}

/**
 * Extract Instagram User data from various JSON schemas (Meta 2020-2026)
 */
function parseInstagramJSON(jsonObj) {
  const users = [];

  const extractItem = (item) => {
    if (!item) return null;
    let username = '';
    let href = '';
    let timestamp = null;

    if (item.string_list_data && Array.isArray(item.string_list_data) && item.string_list_data.length > 0) {
      const data = item.string_list_data[0];
      username = data.value || item.title || '';
      href = data.href || `https://www.instagram.com/${username}`;
      timestamp = data.timestamp || null;
    } else if (item.value) {
      username = item.value;
      href = item.href || `https://www.instagram.com/${username}`;
      timestamp = item.timestamp || null;
    } else if (item.title) {
      username = item.title;
      href = `https://www.instagram.com/${username}`;
    } else if (typeof item === 'string') {
      username = item;
      href = `https://www.instagram.com/${username}`;
    }

    username = username.trim().toLowerCase().replace(/^@/, '');
    if (username) {
      const is_verified = !!item.is_verified;
      const is_private = !!item.is_private;
      const profile_pic_url = item.profile_pic_url || '';
      const full_name = item.full_name || '';
      const follower_count = typeof item.follower_count === 'number' ? item.follower_count : null;
      return { username, href, timestamp, is_verified, is_private, profile_pic_url, full_name, follower_count };
    }
    return null;
  };

  if (Array.isArray(jsonObj)) {
    jsonObj.forEach(entry => {
      const parsed = extractItem(entry);
      if (parsed) users.push(parsed);
    });
  } else if (jsonObj.relationships_following && Array.isArray(jsonObj.relationships_following)) {
    jsonObj.relationships_following.forEach(entry => {
      const parsed = extractItem(entry);
      if (parsed) users.push(parsed);
    });
  } else if (jsonObj.followers && Array.isArray(jsonObj.followers)) {
    jsonObj.followers.forEach(entry => {
      const parsed = extractItem(entry);
      if (parsed) users.push(parsed);
    });
  } else {
    for (const key of Object.keys(jsonObj)) {
      if (Array.isArray(jsonObj[key])) {
        jsonObj[key].forEach(entry => {
          const parsed = extractItem(entry);
          if (parsed) users.push(parsed);
        });
      }
    }
  }

  return users;
}

/**
 * Handle ZIP Archive from Instagram
 */
async function handleZipFile(file) {
  try {
    showToast('⚓ Mengarungi arsip ZIP Instagram...', 'info');
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);

    let followersFound = false;
    let followingFound = false;

    for (const relativePath of Object.keys(contents.files)) {
      const lower = relativePath.toLowerCase();
      
      if ((lower.includes('followers_') && lower.endsWith('.json')) || lower.endsWith('followers.json')) {
        const text = await contents.files[relativePath].async('string');
        try {
          const json = JSON.parse(text);
          const parsed = parseInstagramJSON(json);
          parsed.forEach(u => state.followers.set(u.username, u));
          followersFound = true;
        } catch (e) {
          console.warn('Gagal parse file followers:', relativePath, e);
        }
      }

      if (lower.endsWith('following.json') || (lower.includes('following') && lower.endsWith('.json'))) {
        const text = await contents.files[relativePath].async('string');
        try {
          const json = JSON.parse(text);
          const parsed = parseInstagramJSON(json);
          parsed.forEach(u => state.following.set(u.username, u));
          followingFound = true;
        } catch (e) {
          console.warn('Gagal parse file following:', relativePath, e);
        }
      }
    }

    if (followersFound || followingFound) {
      updateFileBadges();
      if (state.followers.size > 0 && state.following.size > 0) {
        runAnalysis();
      } else {
        showToast('⚠️ File ZIP termuat sebagian. Pastikan ada followers dan following.', 'warning');
      }
    } else {
      showToast('❌ Tidak menemukan file JSON followers/following di dalam ZIP.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('❌ Gagal membaca file ZIP: ' + err.message, 'error');
  }
}

/**
 * Process Raw Files (JSON or ZIP)
 */
async function processFiles(files) {
  let hasZip = false;

  for (const file of files) {
    if (file.name.endsWith('.zip')) {
      hasZip = true;
      await handleZipFile(file);
      break;
    }
  }

  if (hasZip) return;

  for (const file of files) {
    const filename = file.name.toLowerCase();
    if (!filename.endsWith('.json')) continue;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = parseInstagramJSON(json);

      if (filename.includes('follower')) {
        parsed.forEach(u => state.followers.set(u.username, u));
        showToast(`🌊 ${parsed.length} data Pengikut berhasil dimuat!`, 'success');
      } else if (filename.includes('following')) {
        parsed.forEach(u => state.following.set(u.username, u));
        showToast(`⛵ ${parsed.length} data Mengikuti berhasil dimuat!`, 'success');
      } else {
        if (json.relationships_following) {
          parsed.forEach(u => state.following.set(u.username, u));
          showToast(`⛵ ${parsed.length} data Mengikuti terdeteksi!`, 'success');
        } else {
          parsed.forEach(u => state.followers.set(u.username, u));
          showToast(`🌊 ${parsed.length} data Pengikut terdeteksi!`, 'success');
        }
      }
    } catch (e) {
      console.error('Error reading JSON file', e);
      showToast(`❌ Gagal membaca ${file.name}: format tidak valid`, 'error');
    }
  }

  updateFileBadges();

  if (state.followers.size > 0 && state.following.size > 0) {
    runAnalysis();
  }
}

/**
 * Update UI indicators for uploaded files
 */
function updateFileBadges() {
  const followersBadge = document.getElementById('badge-followers-status');
  const followingBadge = document.getElementById('badge-following-status');
  const analyzeBtn = document.getElementById('btn-run-analysis');

  if (followersBadge) {
    if (state.followers.size > 0) {
      followersBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      followersBadge.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Followers: ${state.followers.size} akun`;
    } else {
      followersBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700';
      followersBadge.innerHTML = `<i data-lucide="circle-dashed" class="w-3.5 h-3.5"></i> Belum ada followers`;
    }
  }

  if (followingBadge) {
    if (state.following.size > 0) {
      followingBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      followingBadge.innerHTML = `<i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Following: ${state.following.size} akun`;
    } else {
      followingBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700';
      followingBadge.innerHTML = `<i data-lucide="circle-dashed" class="w-3.5 h-3.5"></i> Belum ada following`;
    }
  }

  if (analyzeBtn) {
    if (state.followers.size > 0 && state.following.size > 0) {
      analyzeBtn.classList.remove('opacity-50', 'pointer-events-none');
    }
  }

  lucide.createIcons();
}

/**
 * Smart Account Classification Helper (v2.0)
 */
function getUserClassification(user) {
  if (!user) return 'friend';
  const uname = (user.username || '').toLowerCase();

  // 1. User manual override (saved in localStorage)
  if (state.userOverrides && state.userOverrides[uname]) {
    return state.userOverrides[uname]; // 'official' or 'friend'
  }

  // 2. Verified accounts (centang biru) are guaranteed official / public figures / brands
  if (user.is_verified) {
    return 'official';
  }

  // 3. Known follower count comparison
  if (typeof user.follower_count === 'number' && user.follower_count > 0) {
    return user.follower_count >= state.officialThreshold ? 'official' : 'friend';
  }

  // 4. Private accounts are virtually always personal/friend accounts
  if (user.is_private) {
    return 'friend';
  }

  // 5. Default unverified accounts without known count are personal/friends
  return 'friend';
}

function calculateClassificationStats() {
  const unfollowers = state.stats.notFollowingBack || [];
  let friendsCount = 0;
  let officialCount = 0;
  let privateCount = 0;

  unfollowers.forEach(u => {
    const cls = getUserClassification(u);
    if (cls === 'official') officialCount++;
    else friendsCount++;

    if (u.is_private) privateCount++;
  });

  state.stats.splitFriends = friendsCount;
  state.stats.splitOfficial = officialCount;
  state.stats.splitPrivate = privateCount;
}

window.toggleUserOverride = function(username) {
  if (!username) return;
  const uname = username.toLowerCase();
  const user = state.following.get(uname) || state.followers.get(uname) || { username: uname };
  const current = getUserClassification(user);

  if (current === 'official') {
    state.userOverrides[uname] = 'friend';
    showToast(`👥 @${username} dipindahkan ke kelompok Teman!`, 'success');
  } else {
    state.userOverrides[uname] = 'official';
    showToast(`🏢 @${username} dipindahkan ke kelompok Official!`, 'success');
  }

  localStorage.setItem('noahig_custom_overrides', JSON.stringify(state.userOverrides));
  calculateClassificationStats();
  renderStats();
  renderList();
};

window.setClassificationFilter = function(filterType) {
  state.classificationFilter = filterType;

  const btnMap = {
    all: document.getElementById('filter-btn-all'),
    friends: document.getElementById('filter-btn-friends'),
    official: document.getElementById('filter-btn-official'),
    private: document.getElementById('filter-btn-private')
  };

  Object.entries(btnMap).forEach(([key, btn]) => {
    if (!btn) return;
    if (key === filterType) {
      btn.className = 'class-filter-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-sky-500/20 text-white border border-pink-500/40 shadow-sm';
    } else {
      btn.className = 'class-filter-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent transition-all';
    }
  });

  renderList();
};

window.changeThreshold = function(val) {
  state.officialThreshold = parseInt(val, 10) || 10000;
  showToast(`⚙️ Ambang batas official: ${formatCompactNumber(state.officialThreshold)}`, 'info');
  calculateClassificationStats();
  renderStats();
  renderList();
};

function formatCompactNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
  return num.toString();
}

function formatFollowerCount(count) {
  if (typeof count !== 'number' || isNaN(count) || count <= 0) return '';
  if (count >= 1000000) {
    const val = (count / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 });
    return `${val} jt pengikut`;
  }
  if (count >= 1000) {
    const val = (count / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 });
    return `${val} rb pengikut`;
  }
  return `${count} pengikut`;
}

/**
 * Execute Relationship Calculation
 */
function runAnalysis() {
  const notFollowingBack = [];
  const mutuals = [];
  const fans = [];

  for (const [username, userObj] of state.following.entries()) {
    if (!state.followers.has(username)) {
      notFollowingBack.push(userObj);
    } else {
      mutuals.push(userObj);
    }
  }

  for (const [username, userObj] of state.followers.entries()) {
    if (!state.following.has(username)) {
      fans.push(userObj);
    }
  }

  const ratioVal = state.following.size > 0 
    ? ((mutuals.length / state.following.size) * 100).toFixed(1) + '%' 
    : '0%';

  state.stats = {
    totalFollowers: state.followers.size,
    totalFollowing: state.following.size,
    notFollowingBack,
    fans,
    mutuals,
    ratio: ratioVal,
    splitFriends: 0,
    splitOfficial: 0,
    splitPrivate: 0
  };

  state.hasAnalyzed = true;

  calculateClassificationStats();
  renderStats();
  renderList();
  showResultsSection();

  showToast(`🎯 Analisis Selesai! ${notFollowingBack.length} akun tidak follback (${state.stats.splitFriends} teman, ${state.stats.splitOfficial} official).`, 'success');
  
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.7 },
      colors: ['#c13584', '#e1306c', '#0ea5e9', '#f59e0b']
    });
  }
}

/**
 * Render Analytics Metrics
 */
function renderStats() {
  const unfollowersCountEl = document.getElementById('stat-unfollowers-count');
  const fansCountEl = document.getElementById('stat-fans-count');
  const mutualsCountEl = document.getElementById('stat-mutuals-count');
  const followingCountEl = document.getElementById('stat-following-count');
  const followersCountEl = document.getElementById('stat-followers-count');
  const ratioEl = document.getElementById('stat-ratio');

  if (unfollowersCountEl) unfollowersCountEl.textContent = state.stats.notFollowingBack.length;
  if (fansCountEl) fansCountEl.textContent = state.stats.fans.length;
  if (mutualsCountEl) mutualsCountEl.textContent = state.stats.mutuals.length;
  if (followingCountEl) followingCountEl.textContent = state.stats.totalFollowing;
  if (followersCountEl) followersCountEl.textContent = state.stats.totalFollowers;
  if (ratioEl) ratioEl.textContent = state.stats.ratio;

  const tabUnfollowersCount = document.getElementById('tab-count-unfollowers');
  const tabFansCount = document.getElementById('tab-count-fans');
  const tabMutualsCount = document.getElementById('tab-count-mutuals');

  if (tabUnfollowersCount) tabUnfollowersCount.textContent = state.stats.notFollowingBack.length;
  if (tabFansCount) tabFansCount.textContent = state.stats.fans.length;
  if (tabMutualsCount) tabMutualsCount.textContent = state.stats.mutuals.length;

  // v2.0 Friends vs Official split
  const splitFriendsEl = document.getElementById('stat-split-friends');
  const splitOfficialEl = document.getElementById('stat-split-official');
  if (splitFriendsEl) splitFriendsEl.textContent = `${state.stats.splitFriends} Teman`;
  if (splitOfficialEl) splitOfficialEl.textContent = `${state.stats.splitOfficial} Official`;

  // Sub-filter counts
  const countAllEl = document.getElementById('filter-count-all');
  const countFriendsEl = document.getElementById('filter-count-friends');
  const countOfficialEl = document.getElementById('filter-count-official');
  const countPrivateEl = document.getElementById('filter-count-private');

  if (countAllEl) countAllEl.textContent = state.stats.notFollowingBack.length;
  if (countFriendsEl) countFriendsEl.textContent = state.stats.splitFriends;
  if (countOfficialEl) countOfficialEl.textContent = state.stats.splitOfficial;
  if (countPrivateEl) countPrivateEl.textContent = state.stats.splitPrivate;
}

/**
 * Render Current Tab List with Filtering
 */
function renderList() {
  const container = document.getElementById('users-grid');
  const emptyState = document.getElementById('empty-state');
  const currentTabTitle = document.getElementById('current-tab-title');
  const currentTabDesc = document.getElementById('current-tab-desc');
  const currentExportCount = document.getElementById('current-export-count');
  const classFilterBar = document.getElementById('classification-filter-bar');

  if (!container) return;

  let currentList = [];
  let badgeClass = '';
  let badgeText = '';

  if (state.activeTab === 'unfollowers') {
    currentList = state.stats.notFollowingBack;
    badgeClass = 'badge-unfollower';
    badgeText = 'Tidak Follback';
    if (currentTabTitle) currentTabTitle.innerHTML = `<i data-lucide="user-x" class="w-5 h-5 text-rose-400"></i> Akun Tidak Follow Back`;
    if (currentTabDesc) currentTabDesc.textContent = 'Daftar akun yang kamu ikuti, tetapi mereka tidak mengikuti balik bahteramu.';
    if (classFilterBar) classFilterBar.classList.remove('hidden');
  } else if (state.activeTab === 'fans') {
    currentList = state.stats.fans;
    badgeClass = 'badge-fan';
    badgeText = 'Penggemar (Fan)';
    if (currentTabTitle) currentTabTitle.innerHTML = `<i data-lucide="heart" class="w-5 h-5 text-amber-400"></i> Penumpang Setia (Fans)`;
    if (currentTabDesc) currentTabDesc.textContent = 'Daftar akun yang mengikuti kamu, tetapi belum kamu ikuti balik.';
    if (classFilterBar) classFilterBar.classList.remove('hidden');
  } else if (state.activeTab === 'mutuals') {
    currentList = state.stats.mutuals;
    badgeClass = 'badge-mutual';
    badgeText = 'Saling Follow';
    if (currentTabTitle) currentTabTitle.innerHTML = `<i data-lucide="users" class="w-5 h-5 text-emerald-400"></i> Sahabat Sekoci (Mutuals)`;
    if (currentTabDesc) currentTabDesc.textContent = 'Daftar akun yang saling mengikuti secara harmonis.';
    if (classFilterBar) classFilterBar.classList.remove('hidden');
  }

  // 1. Classification Sub-Filter (v2.0)
  let classFiltered = currentList;
  if (state.classificationFilter === 'friends') {
    classFiltered = currentList.filter(u => getUserClassification(u) === 'friend');
  } else if (state.classificationFilter === 'official') {
    classFiltered = currentList.filter(u => getUserClassification(u) === 'official');
  } else if (state.classificationFilter === 'private') {
    classFiltered = currentList.filter(u => !!u.is_private);
  }

  // 2. Search Query Filter
  const query = state.searchQuery.trim().toLowerCase();
  const filtered = query
    ? classFiltered.filter(item => item.username.toLowerCase().includes(query) || (item.full_name && item.full_name.toLowerCase().includes(query)))
    : classFiltered;

  if (currentExportCount) currentExportCount.textContent = `${filtered.length} Akun`;

  container.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    container.classList.add('hidden');
    lucide.createIcons();
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.classList.remove('hidden');

  const fragment = document.createDocumentFragment();

  filtered.forEach((user) => {
    const card = document.createElement('div');
    card.className = 'glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3.5 group relative overflow-hidden transition-all duration-200 border border-slate-800/80 hover:border-pink-500/40';
    
    const classification = getUserClassification(user);
    const isOfficial = classification === 'official';

    let timeText = '';
    if (user.timestamp) {
      const date = new Date(user.timestamp * 1000);
      timeText = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    let followersText = '';
    if (typeof user.follower_count === 'number' && user.follower_count > 0) {
      followersText = formatFollowerCount(user.follower_count);
    }

    const avatarHtml = user.profile_pic_url
      ? `<img src="${user.profile_pic_url}" alt="${user.username}" class="w-full h-full rounded-full object-cover" onerror="this.onerror=null;this.parentNode.innerHTML='<div class=\\'w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-sm text-slate-200 uppercase\\'>${user.username.charAt(0)}</div>';">`
      : `<div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-sm text-slate-200 uppercase">${user.username.charAt(0)}</div>`;

    const verifiedSvg = user.is_verified
      ? `<span title="Official Terverifikasi (Centang Biru)" class="inline-flex text-sky-400 flex-shrink-0"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5l-4-4 1.41-1.41L11 13.67l6.59-6.59L19 8.5l-8 8z"/></svg></span>`
      : '';

    const classBadgeHtml = isOfficial
      ? `<span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold badge-official flex items-center gap-1"><i data-lucide="badge-check" class="w-3.5 h-3.5 text-pink-400"></i> Official (&gt;${formatCompactNumber(state.officialThreshold)})</span>`
      : `<span class="text-[11px] px-2.5 py-0.5 rounded-full font-semibold badge-friend flex items-center gap-1"><i data-lucide="user-check" class="w-3.5 h-3.5 text-sky-400"></i> Teman (&lt;${formatCompactNumber(state.officialThreshold)})</span>`;

    const privateBadgeHtml = user.is_private
      ? `<span class="text-[11px] px-2.5 py-0.5 rounded-full font-semibold badge-private flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3 text-emerald-400"></i> Gembok</span>`
      : '';

    const toggleBtnHtml = isOfficial
      ? `<button onclick="toggleUserOverride('${user.username}')" title="Pindahkan ke kelompok Teman" class="text-[11px] px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5 transition-all font-semibold">
          <i data-lucide="user-check" class="w-3.5 h-3.5 text-sky-400"></i>
          <span>Jadikan Teman</span>
        </button>`
      : `<button onclick="toggleUserOverride('${user.username}')" title="Pindahkan ke kelompok Official" class="text-[11px] px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1.5 transition-all font-semibold">
          <i data-lucide="badge-check" class="w-3.5 h-3.5 text-pink-400"></i>
          <span>Jadikan Official</span>
        </button>`;

    card.innerHTML = `
      <div class="flex items-start gap-3.5 min-w-0">
        <div class="w-12 h-12 rounded-full p-[2px] ig-gradient-bg flex-shrink-0 overflow-hidden shadow-md">
          ${avatarHtml}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-extrabold text-slate-100 text-base hover:text-pink-400 transition-colors cursor-pointer break-all" onclick="window.open('${user.href}', '_blank')">
              @${user.username}
            </span>
            ${verifiedSvg}
            ${user.full_name ? `<span class="text-xs text-slate-400 font-medium break-words">(${user.full_name})</span>` : ''}
          </div>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <span class="text-[11px] px-2.5 py-0.5 rounded-full font-medium ${badgeClass}">${badgeText}</span>
            ${classBadgeHtml}
            ${privateBadgeHtml}
            ${followersText ? `<span class="text-[11px] text-amber-300 font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-1"><i data-lucide="users" class="w-3 h-3 text-amber-400"></i> ${followersText}</span>` : ''}
            ${timeText ? `<span class="text-[11px] text-slate-500 font-mono">${timeText}</span>` : ''}
          </div>
        </div>
      </div>

      <!-- Card Bottom Footer (Never squished) -->
      <div class="flex items-center justify-between gap-2 pt-3 mt-1 border-t border-slate-800/80 flex-wrap">
        <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Kategori:</span>
          <strong class="${isOfficial ? 'text-pink-400 font-bold' : 'text-sky-300 font-bold'}">${isOfficial ? 'Official / Artis' : 'Akun Teman'}</strong>
        </div>
        <div class="flex items-center gap-2">
          ${toggleBtnHtml}
          <button onclick="copyUsername('${user.username}', this)" title="Salin ID" class="p-2 rounded-xl bg-slate-800/80 hover:bg-pink-500/20 text-slate-400 hover:text-pink-300 border border-slate-700/60 hover:border-pink-500/40 transition-all flex items-center gap-1 text-xs">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span class="text-[11px] hidden sm:inline">Salin</span>
          </button>
          <a href="${user.href}" target="_blank" rel="noopener noreferrer" title="Buka Profil Instagram" class="p-2 rounded-xl bg-slate-800/80 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/40 transition-all flex items-center gap-1 text-xs">
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            <span class="text-[11px] hidden sm:inline">Buka IG</span>
          </a>
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
  lucide.createIcons();
}

/**
 * Show results dashboard section with smooth scroll
 */
function showResultsSection() {
  const resultsSection = document.getElementById('results-section');
  if (resultsSection) {
    resultsSection.classList.remove('hidden');
    const yOffset = -90;
    const y = resultsSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }
}

/**
 * Copy Single Username to Clipboard
 */
window.copyUsername = async function(username, btnEl) {
  try {
    await navigator.clipboard.writeText(username);
    showToast(`📋 Berhasil salin: @${username}`, 'success');
    if (btnEl) {
      const originalHTML = btnEl.innerHTML;
      btnEl.innerHTML = `<i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>`;
      lucide.createIcons();
      setTimeout(() => {
        btnEl.innerHTML = originalHTML;
        lucide.createIcons();
      }, 1500);
    }
  } catch (err) {
    showToast('❌ Gagal menyalin ID ke clipboard', 'error');
  }
};

/**
 * Copy All Current IDs to Clipboard as Clean Text
 */
window.copyAllCurrentIDs = async function() {
  let list = [];
  if (state.activeTab === 'unfollowers') list = state.stats.notFollowingBack;
  else if (state.activeTab === 'fans') list = state.stats.fans;
  else if (state.activeTab === 'mutuals') list = state.stats.mutuals;

  if (state.classificationFilter === 'friends') {
    list = list.filter(u => getUserClassification(u) === 'friend');
  } else if (state.classificationFilter === 'official') {
    list = list.filter(u => getUserClassification(u) === 'official');
  } else if (state.classificationFilter === 'private') {
    list = list.filter(u => !!u.is_private);
  }

  const query = state.searchQuery.trim().toLowerCase();
  const filtered = query ? list.filter(u => u.username.toLowerCase().includes(query)) : list;

  if (filtered.length === 0) {
    showToast('⚠️ Tidak ada ID untuk disalin.', 'warning');
    return;
  }

  const textToCopy = filtered.map(u => u.username).join('\n');

  try {
    await navigator.clipboard.writeText(textToCopy);
    showToast(`✨ Berhasil salin ${filtered.length} ID akun ke clipboard!`, 'success');
  } catch (e) {
    showToast('❌ Gagal salin ke clipboard', 'error');
  }
};

/**
 * Export as Plain .TXT file (Zero heavy storage, pure IDs text)
 */
window.downloadTxtFile = function() {
  let list = [];
  let filenamePrefix = 'noahig_unfollowers';

  if (state.activeTab === 'unfollowers') {
    list = state.stats.notFollowingBack;
    filenamePrefix = 'noahig_unfollowers';
  } else if (state.activeTab === 'fans') {
    list = state.stats.fans;
    filenamePrefix = 'noahig_fans';
  } else if (state.activeTab === 'mutuals') {
    list = state.stats.mutuals;
    filenamePrefix = 'noahig_mutuals';
  }

  if (state.classificationFilter === 'friends') {
    list = list.filter(u => getUserClassification(u) === 'friend');
    filenamePrefix += '_teman';
  } else if (state.classificationFilter === 'official') {
    list = list.filter(u => getUserClassification(u) === 'official');
    filenamePrefix += '_official';
  } else if (state.classificationFilter === 'private') {
    list = list.filter(u => !!u.is_private);
    filenamePrefix += '_private';
  }

  const query = state.searchQuery.trim().toLowerCase();
  const filtered = query ? list.filter(u => u.username.toLowerCase().includes(query)) : list;

  if (filtered.length === 0) {
    showToast('⚠️ Daftar kosong, tidak ada ID untuk diunduh.', 'warning');
    return;
  }

  const fileContent = `# NoahIG - Instagram ID Export\n# Kategori: ${state.activeTab}\n# Total: ${filtered.length} akun\n# Tanggal: ${new Date().toLocaleString('id-ID')}\n# ----------------------------------------\n` +
    filtered.map(u => u.username).join('\n');

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`📥 File ${a.download} berhasil diunduh!`, 'success');
};

/**
 * Initialize Dropzone and File Pickers
 */
function initDropzone() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.add('dropzone-active'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, () => dropzone.classList.remove('dropzone-active'), false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  });
}

/**
 * Initialize Tabs Navigation
 */
function initTabs() {
  const tabs = ['unfollowers', 'fans', 'mutuals'];

  tabs.forEach(tabKey => {
    const btn = document.getElementById(`tab-btn-${tabKey}`);
    if (btn) {
      btn.addEventListener('click', () => {
        state.activeTab = tabKey;
        tabs.forEach(k => {
          const b = document.getElementById(`tab-btn-${k}`);
          if (b) {
            if (k === tabKey) {
              b.className = 'tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-sky-500/20 text-white border border-pink-500/40 shadow-lg shadow-pink-500/10';
            } else {
              b.className = 'tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent transition-all';
            }
          }
        });

        renderList();
      });
    }
  });
}

/**
 * Initialize Search Input
 */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (clearBtn) {
        if (state.searchQuery.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }
      renderList();
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearBtn.classList.add('hidden');
      renderList();
    });
  }
}

/**
 * Initialize Quick Action Buttons
 */
function initActions() {
  const runAnalysisBtn = document.getElementById('btn-run-analysis');
  if (runAnalysisBtn) {
    runAnalysisBtn.addEventListener('click', () => {
      if (state.followers.size > 0 && state.following.size > 0) {
        runAnalysis();
      } else {
        showToast('⚠️ Silakan unggah kedua file (followers & following) terlebih dahulu.', 'warning');
      }
    });
  }

  const resetBtn = document.getElementById('btn-reset-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.followers.clear();
      state.following.clear();
      state.hasAnalyzed = false;
      updateFileBadges();
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) resultsSection.classList.add('hidden');
      showToast('🔄 Data navigasi berhasil di-reset.', 'info');
    });
  }
}

/**
 * Load Demo / Simulation Data
 */
function initDemoButton() {
  const demoBtn = document.getElementById('btn-load-demo');
  if (!demoBtn) return;

  demoBtn.addEventListener('click', () => {
    state.followers.clear();
    state.following.clear();

    const sampleFollowing = [
      // Akun Official / Selebgram / Brand (> 10k & Verified)
      { username: 'hokben_id', full_name: 'HokBen', is_verified: true, follower_count: 1200000, is_private: false },
      { username: 'cristiano', full_name: 'Cristiano Ronaldo', is_verified: true, follower_count: 640000000, is_private: false },
      { username: 'apple', full_name: 'Apple', is_verified: true, follower_count: 32000000, is_private: false },
      { username: 'folkative', full_name: 'FOLKATIVE™', is_verified: true, follower_count: 4200000, is_private: false },
      { username: 'techcrunch', full_name: 'TechCrunch', is_verified: true, follower_count: 1800000, is_private: false },
      
      // Akun Teman / Personal (< 10k & Private)
      { username: 'kokopcoffee', full_name: 'KOKOP COFFEE', is_verified: false, follower_count: 31, is_private: false },
      { username: 'budi_santoso', full_name: 'Budi Santoso', is_verified: false, follower_count: 420, is_private: true },
      { username: 'citra.kartika', full_name: 'Citra Kartika', is_verified: false, follower_count: 680, is_private: true },
      { username: 'dimas.kurniawan', full_name: 'Dimas K.', is_verified: false, follower_count: 310, is_private: true },
      { username: 'kopi_senja_jkt', full_name: 'Kopi Senja Jakarta', is_verified: false, follower_count: 8500, is_private: false },
      
      // Mutuals
      { username: 'cyber_sailor', full_name: 'Cyber Sailor', is_verified: false, follower_count: 150, is_private: false },
      { username: 'noah_ocean_rider', full_name: 'Noah Rider', is_verified: false, follower_count: 320, is_private: false }
    ];

    const sampleFollowers = [
      { username: 'cyber_sailor', full_name: 'Cyber Sailor', is_verified: false, follower_count: 150, is_private: false },
      { username: 'noah_ocean_rider', full_name: 'Noah Rider', is_verified: false, follower_count: 320, is_private: false },
      { username: 'fan_setia_01', full_name: 'Fans Noah 01', is_verified: false, follower_count: 80, is_private: false },
      { username: 'kawan_lama_bandung', full_name: 'Kawan Lama', is_verified: false, follower_count: 610, is_private: true }
    ];

    sampleFollowing.forEach(u => {
      state.following.set(u.username, {
        username: u.username,
        full_name: u.full_name,
        is_verified: u.is_verified,
        is_private: u.is_private,
        follower_count: u.follower_count,
        href: `https://www.instagram.com/${u.username}`,
        timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 30)
      });
    });

    sampleFollowers.forEach(u => {
      state.followers.set(u.username, {
        username: u.username,
        full_name: u.full_name,
        is_verified: u.is_verified,
        is_private: u.is_private,
        follower_count: u.follower_count,
        href: `https://www.instagram.com/${u.username}`,
        timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 30)
      });
    });

    updateFileBadges();
    runAnalysis();
    showToast('🚀 Demo NoahIG v2.1 berhasil dimuat! HokBen (Official >10k) & Kokop Coffee (Teman <10k)', 'success');
  });
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let iconName = 'info';
  let borderClass = 'border-sky-500/40 bg-slate-900/90 text-sky-200';

  if (type === 'success') {
    iconName = 'check-circle-2';
    borderClass = 'border-emerald-500/40 bg-slate-900/90 text-emerald-200';
  } else if (type === 'warning') {
    iconName = 'alert-triangle';
    borderClass = 'border-amber-500/40 bg-slate-900/90 text-amber-200';
  } else if (type === 'error') {
    iconName = 'x-circle';
    borderClass = 'border-rose-500/40 bg-slate-900/90 text-rose-200';
  }

  toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-sm font-medium transition-all duration-300 transform translate-y-4 opacity-0 ${borderClass}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

/**
 * Modals
 */
window.toggleGuideModal = function(show = true) {
  const modal = document.getElementById('guide-modal');
  if (!modal) return;
  if (show) modal.classList.remove('hidden');
  else modal.classList.add('hidden');
};

window.toggleSatSetModal = function(show = true) {
  const modal = document.getElementById('satset-modal');
  if (!modal) return;
  if (show) modal.classList.remove('hidden');
  else modal.classList.add('hidden');
};
