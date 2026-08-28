/**
 * NoahIG - Instagram Follower & Unfollower Navigator
 * 100% In-Memory & Client-Side Engine (Zero Server Upload, Zero Credentials)
 */

// Application State
const state = {
  followers: new Map(),
  following: new Map(),
  activeTab: 'unfollowers',
  searchQuery: '',
  stats: {
    totalFollowers: 0,
    totalFollowing: 0,
    notFollowingBack: [],
    fans: [],
    mutuals: [],
    ratio: '0%'
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
        <div style="font-weight:800;font-size:14px;background:linear-gradient(135deg,#c13584,#fd1d1d,#fcaf45);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">NOAHIG SAT-SET</div>
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
            full_name: u.full_name,
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

  const payload = {
    source: 'NoahIG_SatSet',
    timestamp: Date.now(),
    following,
    followers
  };

  const payloadStr = JSON.stringify(payload);

  statusEl.textContent = '✅ Selesai Sat-Set!';
  progressEl.innerHTML = \`Following: <b>\${following.length}</b> &bull; Followers: <b>\${followers.length}</b><br><span style="color:#10b981;">Data siap dimasukkan ke NoahIG!</span>\`;
  
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
      return { username, href, timestamp };
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
    ratio: ratioVal
  };

  state.hasAnalyzed = true;

  renderStats();
  renderList();
  showResultsSection();

  showToast(`🎯 Analisis Bahtera Selesai! Ditemukan ${notFollowingBack.length} akun tidak follow back.`, 'success');
  
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
  } else if (state.activeTab === 'fans') {
    currentList = state.stats.fans;
    badgeClass = 'badge-fan';
    badgeText = 'Penggemar (Fan)';
    if (currentTabTitle) currentTabTitle.innerHTML = `<i data-lucide="heart" class="w-5 h-5 text-amber-400"></i> Penumpang Setia (Fans)`;
    if (currentTabDesc) currentTabDesc.textContent = 'Daftar akun yang mengikuti kamu, tetapi belum kamu ikuti balik.';
  } else if (state.activeTab === 'mutuals') {
    currentList = state.stats.mutuals;
    badgeClass = 'badge-mutual';
    badgeText = 'Saling Follow';
    if (currentTabTitle) currentTabTitle.innerHTML = `<i data-lucide="users" class="w-5 h-5 text-emerald-400"></i> Sahabat Sekoci (Mutuals)`;
    if (currentTabDesc) currentTabDesc.textContent = 'Daftar akun yang saling mengikuti secara harmonis.';
  }

  const query = state.searchQuery.trim().toLowerCase();
  const filtered = query
    ? currentList.filter(item => item.username.toLowerCase().includes(query))
    : currentList;

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
    card.className = 'glass-card rounded-2xl p-4 flex items-center justify-between gap-3 group relative overflow-hidden';
    
    let timeText = '';
    if (user.timestamp) {
      const date = new Date(user.timestamp * 1000);
      timeText = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    card.innerHTML = `
      <div class="flex items-center gap-3.5 min-w-0">
        <div class="w-11 h-11 rounded-full p-[2px] ig-gradient-bg flex-shrink-0">
          <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-sm text-slate-200 uppercase">
            ${user.username.charAt(0)}
          </div>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-100 truncate text-sm hover:text-pink-400 transition-colors cursor-pointer" onclick="window.open('${user.href}', '_blank')">
              @${user.username}
            </span>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[11px] px-2 py-0.5 rounded-full font-medium ${badgeClass}">${badgeText}</span>
            ${timeText ? `<span class="text-[11px] text-slate-500 font-mono">${timeText}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <button onclick="copyUsername('${user.username}', this)" title="Salin ID" class="p-2 rounded-xl bg-slate-800/80 hover:bg-pink-500/20 text-slate-400 hover:text-pink-300 border border-slate-700/60 hover:border-pink-500/40 transition-all">
          <i data-lucide="copy" class="w-4 h-4"></i>
        </button>
        <a href="${user.href}" target="_blank" rel="noopener noreferrer" title="Buka Profil Instagram" class="p-2 rounded-xl bg-slate-800/80 hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 border border-slate-700/60 hover:border-sky-500/40 transition-all">
          <i data-lucide="external-link" class="w-4 h-4"></i>
        </a>
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
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      'noah_ocean_rider', 'cyber_sailor', 'cristiano', 'leomessi', 'taylorswift',
      'natgeo', 'nasa', 'zuck', 'billgates', 'elonmusk', 'instagram', 'nike',
      'steve_voyager', 'aurora_borealis', 'kopi_senja_jakarta', 'tech_insider_id',
      'explore_bali', 'developer_nusantara', 'pixel_art_lab', 'maritime_legend'
    ];

    const sampleFollowers = [
      'noah_ocean_rider', 'cyber_sailor', 'steve_voyager', 'aurora_borealis',
      'kopi_senja_jakarta', 'tech_insider_id', 'pixel_art_lab', 'maritime_legend',
      'loyal_fan_01', 'loyal_fan_02', 'secret_admirer_id', 'indonesia_traveler',
      'creative_studio_bali'
    ];

    sampleFollowing.forEach(u => {
      state.following.set(u, {
        username: u,
        href: `https://www.instagram.com/${u}`,
        timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 30)
      });
    });

    sampleFollowers.forEach(u => {
      state.followers.set(u, {
        username: u,
        href: `https://www.instagram.com/${u}`,
        timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 30)
      });
    });

    updateFileBadges();
    runAnalysis();
    showToast('🚀 Simulasi data bahtera berhasil dimuat!', 'success');
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
