import * as THREE from 'three';
import { worldPosition } from './spatial.js';

export class HotspotSystem {
  constructor(layer, camera, onSelect) {
    this.layer = layer;
    this.camera = camera;
    this.radius = 60;
    this.items = [];
    this._v = new THREE.Vector3();
    this.onSelect = onSelect;
  }

  setForNode(node) {
    this.layer.querySelectorAll('.hotspot').forEach((e) => e.remove());
    this.items = [];
    for (const data of node.hotspots || []) {
      const el = document.createElement('div');
      el.className = 'hotspot hidden';
      el.innerHTML = `<div class="dot"></div><div class="label">${data.title}</div>`;
      el.addEventListener('click', () => this.onSelect(data));
      this.layer.appendChild(el);
      this.items.push({
        data,
        el,
        position: worldPosition(node, data.yaw, data.pitch, this.radius)
      });
    }
  }

  update() {
    const cameraMatrix = this.camera.matrixWorldInverse;
    for (const item of this.items) {
      this._v.copy(item.position).applyMatrix4(cameraMatrix);
      if (this._v.z > -1) {
        item.el.classList.add('hidden');
        continue;
      }
      this._v.copy(item.position).project(this.camera);
      const x = (this._v.x * 0.5 + 0.5) * innerWidth;
      const y = (-this._v.y * 0.5 + 0.5) * innerHeight;
      item.el.style.left = `${x}px`;
      item.el.style.top = `${y}px`;
      item.el.classList.remove('hidden');
    }
  }
}
