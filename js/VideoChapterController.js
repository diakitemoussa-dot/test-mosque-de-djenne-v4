import * as THREE from 'three';
import { CHAPTERS } from './chapters.js';
import { VideoSphere } from './VideoSphere.js';

const TRANSITION_MS = 2400;
const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export class VideoChapterController {
  constructor({ scene, camera, rig, hotspotSystem, hotspotTimeline, timelineScrubber, onChapterChange, onComplete, onLoadingChange }) {
    this.scene = scene;
    this.camera = camera;
    this.rig = rig;
    this.hotspotSystem = hotspotSystem;
    this.hotspotTimeline = hotspotTimeline;
    this.timelineScrubber = timelineScrubber;
    this.onChapterChange = onChapterChange;
    this.onComplete = onComplete;
    this.onLoadingChange = onLoadingChange;

    this.chapters = CHAPTERS;
    this.currentIndex = 0;
    this.isTransitioning = false;

    this.sphereA = new VideoSphere(scene);
    this.sphereB = new VideoSphere(scene);
    this.activeSphere = this.sphereA;
    this.nextSphere = this.sphereB;

    this._setupSphereCallbacks();
  }

  _setupSphereCallbacks() {
    this.sphereA.onEnded(() => this._onChapterEnd());
    this.sphereA.onTimeUpdate((t) => this._onTimeUpdate(t));
    this.sphereB.onEnded(() => this._onChapterEnd());
    this.sphereB.onTimeUpdate((t) => this._onTimeUpdate(t));
  }

  async loadChapter(index, isNext = false) {
    const chapter = this.chapters[index];
    const sphere = isNext ? this.nextSphere : this.activeSphere;
    sphere.fallbackDuration = chapter.duration;

    if (!isNext) {
      this.onLoadingChange?.(true);
      sphere.onProgress((percent, buffered) => {
        this.timelineScrubber.setLoadingProgress(percent);
      });
    }

    await sphere.load(chapter.video);

    if (!isNext) {
      sphere.onProgress(null);
      this.onLoadingChange?.(false);
      this._setupChapter(chapter);
      this.timelineScrubber.setChapter(chapter, this.chapters);
      this.hotspotTimeline.setHotspots(chapter.hotspotsTemporal);
      this.hotspotSystem.setForNode({ hotspots: chapter.hotspotsSpatial, heading0: 0, position: [0, 0, 0] });
      this.onChapterChange?.(chapter, index);
    }
  }

  _setupChapter(chapter) {
    this.camera.position.set(0, 0, 0);
    this.rig.recenter();
    this.activeSphere.setOpacity(1);
    this.nextSphere.setOpacity(0);
  }

  async playCurrent() {
    try {
      await this.activeSphere.play();
    } catch (e) {
      console.log('Autoplay blocked, waiting for user interaction');
    }
  }

  seek(time) {
    this.activeSphere.seek(time);
  }

  get currentTime() {
    return this.activeSphere.currentTime;
  }

  get duration() {
    return this.activeSphere.duration;
  }

  _onTimeUpdate(time) {
    this.timelineScrubber.update(time, this.duration);
    this.hotspotTimeline.update(time);
  }

  _onChapterEnd() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.timelineScrubber.setEndReached(true);

    const nextIndex = this.currentIndex + 1;
    if (nextIndex >= this.chapters.length) {
      this.timelineScrubber.setComplete(true);
      this.onComplete?.();
      return;
    }

    this._transitionTo(nextIndex);
  }

  async _transitionTo(nextIndex) {
    const nextChapter = this.chapters[nextIndex];
    this.nextSphere.fallbackDuration = nextChapter.duration;

    const t0 = performance.now();

    const animate = () => {
      const t = Math.min(1, (performance.now() - t0) / TRANSITION_MS);
      const e = easeInOut(t);
      this.activeSphere.setOpacity(1 - e);
      this.nextSphere.setOpacity(e);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        this._finishTransition(nextIndex, nextChapter);
      }
    };
    requestAnimationFrame(animate);
  }

  _finishTransition(nextIndex, nextChapter) {
    [this.activeSphere, this.nextSphere] = [this.nextSphere, this.activeSphere];
    this.currentIndex = nextIndex;
    this.isTransitioning = false;

    // If next sphere not ready, show loading
    if (this.activeSphere.video.readyState < 3) { // HAVE_FUTURE_DATA
      this.onLoadingChange?.(true);
      this.activeSphere.onProgress((percent) => {
        this.timelineScrubber.setLoadingProgress(percent);
      });
      this.activeSphere.video.addEventListener('canplay', () => {
        this.activeSphere.onProgress(null);
        this.onLoadingChange?.(false);
      }, { once: true });
    }

    this._setupChapter(nextChapter);
    this.activeSphere.play();
    this.timelineScrubber.setChapter(nextChapter, this.chapters);
    this.timelineScrubber.setEndReached(false);
    this.hotspotTimeline.setHotspots(nextChapter.hotspotsTemporal);
    this.hotspotSystem.setForNode({ hotspots: nextChapter.hotspotsSpatial, heading0: 0, position: [0, 0, 0] });
    this.onChapterChange?.(nextChapter, nextIndex);

    const followingIndex = nextIndex + 1;
    if (followingIndex < this.chapters.length) {
      this.loadChapter(followingIndex, true).catch(() => {});
    }
  }

  async goToChapter(targetIndex) {
    if (this.isTransitioning || targetIndex === this.currentIndex) return;
    this.isTransitioning = true;
    this.activeSphere.pause();
    this.onLoadingChange?.(true);
    await this._transitionTo(targetIndex);
  }

  update(dt) {
    if (this.isTransitioning) return;
    this.sphereA.mesh.position.copy(this.camera.position);
    this.sphereB.mesh.position.copy(this.camera.position);
  }

  dispose() {
    this.sphereA.dispose();
    this.sphereB.dispose();
  }
}