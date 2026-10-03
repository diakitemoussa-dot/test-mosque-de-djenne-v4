import * as THREE from 'three';

export class VideoSphere {
  constructor(scene) {
    this.scene = scene;
    this.video = document.createElement('video');
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.preload = 'metadata';
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

    this._boundOnEnded = () => this._onEnded();
    this._boundOnTimeUpdate = () => this._onTimeUpdate();
    this.video.addEventListener('ended', this._boundOnEnded);
    this.video.addEventListener('timeupdate', this._boundOnTimeUpdate);
  }

  load(src, posterUrl = null) {
    return new Promise((resolve, reject) => {
      this.video.src = src;
      if (posterUrl) this.video.poster = posterUrl;
      this.video.load();
      const onCanPlay = () => {
        this.video.removeEventListener('canplaythrough', onCanPlay);
        resolve();
      };
      const onError = (e) => {
        this.video.removeEventListener('error', onError);
        reject(e);
      };
      this.video.addEventListener('canplaythrough', onCanPlay);
      this.video.addEventListener('error', onError);
    });
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
    this.video.removeEventListener('ended', this._boundOnEnded);
    this.video.removeEventListener('timeupdate', this._boundOnTimeUpdate);
    this.video.src = '';
    this.video.load();
    this.texture.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
    this.scene.remove(this.mesh);
  }
}