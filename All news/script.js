/**
 * NEXT-GEN NEWS REEL CORE ENGINE
 */

const SAMPLE_DATA = [
    {
        id: 1,
        category: 'Politics',
        location: 'Washington',
        time: '2m ago',
        source: 'Verified Reuters',
        headline: 'New Global Climate Pact Signed in Paris',
        paragraphs: [
            "World leaders have officially ratified a groundbreaking agreement to aggressive target carbon emissions by 2030.",
            "The pact, known as 'EarthGuard 2030', introduces strict penalties for excessive industrial waste while incentivizing green energy.",
            "Special focus was placed on developing nations, providing a $500B fund for sustainable infrastructure growth."
        ],
        whyItMatters: "This is the first time in history that penalty-based carbon limits have been agreed upon globally, moving beyond voluntary goals.",
        audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Mock audio
    },
    {
        id: 2,
        category: 'Tech',
        location: 'Silicon Valley',
        time: '15m ago',
        source: 'Bloomberg Tech',
        headline: 'AI Revolution: Neural Chips Hit Consumer Market',
        paragraphs: [
            "A new generation of processing chips designed specifically for locally-run AI models has been released today.",
            "Unlike previous hardware, these chips allow mobile devices to process complex generative tasks without cloud connectivity.",
            "Privacy advocates have praised the move, as data never leaves the user's device during computation."
        ],
        whyItMatters: "This shifts the power of AI from massive server farms directly into our pockets, drastically improving privacy and speed.",
        audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' // Mock audio
    }
];

class NewsReelApp {
    constructor() {
        this.reels = SAMPLE_DATA;
        this.currentIndex = 0;
        this.wrapper = document.getElementById('reels-wrapper');
        this.loader = document.getElementById('loader');
        this.loaderFact = document.getElementById('loader-fact');
        this.isSwiping = false;
        this.startY = 0;

        this.init();
    }

    init() {
        this.renderReels();
        this.setupEventListeners();
        this.showReel(0);
    }

    renderReels() {
        const template = document.getElementById('reel-template');
        this.wrapper.innerHTML = ''; // Clear for re-render if needed

        this.reels.forEach((news, index) => {
            const clone = template.content.cloneNode(true);
            const slide = clone.querySelector('.reel-slide');

            // Populate data
            slide.querySelector('.category-pill').textContent = news.category;
            slide.querySelector('.location').textContent = news.location;
            slide.querySelector('.time').textContent = news.time;
            slide.querySelector('.trust-badge').textContent = news.source;
            slide.querySelector('.headline').textContent = news.headline;

            const contentArea = slide.querySelector('.article-content');
            news.paragraphs.forEach((p, pIndex) => {
                const pTag = document.createElement('p');
                pTag.id = `reel-${index}-p-${pIndex}`;
                // Split text into words for synced highlighting
                pTag.innerHTML = p.split(' ').map(word => `<span>${word}</span>`).join(' ');
                contentArea.appendChild(pTag);
            });

            // Audio Logic
            const audio = new Audio(news.audioSrc);
            const playBtn = slide.querySelector('.play-pause-btn');
            const progress = slide.querySelector('.progress-bar');
            const timeDisplay = slide.querySelector('.audio-time');
            const speedSelect = slide.querySelector('.speed-control');

            audio.ontimeupdate = () => {
                const pct = (audio.currentTime / audio.duration) * 100;
                progress.style.width = `${pct}%`;
                timeDisplay.textContent = `${this.formatTime(audio.currentTime)} / ${this.formatTime(audio.duration || 45)}`;
                this.syncTextHighlight(index, audio.currentTime, audio.duration);
                this.updateFlowIndicator(index, audio.currentTime / audio.duration);
            };

            playBtn.onclick = () => {
                if (audio.paused) {
                    // Stop others
                    document.querySelectorAll('audio').forEach(a => { if (a !== audio) a.pause() });
                    audio.play();
                    playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                } else {
                    audio.pause();
                    playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
                }
            };

            speedSelect.onchange = (e) => audio.playbackRate = parseFloat(e.target.value);

            // Set data attributes for actions
            slide.querySelectorAll('.action-btn').forEach(btn => {
                btn.onclick = () => this.handleAction(btn.dataset.action, index);
            });

            this.wrapper.appendChild(clone);
        });
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    syncTextHighlight(reelIndex, currentTime, duration) {
        const slide = document.querySelectorAll('.reel-slide')[reelIndex];
        const allSpans = slide.querySelectorAll('.article-content p span');
        const progress = currentTime / duration;
        const highlightIndex = Math.floor(progress * allSpans.length);

        allSpans.forEach((span, i) => {
            if (i === highlightIndex) {
                span.classList.add('highlight');
                // Ensure paragraph is visible
                span.parentElement.classList.add('visible');
            } else {
                span.classList.remove('highlight');
            }
        });
    }

    setupEventListeners() {
        // Swipe Detection
        document.addEventListener('touchstart', e => {
            this.startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', e => {
            const endY = e.changedTouches[0].clientY;
            this.handleSwipe(this.startY - endY);
        }, { passive: true });

        // Desktop Fallback (Wheel)
        document.addEventListener('wheel', e => {
            if (this.isSwiping) return;
            this.handleSwipe(e.deltaY);
        }, { passive: true });

        // Focus Mode Long Press
        let longPressTimer;
        document.addEventListener('pointerdown', () => {
            longPressTimer = setTimeout(() => this.toggleFocusMode(true), 800);
        });
        document.addEventListener('pointerup', () => clearTimeout(longPressTimer));

        document.getElementById('exit-focus').onclick = () => this.toggleFocusMode(false);
    }

    handleSwipe(deltaY) {
        if (Math.abs(deltaY) < 50 || this.isSwiping) return;

        if (deltaY > 0 && this.currentIndex < this.reels.length - 1) {
            this.goToReel(this.currentIndex + 1);
        } else if (deltaY < 0 && this.currentIndex > 0) {
            this.goToReel(this.currentIndex - 1);
        }
    }

    goToReel(index) {
        this.isSwiping = true;

        // Pause current audio
        document.querySelectorAll('audio').forEach(a => a.pause());

        this.currentIndex = index;
        this.wrapper.style.transform = `translateY(-${index * 100}vh)`;

        setTimeout(() => {
            this.showReel(index);
            this.isSwiping = false;
        }, 500);
    }

    showReel(index) {
        const slides = document.querySelectorAll('.reel-slide');
        const activeSlide = slides[index];

        // Initial reveal of first paragraph
        const firstP = activeSlide.querySelector('.article-content p');
        if (firstP) firstP.classList.add('visible');
    }

    updateFlowIndicator(index, progress) {
        const slides = document.querySelectorAll('.reel-slide');
        const indicator = slides[index].querySelector('.indicator-fill');
        if (indicator) indicator.style.height = `${(progress || 0) * 100}%`;
    }

    handleAction(action, index) {
        console.log(`Action: ${action} on reel ${index}`);
        const activeSlide = document.querySelectorAll('.reel-slide')[index];
        const news = this.reels[index];

        switch (action) {
            case 'explain':
                this.toggleWhyBlock(activeSlide, news.whyItMatters);
                break;
            case 'perspective':
                this.morphContent(activeSlide, index);
                break;
            // Other actions (save/share/readfull) would be implemented here
        }
    }

    toggleWhyBlock(slide, text) {
        let block = slide.querySelector('.ai-why-block');
        if (block) {
            block.remove();
        } else {
            block = document.createElement('div');
            block.className = 'ai-why-block';
            block.innerHTML = `<strong>Why it matters:</strong><br>${text}`;
            slide.querySelector('.reading-canvas').prepend(block);
        }
    }

    morphContent(slide, index) {
        // Visual trick to simulate "perspective switch"
        const headline = slide.querySelector('.headline');
        headline.style.opacity = '0';

        setTimeout(() => {
            headline.textContent = `Impact Analysis: ${this.reels[index].headline}`;
            headline.style.opacity = '1';
            // In a real app, this would fetch an AI-rewritten version
        }, 300);
    }

    toggleFocusMode(show) {
        const overlay = document.getElementById('focus-overlay');
        overlay.classList.toggle('hidden', !show);
    }
}

// Start App
window.onload = () => new NewsReelApp();
