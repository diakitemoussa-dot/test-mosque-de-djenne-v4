import * as THREE from 'three';

export const DEG = Math.PI / 180;

export function dirFromHeading(h) {
  return new THREE.Vector3(Math.sin(h), 0, Math.cos(h));
}

export function headingBetween(a, b) {
  return Math.atan2(b.x - a.x, b.z - a.z);
}

export function lonForHeading(headingRad, node) {
  return headingRad - node.heading0 * DEG + Math.PI / 2;
}

export function worldPosition(node, yawDeg, pitchDeg, dist) {
  const h = (yawDeg + node.heading0) * DEG;
  const p = pitchDeg * DEG;
  const d = dirFromHeading(h);
  return new THREE.Vector3(
    node.position[0] + d.x * dist * Math.cos(p),
    node.position[1] + Math.sin(p) * dist,
    node.position[2] + d.z * dist * Math.cos(p)
  );
}
