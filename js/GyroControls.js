export class GyroControls {
  constructor(rig) {
    this.rig = rig;
    this.available = false;
    this.permissionState = 'unknown';
    this._firstEvent = new Promise((resolve) => {
      this._resolveFirst = resolve;
    });
    this._onOrientation = (event) => {
      if (event.alpha === null && event.beta === null) return;
      this.available = true;
      const orientRad =
        ((screen.orientation && screen.orientation.angle) ||
          window.orientation ||
          0) * (Math.PI / 180);
      this.rig.setFromDeviceOrientation(
        event.alpha || 0,
        event.beta || 0,
        event.gamma || 0,
        orientRad
      );
      this._resolveFirst();
    };
  }

  attach() {
    window.addEventListener('deviceorientation', this._onOrientation);
  }

  async enable() {
    this.attach();
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        this.permissionState = await DeviceOrientationEvent.requestPermission();
      } catch {
        this.permissionState = 'denied';
      }
      if (this.permissionState !== 'granted') return false;
    }
    const timeout = new Promise((resolve) => setTimeout(resolve, 900));
    await Promise.race([this._firstEvent, timeout]);
    return this.available;
  }
}
