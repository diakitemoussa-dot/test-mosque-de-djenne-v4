import * as THREE from 'three';

export class VideoSphere {
  constructor(scene) {
    this.scene = scene;
    this.video = document.createElement('video');
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.preload = 'auto';
    this.video.crossOrigin = 'anonymous';

    this.texture = new THREE.VideoTexture(this.video);
    this.texture.colorSpace = THREE.SRGBColorSpace;

    const geo = new THREE.SphereGeometry(500, 64, 48);
    geo.scale(-1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 1,
      depthWrite: false
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.scene.add(this.mesh);

    this._fallbackDuration = 60;
    this._endedCallback = null;
    this._timeUpdateCallback = null;
    this._progressCallback = null;

    this._boundOnEnded = () => this._onEnded();
    this._boundOnTimeUpdate = () => this._onTimeUpdate();
    this._boundOnProgress = () => this._onProgress();
    this._boundOnCanPlay = () => this._onCanPlay();
    this._boundOnError = (e) => this._onError(e);
    this.video.addEventListener('ended', this._boundOnEnded);
    this.video.addEventListener('timeupdate', this._boundOnTimeUpdate);
    this.video.addEventListener('progress', this._boundOnProgress);
    this.video.addEventListener('canplay', this._boundOnCanPlay);
    this.video.addEventListener('error', this._boundOnError);
  }

  load(src, posterUrl = null) {
    return new Promise((resolve, reject) => {
      this._resolveLoad = resolve;
      this._rejectLoad = reject;
      this._loadTimeout = setTimeout(() => {
        this.video.removeEventListener('canplay', this._boundOnCanPlay);
        this.video.removeEventListener('error', this._boundOnError);
        resolve(); // Timeout: on continue quand même
      }, 15000); // 15s max

      this.video.src = src;
      if (posterUrl) this.video.poster = posterUrl;
      this.video.load();
    });
  }

  onProgress(cb) {
    this._progressCallback = cb;
  }

  _onProgress() {
    if (this.video.buffered.length > 0) {
      const buffered = this.video.buffered.end(this.video.buffered.length - 1);
      const duration = this.video.duration || this._fallbackDuration;
      const percent = Math.min(1, buffered / duration);
      this._progressCallback?.(percent, buffered);
    }
  }

  _onCanPlay() {
    clearTimeout(this._loadTimeout);
    this.video.removeEventListener('canplay', this._boundOnCanPlay);
    this.video.removeEventListener('error', this._boundOnError);
    this._resolveLoad?.();
  }

  _onError(e) {
    clearTimeout(this._loadTimeout);
    this.video.removeEventListener('canplay', this._boundOnCanPlay);
    this.video.removeEventListener('error', this._boundOnError);
    this._rejectLoad?.(e);
  }

  play() {
    return this.video.play();
  }

  pause() {
    this.video.pause();
  }

  seek(time) {
    this.video.currentTime = time;
  }

  setOpacity(opacity) {
    this.material.opacity = opacity;
  }

  get currentTime() {
    return this.video.currentTime;
  }

  get duration() {
    return this.video.duration || this._fallbackDuration;
  }

  set fallbackDuration(d) {
    this._fallbackDuration = d;
  }

  onEnded(cb) {
    this._endedCallback = cb;
  }

  onTimeUpdate(cb) {
    this._timeUpdateCallback = cb;
  }

  _onEnded() {
    this._endedCallback?.();
  }

  _onTimeUpdate() {
    this._timeUpdateCallback?.(this.video.currentTime);
  }

  dispose() {
    clearTimeout(this._loadTimeout);
    this.video.removeEventListener('ended', this._boundOnEnded);
    this.video.removeEventListener('timeupdate', this._boundOnTimeUpdate);
    this.video.removeEventListener('progress', this._boundOnProgress);
    this.video.removeEventListener('canplay', this._boundOnCanPlay);
    this.video.removeEventListener('error', this._boundOnError);
    this.video.src = '';
    this.video.load();
    this.texture.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
    this.scene.remove(this.mesh);
  }
}