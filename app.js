/**
 * SuDownloader - Suno AI Song, Batch & Workspace Studio Engine
 * Fast Instant Fetching (MasterAudio Pro Architecture)
 * Supports: MP3 320k, WAV 24-bit Studio, FLAC Lossless, Multi-Link Batching, and Suno Workspace Explorer
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    currentMode: 'single',
    currentClipId: null,
    trackData: null,
    audioBuffer: null,
    isPlaying: false,
    audioDuration: 0,
    history: [],
    batchItems: [],
    workspaceData: null,
    currentFolderClips: [],
    currentFolderName: 'Feed Utama',
    nowPlayingTrack: null,
    isLooping: false,
    isShuffling: false,
    showCountdown: false
  };

  let activeDetailClipId = null;
  let activeDetailClip = null;

  // --- DOM ELEMENTS ---
  const el = {
    // Mode Navigation
    navSingleTab: document.getElementById('navSingleTab'),
    navBatchTab: document.getElementById('navBatchTab'),
    navWorkspaceTab: document.getElementById('navWorkspaceTab'),
    singleLinkSection: document.getElementById('singleLinkSection'),
    batchSection: document.getElementById('batchSection'),
    workspaceSection: document.getElementById('workspaceSection'),

    // Single Link Search
    sunoUrlInput: document.getElementById('sunoUrlInput'),
    pasteBtn: document.getElementById('pasteBtn'),
    fetchBtn: document.getElementById('fetchBtn'),
    loadingState: document.getElementById('loadingState'),
    resultSection: document.getElementById('resultSection'),

    // Track Display
    coverImg: document.getElementById('coverImg'),
    coverWrapper: document.getElementById('coverWrapper'),
    modelBadge: document.getElementById('modelBadge'),
    downloadCoverBtn: document.getElementById('downloadCoverBtn'),
    trackTitle: document.getElementById('trackTitle'),
    authorAvatar: document.getElementById('authorAvatar'),
    authorName: document.getElementById('authorName'),
    trackDuration: document.getElementById('trackDuration'),
    trackDate: document.getElementById('trackDate'),
    trackTags: document.getElementById('trackTags'),

    // Player
    playPauseBtn: document.getElementById('playPauseBtn'),
    waveformCanvas: document.getElementById('waveformCanvas'),
    waveformBox: document.getElementById('waveformBox'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    volumeSlider: document.getElementById('volumeSlider'),
    audioPlayer: document.getElementById('audioPlayer'),

    // Format Downloads
    dlMp3Btn: document.getElementById('dlMp3Btn'),
    dlWavBtn: document.getElementById('dlWavBtn'),
    dlFlacBtn: document.getElementById('dlFlacBtn'),
    dlM4aBtn: document.getElementById('dlM4aBtn'),
    dlMp4Btn: document.getElementById('dlMp4Btn'),
    dlZipBtn: document.getElementById('dlZipBtn'),

    // Lyrics & Info
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    lyricsContent: document.getElementById('lyricsContent'),
    copyLyricsBtn: document.getElementById('copyLyricsBtn'),
    downloadLyricsTxtBtn: document.getElementById('downloadLyricsTxtBtn'),
    downloadLyricsLrcBtn: document.getElementById('downloadLyricsLrcBtn'),
    infoClipId: document.getElementById('infoClipId'),
    infoModel: document.getElementById('infoModel'),
    infoPrompt: document.getElementById('infoPrompt'),
    infoAudioStream: document.getElementById('infoAudioStream'),

    // Batch Downloader Elements
    batchUrlsInput: document.getElementById('batchUrlsInput'),
    batchCountLabel: document.getElementById('batchCountLabel'),
    batchPasteBtn: document.getElementById('batchPasteBtn'),
    batchDemoBtn: document.getElementById('batchDemoBtn'),
    batchClearBtn: document.getElementById('batchClearBtn'),
    batchFetchBtn: document.getElementById('batchFetchBtn'),
    batchDownloadAllZipBtn: document.getElementById('batchDownloadAllZipBtn'),
    batchProgressBarBox: document.getElementById('batchProgressBarBox'),
    batchProgressFill: document.getElementById('batchProgressFill'),
    batchProgressPercent: document.getElementById('batchProgressPercent'),
    batchProgressStatus: document.getElementById('batchProgressStatus'),
    batchResultsSection: document.getElementById('batchResultsSection'),
    batchResultsCount: document.getElementById('batchResultsCount'),
    batchItemsList: document.getElementById('batchItemsList'),

    // Suno Workspace Explorer Elements
    autoConnectBtn: document.getElementById('autoConnectBtn'),
    extStatusBadge: document.getElementById('extStatusBadge'),

    // Collapsible Manual Cookie Elements
    toggleManualCookieBtn: document.getElementById('toggleManualCookieBtn'),
    toggleManualCookieText: document.getElementById('toggleManualCookieText'),
    manualCookieSavedBadge: document.getElementById('manualCookieSavedBadge'),
    manualCookieSection: document.getElementById('manualCookieSection'),

    sunoCookieInput: document.getElementById('sunoCookieInput'),
    pasteCookieBtn: document.getElementById('pasteCookieBtn'),
    toggleCookieVisibilityBtn: document.getElementById('toggleCookieVisibilityBtn'),
    saveCookieCheckbox: document.getElementById('saveCookieCheckbox'),
    clearCookieBtn: document.getElementById('clearCookieBtn'),
    fetchWorkspaceBtn: document.getElementById('fetchWorkspaceBtn'),
    workspaceLoadingState: document.getElementById('workspaceLoadingState'),
    workspaceView: document.getElementById('workspaceView'),
    workspaceFoldersList: document.getElementById('workspaceFoldersList'),
    refreshWorkspaceBtn: document.getElementById('refreshWorkspaceBtn'),
    currentFolderTitle: document.getElementById('currentFolderTitle'),
    currentFolderCount: document.getElementById('currentFolderCount'),
    folderSearchInput: document.getElementById('folderSearchInput'),
    downloadFolderZipBtn: document.getElementById('downloadFolderZipBtn'),
    folderClipsList: document.getElementById('folderClipsList'),

    // Workspace Side Detail Frame Elements
    workspaceDetailPane: document.getElementById('workspaceDetailPane'),
    wsDetailTitle: document.getElementById('wsDetailTitle'),
    closeWsDetailBtn: document.getElementById('closeWsDetailBtn'),
    wsDetailCover: document.getElementById('wsDetailCover'),
    wsDetailModel: document.getElementById('wsDetailModel'),
    wsZoomCoverBtn: document.getElementById('wsZoomCoverBtn'),
    wsDetailArtist: document.getElementById('wsDetailArtist'),
    wsDetailDuration: document.getElementById('wsDetailDuration'),
    wsDetailDate: document.getElementById('wsDetailDate'),
    wsDetailTags: document.getElementById('wsDetailTags'),
    wsPlayPauseBtn: document.getElementById('wsPlayPauseBtn'),
    wsCurrentTime: document.getElementById('wsCurrentTime'),
    wsTotalTime: document.getElementById('wsTotalTime'),
    wsSeekSlider: document.getElementById('wsSeekSlider'),
    wsDlMp3Btn: document.getElementById('wsDlMp3Btn'),
    wsDlWavBtn: document.getElementById('wsDlWavBtn'),
    wsDlFlacBtn: document.getElementById('wsDlFlacBtn'),
    wsDlM4aBtn: document.getElementById('wsDlM4aBtn'),
    wsDlMp4Btn: document.getElementById('wsDlMp4Btn'),
    wsDlZipBtn: document.getElementById('wsDlZipBtn'),
    wsCopyLyricsBtn: document.getElementById('wsCopyLyricsBtn'),
    wsDownloadLyricsBtn: document.getElementById('wsDownloadLyricsBtn'),
    wsDetailLyrics: document.getElementById('wsDetailLyrics'),

    // Persistent Global Bottom Audio Player Elements
    globalBottomPlayer: document.getElementById('globalBottomPlayer'),
    bpThumb: document.getElementById('bpThumb'),
    bpTitle: document.getElementById('bpTitle'),
    bpArtist: document.getElementById('bpArtist'),
    bpShuffleBtn: document.getElementById('bpShuffleBtn'),
    bpPrevBtn: document.getElementById('bpPrevBtn'),
    bpPlayPauseBtn: document.getElementById('bpPlayPauseBtn'),
    bpNextBtn: document.getElementById('bpNextBtn'),
    bpLoopBtn: document.getElementById('bpLoopBtn'),
    bpCurrentTime: document.getElementById('bpCurrentTime'),
    bpTotalTime: document.getElementById('bpTotalTime'),
    bpSeekSlider: document.getElementById('bpSeekSlider'),
    bpSeekProgress: document.getElementById('bpSeekProgress'),
    bpVolumeSlider: document.getElementById('bpVolumeSlider'),
    bpMuteBtn: document.getElementById('bpMuteBtn'),
    bpDlMp3Btn: document.getElementById('bpDlMp3Btn'),
    bpDlWavBtn: document.getElementById('bpDlWavBtn'),
    bpOpenDetailBtn: document.getElementById('bpOpenDetailBtn'),
    bpCloseBarBtn: document.getElementById('bpCloseBarBtn'),
    bpSpectrumCanvas: document.getElementById('bpSpectrumCanvas'),

    // History
    toggleHistoryBtn: document.getElementById('toggleHistoryBtn'),
    historySection: document.getElementById('historySection'),
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    // Modals & Toasts
    coverModal: document.getElementById('coverModal'),
    modalCoverImg: document.getElementById('modalCoverImg'),
    closeCoverModalBtn: document.getElementById('closeCoverModalBtn'),
    openGuideBtn: document.getElementById('openGuideBtn'),
    guideModal: document.getElementById('guideModal'),
    closeGuideModalBtn: document.getElementById('closeGuideModalBtn'),
    openCookieGuideBtn: document.getElementById('openCookieGuideBtn'),
    openCookieGuideBtn2: document.getElementById('openCookieGuideBtn2'),
    cookieGuideModal: document.getElementById('cookieGuideModal'),
    closeCookieGuideModalBtn: document.getElementById('closeCookieGuideModalBtn'),
    toastContainer: document.getElementById('toastContainer'),

    // Audio Mastering Studio & Equalizer Elements
    openMasteringHeaderBtn: document.getElementById('openMasteringHeaderBtn'),
    headerMasteringDot: document.getElementById('headerMasteringDot'),
    bpMasteringBtn: document.getElementById('bpMasteringBtn'),
    bpMasteringDot: document.getElementById('bpMasteringDot'),
    masteringModal: document.getElementById('masteringModal'),
    closeMasteringModalBtn: document.getElementById('closeMasteringModalBtn'),
    masteringPowerToggle: document.getElementById('masteringPowerToggle'),
    masteringPowerLed: document.getElementById('masteringPowerLed'),
    masteringPowerText: document.getElementById('masteringPowerText'),
    masteringPresetSelect: document.getElementById('masteringPresetSelect'),
    masteringResetBtn: document.getElementById('masteringResetBtn'),
    masteringSaveCustomBtn: document.getElementById('masteringSaveCustomBtn'),
    masteringWarmthSlider: document.getElementById('masteringWarmthSlider'),
    masteringWarmthVal: document.getElementById('masteringWarmthVal'),
    masteringWidthSlider: document.getElementById('masteringWidthSlider'),
    masteringWidthVal: document.getElementById('masteringWidthVal'),
    masteringGainSlider: document.getElementById('masteringGainSlider'),
    masteringGainVal: document.getElementById('masteringGainVal'),

    // Download Progress Dock Elements
    downloadProgressDock: document.getElementById('downloadProgressDock'),
    dpActiveCountBadge: document.getElementById('dpActiveCountBadge'),
    dpCloseDockBtn: document.getElementById('dpCloseDockBtn'),
    dpTasksList: document.getElementById('dpTasksList'),

    // Download Stats & Analytics Elements
    openStatsModalBtn: document.getElementById('openStatsModalBtn'),
    headerStatsBadge: document.getElementById('headerStatsBadge'),
    statsModal: document.getElementById('statsModal'),
    closeStatsModalBtn: document.getElementById('closeStatsModalBtn'),
    statsMonthSelect: document.getElementById('statsMonthSelect'),
    statsRefreshBtn: document.getElementById('statsRefreshBtn'),
    statsExportCsvBtn: document.getElementById('statsExportCsvBtn'),
    statsClearBtn: document.getElementById('statsClearBtn'),
    statsSyncBadge: document.getElementById('statsSyncBadge'),
    statTotalAll: document.getElementById('statTotalAll'),
    statTotalMp3: document.getElementById('statTotalMp3'),
    statTotalWav: document.getElementById('statTotalWav'),
    statTotalFlac: document.getElementById('statTotalFlac'),
    statTotalM4aMp4: document.getElementById('statTotalM4aMp4'),
    statTotalZip: document.getElementById('statTotalZip')
  };

  // --- AUDIO CONTEXT & MASTERING STUDIO DSP ENGINE ---
  let audioCtx = null;
  let waveData = [];
  let analyserNode = null;
  let audioSourceNode = null;
  let spectrumAnimationId = null;
  let spectrumPeaks = [];
  let spectrumSmoothed = [];

  const MASTERING_FREQS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  const MASTERING_PRESETS = {
    studio_master: {
      name: 'Studio Master Pro',
      gains: [2.5, 3.0, 1.5, -0.5, 0.0, 1.5, 2.0, 3.0, 3.5, 4.0],
      warmth: 20,
      width: 120,
      gain: 1.0
    },
    pop: {
      name: 'Pop',
      gains: [1.5, 2.0, 1.0, -1.0, 0.5, 2.0, 3.0, 2.5, 3.5, 4.0],
      warmth: 20,
      width: 120,
      gain: 1.0
    },
    rock: {
      name: 'Rock',
      gains: [3.0, 4.0, 2.5, 1.0, 0.0, -1.0, 2.0, 3.5, 3.0, 2.0],
      warmth: 35,
      width: 115,
      gain: 1.5
    },
    blues: {
      name: 'Blues',
      gains: [2.0, 2.5, 2.0, 1.5, 1.0, 2.0, 1.5, 1.0, 0.5, 0.0],
      warmth: 45,
      width: 105,
      gain: 0.5
    },
    metal: {
      name: 'Metal',
      gains: [5.0, 6.0, 3.0, -2.5, -4.0, -2.0, 2.5, 4.5, 5.5, 6.0],
      warmth: 50,
      width: 125,
      gain: 2.0
    },
    jazz: {
      name: 'Jazz',
      gains: [1.0, 1.5, 1.0, 0.5, 0.5, 1.0, 1.5, 2.0, 3.0, 3.5],
      warmth: 15,
      width: 110,
      gain: 0.0
    },
    ska: {
      name: 'Ska',
      gains: [2.0, 4.0, 2.5, 0.0, 1.0, 2.5, 3.0, 3.5, 4.0, 3.0],
      warmth: 20,
      width: 115,
      gain: 1.0
    },
    reggae: {
      name: 'Reggae',
      gains: [6.0, 7.0, 4.0, 1.0, 0.0, -0.5, 0.5, 1.0, 1.5, -1.0],
      warmth: 30,
      width: 110,
      gain: 1.0
    },
    acoustic: {
      name: 'Acoustic / Ballad',
      gains: [1.0, 1.5, 1.0, 0.0, 0.5, 1.5, 2.5, 3.0, 3.5, 4.0],
      warmth: 20,
      width: 115,
      gain: 0.5
    },
    edm: {
      name: 'EDM / Dance',
      gains: [6.0, 6.5, 4.0, 1.0, -1.0, 0.5, 2.0, 4.0, 5.0, 6.0],
      warmth: 25,
      width: 140,
      gain: 2.0
    },
    bass_boost: {
      name: 'Bass Booster',
      gains: [8.0, 8.5, 6.0, 3.0, 1.0, 0.0, 0.0, 1.0, 1.5, 1.0],
      warmth: 30,
      width: 105,
      gain: 1.5
    },
    flat: {
      name: 'Flat / Neutral',
      gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      warmth: 0,
      width: 100,
      gain: 0.0
    },
    custom: {
      name: 'Custom',
      gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      warmth: 0,
      width: 100,
      gain: 0.0
    }
  };

  const masteringState = {
    isActive: false,
    currentPreset: 'studio_master',
    gains: [2.5, 3.0, 1.5, -0.5, 0.0, 1.5, 2.0, 3.0, 3.5, 4.0],
    warmth: 20,
    width: 120,
    gain: 1.0
  };

  let masteringFilters = [];
  let masteringPreGain = null;
  let masteringWaveShaper = null;
  let masteringCompressor = null;
  let masteringPostGain = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function initSpectrumAnalyser() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (!analyserNode) {
        analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 128;
        analyserNode.smoothingTimeConstant = 0.8;
      }
      if (!audioSourceNode && el.audioPlayer) {
        try {
          audioSourceNode = ctx.createMediaElementSource(el.audioPlayer);
          setupMasteringDspChain(ctx);
        } catch (srcErr) {
          console.debug('MediaElementSource notice:', srcErr.message);
        }
      }
    } catch (e) {
      console.debug('Analyser init error:', e.message);
    }
  }

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initExtensionBridge();
    loadHistoryFromStorage();
    loadStoredCookie();
    loadMasteringSettings();
    generateWaveformData();
    startSpectrumVisualizer();
    updateStatsHeaderBadge();

    // Check query params
    const params = new URLSearchParams(window.location.search);
    const querySong = params.get('song') || params.get('url') || params.get('id');
    if (querySong) {
      el.sunoUrlInput.value = querySong;
      handleAutoFetch();
    }
  });

  // --- MODE SWITCHER ---
  function switchMode(mode) {
    state.currentMode = mode;
    [el.navSingleTab, el.navBatchTab, el.navWorkspaceTab].forEach(btn => {
      if (btn) btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
    // Sync mobile drawer tabs
    document.querySelectorAll('.drawer-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
    el.singleLinkSection.classList.toggle('active', mode === 'single');
    el.batchSection.classList.toggle('active', mode === 'batch');
    el.workspaceSection.classList.toggle('active', mode === 'workspace');

    // Auto-connect workspace if user opens workspace tab
    if (mode === 'workspace' && (!state.workspaceData || el.workspaceView.style.display === 'none')) {
      if (el.sunoCookieInput.value.trim()) {
        handleFetchWorkspace(true);
      } else {
        handleAutoConnectClick(true);
      }
    }
  }

  // --- MOBILE INNER TAB SWITCHER (Single Link: Cari / Hasil) ---
  function switchMobileInnerTab(tabName) {
    // Tab buttons
    document.querySelectorAll('.mobile-inner-tab').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-inner-tab') === tabName);
    });
    // Panels
    const feedPanel   = document.getElementById('mobileTabFeed');
    const resultPanel = document.getElementById('mobileTabResult');
    if (feedPanel)   feedPanel.classList.toggle('active',   tabName === 'feed');
    if (resultPanel) resultPanel.classList.toggle('active', tabName === 'result');
  }

  // --- WORKSPACE MOBILE TAB SWITCHER (Koleksi & Folder / Feed Utama) ---
  function switchWsTab(tabName) {
    // Tab buttons
    document.querySelectorAll('.ws-mobile-tab').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-ws-tab') === tabName);
    });
    // Panels
    const foldersPanel = document.getElementById('wsPanelFolders');
    const feedPanel    = document.getElementById('wsPanelFeed');
    if (foldersPanel) foldersPanel.classList.toggle('ws-panel-active', tabName === 'folders');
    if (feedPanel)    feedPanel.classList.toggle('ws-panel-active',    tabName === 'feed');
  }
  window.switchWsTab = switchWsTab;

  // --- EVENT LISTENERS ---
  function initEventListeners() {
    // 1. Navigation Tabs
    [el.navSingleTab, el.navBatchTab, el.navWorkspaceTab].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          switchMode(btn.getAttribute('data-mode'));
        });
      }
    });

    // 2. Quick Demo Buttons
    document.querySelectorAll('.quick-link-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.preventDefault();
        const url = tag.getAttribute('data-url');
        if (url) {
          el.sunoUrlInput.value = url;
          handleAutoFetch();
        }
      });
    });

    // 3. Single Link Paste & Fetch
    el.pasteBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          el.sunoUrlInput.value = text.trim();
          showToast('Link berhasil ditempel!', 'success');
          handleAutoFetch();
        }
      } catch (err) {
        showToast('Gunakan pintasan Ctrl+V untuk menempelkan link.', 'info');
      }
    });

    el.fetchBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      handleAutoFetch();
    });

    el.sunoUrlInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAutoFetch();
      }
    });

    let inputDebounce = null;
    el.sunoUrlInput?.addEventListener('input', () => {
      if (inputDebounce) clearTimeout(inputDebounce);
      inputDebounce = setTimeout(() => {
        const val = el.sunoUrlInput.value.trim();
        const extracted = extractClipId(val);
        if (extracted && extracted !== state.currentClipId) {
          handleAutoFetch();
        }
      }, 500);
    });

    // 4. Audio Player Controls
    el.playPauseBtn?.addEventListener('click', toggleAudioPlayback);
    el.volumeSlider?.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      el.audioPlayer.volume = isNaN(vol) ? 0.9 : vol;
    });

    el.audioPlayer.addEventListener('play', () => {
      state.isPlaying = true;
      initSpectrumAnalyser();
      startSpectrumVisualizer();
      updateAllPlayStates();
    });
    el.audioPlayer.addEventListener('playing', () => {
      state.isPlaying = true;
      initSpectrumAnalyser();
      startSpectrumVisualizer();
      updateAllPlayStates();
    });
    el.audioPlayer.addEventListener('pause', () => {
      state.isPlaying = false;
      updateAllPlayStates();
    });
    el.audioPlayer.addEventListener('ended', () => {
      state.isPlaying = false;
      updateAllPlayStates();
      drawWaveform(0);
      if (el.wsSeekSlider) el.wsSeekSlider.value = 0;
      if (el.bpSeekSlider) el.bpSeekSlider.value = 100;
      if (el.bpSeekProgress) el.bpSeekProgress.style.width = '100%';
      if (state.isLooping) {
        el.audioPlayer.currentTime = 0;
        el.audioPlayer.play().catch(e => {});
      } else {
        playNextTrack();
      }
    });
    el.audioPlayer.addEventListener('timeupdate', updateAudioProgress);
    el.audioPlayer.addEventListener('loadedmetadata', () => {
      state.audioDuration = el.audioPlayer.duration || 0;
      el.totalTime.textContent = formatDuration(state.audioDuration);
      if (el.wsTotalTime) el.wsTotalTime.textContent = formatDuration(state.audioDuration);
      if (el.bpTotalTime) {
        if (state.showCountdown) {
          el.bpTotalTime.textContent = `-${formatDuration(state.audioDuration)}`;
        } else {
          el.bpTotalTime.textContent = formatDuration(state.audioDuration);
        }
      }
    });

    el.waveformBox?.addEventListener('click', (e) => {
      if (!el.audioPlayer.duration) return;
      const rect = el.waveformBox.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      el.audioPlayer.currentTime = pct * el.audioPlayer.duration;
    });

    // Global Bottom Player Controls
    el.bpPlayPauseBtn?.addEventListener('click', toggleAudioPlayback);
    el.bpNextBtn?.addEventListener('click', playNextTrack);
    el.bpPrevBtn?.addEventListener('click', playPrevTrack);

    el.bpLoopBtn?.addEventListener('click', () => {
      state.isLooping = !state.isLooping;
      el.bpLoopBtn.classList.toggle('active', state.isLooping);
      showToast(state.isLooping ? '🔁 Ulangi lagu aktif' : '🔁 Ulangi lagu nonaktif', 'info');
    });

    el.bpShuffleBtn?.addEventListener('click', () => {
      state.isShuffling = !state.isShuffling;
      el.bpShuffleBtn.classList.toggle('active', state.isShuffling);
      showToast(state.isShuffling ? '🔀 Acak lagu aktif' : '🔀 Acak lagu nonaktif', 'info');
    });

    // Bottom Player Seekbar Scrubbing & Click-to-Seek
    el.bpSeekSlider?.addEventListener('mousedown', () => {
      el.bpSeekSlider.dataset.dragging = 'true';
    });
    el.bpSeekSlider?.addEventListener('touchstart', () => {
      el.bpSeekSlider.dataset.dragging = 'true';
    }, { passive: true });

    el.bpSeekSlider?.addEventListener('input', (e) => {
      el.bpSeekSlider.dataset.dragging = 'true';
      const pct = parseFloat(e.target.value);
      if (el.bpSeekProgress) {
        el.bpSeekProgress.style.width = `${pct}%`;
      }
      const dur = el.audioPlayer?.duration || state.nowPlayingTrack?.duration || 180;
      const cur = (pct / 100) * dur;
      if (el.bpCurrentTime) el.bpCurrentTime.textContent = formatDuration(cur);
      if (el.bpTotalTime) {
        if (state.showCountdown) {
          el.bpTotalTime.textContent = `-${formatDuration(Math.max(0, dur - cur))}`;
        } else {
          el.bpTotalTime.textContent = formatDuration(dur);
        }
      }
    });

    const commitBpSeek = () => {
      if (el.bpSeekSlider?.dataset.dragging) {
        const pct = parseFloat(el.bpSeekSlider.value) / 100;
        const dur = el.audioPlayer?.duration || state.nowPlayingTrack?.duration || 180;
        if (el.audioPlayer && !isNaN(dur) && dur > 0) {
          el.audioPlayer.currentTime = pct * dur;
        }
        setTimeout(() => {
          delete el.bpSeekSlider.dataset.dragging;
        }, 80);
      }
    };

    el.bpSeekSlider?.addEventListener('change', commitBpSeek);
    el.bpSeekSlider?.addEventListener('mouseup', commitBpSeek);
    el.bpSeekSlider?.addEventListener('touchend', commitBpSeek);

    // Toggle Countdown vs Total Duration on Click
    el.bpTotalTime?.addEventListener('click', () => {
      state.showCountdown = !state.showCountdown;
      showToast(state.showCountdown ? '⏱️ Mode Hitung Mundur (Waktu Sisa)' : '⏱️ Mode Total Durasi', 'info');
      updateAudioProgress();
    });

    el.bpVolumeSlider?.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      el.audioPlayer.volume = vol;
      if (el.volumeSlider) el.volumeSlider.value = vol;
    });

    el.bpMuteBtn?.addEventListener('click', () => {
      el.audioPlayer.muted = !el.audioPlayer.muted;
      el.bpMuteBtn.textContent = el.audioPlayer.muted ? '🔇' : '🔊';
    });

    el.bpCloseBarBtn?.addEventListener('click', () => {
      el.globalBottomPlayer.style.display = 'none';
      document.body.classList.remove('has-bottom-player');
    });

    // Bottom Player Quick Format Downloads
    el.bpDlMp3Btn?.addEventListener('click', () => {
      const track = state.nowPlayingTrack || state.trackData;
      if (track) downloadTrackInFormat('mp3', track, el.bpDlMp3Btn);
      else showToast('Putar atau pilih lagu terlebih dahulu.', 'info');
    });
    el.bpDlWavBtn?.addEventListener('click', () => {
      const track = state.nowPlayingTrack || state.trackData;
      if (track) downloadTrackInFormat('wav', track, el.bpDlWavBtn);
      else showToast('Putar atau pilih lagu terlebih dahulu.', 'info');
    });

    // Download Progress Dock Close
    el.dpCloseDockBtn?.addEventListener('click', () => {
      if (el.downloadProgressDock) el.downloadProgressDock.style.display = 'none';
    });

    // Download Stats & Analytics Modal Events
    el.openStatsModalBtn?.addEventListener('click', openStatsModal);
    el.closeStatsModalBtn?.addEventListener('click', closeStatsModal);
    el.statsMonthSelect?.addEventListener('change', () => renderStatsModal());
    el.statsArtistFilter?.addEventListener('input', () => renderStatsModal());
    el.statsRefreshBtn?.addEventListener('click', () => {
      populateMonthSelect();
      renderStatsModal();
      showToast('Data statistik diperbarui', 'info');
    });
    el.statsExportCsvBtn?.addEventListener('click', exportStatsToCsv);
    el.statsClearBtn?.addEventListener('click', clearDownloadStats);

    el.statsModal?.addEventListener('click', (e) => {
      if (e.target === el.statsModal) closeStatsModal();
    });

    // Side Detail Pane Controls
    el.closeWsDetailBtn?.addEventListener('click', closeWorkspaceClipDetail);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeWorkspaceClipDetail();
    });

    el.wsPlayPauseBtn?.addEventListener('click', () => {
      if (activeDetailClip) {
        playSong(activeDetailClip, true);
      }
    });

    el.wsSeekSlider?.addEventListener('input', (e) => {
      if (activeDetailClipId === state.nowPlayingTrack?.id && el.audioPlayer && el.audioPlayer.duration) {
        const pct = parseFloat(e.target.value) / 100;
        el.audioPlayer.currentTime = pct * el.audioPlayer.duration;
      }
    });

    // 5. Download format buttons
    el.dlMp3Btn?.addEventListener('click', () => downloadTrackInFormat('mp3', null, el.dlMp3Btn));
    el.dlWavBtn?.addEventListener('click', () => downloadTrackInFormat('wav', null, el.dlWavBtn));
    el.dlFlacBtn?.addEventListener('click', () => downloadTrackInFormat('flac', null, el.dlFlacBtn));
    el.dlM4aBtn?.addEventListener('click', () => downloadTrackInFormat('m4a', null, el.dlM4aBtn));
    el.dlMp4Btn?.addEventListener('click', () => downloadTrackInFormat('mp4', null, el.dlMp4Btn));
    el.dlZipBtn?.addEventListener('click', downloadAllInZip);
    el.downloadCoverBtn?.addEventListener('click', downloadCoverImage);

    // 6. Lyrics Actions
    el.copyLyricsBtn?.addEventListener('click', copyLyricsToClipboard);
    el.downloadLyricsTxtBtn?.addEventListener('click', downloadLyricsTxt);
    el.downloadLyricsLrcBtn?.addEventListener('click', downloadLyricsLrc);

    // 7. Tabs inside Track Card
    el.tabBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        el.tabBtns.forEach(b => b.classList.remove('active'));
        el.tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        const pane = document.getElementById(targetTab);
        if (pane) pane.classList.add('active');
      });
    });

    // 8. History & Modals
    el.toggleHistoryBtn?.addEventListener('click', () => {
      const show = el.historySection.style.display === 'none';
      el.historySection.style.display = show ? 'block' : 'none';
    });
    el.clearHistoryBtn?.addEventListener('click', () => {
      state.history = [];
      localStorage.removeItem('sudownloader_history');
      renderHistoryList();
      showToast('Riwayat berhasil dibersihkan.', 'info');
    });

    el.coverWrapper?.addEventListener('click', () => {
      if (el.coverImg.src) {
        el.modalCoverImg.src = el.coverImg.src;
        el.coverModal.style.display = 'flex';
      }
    });
    el.closeCoverModalBtn?.addEventListener('click', () => el.coverModal.style.display = 'none');
    el.coverModal?.addEventListener('click', (e) => {
      if (e.target === el.coverModal) el.coverModal.style.display = 'none';
    });

    el.openGuideBtn?.addEventListener('click', () => el.guideModal.style.display = 'flex');
    el.closeGuideModalBtn?.addEventListener('click', () => el.guideModal.style.display = 'none');
    el.guideModal?.addEventListener('click', (e) => {
      if (e.target === el.guideModal) el.guideModal.style.display = 'none';
    });

    // Cookie Guide Modals
    el.openCookieGuideBtn?.addEventListener('click', () => el.cookieGuideModal.style.display = 'flex');
    el.openCookieGuideBtn2?.addEventListener('click', () => el.cookieGuideModal.style.display = 'flex');
    el.closeCookieGuideModalBtn?.addEventListener('click', () => el.cookieGuideModal.style.display = 'none');
    el.cookieGuideModal?.addEventListener('click', (e) => {
      if (e.target === el.cookieGuideModal) el.cookieGuideModal.style.display = 'none';
    });

    // ---- Mobile Drawer Event Listeners ----
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileDrawerBackdrop = document.getElementById('mobileDrawerBackdrop');

    function openMobileDrawer() {
      if (!mobileDrawer) return;
      mobileDrawer.classList.add('is-open');
      if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.add('is-open');
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.add('is-active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
      }
    }

    window.closeMobileDrawer = function() {
      if (!mobileDrawer) return;
      mobileDrawer.classList.remove('is-open');
      if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove('is-open');
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.remove('is-active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    };

    mobileMenuBtn?.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
        window.closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });

    // Mobile drawer tab buttons
    document.querySelectorAll('.drawer-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchMode(btn.getAttribute('data-mode'));
        window.closeMobileDrawer();
      });
    });

    // Mobile drawer action buttons
    document.getElementById('mobileOpenGuideBtn')?.addEventListener('click', () => {
      window.closeMobileDrawer();
      if (el.guideModal) el.guideModal.style.display = 'flex';
    });
    document.getElementById('mobileOpenCookieGuideBtn')?.addEventListener('click', () => {
      window.closeMobileDrawer();
      if (el.cookieGuideModal) el.cookieGuideModal.style.display = 'flex';
    });
    document.getElementById('mobileToggleHistoryBtn')?.addEventListener('click', () => {
      window.closeMobileDrawer();
      const show = el.historySection.style.display === 'none';
      el.historySection.style.display = show ? 'block' : 'none';
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.closeMobileDrawer();
    });

    // ---- Mobile Inner Tabs (Single Link: Cari Lagu / Hasil Lagu) ----
    document.querySelectorAll('.mobile-inner-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        switchMobileInnerTab(btn.getAttribute('data-inner-tab'));
      });
    });

    // ---- Workspace Mobile Tabs (Koleksi & Folder / Feed Utama) ----
    // Initialize panels on mobile: folders active by default
    if (window.innerWidth <= 768) {
      const wsFolders = document.getElementById('wsPanelFolders');
      const wsFeed    = document.getElementById('wsPanelFeed');
      if (wsFolders) wsFolders.classList.add('ws-panel-active');
      if (wsFeed)    wsFeed.classList.remove('ws-panel-active');
    }

    document.querySelectorAll('.ws-mobile-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        switchWsTab(btn.getAttribute('data-ws-tab'));
      });
    });

    // Audio Mastering Studio Modal & Controls
    const openMasteringStudio = (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
        e.stopPropagation();
      }
      if (el.masteringModal) {
        el.masteringModal.classList.add('active');
        el.masteringModal.style.display = 'flex';
        syncMasteringControlsToState();
      }
    };
    const closeMasteringStudio = (e) => {
      if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
        e.stopPropagation();
      }
      if (el.masteringModal) {
        el.masteringModal.classList.remove('active');
        el.masteringModal.style.display = 'none';
      }
    };

    window.openMasteringStudio = openMasteringStudio;
    window.closeMasteringStudio = closeMasteringStudio;

    el.openMasteringHeaderBtn?.addEventListener('click', openMasteringStudio);
    el.bpMasteringBtn?.addEventListener('click', openMasteringStudio);
    el.closeMasteringModalBtn?.addEventListener('click', closeMasteringStudio);
    el.masteringModal?.addEventListener('click', (e) => {
      if (e.target === el.masteringModal) closeMasteringStudio(e);
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.masteringModal && el.masteringModal.style.display === 'flex') {
        closeMasteringStudio();
      }
    });

    // Mastering Power Toggle (Active / Bypass)
    el.masteringPowerToggle?.addEventListener('click', () => {
      masteringState.isActive = !masteringState.isActive;
      applyMasteringDspParams();
      saveMasteringSettings();
      showToast(masteringState.isActive ? '🎛️ Audio Mastering: AKTIF' : '⚡ Audio Mastering: BYPASS (Original)', masteringState.isActive ? 'success' : 'info');
    });

    // Preset Selection
    el.masteringPresetSelect?.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (selected !== 'custom') {
        applyPreset(selected);
        showToast(`Preset "${MASTERING_PRESETS[selected]?.name || selected}" diterapkan!`, 'info');
      } else {
        masteringState.currentPreset = 'custom';
        saveMasteringSettings();
      }
    });

    // Reset Flat
    el.masteringResetBtn?.addEventListener('click', () => {
      applyPreset('flat');
      showToast('Equalizer di-reset ke Flat (0 dB).', 'info');
    });

    // Save Custom
    el.masteringSaveCustomBtn?.addEventListener('click', () => {
      MASTERING_PRESETS.custom = {
        name: 'Custom',
        gains: [...masteringState.gains],
        warmth: masteringState.warmth,
        width: masteringState.width,
        gain: masteringState.gain
      };
      masteringState.currentPreset = 'custom';
      if (el.masteringPresetSelect) el.masteringPresetSelect.value = 'custom';
      saveMasteringSettings();
      showToast('Setelan saat ini berhasil disimpan ke preset Custom!', 'success');
    });

    // 10-Band Graphic Equalizer Faders
    document.querySelectorAll('.eq-fader-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const bandIdx = parseInt(e.target.dataset.band, 10);
        const freq = e.target.dataset.freq;
        const val = parseFloat(e.target.value);
        if (!isNaN(bandIdx) && bandIdx >= 0 && bandIdx < 10) {
          masteringState.gains[bandIdx] = val;
          const label = document.getElementById(`eqVal_${freq}`);
          if (label) label.textContent = `${val > 0 ? '+' : ''}${val}dB`;

          // Switch preset to custom when user moves a fader
          if (masteringState.currentPreset !== 'custom') {
            masteringState.currentPreset = 'custom';
            if (el.masteringPresetSelect) el.masteringPresetSelect.value = 'custom';
          }

          applyMasteringDspParams();
          saveMasteringSettings();
        }
      });
    });

    // Tube Warmth Slider
    el.masteringWarmthSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      masteringState.warmth = val;
      if (el.masteringWarmthVal) el.masteringWarmthVal.textContent = `${val}%`;
      if (masteringState.currentPreset !== 'custom') {
        masteringState.currentPreset = 'custom';
        if (el.masteringPresetSelect) el.masteringPresetSelect.value = 'custom';
      }
      applyMasteringDspParams();
      saveMasteringSettings();
    });

    // Stereo Width Slider
    el.masteringWidthSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      masteringState.width = val;
      if (el.masteringWidthVal) el.masteringWidthVal.textContent = `${val}%`;
      if (masteringState.currentPreset !== 'custom') {
        masteringState.currentPreset = 'custom';
        if (el.masteringPresetSelect) el.masteringPresetSelect.value = 'custom';
      }
      applyMasteringDspParams();
      saveMasteringSettings();
    });

    // Master Output Gain Slider
    el.masteringGainSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      masteringState.gain = val;
      if (el.masteringGainVal) el.masteringGainVal.textContent = `${val > 0 ? '+' : ''}${val.toFixed(1)} dB`;
      if (masteringState.currentPreset !== 'custom') {
        masteringState.currentPreset = 'custom';
        if (el.masteringPresetSelect) el.masteringPresetSelect.value = 'custom';
      }
      applyMasteringDspParams();
      saveMasteringSettings();
    });

    // 9. Batch Downloader Events
    el.batchUrlsInput?.addEventListener('input', updateBatchLineCount);
    el.batchPasteBtn?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          el.batchUrlsInput.value = (el.batchUrlsInput.value ? el.batchUrlsInput.value + '\n' : '') + text.trim();
          updateBatchLineCount();
          showToast('Link batch berhasil ditempel!', 'success');
        }
      } catch (e) {
        showToast('Gunakan Ctrl+V untuk menempel link.', 'info');
      }
    });

    el.batchDemoBtn?.addEventListener('click', () => {
      el.batchUrlsInput.value = "https://suno.com/song/97b329dd-d468-4266-bb55-b8ccc95124df\nhttps://suno.com/song/c8acea1e-e88e-4e2e-a542-a0ad4e9d905a";
      updateBatchLineCount();
    });

    el.batchClearBtn?.addEventListener('click', () => {
      el.batchUrlsInput.value = '';
      updateBatchLineCount();
      el.batchResultsSection.style.display = 'none';
      el.batchDownloadAllZipBtn.style.display = 'none';
      state.batchItems = [];
    });

    el.batchFetchBtn?.addEventListener('click', handleBatchFetch);
    el.batchDownloadAllZipBtn?.addEventListener('click', handleBatchDownloadAllZip);

    // 10. Workspace Explorer Events
    el.pasteCookieBtn?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          el.sunoCookieInput.value = text.trim();
          updateManualCookieBadge();
          showToast('Cookie/Token berhasil ditempel!', 'success');
        }
      } catch (e) {
        showToast('Gunakan Ctrl+V untuk menempel cookie.', 'info');
      }
    });

    el.toggleCookieVisibilityBtn?.addEventListener('click', () => {
      const isMasked = el.sunoCookieInput.classList.toggle('is-masked');
      el.toggleCookieVisibilityBtn.textContent = isMasked ? '👁️' : '🔒';
    });

    // Toggle Collapsible Manual Cookie Form (Default: Hidden)
    el.toggleManualCookieBtn?.addEventListener('click', () => {
      const isCurrentlyHidden = !el.manualCookieSection || el.manualCookieSection.style.display === 'none';
      if (isCurrentlyHidden) {
        el.manualCookieSection.style.display = 'block';
        el.toggleManualCookieBtn.classList.add('is-open');
        el.toggleManualCookieBtn.setAttribute('aria-expanded', 'true');
        el.toggleManualCookieText.textContent = '▲ Sembunyikan Form Cookie';
      } else {
        el.manualCookieSection.style.display = 'none';
        el.toggleManualCookieBtn.classList.remove('is-open');
        el.toggleManualCookieBtn.setAttribute('aria-expanded', 'false');
        el.toggleManualCookieText.textContent = '▼ Tampilkan Form Cookie';
      }
    });

    el.sunoCookieInput?.addEventListener('input', updateManualCookieBadge);

    el.clearCookieBtn?.addEventListener('click', () => {
      localStorage.removeItem('suno_cookie');
      el.sunoCookieInput.value = '';
      el.clearCookieBtn.style.display = 'none';
      el.workspaceView.style.display = 'none';
      updateManualCookieBadge();
      showToast('Sesi cookie Suno dihapus.', 'info');
    });

    el.fetchWorkspaceBtn?.addEventListener('click', handleFetchWorkspace);
    el.refreshWorkspaceBtn?.addEventListener('click', handleFetchWorkspace);

    el.folderSearchInput?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      renderFilteredFolderClips(q);
    });

    el.downloadFolderZipBtn?.addEventListener('click', handleDownloadCurrentFolderZip);
    el.autoConnectBtn?.addEventListener('click', () => handleAutoConnectClick(false));
  }

  function updateManualCookieBadge() {
    if (!el.manualCookieSavedBadge) return;
    const hasCookie = Boolean(el.sunoCookieInput && el.sunoCookieInput.value.trim());
    el.manualCookieSavedBadge.style.display = hasCookie ? 'inline-block' : 'none';
  }

  // --- EXTENSION BRIDGE & AUTO-CONNECT ENGINE ---
  function initExtensionBridge() {
    window.addEventListener('message', (event) => {
      if (!event.data) return;

      // 1. Extension announces it's ready
      if (event.data.type === 'SUNO_EXT_READY') {
        if (el.extStatusBadge) {
          el.extStatusBadge.textContent = '🟢 Ekstensi Terhubung';
          el.extStatusBadge.className = 'ext-status-badge';
        }
      }

      // 2. Auto Session Received (from background or on page load/refresh)
      if (event.data.type === 'SUNO_AUTO_SESSION') {
        if (event.data.success && (event.data.cookie || event.data.token)) {
          const cred = event.data.cookie || event.data.token;
          const wasEmpty = !el.sunoCookieInput.value;
          el.sunoCookieInput.value = cred;
          localStorage.setItem('suno_cookie', cred);
          el.clearCookieBtn.style.display = 'inline-block';
          updateManualCookieBadge();

          if (el.extStatusBadge) {
            el.extStatusBadge.textContent = '🟢 Akun Suno Terdeteksi';
            el.extStatusBadge.className = 'ext-status-badge';
          }

          // Auto-sync session to local backend cache in background
          try {
            const fd = new FormData();
            fd.append('action', 'sync_session');
            fd.append('cookie', cred);
            fetch('./proxy.php', { method: 'POST', body: fd });
          } catch (e) {}

          // If on workspace tab and not connected, auto-connect immediately!
          if (state.currentMode === 'workspace' && (!state.workspaceData || el.workspaceView.style.display === 'none')) {
            showToast('⚡ Auto-Connect: Sesi Suno terdeteksi dari tab browser!', 'success');
            handleFetchWorkspace(true);
          }
        }
      }

      // 3. Manual 1-Click Request Response
      if (event.data.type === 'SUNO_SESSION_RESPONSE') {
        if (event.data.success && (event.data.cookie || event.data.token)) {
          const cred = event.data.cookie || event.data.token;
          el.sunoCookieInput.value = cred;
          localStorage.setItem('suno_cookie', cred);
          el.clearCookieBtn.style.display = 'inline-block';
          updateManualCookieBadge();

          if (el.extStatusBadge) {
            el.extStatusBadge.textContent = '🟢 Akun Suno Terhubung';
            el.extStatusBadge.className = 'ext-status-badge';
          }

          // Auto-sync session to backend
          try {
            const fd = new FormData();
            fd.append('action', 'sync_session');
            fd.append('cookie', cred);
            fetch('./proxy.php', { method: 'POST', body: fd });
          } catch (e) {}

          showToast('⚡ Berhasil tersambung ke akun Suno!', 'success');
          handleFetchWorkspace(false);
        } else {
          showToast(event.data.error || 'Pastikan Anda sudah login ke suno.com di tab lain.', 'error');
          if (el.extStatusBadge) {
            el.extStatusBadge.textContent = '⚠️ Belum Login di Suno';
            el.extStatusBadge.className = 'ext-status-badge waiting';
          }
        }
      }
    });

    // Ping extension immediately on boot
    window.postMessage({ type: 'PING_SUNO_EXT' }, '*');
    setTimeout(() => {
      window.postMessage({ type: 'PING_SUNO_EXT' }, '*');
    }, 400);
  }

  // Handle manual 1-Click Auto-Connect
  async function handleAutoConnectClick(silent = false) {
    if (el.extStatusBadge) {
      el.extStatusBadge.textContent = '⏳ Mengambil Sesi...';
      el.extStatusBadge.className = 'ext-status-badge waiting';
    }
    if (!silent) showToast('⚡ Menghubungkan ke sesi akun Suno...', 'info');

    // 1. Ask Extension Bridge directly
    window.postMessage({ type: 'REQUEST_SUNO_SESSION' }, '*');

    // 2. Fallback check from local server cache if extension doesn't answer in 1.2s
    setTimeout(async () => {
      if (!el.sunoCookieInput.value) {
        try {
          const res = await fetch('./proxy.php?action=get_saved_session');
          const json = await res.json();
          if (json && json.success && json.cookie) {
            el.sunoCookieInput.value = json.cookie;
            localStorage.setItem('suno_cookie', json.cookie);
            el.clearCookieBtn.style.display = 'inline-block';
            if (el.extStatusBadge) {
              el.extStatusBadge.textContent = '🟢 Sesi Lokal Terhubung';
              el.extStatusBadge.className = 'ext-status-badge';
            }
            if (!silent) showToast('⚡ Menggunakan sesi Suno dari server lokal!', 'success');
            handleFetchWorkspace(silent);
            return;
          }
        } catch (e) {}

        if (el.extStatusBadge) {
          el.extStatusBadge.textContent = '⚠️ Ekstensi Belum Aktif';
          el.extStatusBadge.className = 'ext-status-badge waiting';
        }
        if (!silent) {
          showToast('Ekstensi Suno belum aktif atau tab suno.com belum login.', 'error');
        }
      }
    }, 1200);
  }

  // --- HELPER: Cookie Persistence & Auto-Sync ---
  async function loadStoredCookie() {
    try {
      const saved = localStorage.getItem('suno_cookie');
      if (saved) {
        el.sunoCookieInput.value = saved;
        el.clearCookieBtn.style.display = 'inline-block';
        if (el.extStatusBadge) {
          el.extStatusBadge.textContent = '🟢 Sesi Tersimpan Siap';
        }
      } else {
        // Fallback: Check backend active session cache
        try {
          const res = await fetch('./proxy.php?action=get_saved_session');
          const json = await res.json();
          if (json && json.success && json.cookie) {
            el.sunoCookieInput.value = json.cookie;
            localStorage.setItem('suno_cookie', json.cookie);
            el.clearCookieBtn.style.display = 'inline-block';
            if (el.extStatusBadge) {
              el.extStatusBadge.textContent = '🟢 Sesi Server Siap';
            }
          }
        } catch (e) {}
      }
      updateManualCookieBadge();
    } catch (e) {}
  }

  // --- URL & CLIP ID EXTRACTION ---
  function extractClipId(rawUrl) {
    if (!rawUrl) return null;
    const trimmed = rawUrl.trim();
    const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
    const match = trimmed.match(uuidRegex);
    if (match) return match[1].toLowerCase();

    const shortShareRegex = /\/s\/([a-zA-Z0-9_-]{4,50})/i;
    const shareMatch = trimmed.match(shortShareRegex);
    if (shareMatch) return `share:${shareMatch[1]}`;

    if (/^[a-zA-Z0-9_-]{8,40}$/.test(trimmed)) return trimmed;
    return null;
  }

  // --- FETCH PIPELINE: SINGLE TRACK ---
  async function handleAutoFetch() {
    const rawInput = el.sunoUrlInput.value.trim();
    if (!rawInput) {
      showToast('Silakan tempelkan link atau ID lagu Suno.', 'error');
      return;
    }

    const clipId = extractClipId(rawInput);
    if (!clipId) {
      showToast('Format link Suno tidak dikenali.', 'error');
      return;
    }

    showLoading(true);
    state.audioBuffer = null;

    try {
      let data = null;

      // Local PHP Proxy with DRM decryption
      try {
        const phpUrl = `./proxy.php?action=suno&url=${encodeURIComponent(rawInput)}`;
        const res = await fetch(phpUrl);
        if (res.ok) {
          const json = await res.json();
          if (json && json.title) data = json;
        }
      } catch (err) {}

      // Fallback: Direct Suno Studio API
      if (!data && !clipId.startsWith('share:')) {
        data = await fetchSunoTrackDirect(clipId);
      }

      if (!data || !data.title) {
        throw new Error('Tidak dapat menemukan data lagu dari server Suno AI.');
      }

      state.currentClipId = data.id;
      state.trackData = data;

      renderTrackUI(data);
      setupAudioPlayer(data);
      addToHistory(data);

      showToast(`Lagu "${data.title}" berhasil dimuat!`, 'success');
    } catch (err) {
      console.error('Fetch track error:', err);
      showToast(err.message || 'Gagal memuat lagu Suno.', 'error');
    } finally {
      showLoading(false);
    }
  }

  async function fetchSunoTrackDirect(id) {
    const endpoint = `https://studio-api.prod.suno.com/api/clip/${id}`;
    const json = await fetchWithCorsProxy(endpoint, 'json');
    if (json && json.title) {
      const artist = json.displayName || json.display_name || json.artist || json.user_display_name || (json.handle ? (json.handle.startsWith('@') ? json.handle : `@${json.handle}`) : '') || json.user?.display_name || 'Suno Artist';
      return {
        id: json.id || id,
        title: cleanSongTitle(json.title),
        artist: artist,
        displayName: artist,
        display_name: artist,
        handle: json.handle || '',
        imageUrl: json.image_large_url || json.image_url || `https://cdn2.suno.ai/image_large_${id}.jpeg`,
        imageLargeUrl: json.image_large_url || json.image_url || `https://cdn2.suno.ai/image_large_${id}.jpeg`,
        audioUrl: `https://d2lwuy8qc234o3.cloudfront.net/1/clip/${id}.m4a`,
        audioCandidates: [
          `https://d2lwuy8qc234o3.cloudfront.net/1/clip/${id}.m4a`,
          `https://d2lwuy8qc234o3.cloudfront.net/0/clip/${id}.m4a`,
          `https://cdn1.suno.ai/${id}.mp3`,
          `https://cdn2.suno.ai/${id}.mp3`
        ],
        videoUrl: `https://cdn1.suno.ai/${id}.mp4`,
        lyrics: json.metadata?.prompt || json.prompt || '[Instrumental]',
        tags: json.metadata?.tags || json.display_tags || 'AI Music',
        duration: parseFloat(json.metadata?.duration || json.duration || 180),
        model: json.major_model_version || json.model || 'v5.5',
        createdAt: json.created_at || new Date().toISOString()
      };
    }
    return null;
  }

  async function fetchWithCorsProxy(url, responseType = 'json') {
    try {
      const phpUrl = `./proxy.php?url=${encodeURIComponent(url)}`;
      const res = await fetch(phpUrl);
      if (res.ok) return responseType === 'json' ? await res.json() : await res.text();
    } catch (e) {}

    try {
      const direct = await fetch(url, { mode: 'cors' });
      if (direct.ok) return responseType === 'json' ? await direct.json() : await direct.text();
    } catch (e) {}

    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`
    ];
    for (const p of proxies) {
      try {
        const res = await fetch(p);
        if (res.ok) return responseType === 'json' ? await res.json() : await res.text();
      } catch (err) {}
    }
    return null;
  }

  function cleanSongTitle(title) {
    if (!title) return 'Suno Song';
    return title.replace(/\s*[-|]\s*Suno.*$/i, '').replace(/^Suno\s*[-|]\s*/i, '').trim();
  }

  // --- RENDER SINGLE TRACK UI ---
  function renderTrackUI(data) {
    if (!data) return;
    el.resultSection.style.display = 'block';

    el.coverImg.src = data.imageLargeUrl || data.imageUrl;
    el.modelBadge.textContent = data.model ? `Model ${data.model}` : 'Suno AI';

    el.trackTitle.textContent = data.title || 'Suno Track';
    el.authorName.textContent = data.displayName || data.artist || 'Suno Artist';
    if (data.avatarUrl) el.authorAvatar.src = data.avatarUrl;

    el.trackDuration.textContent = `⏱️ ${formatDuration(data.duration || 180)}`;

    let formattedDate = 'Baru';
    try {
      if (data.createdAt) {
        const d = new Date(data.createdAt);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      }
    } catch (e) {}
    el.trackDate.textContent = `📅 ${formattedDate}`;

    // Tags
    el.trackTags.innerHTML = '';
    if (data.tags) {
      const tagList = data.tags.split(',').map(t => t.trim()).filter(Boolean);
      tagList.slice(0, 6).forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag-badge';
        span.textContent = `#${tag}`;
        el.trackTags.appendChild(span);
      });
    }

    renderLyricsFormatted(data.lyrics);

    el.infoClipId.textContent = data.id;
    el.infoModel.textContent = data.model || 'v5.5';
    el.infoPrompt.textContent = data.tags || data.prompt || '-';
    el.infoAudioStream.textContent = data.audioCandidates ? data.audioCandidates[0] : '-';

    initWaveformCanvas();
    drawWaveform(0);
  }

  function renderLyricsFormatted(rawLyrics) {
    el.lyricsContent.innerHTML = '';
    if (!rawLyrics) {
      el.lyricsContent.textContent = 'Tidak ada lirik yang terdeteksi.';
      return;
    }
    const lines = rawLyrics.split('\n');
    let currentHtml = '';
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentHtml += `\n<span class="section-marker">${escapeHtml(trimmed)}</span>\n`;
      } else {
        currentHtml += escapeHtml(line) + '\n';
      }
    });
    el.lyricsContent.innerHTML = currentHtml.trim();
  }

  // --- GLOBAL AUDIO PLAYER ENGINE ---
  function playSong(data, startPlaying = true) {
    if (!data || !data.id) return;

    // If clicking the same song that is already loaded:
    if (state.nowPlayingTrack && state.nowPlayingTrack.id === data.id && el.audioPlayer.src) {
      if (startPlaying && el.audioPlayer.paused) {
        getAudioContext();
        el.audioPlayer.play().catch(e => {});
      } else if (!startPlaying && !el.audioPlayer.paused) {
        el.audioPlayer.pause();
      } else {
        toggleAudioPlayback();
      }
      return;
    }

    // New song selected for playback
    state.nowPlayingTrack = data;
    state.currentClipId = data.id;

    // Set audio source to direct stream proxy
    const streamUrl = `./proxy.php?action=stream&id=${data.id}`;
    el.audioPlayer.src = streamUrl;
    el.audioPlayer.load();

    // Update bottom global player bar UI
    updateGlobalBottomPlayerUI(data);

    // Update single-track view waveform if active
    el.currentTime.textContent = '00:00';
    el.totalTime.textContent = formatDuration(data.duration || 180);
    initWaveformCanvas();
    drawWaveform(0);

    if (startPlaying) {
      getAudioContext();
      el.audioPlayer.play().catch(err => console.warn('Playback error:', err));
    }

    updateAllPlayStates();
  }

  // Backward compatibility alias for single track view
  function setupAudioPlayer(data) {
    playSong(data, false);
  }

  function updateGlobalBottomPlayerUI(data) {
    if (!el.globalBottomPlayer) return;
    el.globalBottomPlayer.style.display = 'flex';
    document.body.classList.add('has-bottom-player');

    if (el.bpThumb) el.bpThumb.src = data.imageLargeUrl || data.imageUrl || `https://cdn2.suno.ai/image_large_${data.id}.jpeg`;
    if (el.bpTitle) {
      el.bpTitle.textContent = data.title || 'Suno Track';
      el.bpTitle.title = data.title || 'Suno Track';
    }
    if (el.bpArtist) {
      const art = data.displayName || data.artist || 'Suno Artist';
      const hnd = data.handle ? ` (@${data.handle.replace(/^@/, '')})` : '';
      el.bpArtist.textContent = `${art}${hnd}`;
    }
    if (el.bpTotalTime) {
      el.bpTotalTime.title = 'Klik untuk beralih antara Total Durasi / Hitung Mundur (Waktu Sisa)';
      el.bpTotalTime.textContent = state.showCountdown ? `-${formatDuration(data.duration || 180)}` : formatDuration(data.duration || 180);
    }
    if (el.bpCurrentTime) el.bpCurrentTime.textContent = '00:00';
    if (el.bpSeekSlider) el.bpSeekSlider.value = 0;
    if (el.bpSeekProgress) el.bpSeekProgress.style.width = '0%';

    // Connect bottom player action buttons
    if (el.bpDlMp3Btn) el.bpDlMp3Btn.onclick = () => downloadTrackInFormat('mp3', data, el.bpDlMp3Btn);
    if (el.bpDlWavBtn) el.bpDlWavBtn.onclick = () => downloadTrackInFormat('wav', data, el.bpDlWavBtn);
    if (el.bpOpenDetailBtn) el.bpOpenDetailBtn.onclick = () => {
      const card = document.querySelector(`.folder-clip-card[data-clip-id="${data.id}"]`);
      openWorkspaceClipDetail(data, card);
    };
  }

  function toggleAudioPlayback() {
    if (!el.audioPlayer.src) {
      if (state.nowPlayingTrack) {
        playSong(state.nowPlayingTrack, true);
      } else if (state.currentFolderClips && state.currentFolderClips.length > 0) {
        playSong(state.currentFolderClips[0], true);
      }
      return;
    }
    if (el.audioPlayer.paused) {
      getAudioContext();
      el.audioPlayer.play().catch(err => console.warn('Playback error:', err));
    } else {
      el.audioPlayer.pause();
    }
  }

  function playNextTrack() {
    const list = state.currentFolderClips;
    if (!list || list.length === 0) return;

    if (state.isShuffling) {
      const randIdx = Math.floor(Math.random() * list.length);
      playSong(list[randIdx], true);
      return;
    }

    let currIdx = list.findIndex(c => c.id === state.nowPlayingTrack?.id);
    if (currIdx === -1) currIdx = 0;
    const nextIdx = (currIdx + 1) % list.length;
    playSong(list[nextIdx], true);
    showToast(`Memutar berikutnya: ${list[nextIdx].title}`, 'info');
  }

  function playPrevTrack() {
    const list = state.currentFolderClips;
    if (!list || list.length === 0) return;

    if (el.audioPlayer.currentTime > 3) {
      el.audioPlayer.currentTime = 0;
      return;
    }

    let currIdx = list.findIndex(c => c.id === state.nowPlayingTrack?.id);
    if (currIdx === -1) currIdx = 0;
    const prevIdx = (currIdx - 1 + list.length) % list.length;
    playSong(list[prevIdx], true);
    showToast(`Memutar sebelumnya: ${list[prevIdx].title}`, 'info');
  }

  function updateAllPlayStates() {
    const isPlaying = !el.audioPlayer.paused && Boolean(el.audioPlayer.src);
    const nowId = state.nowPlayingTrack?.id;

    // 1. Single View Play Button
    if (el.playPauseBtn) {
      el.playPauseBtn.innerHTML = isPlaying ? '⏸' : '▶';
    }

    // 2. Global Bottom Player Play Button
    if (el.bpPlayPauseBtn) {
      el.bpPlayPauseBtn.innerHTML = isPlaying ? '⏸' : '▶';
    }

    // 3. Side Detail Pane Play Button
    if (el.wsPlayPauseBtn) {
      if (activeDetailClipId === nowId) {
        el.wsPlayPauseBtn.innerHTML = isPlaying ? '⏸' : '▶';
      } else {
        el.wsPlayPauseBtn.innerHTML = '▶';
      }
    }

    // 4. Update every card in the folder grid
    document.querySelectorAll('.folder-clip-card').forEach(card => {
      const cardClipId = card.dataset.clipId;
      const playBtn = card.querySelector('.btn-clip-play');
      const titleBox = card.querySelector('.clip-title');

      if (cardClipId === nowId) {
        card.classList.add('is-now-playing');

        // Add/update equalizer animation in card title
        let eq = titleBox ? titleBox.querySelector('.now-playing-eq') : null;
        if (!eq && titleBox) {
          eq = document.createElement('span');
          eq.className = 'now-playing-eq';
          eq.innerHTML = '<span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>';
          titleBox.appendChild(eq);
        }

        if (isPlaying) {
          if (eq) eq.classList.remove('is-paused');
          if (playBtn) {
            playBtn.innerHTML = '⏸ Jeda';
            playBtn.classList.add('is-playing');
          }
        } else {
          if (eq) eq.classList.add('is-paused');
          if (playBtn) {
            playBtn.innerHTML = '▶ Lanjut';
            playBtn.classList.remove('is-playing');
          }
        }
      } else {
        card.classList.remove('is-now-playing');
        const eq = titleBox ? titleBox.querySelector('.now-playing-eq') : null;
        if (eq) eq.remove();
        if (playBtn) {
          playBtn.innerHTML = '▶ Putar';
          playBtn.classList.remove('is-playing');
        }
      }
    });
  }

  function updateAudioProgress() {
    if (!el.audioPlayer.duration) return;
    const cur = el.audioPlayer.currentTime;
    const dur = el.audioPlayer.duration;
    const ratio = Math.max(0, Math.min(1, cur / dur));

    // Single mode waveform
    el.currentTime.textContent = formatDuration(cur);
    drawWaveform(ratio);

    // Global Bottom Player seekbar & time
    if (el.bpCurrentTime) el.bpCurrentTime.textContent = formatDuration(cur);
    if (el.bpTotalTime) {
      if (state.showCountdown) {
        const remaining = Math.max(0, dur - cur);
        el.bpTotalTime.textContent = `-${formatDuration(remaining)}`;
      } else {
        el.bpTotalTime.textContent = formatDuration(dur);
      }
    }
    if (el.bpSeekSlider && !el.bpSeekSlider.dataset.dragging) {
      el.bpSeekSlider.value = ratio * 100;
    }
    if (el.bpSeekProgress && !el.bpSeekSlider?.dataset.dragging) {
      el.bpSeekProgress.style.width = `${ratio * 100}%`;
    }

    // Side detail pane seekbar & time (if viewing the now-playing track)
    if (activeDetailClipId === state.nowPlayingTrack?.id) {
      if (el.wsCurrentTime) el.wsCurrentTime.textContent = formatDuration(cur);
      if (el.wsTotalTime) el.wsTotalTime.textContent = formatDuration(dur);
      if (el.wsSeekSlider) el.wsSeekSlider.value = ratio * 100;
    }
  }

  function initWaveformCanvas() {
    const canvas = el.waveformCanvas;
    const parent = el.waveformBox;
    if (!canvas || !parent) return;
    const w = parent.clientWidth > 0 ? parent.clientWidth : 450;
    const h = parent.clientHeight > 0 ? parent.clientHeight : 44;
    canvas.width = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
  }

  function generateWaveformData() {
    waveData = [];
    const bars = 65;
    for (let i = 0; i < bars; i++) {
      const height = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.18) * Math.cos(i * 0.08) + Math.random() * 0.2);
      waveData.push(Math.min(1, height));
    }
  }

  function drawWaveform(progressRatio = 0) {
    const canvas = el.waveformCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width || 450;
    const h = canvas.height || 44;
    if (w <= 0 || h <= 0) return;

    ctx.clearRect(0, 0, w, h);
    const barCount = waveData.length || 65;
    const barWidth = (w / barCount) * 0.65;
    const gap = (w / barCount) * 0.35;

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + gap);
      const val = waveData[i] || 0.4;
      const barH = val * h * 0.82;
      const y = (h - barH) / 2;

      ctx.fillStyle = (i / barCount <= progressRatio) ? '#00f2fe' : 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, barH, 2);
      } else {
        ctx.rect(x, y, barWidth, barH);
      }
      ctx.fill();
    }
  }

  // --- BOTTOM PLAYER LIVE AUDIO SPECTRUM VISUALIZER ---
  function startSpectrumVisualizer() {
    if (!spectrumAnimationId) {
      spectrumAnimationId = requestAnimationFrame(renderBottomPlayerSpectrum);
    }
  }

  function renderBottomPlayerSpectrum() {
    spectrumAnimationId = requestAnimationFrame(renderBottomPlayerSpectrum);

    const canvas = el.bpSpectrumCanvas;
    if (!canvas || !el.globalBottomPlayer || el.globalBottomPlayer.style.display === 'none') {
      return;
    }

    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = Math.floor(rect.width) || 600;
    const height = Math.floor(rect.height) || 64;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const isPlaying = !el.audioPlayer.paused && Boolean(el.audioPlayer.src);
    const numBars = 54;
    const barWidth = Math.max(3, (width / numBars) * 0.58);
    const gap = (width - (numBars * barWidth)) / (numBars - 1);

    if (spectrumSmoothed.length !== numBars) {
      spectrumSmoothed = new Array(numBars).fill(2);
      spectrumPeaks = new Array(numBars).fill(2);
    }

    // Try reading real frequency data from Web Audio Analyser
    let freqData = null;
    let hasRealData = false;
    if (analyserNode && isPlaying) {
      const bufferLen = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLen);
      analyserNode.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLen; i++) sum += dataArray[i];
      if (sum > 10) {
        freqData = dataArray;
        hasRealData = true;
      }
    }

    const time = performance.now() * 0.003;
    const audioCurTime = el.audioPlayer.currentTime || 0;

    for (let i = 0; i < numBars; i++) {
      let targetHeight = 3;

      if (isPlaying) {
        if (hasRealData && freqData) {
          const binIndex = Math.min(Math.floor((i / numBars) * (freqData.length * 0.72)), freqData.length - 1);
          const rawVal = freqData[binIndex] / 255;
          targetHeight = 4 + rawVal * (height * 0.85);
        } else {
          // Dynamic organic spectrum synthesis
          const wave1 = Math.sin(time * 2.6 + i * 0.26);
          const wave2 = Math.cos(time * 1.8 - i * 0.17 + audioCurTime * 3.2);
          const beat = Math.abs(Math.sin(audioCurTime * 4.4 + (i % 4) * 0.7));
          const arch = Math.sin((i / numBars) * Math.PI);
          const energy = (0.2 + 0.55 * Math.abs(wave1 * wave2) + 0.25 * beat) * (0.35 + 0.65 * arch);
          targetHeight = 4 + energy * (height * 0.82);
        }
      } else {
        // Paused/idle: soft low breathing wave
        targetHeight = 3 + Math.sin(time * 0.7 + i * 0.2) * 1.6;
      }

      const lerpSpeed = isPlaying ? 0.35 : 0.12;
      spectrumSmoothed[i] += (targetHeight - spectrumSmoothed[i]) * lerpSpeed;
      const curH = Math.max(2, spectrumSmoothed[i]);

      if (curH >= spectrumPeaks[i]) {
        spectrumPeaks[i] = curH;
      } else {
        spectrumPeaks[i] -= 0.65;
        if (spectrumPeaks[i] < curH) spectrumPeaks[i] = curH;
      }

      const x = i * (barWidth + gap);
      const y = height - curH - 2;

      // Vivid neon vertical gradient: Electric Cyan -> Violet/Purple -> Neon Pink
      const grad = ctx.createLinearGradient(0, y, 0, height);
      grad.addColorStop(0, '#00f2fe');
      grad.addColorStop(0.5, '#a855f7');
      grad.addColorStop(1, 'rgba(236, 72, 153, 0.45)');

      ctx.fillStyle = grad;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = isPlaying ? 6 : 2;

      const radius = Math.min(barWidth / 2, 2.5);
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, curH, [radius, radius, 0, 0]);
      } else {
        ctx.rect(x, y, barWidth, curH);
      }
      ctx.fill();

      // Peak hold dot
      if (isPlaying && spectrumPeaks[i] > 6) {
        const peakY = height - spectrumPeaks[i] - 4;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 8;
        ctx.fillRect(x, Math.max(0, peakY), barWidth, 2);
      }
    }

    ctx.restore();
  }

  // --- DOWNLOAD MANAGERS & REAL-TIME PROGRESS ENGINE ---
  const activeDownloads = new Map();

  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0) + ' ' + units[i];
  }

  function updateDownloadDockHeader() {
    if (!el.dpActiveCountBadge) return;
    let activeCount = 0;
    activeDownloads.forEach(t => {
      if (t.state !== 'completed' && t.state !== 'error') activeCount++;
    });
    el.dpActiveCountBadge.textContent = activeCount;
    if (activeCount === 0 && activeDownloads.size === 0) {
      if (el.downloadProgressDock) {
        setTimeout(() => {
          if (activeDownloads.size === 0 && el.downloadProgressDock) {
            el.downloadProgressDock.style.display = 'none';
          }
        }, 3000);
      }
    }
  }

  function createDownloadTask(opts) {
    const taskId = 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const task = {
      id: taskId,
      clipId: opts.clipId || '',
      title: opts.title || 'Audio Suno',
      artist: opts.artist || 'Suno AI',
      coverUrl: opts.coverUrl || 'https://cdn1.suno.ai/defaultBlue.webp',
      format: (opts.format || 'mp3').toLowerCase(),
      isMastering: !!opts.isMastering,
      presetName: opts.presetName || '',
      btn: opts.btn || null,
      percent: typeof opts.percent === 'number' ? opts.percent : 0,
      status: opts.status || 'Menyiapkan unduhan...',
      loadedBytes: 0,
      totalBytes: 0,
      state: 'pending'
    };
    activeDownloads.set(taskId, task);

    if (el.downloadProgressDock) {
      el.downloadProgressDock.style.display = 'block';
    }

    renderDownloadTaskCard(task);
    updateDownloadDockHeader();
    return taskId;
  }

  function renderDownloadTaskCard(task) {
    if (!el.dpTasksList) return;
    let card = document.getElementById(`dpCard_${task.id}`);
    if (!card) {
      card = document.createElement('div');
      card.id = `dpCard_${task.id}`;
      card.className = 'dp-task-card';
      el.dpTasksList.prepend(card);
    }

    const fmtUpper = (task.format || 'MP3').toUpperCase();
    const fmtClass = `fmt-${task.format || 'mp3'}`;
    const masteringBadgeHtml = task.isMastering 
      ? `<span class="dp-mastering-badge" title="Mastering: ${escapeHtml(task.presetName)}">🎛️ MASTERED</span>` 
      : '';

    card.innerHTML = `
      <div class="dp-task-top">
        <img class="dp-task-thumb" src="${task.coverUrl}" alt="Cover" onerror="this.src='https://cdn1.suno.ai/defaultBlue.webp'">
        <div class="dp-task-info">
          <div class="dp-task-name" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</div>
          <div class="dp-task-badges">
            <span class="dp-format-badge ${fmtClass}">${fmtUpper}</span>
            ${masteringBadgeHtml}
            <span class="dp-task-artist">${escapeHtml(task.artist)}</span>
          </div>
        </div>
        <div class="dp-task-percent" id="dpPct_${task.id}">${task.percent >= 0 ? task.percent + '%' : '⏳'}</div>
      </div>
      <div class="dp-progress-wrap">
        <div class="dp-progress-bar ${task.percent < 0 ? 'is-indeterminate' : ''}" id="dpBar_${task.id}" style="width: ${task.percent >= 0 ? task.percent : 40}%;"></div>
      </div>
      <div class="dp-task-bottom">
        <span class="dp-task-status" id="dpStatus_${task.id}">${escapeHtml(task.status)}</span>
        <span class="dp-task-bytes" id="dpBytes_${task.id}"></span>
      </div>
    `;
  }

  function updateDownloadProgress(taskId, data) {
    const task = activeDownloads.get(taskId);
    if (!task) return;

    if (typeof data.percent === 'number') task.percent = data.percent;
    if (data.status) task.status = data.status;
    if (typeof data.loadedBytes === 'number') task.loadedBytes = data.loadedBytes;
    if (typeof data.totalBytes === 'number') task.totalBytes = data.totalBytes;
    if (data.state) task.state = data.state;

    const pctEl = document.getElementById(`dpPct_${taskId}`);
    const barEl = document.getElementById(`dpBar_${taskId}`);
    const statusEl = document.getElementById(`dpStatus_${taskId}`);
    const bytesEl = document.getElementById(`dpBytes_${taskId}`);

    if (pctEl) {
      if (task.percent >= 0) {
        pctEl.textContent = `${task.percent}%`;
      } else {
        pctEl.textContent = '⏳';
      }
    }

    if (barEl) {
      if (data.isIndeterminate || task.percent < 0) {
        barEl.classList.add('is-indeterminate');
        barEl.style.width = '40%';
      } else {
        barEl.classList.remove('is-indeterminate');
        barEl.style.width = `${Math.min(100, Math.max(0, task.percent))}%`;
      }
    }

    if (statusEl) {
      statusEl.textContent = task.status;
      if (task.state === 'completed') {
        statusEl.className = 'dp-task-status is-complete';
      } else if (task.state === 'error') {
        statusEl.className = 'dp-task-status is-error';
      } else {
        statusEl.className = 'dp-task-status';
      }
    }

    if (bytesEl) {
      if (task.totalBytes > 0 && task.loadedBytes > 0) {
        bytesEl.textContent = `${formatBytes(task.loadedBytes)} / ${formatBytes(task.totalBytes)}`;
      } else if (task.loadedBytes > 0) {
        bytesEl.textContent = formatBytes(task.loadedBytes);
      } else {
        bytesEl.textContent = '';
      }
    }

    updateDownloadDockHeader();
  }

  function completeDownloadTask(taskId, finalFilename, finalSize = 0) {
    const task = activeDownloads.get(taskId);
    if (!task) return;

    task.state = 'completed';
    task.percent = 100;
    task.status = '✅ Selesai diunduh!';
    if (finalSize > 0) task.loadedBytes = finalSize;

    updateDownloadProgress(taskId, {
      percent: 100,
      status: `✅ Selesai diunduh!`,
      isIndeterminate: false,
      state: 'completed'
    });

    const barEl = document.getElementById(`dpBar_${taskId}`);
    if (barEl) {
      barEl.classList.remove('is-indeterminate');
      barEl.classList.add('is-complete');
      barEl.style.width = '100%';
    }

    if (task.btn) {
      setButtonLoading(task.btn, false, task.format.toUpperCase());
    }

    try {
      recordDownloadEvent({
        id: task.clipId,
        title: task.title,
        artist: task.artist
      }, task.format, finalSize || task.loadedBytes || 0);
    } catch (e) {
      console.debug('recordDownloadEvent notice:', e);
    }

    updateDownloadDockHeader();

    setTimeout(() => {
      removeDownloadTask(taskId);
    }, 7000);
  }

  function failDownloadTask(taskId, errorMsg) {
    const task = activeDownloads.get(taskId);
    if (!task) return;

    task.state = 'error';
    task.status = `❌ Gagal: ${errorMsg || 'Terjadi kesalahan'}`;

    updateDownloadProgress(taskId, {
      status: task.status,
      isIndeterminate: false,
      state: 'error'
    });

    const barEl = document.getElementById(`dpBar_${taskId}`);
    if (barEl) {
      barEl.classList.remove('is-indeterminate');
      barEl.classList.add('is-error');
      barEl.style.width = '100%';
    }

    if (task.btn) {
      setButtonLoading(task.btn, false, task.format.toUpperCase());
    }

    updateDownloadDockHeader();

    setTimeout(() => {
      removeDownloadTask(taskId);
    }, 9000);
  }

  function removeDownloadTask(taskId) {
    activeDownloads.delete(taskId);
    const card = document.getElementById(`dpCard_${taskId}`);
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(10px)';
      card.style.transition = 'all 0.3s ease';
      setTimeout(() => card.remove(), 300);
    }
    updateDownloadDockHeader();
  }

  async function downloadTrackInFormat(format, customTrack = null, triggeringBtn = null) {
    const track = customTrack || state.trackData;
    if (!track) return;
    const cleanTitle = cleanFileName(`${track.displayName || track.artist || 'Suno'} - ${track.title || 'Song'}`);
    const btnMap = {
      m4a: el.dlM4aBtn,
      mp4: el.dlMp4Btn,
      wav: el.dlWavBtn,
      mp3: el.dlMp3Btn,
      flac: el.dlFlacBtn
    };
    const btn = triggeringBtn || (customTrack ? null : (btnMap[format] || null));
    const label = format.toUpperCase();

    if (btn) setButtonLoading(btn, true, label);
    showToast(`Memproses download ${label} (${cleanTitle})...`, 'info');

    // Strategy 1: Local PHP proxy (High-speed FFmpeg conversion: 24-bit WAV, FLAC, 320k MP3)
    try {
      const ping = await fetch('./proxy.php?ping=1').then(r => r.ok).catch(() => false);
      if (ping) {
        await triggerServerDownload('', `${cleanTitle}.${format}`, btn, label, track.id, format, track);
        return;
      }
    } catch (e) {}

    // Strategy 2: Client-side Fallback
    const directAudioUrl = (track.audioCandidates && track.audioCandidates[0]) ? track.audioCandidates[0] : `https://d2lwuy8qc234o3.cloudfront.net/1/clip/${track.id}.m4a`;

    if (format === 'm4a') {
      downloadAudioOrVideoFile(directAudioUrl, `${cleanTitle}.m4a`, btn, label, track);
      return;
    }
    if (format === 'mp4') {
      const mp4Url = track.videoUrl || `https://cdn1.suno.ai/${track.id}.mp4`;
      downloadAudioOrVideoFile(mp4Url, `${cleanTitle}.mp4`, btn, label, track);
      return;
    }
    if (format === 'wav') {
      try {
        const audioBuffer = await getOrFetchDecodedAudio(track);
        if (audioBuffer) {
          const wavBlob = audioBufferToWavBlob(audioBuffer);
          saveBlobAs(wavBlob, `${cleanTitle}.wav`);
          showToast('WAV 24-bit berhasil diunduh!', 'success');
          if (btn) setButtonLoading(btn, false, label);
          return;
        }
      } catch (err) {}
      downloadAudioOrVideoFile(directAudioUrl, `${cleanTitle}.wav`, btn, label, track);
      return;
    }
    if (format === 'flac') {
      downloadAudioOrVideoFile(directAudioUrl, `${cleanTitle}.flac`, btn, label, track);
      return;
    }
    if (format === 'mp3') {
      try {
        const Lame = window.lamejs || (typeof lamejs !== 'undefined' ? lamejs : null);
        if (Lame && Lame.Mp3Encoder) {
          const audioBuffer = await getOrFetchDecodedAudio(track);
          if (audioBuffer) {
            const mp3Blob = audioBufferToMp3Blob(audioBuffer, 320);
            if (mp3Blob) {
              saveBlobAs(mp3Blob, `${cleanTitle}.mp3`);
              showToast('MP3 320kbps berhasil diunduh!', 'success');
              if (btn) setButtonLoading(btn, false, label);
              return;
            }
          }
        }
      } catch (e) {}
      downloadAudioOrVideoFile(directAudioUrl, `${cleanTitle}.mp3`, btn, label, track);
    }
  }

  async function downloadAllInZip(customTrack = null, triggeringBtn = null) {
    const track = customTrack || state.trackData;
    if (!track) return;
    const JSZipLib = window.JSZip || (typeof JSZip !== 'undefined' ? JSZip : null);
    if (!JSZipLib) {
      showToast('Library ZIP sedang dimuat...', 'info');
      return;
    }

    const btn = triggeringBtn || (customTrack ? null : el.dlZipBtn);
    if (btn) setButtonLoading(btn, true, 'ZIP');

    const cleanTitle = cleanFileName(`${track.displayName || track.artist || 'Suno'} - ${track.title || 'Song'}`);
    const isMastering = !!(masteringState && masteringState.isActive);
    const currentPresetKey = (masteringState && masteringState.currentPreset) || 'studio_master';
    const presetName = MASTERING_PRESETS[currentPresetKey]?.name || 'Studio Master';

    const taskId = createDownloadTask({
      clipId: track.id || '',
      title: `${track.title || 'Lagu'} [Paket Lengkap]`,
      artist: track.displayName || track.artist || 'Suno AI',
      coverUrl: track.imageLargeUrl || track.imageUrl || 'https://cdn1.suno.ai/defaultBlue.webp',
      format: 'zip',
      isMastering: isMastering,
      presetName: presetName,
      btn: btn
    });

    try {
      updateDownloadProgress(taskId, {
        percent: 10,
        status: '📝 Menyiapkan berkas lirik & metadata...',
        isIndeterminate: false
      });

      const zip = new JSZipLib();
      const folder = zip.folder(cleanTitle);

      // 1. Lyrics
      const lyricsHeader = `========================================\n${track.title}\nOleh: ${track.displayName || track.artist}\nModel: ${track.model} | Suno AI\nTags: ${track.tags}\n========================================\n\n`;
      folder.file(`${cleanTitle} - Lirik.txt`, lyricsHeader + (track.lyrics || ''));

      // 2. Cover Artwork
      updateDownloadProgress(taskId, {
        percent: 30,
        status: '🖼️ Mengunduh artwork cover HD...',
        isIndeterminate: false
      });
      try {
        const coverBlob = await fetchMediaBlob(track.imageLargeUrl || track.imageUrl);
        if (coverBlob) folder.file(`${cleanTitle} - Cover.jpg`, coverBlob);
      } catch (e) {}

      // 3. Audio Stream with live reader
      updateDownloadProgress(taskId, {
        percent: 50,
        status: isMastering ? '🎛️ Memproses FFmpeg & DSP Mastering MP3...' : '🎵 Mengunduh berkas audio MP3...',
        isIndeterminate: true
      });

      try {
        const audioUrl = `./proxy.php?action=download&id=${track.id}&format=mp3${getMasteringQueryString()}`;
        const audioRes = await fetch(audioUrl);
        if (audioRes.ok) {
          const audioBlob = await audioRes.blob();
          if (audioBlob && audioBlob.size > 1000) {
            folder.file(`${cleanTitle}.mp3`, audioBlob);
          }
        }
      } catch (e) {}

      // 4. Compress to ZIP
      updateDownloadProgress(taskId, {
        percent: 85,
        status: '🗜️ Mengompres berkas ke format ZIP...',
        isIndeterminate: false
      });

      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        const pct = Math.min(99, Math.round(85 + (metadata.percent * 0.14)));
        updateDownloadProgress(taskId, {
          percent: pct,
          status: `🗜️ Mengompres ZIP (${Math.round(metadata.percent)}%)...`,
          loadedBytes: 0,
          totalBytes: 0,
          isIndeterminate: false
        });
      });

      saveBlobAs(content, `${cleanTitle} [Paket Lengkap].zip`);
      completeDownloadTask(taskId, `${cleanTitle} [Paket Lengkap].zip`, content.size);
      showToast('Paket ZIP berhasil diunduh!', 'success');

      if (track && track.id) {
        addToHistory({
          id: track.id,
          title: track.title || `${cleanTitle} [Paket Lengkap]`,
          displayName: track.displayName || track.artist || 'Suno Artist',
          artist: track.artist || track.displayName || 'Suno Artist',
          imageUrl: track.imageUrl || track.imageLargeUrl || 'https://cdn1.suno.ai/defaultBlue.webp'
        });
      }
    } catch (err) {
      failDownloadTask(taskId, err.message || 'Gagal membuat ZIP');
      showToast('Gagal membuat paket ZIP: ' + err.message, 'error');
    } finally {
      if (btn) setButtonLoading(btn, false, 'ZIP');
    }
  }

  async function downloadCoverImage() {
    if (!state.trackData) return;
    const track = state.trackData;
    const coverUrl = track.imageLargeUrl || track.imageUrl;
    if (!coverUrl) return;
    const cleanTitle = cleanFileName(`${track.displayName || track.artist || 'Suno'} - ${track.title} - Cover`);
    downloadAudioOrVideoFile(coverUrl, `${cleanTitle}.jpg`, el.downloadCoverBtn, 'Download Cover HD (PNG)', track);
  }

  function copyLyricsToClipboard() {
    if (!state.trackData || !state.trackData.lyrics) return;
    navigator.clipboard.writeText(state.trackData.lyrics).then(() => {
      showToast('Lirik disalin ke clipboard!', 'success');
    });
  }

  function downloadLyricsTxt(customTrack = null) {
    const track = customTrack || state.trackData;
    if (!track) return;
    const cleanTitle = cleanFileName(`${track.displayName || track.artist || 'Suno'} - ${track.title} - Lirik`);
    const content = `${track.title}\nArtist: ${track.displayName || track.artist}\nTags: ${track.tags || ''}\n\n${track.lyrics || ''}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveBlobAs(blob, `${cleanTitle}.txt`);
    showToast('Lirik (TXT) berhasil diunduh!', 'success');
  }

  function downloadLyricsLrc(customTrack = null) {
    const track = customTrack || state.trackData;
    if (!track) return;
    const cleanTitle = cleanFileName(`${track.displayName || track.artist || 'Suno'} - ${track.title}`);
    let lrc = `[ti:${track.title}]\n[ar:${track.displayName || track.artist}]\n[al:Suno AI]\n[by:SuDownloader]\n`;
    const lines = (track.lyrics || '').split('\n');
    lines.forEach((line, idx) => {
      if (line.trim()) {
        const min = Math.floor((idx * 4) / 60);
        const sec = (idx * 4) % 60;
        lrc += `[${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.00]${line}\n`;
      }
    });
    saveBlobAs(new Blob([lrc], { type: 'text/plain;charset=utf-8' }), `${cleanTitle}.lrc`);
    showToast('Lirik (LRC) berhasil diunduh!', 'success');
  }

  // Audio Buffers
  async function getOrFetchDecodedAudio(customTrack = null) {
    const track = customTrack || state.trackData;
    if (!track) return null;
    const ctx = getAudioContext();
    if (!ctx) return null;
    const url = `./proxy.php?action=stream&id=${track.id}`;
    try {
      const res = await fetch(url);
      const ab = await res.arrayBuffer();
      return await ctx.decodeAudioData(ab);
    } catch (e) {
      return null;
    }
  }

  function audioBufferToWavBlob(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    const byteRate = sampleRate * numChannels * 3; // 24-bit PCM
    const blockAlign = numChannels * 3;
    const dataSize = length * numChannels * 3;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(offset, str) {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 24, true); // 24-bit!
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    const channelData = [];
    for (let c = 0; c < numChannels; c++) channelData.push(audioBuffer.getChannelData(c));

    for (let i = 0; i < length; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = Math.max(-1, Math.min(1, channelData[c][i]));
        let intSample = sample < 0 ? sample * 0x800000 : sample * 0x7FFFFF;
        intSample = Math.floor(intSample);
        view.setUint8(offset, intSample & 0xFF);
        view.setUint8(offset + 1, (intSample >> 8) & 0xFF);
        view.setUint8(offset + 2, (intSample >> 16) & 0xFF);
        offset += 3;
      }
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  function audioBufferToMp3Blob(audioBuffer, kbps = 320) {
    const Lame = window.lamejs || (typeof lamejs !== 'undefined' ? lamejs : null);
    if (!Lame || !Lame.Mp3Encoder) return null;
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const encoder = new Lame.Mp3Encoder(numChannels, sampleRate, kbps);
    const mp3Data = [];
    const left = audioBuffer.getChannelData(0);
    const right = numChannels > 1 ? audioBuffer.getChannelData(1) : left;
    const blockSize = 1152;
    const totalSamples = left.length;
    const leftInt16 = new Int16Array(blockSize);
    const rightInt16 = new Int16Array(blockSize);

    for (let i = 0; i < totalSamples; i += blockSize) {
      const currentBlock = Math.min(blockSize, totalSamples - i);
      for (let j = 0; j < currentBlock; j++) {
        const sL = Math.max(-1, Math.min(1, left[i + j]));
        leftInt16[j] = sL < 0 ? sL * 0x8000 : sL * 0x7FFF;
        const sR = Math.max(-1, Math.min(1, right[i + j]));
        rightInt16[j] = sR < 0 ? sR * 0x8000 : sR * 0x7FFF;
      }
      const mp3buf = numChannels === 1 
        ? encoder.encodeBuffer(leftInt16.subarray(0, currentBlock))
        : encoder.encodeBuffer(leftInt16.subarray(0, currentBlock), rightInt16.subarray(0, currentBlock));
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }
    const endBuf = encoder.flush();
    if (endBuf.length > 0) mp3Data.push(endBuf);
    return new Blob(mp3Data, { type: 'audio/mp3' });
  }

  async function fetchMediaBlob(url) {
    try {
      const phpUrl = `./proxy.php?url=${encodeURIComponent(url)}`;
      const res = await fetch(phpUrl);
      if (res.ok) return await res.blob();
    } catch (e) {}
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) return await res.blob();
    } catch (e) {}
    return null;
  }

  async function downloadAudioOrVideoFile(url, filename, btnEl, btnLabel, trackInfo = null) {
    if (btnEl) setButtonLoading(btnEl, true, btnLabel);
    const ext = filename.split('.').pop().toLowerCase();
    const track = trackInfo || state.trackData || {};

    try {
      const ping = await fetch('./proxy.php?ping=1').then(r => r.ok).catch(() => false);
      if (ping) {
        await triggerServerDownload(url, filename, btnEl, btnLabel, track.id || '', ext, track);
        return;
      }
    } catch (e) {}

    try {
      const blob = await fetchMediaBlob(url);
      if (blob && blob.size > 500) {
        saveBlobAs(blob, filename);
        if (btnEl) setButtonLoading(btnEl, false, btnLabel);
        return;
      }
    } catch (err) {}
    triggerDirectFileDownload(url, filename);
    if (btnEl) setButtonLoading(btnEl, false, btnLabel);
  }

  async function triggerServerDownload(url, filename, btnEl, btnLabel, id = '', format = 'mp3', trackInfo = null) {
    const isMastering = !!(masteringState && masteringState.isActive);
    const currentPresetKey = (masteringState && masteringState.currentPreset) || 'studio_master';
    const presetName = MASTERING_PRESETS[currentPresetKey]?.name || 'Studio Master';
    const track = trackInfo || state.trackData || {};

    const taskId = createDownloadTask({
      clipId: track.id || id || '',
      title: track.title || filename || 'Suno Audio Track',
      artist: track.displayName || track.artist || 'Suno AI',
      coverUrl: track.imageLargeUrl || track.imageUrl || 'https://cdn1.suno.ai/defaultBlue.webp',
      format: (format || 'mp3').toLowerCase(),
      isMastering: isMastering && ['mp3', 'wav', 'flac'].includes((format || '').toLowerCase()),
      presetName: presetName,
      btn: btnEl
    });

    const fmtUpper = (format || 'mp3').toUpperCase();
    if (btnEl) setButtonLoading(btnEl, true, fmtUpper);

    try {
      const masteringQuery = getMasteringQueryString();
      let downloadUrl = '';
      if (id && format) {
        downloadUrl = `./proxy.php?action=download&id=${encodeURIComponent(id)}&format=${encodeURIComponent(format)}&filename=${encodeURIComponent(filename)}${masteringQuery}`;
      } else {
        downloadUrl = `./proxy.php?action=download&url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}${masteringQuery}`;
      }

      // 1. Notify status while waiting for FFmpeg / PHP conversion
      if (isMastering && ['mp3', 'wav', 'flac'].includes((format || '').toLowerCase())) {
        updateDownloadProgress(taskId, {
          percent: -1,
          status: `🎛️ Memproses DSP Mastering & FFmpeg (${fmtUpper})...`,
          isIndeterminate: true
        });
      } else {
        updateDownloadProgress(taskId, {
          percent: -1,
          status: `⏳ Menyiapkan & konversi ${fmtUpper}...`,
          isIndeterminate: true
        });
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        let errDetail = response.statusText;
        try {
          const txt = await response.text();
          if (txt) errDetail = txt.substring(0, 100);
        } catch (e) {}
        throw new Error(`Server ${response.status}: ${errDetail}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

      let blob = null;
      if (response.body && typeof response.body.getReader === 'function') {
        const reader = response.body.getReader();
        let receivedBytes = 0;
        const chunks = [];

        updateDownloadProgress(taskId, {
          percent: totalBytes > 0 ? 0 : -1,
          status: `📥 Mengunduh stream ${fmtUpper}...`,
          loadedBytes: 0,
          totalBytes: totalBytes,
          isIndeterminate: totalBytes <= 0
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedBytes += value.length;

          if (totalBytes > 0) {
            const pct = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
            updateDownloadProgress(taskId, {
              percent: pct,
              status: `📥 Mengunduh ${fmtUpper}...`,
              loadedBytes: receivedBytes,
              totalBytes: totalBytes,
              isIndeterminate: false
            });
          } else {
            updateDownloadProgress(taskId, {
              percent: -1,
              status: `📥 Mengunduh ${formatBytes(receivedBytes)}...`,
              loadedBytes: receivedBytes,
              totalBytes: 0,
              isIndeterminate: true
            });
          }
        }

        const mimeMap = {
          mp3: 'audio/mpeg',
          wav: 'audio/wav',
          flac: 'audio/flac',
          m4a: 'audio/mp4',
          mp4: 'video/mp4'
        };
        const mimeType = mimeMap[format.toLowerCase()] || 'application/octet-stream';
        blob = new Blob(chunks, { type: mimeType });
      } else {
        blob = await response.blob();
      }

      saveBlobAs(blob, filename);
      completeDownloadTask(taskId, filename, blob.size);
      showToast(`✅ ${fmtUpper} "${filename}" berhasil diunduh!`, 'success');

      if (track && track.id) {
        addToHistory({
          id: track.id,
          title: track.title || filename,
          displayName: track.displayName || track.artist || 'Suno Artist',
          artist: track.artist || track.displayName || 'Suno Artist',
          imageUrl: track.imageUrl || track.imageLargeUrl || 'https://cdn1.suno.ai/defaultBlue.webp'
        });
      }
    } catch (err) {
      console.error('Download stream error:', err);
      failDownloadTask(taskId, err.message || 'Gagal mengunduh');
      showToast(`Gagal download ${fmtUpper}: ${err.message}`, 'error');
    } finally {
      if (btnEl) setButtonLoading(btnEl, false, btnLabel || fmtUpper);
    }
  }

  function triggerDirectFileDownload(url, filename) {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 1000);
  }

  function saveBlobAs(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // ============================================================
  // --- BATCH MULTI-LINK DOWNLOADER ---
  // ============================================================
  function updateBatchLineCount() {
    const lines = (el.batchUrlsInput.value || '')
      .split(/[\r\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);
    el.batchCountLabel.textContent = `${lines.length} link terdeteksi`;
  }

  async function handleBatchFetch() {
    const raw = (el.batchUrlsInput.value || '').trim();
    if (!raw) {
      showToast('Masukkan minimal satu link Suno pada kolom input.', 'error');
      return;
    }

    const lines = raw.split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) {
      showToast('Tidak ada link valid yang ditemukan.', 'error');
      return;
    }

    el.batchFetchBtn.disabled = true;
    el.batchProgressBarBox.style.display = 'block';
    el.batchProgressFill.style.width = '10%';
    el.batchProgressPercent.textContent = '10%';
    el.batchProgressStatus.textContent = `Menghubungi server untuk memproses ${lines.length} link...`;

    state.batchItems = [];
    el.batchItemsList.innerHTML = '';
    el.batchResultsSection.style.display = 'block';

    try {
      const res = await fetch('./proxy.php?action=batch_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: lines })
      });

      let json = null;
      if (res.ok) json = await res.json();

      if (json && Array.isArray(json.items)) {
        state.batchItems = json.items;
      } else {
        // Fallback: fetch individually
        for (let i = 0; i < lines.length; i++) {
          const u = lines[i];
          const pct = Math.round(((i + 1) / lines.length) * 90);
          el.batchProgressFill.style.width = `${pct}%`;
          el.batchProgressPercent.textContent = `${pct}%`;
          el.batchProgressStatus.textContent = `Mengambil ${i + 1} dari ${lines.length}...`;

          const clipId = extractClipId(u);
          if (clipId) {
            const single = await fetchSunoTrackDirect(clipId);
            if (single) {
              state.batchItems.push({ id: clipId, data: single });
            } else {
              state.batchItems.push({ id: clipId, error: 'Tidak ditemukan' });
            }
          }
        }
      }

      el.batchProgressFill.style.width = '100%';
      el.batchProgressPercent.textContent = '100%';
      el.batchProgressStatus.textContent = `Selesai! Berhasil memproses ${state.batchItems.length} lagu.`;

      renderBatchResults();
      if (state.batchItems.some(item => item.data)) {
        el.batchDownloadAllZipBtn.style.display = 'inline-flex';
      }
      showToast(`Batch selesai! ${state.batchItems.length} lagu diproses.`, 'success');
    } catch (err) {
      console.error('Batch fetch error:', err);
      showToast('Gagal memproses batch: ' + err.message, 'error');
    } finally {
      el.batchFetchBtn.disabled = false;
      setTimeout(() => {
        el.batchProgressBarBox.style.display = 'none';
      }, 2500);
    }
  }

  function renderBatchResults() {
    el.batchItemsList.innerHTML = '';
    el.batchResultsCount.textContent = state.batchItems.length;

    state.batchItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'batch-item-card';

      if (item.error) {
        card.innerHTML = `
          <div class="batch-item-main">
            <div style="font-size:24px;">⚠️</div>
            <div class="batch-item-details">
              <div class="batch-item-title" style="color:var(--accent-red);">Gagal Dimuat</div>
              <div class="batch-item-meta">${escapeHtml(item.input || item.id)} &bull; ${escapeHtml(item.error)}</div>
            </div>
          </div>
        `;
        el.batchItemsList.appendChild(card);
        return;
      }

      const d = item.data;
      card.innerHTML = `
        <div class="batch-item-main">
          <img class="batch-thumb" src="${d.imageUrl || 'https://cdn1.suno.ai/defaultBlue.webp'}" alt="Thumb" onerror="this.src='https://cdn1.suno.ai/defaultBlue.webp'">
          <div class="batch-item-details">
            <div class="batch-item-title">${escapeHtml(d.title || 'Suno Song')}</div>
            <div class="batch-item-meta">
              <span>👤 ${escapeHtml(d.displayName || d.artist || 'Suno Artist')}</span>
              <span>•</span>
              <span>⏱️ ${formatDuration(d.duration)}</span>
              <span>•</span>
              <span class="tag-badge" style="font-size:10px;">${d.model || 'v5.5'}</span>
            </div>
          </div>
        </div>
        <div class="batch-item-actions">
          <button class="btn-batch-dl" data-idx="${index}" data-format="mp3">MP3 320k</button>
          <button class="btn-batch-dl" data-idx="${index}" data-format="wav" style="color:var(--accent-purple);">WAV 24b</button>
          <button class="btn-batch-dl" data-idx="${index}" data-format="flac" style="color:#f59e0b;">FLAC</button>
          <button class="btn-batch-dl" data-idx="${index}" data-format="m4a">M4A</button>
          <button class="btn-batch-dl" data-idx="${index}" data-format="zip" style="color:var(--accent-green);">ZIP</button>
          <button class="btn-batch-dl" data-idx="${index}" data-action="single_view">🔍 Detail</button>
        </div>
      `;

      card.querySelectorAll('.btn-batch-dl').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const fmt = btn.getAttribute('data-format');
          const act = btn.getAttribute('data-action');
          if (act === 'single_view') {
            state.trackData = d;
            state.currentClipId = d.id;
            switchMode('single');
            renderTrackUI(d);
            setupAudioPlayer(d);
          } else if (fmt === 'zip') {
            downloadAllInZip(d, btn);
          } else if (fmt) {
            downloadTrackInFormat(fmt, d, btn);
          }
        });
      });

      el.batchItemsList.appendChild(card);
    });
  }

  async function handleBatchDownloadAllZip() {
    const validTracks = state.batchItems.filter(item => item.data).map(item => item.data);
    if (validTracks.length === 0) {
      showToast('Tidak ada lagu valid untuk diunduh.', 'error');
      return;
    }

    const JSZipLib = window.JSZip || (typeof JSZip !== 'undefined' ? JSZip : null);
    if (!JSZipLib) {
      showToast('Library ZIP sedang dimuat...', 'info');
      return;
    }

    const btn = el.batchDownloadAllZipBtn;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Mengompresi seluruh lagu ke ZIP...</span>';
    showToast(`Memulai pembuatan paket ZIP untuk ${validTracks.length} lagu...`, 'info');

    try {
      const zip = new JSZipLib();
      for (let i = 0; i < validTracks.length; i++) {
        const t = validTracks[i];
        const folderName = `${String(i + 1).padStart(2, '0')}. ${cleanFileName(t.title)}`;
        const sub = zip.folder(folderName);

        // Lyrics
        sub.file(`${cleanFileName(t.title)} - Lirik.txt`, `${t.title}\nArtist: ${t.displayName || t.artist}\nTags: ${t.tags}\n\n${t.lyrics}`);

        // Cover
        try {
          const coverBlob = await fetchMediaBlob(t.imageLargeUrl || t.imageUrl);
          if (coverBlob) sub.file(`${cleanFileName(t.title)} - Cover.jpg`, coverBlob);
        } catch (e) {}

        // Audio
        try {
          const audioUrl = `./proxy.php?action=download&id=${t.id}&format=mp3${getMasteringQueryString()}`;
          const audioBlob = await fetch(audioUrl).then(r => r.blob()).catch(() => null);
          if (audioBlob && audioBlob.size > 1000) {
            sub.file(`${cleanFileName(t.title)}.mp3`, audioBlob);
          }
        } catch (e) {}
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveBlobAs(zipBlob, `Suno_Batch_${validTracks.length}_Lagu.zip`);
      showToast(`Berhasil mengunduh batch ZIP ${validTracks.length} lagu!`, 'success');
    } catch (err) {
      showToast('Gagal membuat ZIP batch: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  // ============================================================
  // --- SUNO WORKSPACE & LIBRARY EXPLORER ---
  // ============================================================
  async function handleFetchWorkspace(silent = false) {
    let cookie = el.sunoCookieInput.value.trim();
    if (!cookie) {
      // Try local backend cache
      try {
        const res = await fetch('./proxy.php?action=get_saved_session');
        const json = await res.json();
        if (json && json.success && json.cookie) {
          cookie = json.cookie;
          el.sunoCookieInput.value = cookie;
          localStorage.setItem('suno_cookie', cookie);
          el.clearCookieBtn.style.display = 'inline-block';
        }
      } catch (e) {}
    }

    if (!cookie) {
      if (!silent) showToast('Harap masukkan Cookie atau gunakan tombol "⚡ Konek Otomatis".', 'error');
      return;
    }

    if (el.saveCookieCheckbox.checked) {
      try {
        localStorage.setItem('suno_cookie', cookie);
        el.clearCookieBtn.style.display = 'inline-block';
      } catch (e) {}
    }

    el.fetchWorkspaceBtn.disabled = true;
    el.workspaceLoadingState.style.display = 'block';
    el.workspaceView.style.display = 'none';

    try {
      const formData = new FormData();
      formData.append('action', 'workspace');
      formData.append('cookie', cookie);

      const res = await fetch('./proxy.php', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.message || json.error || 'Gagal terhubung ke workspace Suno.');
      }

      state.workspaceData = json;
      renderWorkspaceFolders(json);
      el.workspaceView.style.display = 'grid';
      if (!silent) showToast('Workspace Suno berhasil terhubung!', 'success');

      // Update badge status if present
      if (el.extStatusBadge) {
        el.extStatusBadge.textContent = '🟢 Akun Suno Terhubung';
        el.extStatusBadge.className = 'ext-status-badge';
      }

      // Load initial feed
      loadWorkspaceFolder('feed', 'feed', 'Feed Utama (Semua Lagu)');
    } catch (err) {
      console.error('Workspace connect error:', err);
      if (!silent) showToast(err.message || 'Kredensial cookie tidak valid atau kadaluarsa.', 'error');
    } finally {
      el.fetchWorkspaceBtn.disabled = false;
      el.workspaceLoadingState.style.display = 'none';
    }
  }

  function renderWorkspaceFolders(data) {
    el.workspaceFoldersList.innerHTML = '';

    // Normalize projects array (can be array or object from API)
    let projects = [];
    if (Array.isArray(data.projects)) {
      projects = data.projects;
    } else if (data.projects && Array.isArray(data.projects.projects)) {
      projects = data.projects.projects;
    } else if (data.projects && Array.isArray(data.projects.items)) {
      projects = data.projects.items;
    }

    // Normalize playlists array
    let playlists = [];
    if (Array.isArray(data.playlists)) {
      playlists = data.playlists;
    } else if (data.playlists && Array.isArray(data.playlists.playlists)) {
      playlists = data.playlists.playlists;
    } else if (data.playlists && Array.isArray(data.playlists.items)) {
      playlists = data.playlists.items;
    }

    // Normalize feed array
    let feed = [];
    if (Array.isArray(data.feed)) {
      feed = data.feed;
    } else if (data.feed && Array.isArray(data.feed.clips)) {
      feed = data.feed.clips;
    }

    let defaultItemToSelect = null;

    // 1. SECTION: FOLDER WORKSPACE & PROYEK (Primary, folder yang dibuat di Suno Workspace)
    const projHeader = document.createElement('div');
    projHeader.className = 'workspace-section-header';
    projHeader.innerHTML = `<span>📁 Folder Workspace (${projects.length})</span>`;
    el.workspaceFoldersList.appendChild(projHeader);

    if (projects.length > 0) {
      projects.forEach((p, idx) => {
        const title = p.name || p.title || 'Folder Tanpa Judul';
        const count = parseInt(p.clip_count ?? p.num_total_clips ?? (p.clips ? p.clips.length : 0)) || 0;
        const item = createFolderItem(`📁 ${title}`, count, `badge-proj-${p.id}`, () => {
          loadWorkspaceFolder(p.id, 'project', title, null, count);
        });
        el.workspaceFoldersList.appendChild(item);
        if (idx === 0) defaultItemToSelect = { el: item, id: p.id, type: 'project', title, count };
      });
    } else {
      const emptyNote = document.createElement('div');
      emptyNote.className = 'folder-empty-note';
      emptyNote.textContent = 'Belum ada folder proyek di workspace akun ini.';
      el.workspaceFoldersList.appendChild(emptyNote);
    }

    // 2. SECTION: PLAYLIST (Koleksi Playlist Pengguna)
    const playHeader = document.createElement('div');
    playHeader.className = 'workspace-section-header';
    playHeader.style.marginTop = '14px';
    playHeader.innerHTML = `<span>📑 Playlist Koleksi (${playlists.length})</span>`;
    el.workspaceFoldersList.appendChild(playHeader);

    if (playlists.length > 0) {
      playlists.forEach((pl, idx) => {
        const title = pl.name || pl.title || 'Playlist Tanpa Judul';
        const count = parseInt(pl.num_total_clips ?? pl.clip_count ?? (pl.clips ? pl.clips.length : 0)) || 0;
        const item = createFolderItem(`📑 ${title}`, count, `badge-play-${pl.id}`, () => {
          loadWorkspaceFolder(pl.id, 'playlist', title, null, count);
        });
        el.workspaceFoldersList.appendChild(item);
        if (!defaultItemToSelect && idx === 0) {
          defaultItemToSelect = { el: item, id: pl.id, type: 'playlist', title, count };
        }
      });
    } else {
      const emptyNote = document.createElement('div');
      emptyNote.className = 'folder-empty-note';
      emptyNote.textContent = 'Belum ada playlist.';
      el.workspaceFoldersList.appendChild(emptyNote);
    }

    // 3. SECTION: FEED UTAMA (Library Semua Lagu)
    const feedHeader = document.createElement('div');
    feedHeader.className = 'workspace-section-header';
    feedHeader.style.marginTop = '14px';
    feedHeader.innerHTML = `<span>🎵 Library Feed</span>`;
    el.workspaceFoldersList.appendChild(feedHeader);

    const feedCount = feed.length;
    const feedItem = createFolderItem('🎵 Feed Utama (Semua Lagu)', feedCount, 'badge-feed-main', () => {
      loadWorkspaceFolder('feed', 'feed', 'Feed Utama (Semua Lagu)', feed, feedCount);
    });
    el.workspaceFoldersList.appendChild(feedItem);

    // Automatically trigger selection of first Workspace Folder if exists, else Playlist, else Feed
    if (defaultItemToSelect) {
      defaultItemToSelect.el.classList.add('active');
      loadWorkspaceFolder(defaultItemToSelect.id, defaultItemToSelect.type, defaultItemToSelect.title, null, defaultItemToSelect.count);
    } else {
      feedItem.classList.add('active');
      loadWorkspaceFolder('feed', 'feed', 'Feed Utama (Semua Lagu)', feed, feedCount);
    }
  }

  function createFolderItem(title, count, badgeId, onClick) {
    const div = document.createElement('button');
    div.className = 'folder-item';
    div.innerHTML = `
      <span class="folder-item-title">${escapeHtml(title)}</span>
      <span class="folder-badge-count" id="${badgeId}">${count} lagu</span>
    `;
    div.addEventListener('click', () => {
      document.querySelectorAll('.folder-item').forEach(f => f.classList.remove('active'));
      div.classList.add('active');
      onClick();
    });
    return div;
  }

  async function loadWorkspaceFolder(folderId, folderType, folderName, initialClips = null, expectedCount = 0) {
    closeWorkspaceClipDetail();
    state.currentFolderName = folderName;
    el.currentFolderTitle.textContent = folderName;
    el.currentFolderCount.textContent = expectedCount > 0 ? `${expectedCount} Lagu Total` : 'Memuat...';
    el.folderClipsList.innerHTML = '<div style="padding:28px;color:var(--text-muted);text-align:center;">⏳ Memuat daftar lagu dari folder...</div>';

    // On mobile: auto-switch to Feed tab when folder selected
    if (window.innerWidth <= 768 && typeof switchWsTab === 'function') {
      switchWsTab('feed');
      // Update the folder breadcrumb label
      const labelEl = document.getElementById('wsFeedFolderLabel');
      const nameEl  = document.getElementById('wsFeedFolderName');
      if (labelEl) labelEl.style.display = 'flex';
      if (nameEl)  nameEl.textContent = '\uD83D\uDCC1 ' + folderName;
    }

    if (initialClips && initialClips.length > 0) {
      state.currentFolderClips = normalizeClipsData(initialClips);
      el.currentFolderCount.textContent = `${state.currentFolderClips.length} Lagu Total`;
      renderFolderClips(state.currentFolderClips);
      return;
    }

    try {
      const cookie = el.sunoCookieInput.value.trim();
      const formData = new FormData();
      formData.append('action', 'workspace_folder');
      formData.append('folder_id', folderId);
      formData.append('folder_type', folderType);
      formData.append('cookie', cookie);

      const res = await fetch('./proxy.php', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.message || 'Gagal memuat folder.');

      state.currentFolderClips = normalizeClipsData(json.clips || []);
      const totalCount = state.currentFolderClips.length;

      // Update header badge with exact total value
      el.currentFolderCount.textContent = `${totalCount} Lagu Total`;

      // Also dynamically update sidebar badge for this folder
      const badgeId = folderType === 'project' ? `badge-proj-${folderId}` : (folderType === 'playlist' ? `badge-play-${folderId}` : 'badge-feed-main');
      const badgeEl = document.getElementById(badgeId);
      if (badgeEl) {
        badgeEl.textContent = `${totalCount} lagu`;
      }

      renderFolderClips(state.currentFolderClips);
    } catch (err) {
      el.currentFolderCount.textContent = '0 Lagu';
      el.folderClipsList.innerHTML = `<div style="padding:24px;color:var(--accent-red);text-align:center;">Gagal memuat isi folder: ${escapeHtml(err.message)}</div>`;
    }
  }

  function normalizeClipsData(rawClips) {
    return rawClips.map(c => {
      const id = c.id || c.clip_id;
      const artist = c.displayName || c.display_name || c.artist || c.user_display_name || c.user_name || c.user?.display_name || (c.handle ? (c.handle.startsWith('@') ? c.handle : `@${c.handle}`) : '') || c.user?.handle || 'Suno Artist';
      return {
        id: id,
        title: cleanSongTitle(c.title || 'Suno Song'),
        artist: artist,
        displayName: artist,
        display_name: artist,
        handle: c.handle || c.user?.handle || '',
        duration: parseFloat(c.metadata?.duration || c.duration || 180),
        model: c.major_model_version || c.model || 'v5.5',
        imageUrl: c.imageLargeUrl || c.imageUrl || c.image_large_url || c.image_url || `https://cdn2.suno.ai/image_large_${id}.jpeg`,
        imageLargeUrl: c.imageLargeUrl || c.imageUrl || c.image_large_url || c.image_url || `https://cdn2.suno.ai/image_large_${id}.jpeg`,
        audioUrl: c.audioUrl || `https://d2lwuy8qc234o3.cloudfront.net/1/clip/${id}.m4a`,
        audioCandidates: c.audioCandidates || [
          `https://d2lwuy8qc234o3.cloudfront.net/1/clip/${id}.m4a`,
          `https://cdn1.suno.ai/${id}.mp3`
        ],
        lyrics: c.lyrics || c.metadata?.prompt || c.prompt || '[Instrumental]',
        tags: c.tags || c.metadata?.tags || c.display_tags || 'AI Music',
        createdAt: c.createdAt || c.created_at || ''
      };
    });
  }

  function renderFolderClips(clips) {
    el.currentFolderCount.textContent = `${clips.length} lagu`;
    el.folderClipsList.innerHTML = '';

    if (!clips || clips.length === 0) {
      el.folderClipsList.innerHTML = '<div style="padding:20px;color:var(--text-muted);grid-column:1/-1;">Folder ini kosong atau tidak ada lagu publik.</div>';
      return;
    }

    clips.forEach(clip => {
      const card = document.createElement('div');
      card.className = 'folder-clip-card';
      card.dataset.clipId = clip.id;

      if (activeDetailClipId === clip.id) {
        card.classList.add('active');
      }

      const isNowPlaying = state.nowPlayingTrack && state.nowPlayingTrack.id === clip.id;
      const isAudioActive = isNowPlaying && !el.audioPlayer.paused && Boolean(el.audioPlayer.src);

      if (isNowPlaying) {
        card.classList.add('is-now-playing');
      }

      const artistLabel = clip.displayName || clip.artist || clip.display_name || 'Suno Artist';
      const handleLabel = clip.handle ? ` (@${escapeHtml(clip.handle.replace(/^@/, ''))})` : '';
      const playBtnText = isNowPlaying ? (isAudioActive ? '⏸ Jeda' : '▶ Lanjut') : '▶ Putar';
      const playBtnClass = isNowPlaying && isAudioActive ? 'btn-clip-action btn-clip-play is-playing' : 'btn-clip-action btn-clip-play';

      card.innerHTML = `
        <div class="clip-card-top" title="Klik untuk membuka detail lagu di samping">
          <img class="clip-thumb" src="${clip.imageUrl}" alt="Thumb" onerror="this.src='https://cdn1.suno.ai/defaultBlue.webp'">
          <div class="clip-info">
            <h4 class="clip-title" title="${escapeHtml(clip.title)}">
              ${escapeHtml(clip.title)}
              ${isNowPlaying ? `<span class="now-playing-eq${isAudioActive ? '' : ' is-paused'}"><span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span></span>` : ''}
            </h4>
            <div class="clip-artist">👤 ${escapeHtml(artistLabel)}${handleLabel}</div>
            <div class="clip-duration">⏱️ ${formatDuration(clip.duration)} &bull; ${clip.model}</div>
          </div>
        </div>
        <div class="clip-card-actions">
          <button class="${playBtnClass}" title="Putar / Jeda Lagu">${playBtnText}</button>
          <button class="btn-clip-action btn-clip-view" title="Buka Detail di Samping">🔍 Detail</button>
          <button class="btn-clip-action btn-clip-mp3" title="Unduh MP3 320k">MP3</button>
          <button class="btn-clip-action btn-clip-wav" style="color:var(--accent-purple);" title="Unduh WAV 24-Bit">WAV</button>
          <button class="btn-clip-action btn-clip-flac" style="color:#f59e0b;" title="Unduh FLAC Lossless">FLAC</button>
        </div>
      `;

      card.querySelector('.btn-clip-play').addEventListener('click', (e) => {
        e.stopPropagation();
        playSong(clip, true);
      });

      card.querySelector('.btn-clip-view').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWorkspaceClipDetail(clip, card);
      });

      card.querySelector('.clip-card-top').addEventListener('click', () => {
        toggleWorkspaceClipDetail(clip, card);
      });

      card.querySelector('.btn-clip-mp3').addEventListener('click', (e) => {
        e.stopPropagation();
        downloadTrackInFormat('mp3', clip, e.currentTarget);
      });
      card.querySelector('.btn-clip-wav').addEventListener('click', (e) => {
        e.stopPropagation();
        downloadTrackInFormat('wav', clip, e.currentTarget);
      });
      card.querySelector('.btn-clip-flac').addEventListener('click', (e) => {
        e.stopPropagation();
        downloadTrackInFormat('flac', clip, e.currentTarget);
      });

      el.folderClipsList.appendChild(card);
    });
  }

  // --- WORKSPACE SIDE DETAIL PANE CONTROLLER ---
  function toggleWorkspaceClipDetail(clip, cardElement) {
    if (activeDetailClipId === clip.id && el.workspaceDetailPane && el.workspaceDetailPane.style.display !== 'none') {
      closeWorkspaceClipDetail();
      return;
    }
    openWorkspaceClipDetail(clip, cardElement);
  }

  function openWorkspaceClipDetail(clip, cardElement) {
    if (!clip) return;
    activeDetailClipId = clip.id;
    activeDetailClip = clip;

    // 1. Highlight active card in grid
    document.querySelectorAll('.folder-clip-card').forEach(c => c.classList.remove('active'));
    if (cardElement) {
      cardElement.classList.add('active');
    }

    // 2. Open side pane without navigating away or losing position
    if (el.workspaceView) el.workspaceView.classList.add('has-detail-open');
    if (el.workspaceDetailPane) {
      el.workspaceDetailPane.style.display = 'flex';
    }

    // 3. Populate metadata
    if (el.wsDetailTitle) {
      el.wsDetailTitle.textContent = clip.title || 'Suno Track';
      el.wsDetailTitle.title = clip.title || 'Suno Track';
    }
    if (el.wsDetailCover) {
      el.wsDetailCover.src = clip.imageLargeUrl || clip.imageUrl;
    }
    if (el.wsDetailModel) {
      el.wsDetailModel.textContent = clip.model ? `Model ${clip.model}` : 'v5.5';
    }

    const artistName = clip.displayName || clip.artist || clip.display_name || 'Suno Artist';
    const handleStr = clip.handle ? ` (@${clip.handle.replace(/^@/, '')})` : '';
    if (el.wsDetailArtist) {
      el.wsDetailArtist.textContent = `${artistName}${handleStr}`;
    }
    if (el.wsDetailDuration) {
      el.wsDetailDuration.textContent = `⏱️ ${formatDuration(clip.duration || 180)}`;
    }

    let formattedDate = 'Baru';
    try {
      if (clip.createdAt) {
        const d = new Date(clip.createdAt);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      }
    } catch (e) {}
    if (el.wsDetailDate) {
      el.wsDetailDate.textContent = `📅 ${formattedDate}`;
    }

    // Tags
    if (el.wsDetailTags) {
      el.wsDetailTags.innerHTML = '';
      if (clip.tags) {
        const tagList = clip.tags.split(',').map(t => t.trim()).filter(Boolean);
        tagList.slice(0, 6).forEach(tag => {
          const span = document.createElement('span');
          span.className = 'tag-badge';
          span.textContent = `#${tag}`;
          el.wsDetailTags.appendChild(span);
        });
      }
    }

    // Synchronize side player buttons with currently playing track (DO NOT stop current audio)
    updateWsPlayPauseState();

    // Lyrics
    if (el.wsDetailLyrics) {
      el.wsDetailLyrics.textContent = clip.lyrics || '[Instrumental / Lirik Khusus]\n(Lagu ini instrumental atau lirik dibuat khusus tanpa teks vokal publik.)';
    }

    // Connect download buttons
    if (el.wsDlMp3Btn) el.wsDlMp3Btn.onclick = () => downloadTrackInFormat('mp3', clip, el.wsDlMp3Btn);
    if (el.wsDlWavBtn) el.wsDlWavBtn.onclick = () => downloadTrackInFormat('wav', clip, el.wsDlWavBtn);
    if (el.wsDlFlacBtn) el.wsDlFlacBtn.onclick = () => downloadTrackInFormat('flac', clip, el.wsDlFlacBtn);
    if (el.wsDlM4aBtn) el.wsDlM4aBtn.onclick = () => downloadTrackInFormat('m4a', clip, el.wsDlM4aBtn);
    if (el.wsDlMp4Btn) el.wsDlMp4Btn.onclick = () => downloadTrackInFormat('mp4', clip, el.wsDlMp4Btn);
    if (el.wsDlZipBtn) el.wsDlZipBtn.onclick = () => downloadAllInZip(clip, el.wsDlZipBtn);

    if (el.wsCopyLyricsBtn) {
      el.wsCopyLyricsBtn.onclick = () => {
        const text = clip.lyrics || '';
        if (!text) {
          showToast('Tidak ada lirik untuk disalin.', 'warning');
          return;
        }
        navigator.clipboard.writeText(text).then(() => {
          showToast('Lirik berhasil disalin ke clipboard!', 'success');
        });
      };
    }

    if (el.wsDownloadLyricsBtn) {
      el.wsDownloadLyricsBtn.onclick = () => {
        downloadLyricsTxt(clip);
      };
    }

    if (el.wsZoomCoverBtn) {
      el.wsZoomCoverBtn.onclick = () => {
        if (el.modalCoverImg && el.coverModal) {
          el.modalCoverImg.src = clip.imageLargeUrl || clip.imageUrl;
          el.coverModal.classList.add('active');
        }
      };
    }
  }

  function closeWorkspaceClipDetail() {
    activeDetailClipId = null;
    activeDetailClip = null;
    document.querySelectorAll('.folder-clip-card').forEach(c => c.classList.remove('active'));
    if (el.workspaceView) el.workspaceView.classList.remove('has-detail-open');
    if (el.workspaceDetailPane) {
      el.workspaceDetailPane.style.display = 'none';
    }
  }

  function updateWsPlayPauseState() {
    if (!el.wsPlayPauseBtn) return;
    const isNowPlayingThis = state.nowPlayingTrack && state.nowPlayingTrack.id === activeDetailClipId;
    const isAudioPlaying = isNowPlayingThis && !el.audioPlayer.paused && Boolean(el.audioPlayer.src);

    if (isAudioPlaying) {
      el.wsPlayPauseBtn.innerHTML = '⏸';
      if (el.audioPlayer.duration) {
        if (el.wsCurrentTime) el.wsCurrentTime.textContent = formatDuration(el.audioPlayer.currentTime);
        if (el.wsTotalTime) el.wsTotalTime.textContent = formatDuration(el.audioPlayer.duration);
        if (el.wsSeekSlider) el.wsSeekSlider.value = (el.audioPlayer.currentTime / el.audioPlayer.duration) * 100;
      }
    } else {
      el.wsPlayPauseBtn.innerHTML = '▶';
      if (isNowPlayingThis && el.audioPlayer.duration) {
        if (el.wsCurrentTime) el.wsCurrentTime.textContent = formatDuration(el.audioPlayer.currentTime);
        if (el.wsTotalTime) el.wsTotalTime.textContent = formatDuration(el.audioPlayer.duration);
        if (el.wsSeekSlider) el.wsSeekSlider.value = (el.audioPlayer.currentTime / el.audioPlayer.duration) * 100;
      } else {
        if (el.wsCurrentTime) el.wsCurrentTime.textContent = '00:00';
        if (el.wsTotalTime) el.wsTotalTime.textContent = formatDuration(activeDetailClip?.duration || 180);
        if (el.wsSeekSlider) el.wsSeekSlider.value = 0;
      }
    }
  }

  function renderFilteredFolderClips(query) {
    if (!query) {
      renderFolderClips(state.currentFolderClips);
      return;
    }
    const filtered = state.currentFolderClips.filter(c => 
      (c.title && c.title.toLowerCase().includes(query)) ||
      (c.displayName && c.displayName.toLowerCase().includes(query)) ||
      (c.tags && c.tags.toLowerCase().includes(query))
    );
    renderFolderClips(filtered);
  }

  async function handleDownloadCurrentFolderZip() {
    const clips = state.currentFolderClips;
    if (!clips || clips.length === 0) {
      showToast('Tidak ada lagu di dalam folder ini.', 'error');
      return;
    }

    const JSZipLib = window.JSZip || (typeof JSZip !== 'undefined' ? JSZip : null);
    if (!JSZipLib) {
      showToast('Library ZIP sedang dimuat...', 'info');
      return;
    }

    const btn = el.downloadFolderZipBtn;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>⏳ Mengompres folder...</span>';
    showToast(`Mengunduh seluruh isi folder "${state.currentFolderName}" (${clips.length} lagu)...`, 'info');

    try {
      const zip = new JSZipLib();
      const folder = zip.folder(cleanFileName(state.currentFolderName));

      for (let i = 0; i < clips.length; i++) {
        const c = clips[i];
        const prefix = `${String(i + 1).padStart(2, '0')}. `;
        const songTitle = cleanFileName(c.title);

        folder.file(`${prefix}${songTitle} - Lirik.txt`, `${c.title}\nArtist: ${c.displayName}\nTags: ${c.tags}\n\n${c.lyrics}`);

        try {
          const coverBlob = await fetchMediaBlob(c.imageLargeUrl || c.imageUrl);
          if (coverBlob) folder.file(`${prefix}${songTitle} - Cover.jpg`, coverBlob);
        } catch (e) {}

        try {
          const audioUrl = `./proxy.php?action=download&id=${c.id}&format=mp3${getMasteringQueryString()}`;
          const audioBlob = await fetch(audioUrl).then(r => r.blob()).catch(() => null);
          if (audioBlob && audioBlob.size > 1000) {
            folder.file(`${prefix}${songTitle}.mp3`, audioBlob);
          }
        } catch (e) {}
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveBlobAs(content, `Suno_Folder_${cleanFileName(state.currentFolderName)}.zip`);
      showToast(`Folder "${state.currentFolderName}" berhasil diunduh!`, 'success');
    } catch (err) {
      showToast('Gagal mengunduh ZIP folder: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }

  // --- HISTORY MANAGEMENT ---
  function loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem('sudownloader_history');
      if (stored) {
        state.history = JSON.parse(stored);
        renderHistoryList();
      }
    } catch (e) {}
  }

  function addToHistory(track) {
    if (!track || !track.id) return;
    state.history = state.history.filter(h => h.id !== track.id);
    state.history.unshift({
      id: track.id,
      title: track.title,
      author: track.displayName || track.artist,
      cover: track.imageUrl,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });

    if (state.history.length > 20) state.history.pop();
    try {
      localStorage.setItem('sudownloader_history', JSON.stringify(state.history));
      renderHistoryList();
    } catch (e) {}
  }

  function renderHistoryList() {
    el.historyList.innerHTML = '';
    if (!state.history || state.history.length === 0) {
      el.historyList.innerHTML = '<p style="color:var(--text-dim);font-size:13px;">Belum ada riwayat download.</p>';
      return;
    }

    state.history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.innerHTML = `
        <img class="history-thumb" src="${item.cover || 'https://cdn1.suno.ai/defaultBlue.webp'}" alt="Thumb" onerror="this.src='https://cdn1.suno.ai/defaultBlue.webp'">
        <div class="history-details">
          <div class="history-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
          <div class="history-author">${escapeHtml(item.author || 'Suno Artist')} &bull; ${item.time}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        el.sunoUrlInput.value = `https://suno.com/song/${item.id}`;
        switchMode('single');
        handleAutoFetch();
      });
      el.historyList.appendChild(card);
    });
  }

  // ============================================================
  // --- DOWNLOAD ANALYTICS, STATS TRACKER & GOOGLE SHEETS SYNC ---
  // ============================================================
  // Konfigurasi Admin: Masukkan Web App URL Google Apps Script di sini.
  // Contoh: 'https://script.google.com/macros/s/AKfycb.../exec'
  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXVJvt6PrReggejBTttFqjidxR-33yUmYBxT59T1cOnO2dP4m-Ij3Muyr-FDtanRR3/exec';
  const STATS_STORAGE_KEY = 'sudownloader_download_records';
  let autoSyncDebounceTimer = null;

  function loadDownloadRecords() {
    try {
      const raw = localStorage.getItem(STATS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  function saveDownloadRecords(records) {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {}
  }

  function scheduleAutoSyncToGoogleSheets() {
    if (autoSyncDebounceTimer) clearTimeout(autoSyncDebounceTimer);
    autoSyncDebounceTimer = setTimeout(() => {
      triggerAutoSyncGoogleSheets();
    }, 1200);
  }

  function recordDownloadEvent(track, format, size = 0) {
    if (!track) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    const artist = (track.displayName || track.artist || 'Suno Artist').trim();
    const title = (track.title || 'Suno Song').trim();
    const fmt = (format || 'mp3').toLowerCase();

    const record = {
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      clipId: track.id || '',
      title: title,
      artist: artist,
      format: fmt,
      monthKey: monthKey,
      timestamp: Date.now(),
      size: size
    };

    const records = loadDownloadRecords();
    records.push(record);
    saveDownloadRecords(records);
    updateStatsHeaderBadge();

    if (el.statsModal && el.statsModal.style.display !== 'none') {
      renderStatsModal();
    }

    // Otomatis sinkronisasi ke Google Spreadsheet tanpa perlu klik tombol manual
    scheduleAutoSyncToGoogleSheets();
  }

  function getMonthLabel(monthKey) {
    if (!monthKey || monthKey === 'all') return 'Semua Periode (Sepanjang Waktu)';
    const parts = monthKey.split('-');
    if (parts.length !== 2) return monthKey;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const now = new Date();
    const isCurrent = (now.getFullYear() === y && now.getMonth() === m);
    return `${monthNames[m] || 'Bulan'} ${y}${isCurrent ? ' (Bulan Ini)' : ''}`;
  }

  function getCurrentMonthKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  function updateStatsHeaderBadge() {
    if (!el.headerStatsBadge) return;
    const records = loadDownloadRecords();
    const currentMonth = getCurrentMonthKey();
    const currentMonthCount = records.filter(r => r.monthKey === currentMonth).length;
    el.headerStatsBadge.textContent = currentMonthCount;
    el.headerStatsBadge.title = `${currentMonthCount} unduhan pada bulan ini (${records.length} total sepanjang waktu)`;
    // Also update mobile drawer badge
    const mobileBadge = document.getElementById('mobileStatsBadge');
    if (mobileBadge) mobileBadge.textContent = currentMonthCount;
  }

  function populateMonthSelect() {
    if (!el.statsMonthSelect) return;
    const records = loadDownloadRecords();
    const currentMonth = getCurrentMonthKey();
    const monthsSet = new Set();
    monthsSet.add(currentMonth);

    records.forEach(r => {
      if (r.monthKey) monthsSet.add(r.monthKey);
    });

    const sortedMonths = Array.from(monthsSet).sort().reverse();
    const currentVal = el.statsMonthSelect.value || currentMonth;

    let html = '';
    sortedMonths.forEach(m => {
      html += `<option value="${m}">${getMonthLabel(m)}</option>`;
    });
    html += `<option value="all">Semua Periode (Sepanjang Waktu)</option>`;

    el.statsMonthSelect.innerHTML = html;
    if (sortedMonths.includes(currentVal) || currentVal === 'all') {
      el.statsMonthSelect.value = currentVal;
    } else {
      el.statsMonthSelect.value = currentMonth;
    }
  }

  function getAggregatedStats(monthKey = null, artistFilter = '') {
    const records = loadDownloadRecords();
    const selectedMonth = monthKey || (el.statsMonthSelect ? el.statsMonthSelect.value : getCurrentMonthKey());
    const filterText = (artistFilter || '').toLowerCase().trim();

    let filtered = records;
    if (selectedMonth && selectedMonth !== 'all') {
      filtered = filtered.filter(r => r.monthKey === selectedMonth);
    }
    if (filterText) {
      filtered = filtered.filter(r => (r.artist || '').toLowerCase().includes(filterText));
    }

    const totals = {
      all: filtered.length,
      mp3: 0,
      wav: 0,
      flac: 0,
      m4a: 0,
      mp4: 0,
      zip: 0
    };

    const artistMap = new Map();

    filtered.forEach(r => {
      const fmt = (r.format || 'mp3').toLowerCase();
      if (totals[fmt] !== undefined) totals[fmt]++;
      else if (fmt === 'aac') totals.m4a++;

      const art = (r.artist || 'Suno Artist').trim();
      if (!artistMap.has(art)) {
        artistMap.set(art, {
          artist: art,
          mp3: 0,
          wav: 0,
          flac: 0,
          m4a: 0,
          mp4: 0,
          zip: 0,
          total: 0
        });
      }
      const aData = artistMap.get(art);
      aData.total++;
      if (aData[fmt] !== undefined) aData[fmt]++;
      else if (fmt === 'aac') aData.m4a++;
    });

    const artists = Array.from(artistMap.values()).sort((a, b) => b.total - a.total);

    return {
      monthKey: selectedMonth,
      monthLabel: getMonthLabel(selectedMonth),
      totals,
      artists
    };
  }

  function renderStatsModal() {
    if (!el.statsModal) return;
    const monthKey = el.statsMonthSelect ? el.statsMonthSelect.value : getCurrentMonthKey();
    const stats = getAggregatedStats(monthKey, '');

    if (el.statTotalAll) el.statTotalAll.textContent = stats.totals.all;
    if (el.statTotalMp3) el.statTotalMp3.textContent = stats.totals.mp3;
    if (el.statTotalWav) el.statTotalWav.textContent = stats.totals.wav;
    if (el.statTotalFlac) el.statTotalFlac.textContent = stats.totals.flac;
    if (el.statTotalM4aMp4) el.statTotalM4aMp4.textContent = (stats.totals.m4a + stats.totals.mp4);
    if (el.statTotalZip) el.statTotalZip.textContent = stats.totals.zip;

    if (el.statsSyncBadge) {
      const isConfigured = Boolean(GOOGLE_APPS_SCRIPT_URL && GOOGLE_APPS_SCRIPT_URL.startsWith('https://script.google.com/macros/s/'));
      el.statsSyncBadge.style.display = isConfigured ? 'inline-flex' : 'none';
      el.statsSyncBadge.textContent = '⚡ Terkoneksi';
    }
  }

  function openStatsModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const modal = el.statsModal || document.getElementById('statsModal');
    if (!modal) return;
    populateMonthSelect();
    renderStatsModal();
    modal.style.display = 'flex';
    modal.classList.add('active');
    triggerAutoSyncGoogleSheets(true);
  }

  function closeStatsModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const modal = el.statsModal || document.getElementById('statsModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.classList.remove('active');
  }

  function exportStatsToCsv() {
    const monthKey = el.statsMonthSelect ? el.statsMonthSelect.value : getCurrentMonthKey();
    const stats = getAggregatedStats(monthKey, '');
    if (stats.artists.length === 0) {
      showToast('Tidak ada data unduhan untuk diekspor.', 'warning');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'Artist / Username,Total MP3,Total WAV,Total FLAC,Total M4A,Total MP4,Total ZIP,Total Keseluruhan,Periode Bulan\r\n';

    stats.artists.forEach(a => {
      const cleanArtist = '"' + String(a.artist).replace(/"/g, '""') + '"';
      csvContent += `${cleanArtist},${a.mp3},${a.wav},${a.flac},${a.m4a},${a.mp4},${a.zip},${a.total},"${stats.monthLabel}"\r\n`;
    });

    csvContent += `"TOTAL KESELURUHAN",${stats.totals.mp3},${stats.totals.wav},${stats.totals.flac},${stats.totals.m4a},${stats.totals.mp4},${stats.totals.zip},${stats.totals.all},"${stats.monthLabel}"\r\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `SuDownloader_Statistik_${stats.monthKey || 'Rekap'}.csv`;
    saveBlobAs(blob, filename);
    showToast(`File CSV "${filename}" berhasil diunduh!`, 'success');
  }

  async function triggerAutoSyncGoogleSheets(silent = true) {
    const webhookUrl = (GOOGLE_APPS_SCRIPT_URL || '').trim();
    if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/macros/s/')) {
      if (el.statsSyncBadge) el.statsSyncBadge.style.display = 'none';
      return;
    }

    if (el.statsSyncBadge) {
      el.statsSyncBadge.style.display = 'inline-flex';
      el.statsSyncBadge.textContent = '⚡ Terkoneksi';
    }

    const currentMonth = getCurrentMonthKey();
    const stats = getAggregatedStats(currentMonth, '');
    if (!stats || !stats.artists || stats.artists.length === 0) {
      return;
    }

    try {
      const payload = {
        action: 'sync_download_stats',
        monthKey: stats.monthKey,
        monthLabel: stats.monthLabel,
        totals: stats.totals,
        artists: stats.artists,
        timestamp: Date.now()
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });

      console.log('✅ [SuDownloader] Auto-sync berhasil:', stats.monthLabel);
    } catch (err) {
      console.warn('⚠️ [SuDownloader] Auto-sync warning:', err);
    }
  }

  function clearDownloadStats() {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat statistik unduhan? Data yang sudah tersimpan di browser akan dihapus.')) {
      localStorage.removeItem(STATS_STORAGE_KEY);
      populateMonthSelect();
      renderStatsModal();
      updateStatsHeaderBadge();
      showToast('Seluruh riwayat statistik download telah dibersihkan.', 'info');
    }
  }

  window.openStatsModal = openStatsModal;
  window.closeStatsModal = closeStatsModal;
  window.triggerAutoSyncGoogleSheets = triggerAutoSyncGoogleSheets;

  // --- UTILITIES ---
  function showLoading(show) {
    el.loadingState.style.display = show ? 'block' : 'none';
    el.fetchBtn.disabled = show;
  }

  function setButtonLoading(btn, isLoading, label) {
    if (!btn) return;
    if (isLoading) {
      btn.classList.add('active-processing');
      btn.disabled = true;
      if (!btn.dataset.origHtml) {
        btn.dataset.origHtml = btn.innerHTML;
      }
      const b = btn.querySelector('.format-badge');
      const d = btn.querySelector('.format-desc');
      if (b) b.textContent = '⏳';
      if (d) d.textContent = 'Memproses...';
      else if (!b && !d) {
        btn.innerHTML = `<span>⏳ ${label || 'Unduh'}...</span>`;
      }
    } else {
      btn.classList.remove('active-processing');
      btn.disabled = false;
      if (btn.dataset.origHtml) {
        btn.innerHTML = btn.dataset.origHtml;
        delete btn.dataset.origHtml;
      } else {
        const b = btn.querySelector('.format-badge');
        const d = btn.querySelector('.format-desc');
        if (b) b.textContent = label;
        if (d) d.textContent = label === 'MP3' ? '320 kbps HQ' : (label.includes('WAV') ? 'Studio Master' : 'Lossless');
      }
    }
  }

  function formatDuration(sec) {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function cleanFileName(str) {
    return String(str || 'Suno_Song')
      .replace(/[\\/:*?"<>|]+/g, '_')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ============================================================
  // --- REAL-TIME AUDIO MASTERING STUDIO & EQUALIZER ENGINE ---
  // ============================================================
  const MASTERING_STORAGE_KEY = 'sudownloader_mastering_settings';

  function setupMasteringDspChain(ctx) {
    if (!audioSourceNode || !analyserNode) return;

    try {
      // 1. Pre-Gain
      masteringPreGain = ctx.createGain();
      masteringPreGain.gain.value = 1.0;

      // 2. 10-Band BiquadFilter EQ Chain
      masteringFilters = MASTERING_FREQS.map((freq, idx) => {
        const filter = ctx.createBiquadFilter();
        filter.frequency.value = freq;
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === MASTERING_FREQS.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.2;
        }
        filter.gain.value = 0;
        return filter;
      });

      // 3. Tube Warmth / WaveShaper Node
      masteringWaveShaper = ctx.createWaveShaper();
      masteringWaveShaper.curve = null;
      masteringWaveShaper.oversample = '2x';

      // 4. Dynamics Compressor Node
      masteringCompressor = ctx.createDynamicsCompressor();
      masteringCompressor.threshold.value = 0;
      masteringCompressor.knee.value = 6;
      masteringCompressor.ratio.value = 1;
      masteringCompressor.attack.value = 0.015;
      masteringCompressor.release.value = 0.12;

      // 5. Post Gain Node (Master Output Gain)
      masteringPostGain = ctx.createGain();
      masteringPostGain.gain.value = 1.0;

      // Connect: audioSourceNode -> masteringPreGain -> Filters[0..9] -> WaveShaper -> Compressor -> PostGain -> Analyser -> Destination
      let lastNode = audioSourceNode;
      lastNode.connect(masteringPreGain);
      lastNode = masteringPreGain;

      masteringFilters.forEach(f => {
        lastNode.connect(f);
        lastNode = f;
      });

      lastNode.connect(masteringWaveShaper);
      masteringWaveShaper.connect(masteringCompressor);
      masteringCompressor.connect(masteringPostGain);
      masteringPostGain.connect(analyserNode);
      analyserNode.connect(ctx.destination);

      // Apply initial settings
      applyMasteringDspParams();
    } catch (e) {
      console.debug('setupMasteringDspChain notice:', e.message);
    }
  }

  function makeWarmthDistortionCurve(warmth) {
    const k = (warmth / 100) * 35;
    if (k <= 0.1) return null;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  function applyMasteringDspParams() {
    if (!audioCtx) {
      updateMasteringUiStatus();
      return;
    }
    const now = audioCtx.currentTime;

    if (!masteringState.isActive) {
      // BYPASS MODE (100% pure unaltered sound)
      if (masteringFilters && masteringFilters.length > 0) {
        masteringFilters.forEach(f => {
          f.gain.setTargetAtTime(0, now, 0.02);
        });
      }
      if (masteringWaveShaper) {
        masteringWaveShaper.curve = null;
      }
      if (masteringCompressor) {
        masteringCompressor.threshold.setTargetAtTime(0, now, 0.02);
        masteringCompressor.ratio.setTargetAtTime(1, now, 0.02);
      }
      if (masteringPostGain) {
        masteringPostGain.gain.setTargetAtTime(1.0, now, 0.02);
      }
      updateMasteringUiStatus();
      return;
    }

    // ACTIVE MASTERING MODE
    if (masteringFilters && masteringFilters.length > 0) {
      masteringFilters.forEach((f, idx) => {
        const g = masteringState.gains[idx] || 0;
        f.gain.setTargetAtTime(g, now, 0.02);
      });
    }

    if (masteringWaveShaper) {
      masteringWaveShaper.curve = makeWarmthDistortionCurve(masteringState.warmth);
    }

    if (masteringCompressor) {
      const compThresh = -16 - (masteringState.warmth * 0.06);
      const compRatio = 2.2 + (masteringState.warmth * 0.015);
      masteringCompressor.threshold.setTargetAtTime(compThresh, now, 0.02);
      masteringCompressor.ratio.setTargetAtTime(compRatio, now, 0.02);
      masteringCompressor.attack.setTargetAtTime(0.015, now, 0.02);
      masteringCompressor.release.setTargetAtTime(0.12, now, 0.02);
    }

    if (masteringPostGain) {
      const linGain = Math.pow(10, (masteringState.gain || 0) / 20);
      masteringPostGain.gain.setTargetAtTime(linGain, now, 0.02);
    }

    updateMasteringUiStatus();
  }

  function updateMasteringUiStatus() {
    const isActive = masteringState.isActive;

    if (el.masteringPowerToggle) {
      el.masteringPowerToggle.classList.toggle('is-active', isActive);
    }
    if (el.masteringPowerText) {
      el.masteringPowerText.textContent = isActive ? 'MASTERING: AKTIF' : 'BYPASS (AUDIO ORIGINAL)';
    }
    if (el.headerMasteringDot) {
      el.headerMasteringDot.classList.toggle('is-active', isActive);
    }
    if (el.bpMasteringDot) {
      el.bpMasteringDot.classList.toggle('is-active', isActive);
    }
    if (el.bpMasteringBtn) {
      el.bpMasteringBtn.classList.toggle('is-active', isActive);
    }
  }

  function syncMasteringControlsToState() {
    if (el.masteringPresetSelect) {
      el.masteringPresetSelect.value = masteringState.currentPreset;
    }

    MASTERING_FREQS.forEach((freq, idx) => {
      const slider = document.querySelector(`.eq-fader-slider[data-band="${idx}"]`);
      const valBadge = document.getElementById(`eqVal_${freq}`);
      const val = masteringState.gains[idx] || 0;
      if (slider) slider.value = val;
      if (valBadge) valBadge.textContent = `${val > 0 ? '+' : ''}${val}dB`;
    });

    if (el.masteringWarmthSlider) el.masteringWarmthSlider.value = masteringState.warmth;
    if (el.masteringWarmthVal) el.masteringWarmthVal.textContent = `${masteringState.warmth}%`;

    if (el.masteringWidthSlider) el.masteringWidthSlider.value = masteringState.width;
    if (el.masteringWidthVal) el.masteringWidthVal.textContent = `${masteringState.width}%`;

    if (el.masteringGainSlider) el.masteringGainSlider.value = masteringState.gain;
    if (el.masteringGainVal) el.masteringGainVal.textContent = `${masteringState.gain > 0 ? '+' : ''}${masteringState.gain.toFixed(1)} dB`;

    updateMasteringUiStatus();
  }

  function applyPreset(presetKey) {
    const preset = MASTERING_PRESETS[presetKey];
    if (!preset) return;
    masteringState.currentPreset = presetKey;
    masteringState.gains = [...preset.gains];
    masteringState.warmth = preset.warmth;
    masteringState.width = preset.width;
    masteringState.gain = preset.gain;

    syncMasteringControlsToState();
    applyMasteringDspParams();
    saveMasteringSettings();
  }

  function saveMasteringSettings() {
    try {
      const data = {
        isActive: masteringState.isActive,
        currentPreset: masteringState.currentPreset,
        gains: masteringState.gains,
        warmth: masteringState.warmth,
        width: masteringState.width,
        gain: masteringState.gain,
        customPreset: MASTERING_PRESETS.custom
      };
      localStorage.setItem(MASTERING_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function loadMasteringSettings() {
    try {
      const raw = localStorage.getItem(MASTERING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (typeof parsed.isActive === 'boolean') masteringState.isActive = parsed.isActive;
          if (parsed.currentPreset && MASTERING_PRESETS[parsed.currentPreset]) {
            masteringState.currentPreset = parsed.currentPreset;
          }
          if (Array.isArray(parsed.gains) && parsed.gains.length === 10) {
            masteringState.gains = [...parsed.gains];
          }
          if (typeof parsed.warmth === 'number') masteringState.warmth = parsed.warmth;
          if (typeof parsed.width === 'number') masteringState.width = parsed.width;
          if (typeof parsed.gain === 'number') masteringState.gain = parsed.gain;
          if (parsed.customPreset && Array.isArray(parsed.customPreset.gains)) {
            MASTERING_PRESETS.custom = parsed.customPreset;
          }
        }
      }
    } catch (e) {}
    syncMasteringControlsToState();
    applyMasteringDspParams();
  }

  function getMasteringPayload() {
    if (!masteringState.isActive) return null;
    return {
      active: true,
      preset: masteringState.currentPreset,
      gains: masteringState.gains,
      warmth: masteringState.warmth,
      width: masteringState.width,
      gain: masteringState.gain
    };
  }

  function getMasteringQueryString() {
    const payload = getMasteringPayload();
    if (!payload) return '';
    return `&mastering_active=1&mastering_data=${encodeURIComponent(JSON.stringify(payload))}`;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

})();
