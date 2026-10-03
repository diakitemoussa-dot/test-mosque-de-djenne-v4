export class TimelineScrubber {
  constructor({ container, onSeek, onEndReached }) {
    this.container = container;
    this.onSeek = onSeek;
    this.onEndReached = onEndReached;
    this.chapter = null;
    this.chapters = [];
    this.duration = 0;
    this.currentTime = 0;
    this.isDragging = false;
    this._buildUI();
    this._bindEvents();
  }

  _buildUI() {
    this.container.innerHTML = `
      <div class="timeline-track" role="slider" aria-label="Progression du chapitre" tabindex="0">
        <div class="timeline-buffer"></div>
        <div class="timeline-fill"></div>
        <div class="timeline-handle" tabindex="-1"></div>
      </div>
      <div class="timeline-labels">
        <span class="time-current">0:00</span>
        <span class="time-total">1:00</span>
      </div>
      <div class="chapter-indicator">Chapitre 1 / 4</div>
      <div class="end-notice hidden">Fin du chapitre — Suivant dans 3s</div>
      <div class="loading-overlay hidden">
        <div class="loading-spinner"></div>
        <span class="loading-text">Chargement...</span>
        <div class="loading-bar"><div class="loading-progress"></div></div>
      </div>
    `;
    this.track = this.container.querySelector('.timeline-track');
    this.buffer = this.container.querySelector('.timeline-buffer');
    this.fill = this.container.querySelector('.timeline-fill');
    this.handle = this.container.querySelector('.timeline-handle');
    this.timeCurrent = this.container.querySelector('.time-current');
    this.timeTotal = this.container.querySelector('.time-total');
    this.chapterIndicator = this.container.querySelector('.chapter-indicator');
    this.endNotice = this.container.querySelector('.end-notice');
    this.loadingOverlay = this.container.querySelector('.loading-overlay');
    this.loadingProgress = this.container.querySelector('.loading-progress');
    this.loadingText = this.container.querySelector('.loading-text');
  }

  _bindEvents() {
    this.handle.addEventListener('pointerdown', (e) => this._onDragStart(e));
    this.track.addEventListener('click', (e) => this._onTrackClick(e));
    this.track.addEventListener('keydown', (e) => this._onTrackKey(e));
    window.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
    window.addEventListener('keydown', (e) => this._onKey(e));
  }

  _onWheel(e) {
    if (this.isDragging) return;
    e.preventDefault();
    const delta = e.deltaY * 0.5;
    this.seek(this.currentTime + delta);
  }

  _onDragStart(e) {
    this.isDragging = true;
    this.handle.setPointerCapture(e.pointerId);
    window.addEventListener('pointermove', this._onDragMove = (e) => this._onDragMove(e));
    window.addEventListener('pointerup', this._onDragEnd = () => this._onDragEnd());
  }

  _onDragMove(e) {
    const rect = this.track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.seek(pct * this.duration);
  }

  _onDragEnd() {
    this.isDragging = false;
    this.handle.releasePointerCapture();
    window.removeEventListener('pointermove', this._onDragMove);
    window.removeEventListener('pointerup', this._onDragEnd);
  }

  _onTrackClick(e) {
    if (e.target === this.handle) return;
    const rect = this.track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    this.seek(pct * this.duration);
  }

  _onTrackKey(e) {
    const step = this.duration * 0.05;
    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); this.seek(this.currentTime - step); break;
      case 'ArrowRight': e.preventDefault(); this.seek(this.currentTime + step); break;
      case 'Home': e.preventDefault(); this.seek(0); break;
      case 'End': e.preventDefault(); this.seek(this.duration); break;
    }
  }

  _onKey(e) {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && document.activeElement !== this.track) {
      e.preventDefault();
      const step = this.duration * 0.05;
      if (e.key === 'ArrowLeft') this.seek(this.currentTime - step);
      if (e.key === 'ArrowRight') this.seek(this.currentTime + step);
      if (e.key === 'Home') this.seek(0);
      if (e.key === 'End') this.seek(this.duration);
    }
  }

  setChapter(chapter, chapters) {
    this.chapter = chapter;
    this.chapters = chapters;
    this.duration = chapter.duration;
    const idx = chapters.findIndex(c => c.id === chapter.id);
    this.chapterIndicator.textContent = `Chapitre ${idx + 1} / ${chapters.length}`;
    this.timeTotal.textContent = this._formatTime(this.duration);
    this.update(0, this.duration);
    this.setLoadingProgress(0);
    this.hideLoading();
  }

  update(currentTime, duration) {
    this.currentTime = currentTime;
    this.duration = duration;
    const pct = duration > 0 ? currentTime / duration : 0;
    this.fill.style.width = `${pct * 100}%`;
    this.handle.style.left = `${pct * 100}%`;
    this.timeCurrent.textContent = this._formatTime(currentTime);
  }

  setLoadingProgress(percent) {
    if (percent === null || percent === undefined) {
      this.buffer.style.width = '0%';
      return;
    }
    const pct = Math.max(0, Math.min(1, percent));
    this.buffer.style.width = `${pct * 100}%`;
    this.loadingProgress.style.width = `${pct * 100}%`;
    this.loadingText.textContent = `Chargement... ${Math.round(pct * 100)}%`;
  }

  showLoading() {
    this.loadingOverlay.classList.remove('hidden');
  }

  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
  }

  seek(time) {
    time = Math.max(0, Math.min(time, this.duration));
    this.onSeek?.(time);
  }

  setEndReached(reached) {
    this.endNotice.classList.toggle('hidden', !reached);
    if (reached) this.onEndReached?.();
  }

  setComplete(complete) {
    this.endNotice.textContent = complete ? 'Expérience terminée' : 'Fin du chapitre — Suivant dans 3s';
    this.endNotice.classList.remove('hidden');
  }

  _formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }
}