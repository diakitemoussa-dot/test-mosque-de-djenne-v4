import * as THREE from 'three';
import { worldPosition } from './spatial.js';

export class HotspotTimeline {
  constructor({ layer, camera }) {
    this.layer = layer;
    this.camera = camera;
    this.hotspots = [];
    this.activeElements = new Map();
    this._v = new THREE.Vector3();
  }

  setHotspots(hotspots) {
    this.layer.querySelectorAll('.hotspot-temporal').forEach(el => el.remove());
    this.activeElements.clear();
    this.hotspots = hotspots || [];

    for (const hs of this.hotspots) {
      const el = document.createElement('div');
      el.className = 'hotspot hotspot-temporal hidden';
      el.dataset.id = hs.id;
      el.innerHTML = `<div class="dot"></div><div class="label">${hs.title}</div>`;
      el.addEventListener('click', () => this._onHotspotClick(hs));
      this.layer.appendChild(el);
      this.activeElements.set(hs.id, {
        el,
        data: hs,
        position: worldPosition({ heading0: 0, position: [0, 0, 0] }, hs.yaw, hs.pitch, 60)
      });
    }
  }

  update(currentTime) {
    for (const [id, item] of this.activeElements) {
      const hs = item.data;
      const isVisible = currentTime >= hs.start && currentTime <= hs.end;
      item.el.classList.toggle('hidden', !isVisible);

      if (isVisible) {
        this._v.copy(item.position).applyMatrix4(this.camera.matrixWorldInverse);
        if (this._v.z > -1) {
          item.el.classList.add('hidden');
          continue;
        }
        this._v.copy(item.position).project(this.camera);
        const x = (this._v.x * 0.5 + 0.5) * innerWidth;
        const y = (-this._v.y * 0.5 + 0.5) * innerHeight;
        item.el.style.left = `${x}px`;
        item.el.style.top = `${y}px`;
      }
    }
  }

  _onHotspotClick(hs) {
    window.dispatchEvent(new CustomEvent('hotspot:open', { detail: hs }));
  }
}