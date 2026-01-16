// --- UI MANAGER ---
class UIManager {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.elements = {
            sheet: document.getElementById('news-sheet'),
            sheetContent: document.querySelector('#news-sheet .sheet-content'),
            zoomInBtn: document.getElementById('zoom-in'),
            zoomOutBtn: document.getElementById('zoom-out'),
            resetBtn: document.getElementById('reset-view'),
            toggle3DBtn: document.getElementById('toggle-3d')
        };
        this.attachListeners();
    }

    attachListeners() {
        this.elements.zoomInBtn.addEventListener('click', () => this.mapManager.zoomIn());
        this.elements.zoomOutBtn.addEventListener('click', () => this.mapManager.zoomOut());
        this.elements.resetBtn.addEventListener('click', () => this.mapManager.resetView());
        this.elements.toggle3DBtn.addEventListener('click', () => this.mapManager.toggle3D());
        // Simple close on map click logic handled by ensuring overlay doesn't block map if no active news
        this.mapManager.map.on('click', () => this.closeSheet());
    }

    showNewsDetail(newsItem) {
        const { title, summary, source, timestamp, image, type } = newsItem;
        const html = `
            <div class="news-preview">
                <div class="meta">
                    <span class="badge ${type}">${type.toUpperCase()}</span>
                    <span>${source}</span>
                    <span>•</span>
                    <span>${timestamp}</span>
                </div>
                <h2>${title}</h2>
                ${image ? `<img src="${image}" alt="${title}" style="width:100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 12px; opacity: 0.9;">` : ''}
                <p>${summary}</p>
                <div class="news-actions">
                    <button class="action-btn"><i class="ph-bold ph-read-cv-logo"></i> Read Full</button>
                    <button class="action-btn secondary"><i class="ph-bold ph-robot"></i> AI Explain</button>
                    <button class="action-btn secondary" id="btn-listen"><i class="ph-bold ph-speaker-high"></i> Listen</button>
                </div>
                <div id="audio-player" class="glass-panel hidden" style="margin-top: 12px; padding: 12px; display: flex; align-items: center; gap: 10px;">
                    <button class="icon-btn" id="audio-play-pause"><i class="ph-fill ph-pause"></i></button>
                    <div style="flex:1; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">
                        <div style="width: 40%; height: 100%; background: var(--primary-color);"></div>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">0:12 / 0:45</span>
                </div>
            </div>
        `;
        this.elements.sheetContent.innerHTML = html;
        this.elements.sheet.classList.remove('hidden');

        // Attach listen handler
        setTimeout(() => {
            const listenBtn = document.getElementById('btn-listen');
            const explainBtn = document.querySelector('.action-btn.secondary .ph-robot').parentElement; // Selector strategy
            const player = document.getElementById('audio-player');
            const playPauseBtn = document.getElementById('audio-play-pause');

            if (explainBtn) {
                explainBtn.addEventListener('click', () => {
                    document.dispatchEvent(new CustomEvent('news-explain', { detail: newsItem }));
                });
            }

            if (listenBtn && player) {
                listenBtn.addEventListener('click', () => {
                    player.classList.remove('hidden');
                    // Mock speech synthesis
                    this.speakSummary(summary);
                    if (playPauseBtn) playPauseBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
                });
            }

            if (playPauseBtn) {
                playPauseBtn.addEventListener('click', () => {
                    if (window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                        playPauseBtn.innerHTML = '<i class="ph-fill ph-pause"></i>';
                    } else if (window.speechSynthesis.speaking) {
                        window.speechSynthesis.pause();
                        playPauseBtn.innerHTML = '<i class="ph-fill ph-play"></i>';
                    }
                });
            }
        }, 0);
    }

    speakSummary(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop previous
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    }

    closeSheet() {
        this.elements.sheet.classList.add('hidden');
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
}
