import * as THREE from 'three';

const DEG = Math.PI / 180;

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.baseFov = 78;
    this.fov = this.baseFov;
    this.targetFov = this.baseFov;
    this.minFov = 42;
    this.maxFov = 95;

    this.homeLon = Math.PI / 2;
    this.homeLat = 0;
    this.lon = this.homeLon;
    this.lat = this.homeLat;

    this.gyroActive = false;
    this.locked = false;
    this.userYaw = 0;
    this.userPitch = 0;

    this._deviceQ = new THREE.Quaternion();
    this._userQ = new THREE.Quaternion();
    this._euler = new THREE.Euler();
    this._q0 = new THREE.Quaternion();
    this._q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    this._zee = new THREE.Vector3(0, 0, 1);
    this._fwd = new THREE.Vector3();
  }

  setFromDeviceOrientation(alphaDeg, betaDeg, gammaDeg, orientRad) {
    this._euler.set(
      betaDeg * DEG,
      alphaDeg * DEG,
      -gammaDeg * DEG,
      'YXZ'
    );
    this._deviceQ.setFromEuler(this._euler);
    this._deviceQ.multiply(this._q1);
    this._deviceQ.multiply(this._q0.setFromAxisAngle(this._zee, -orientRad));
    this.gyroActive = true;
  }

  rotate(dx, dy) {
    if (this.locked) return;
    const k = 0.0032;
    if (this.gyroActive) {
      this.userYaw -= dx * k;
      this.userPitch = THREE.MathUtils.clamp(
        this.userPitch + dy * k,
        -85 * DEG,
        85 * DEG
      );
    } else {
      this.lon -= dx * k;
      this.lat = THREE.MathUtils.clamp(
        this.lat + dy * k,
        -85 * DEG,
        85 * DEG
      );
    }
  }

  pinch(scale) {
    this.targetFov = THREE.MathUtils.clamp(
      this.baseFov / scale,
      this.minFov,
      this.maxFov
    );
  }

  recenter() {
    this.userYaw = 0;
    this.userPitch = 0;
    this.lon = this.homeLon;
    this.lat = this.homeLat;
    this.targetFov = this.baseFov;
  }

  currentLon() {
    this.camera.getWorldDirection(this._fwd);
    return Math.atan2(-this._fwd.x, -this._fwd.z);
  }

  faceLon(lon) {
    if (this.gyroActive) {
      this.userYaw += lon - this.currentLon();
    } else {
      this.lon = lon;
    }
  }

  update(dt) {
    this.fov += (this.targetFov - this.fov) * Math.min(1, dt * 9);
    if (Math.abs(this.camera.fov - this.fov) > 0.01) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }

    if (this.gyroActive) {
      this._userQ.setFromEuler(
        this._euler.set(this.userPitch, this.userYaw, 0, 'YXZ')
      );
      this.camera.quaternion.copy(this._userQ).multiply(this._deviceQ);
    } else {
      this.camera.rotation.set(this.lat, this.lon, 0, 'YXZ');
    }
  }
}
