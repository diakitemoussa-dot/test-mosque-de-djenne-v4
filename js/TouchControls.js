export class TouchControls {
  constructor(element, rig) {
    this.rig = rig;
    this.pointers = new Map();
    this.startPinchDist = 0;
    this.lastX = 0;
    this.lastY = 0;

    element.addEventListener('pointerdown', (e) => this._onDown(e));
    element.addEventListener('pointermove', (e) => this._onMove(e));
    element.addEventListener('pointerup', (e) => this._onUp(e));
    element.addEventListener('pointercancel', (e) => this._onUp(e));
    element.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
    window.addEventListener('keydown', (e) => this._onKey(e));
    element.style.touchAction = 'none';
  }

  _onWheel(event) {
    event.preventDefault();
    const zoom = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    this.rig.pinch(zoom);
  }

  _onKey(event) {
    const step = 24;
    switch (event.key) {
      case 'ArrowLeft':
        this.rig.rotate(step, 0);
        break;
      case 'ArrowRight':
        this.rig.rotate(-step, 0);
        break;
      case 'ArrowUp':
        this.rig.rotate(0, step);
        break;
      case 'ArrowDown':
        this.rig.rotate(0, -step);
        break;
      case '+':
      case '=':
        this.rig.pinch(1.1);
        break;
      case '-':
      case '_':
        this.rig.pinch(1 / 1.1);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  _onDown(event) {
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size === 1) {
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    } else if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.startPinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  _onMove(event) {
    if (!this.pointers.has(event.pointerId)) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.pointers.size === 1) {
      this.rig.rotate(
        event.clientX - this.lastX,
        event.clientY - this.lastY
      );
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    } else if (this.pointers.size === 2 && this.startPinchDist > 0) {
      const [a, b] = [...this.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      this.rig.pinch(dist / this.startPinchDist);
    }
  }

  _onUp(event) {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) this.startPinchDist = 0;
    if (this.pointers.size === 1) {
      const [p] = [...this.pointers.values()];
      this.lastX = p.x;
      this.lastY = p.y;
    }
  }
}
