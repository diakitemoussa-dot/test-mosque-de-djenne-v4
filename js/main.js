import * as THREE from 'three';
import { CameraRig } from './CameraRig.js';
import { GyroControls } from './GyroControls.js';
import { TouchControls } from './TouchControls.js';
import { HotspotSystem } from './HotspotSystem.js';
import { VideoChapterController } from './VideoChapterController.js';
import { HotspotTimeline } from './HotspotTimeline.js';
import { CHAPTERS } from './chapters.js';

const app = document.getElementById('app');
const hotspotLayer = document.getElementById('hotspotLayer');
const navLayer = document.getElementById('navLayer');
const nodeLabel = document.getElementById('nodeLabel');

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(78, innerWidth / innerHeight, 0.1, 1100);

const rig = new CameraRig(camera);
const gyro = new GyroControls(rig);
new TouchControls(renderer.domElement, rig);

const hotspotSystem = new HotspotSystem(navLayer, camera, (data) => {
  controller.goToChapter(data.to);
});

// Simple loading state (no timeline UI)
let isLoading = false;
function showLoading() { isLoading = true; }
function hideLoading() { isLoading = false; }

const hotspotTimeline = new HotspotTimeline({ layer: hotspotLayer, camera });

const controller = new VideoChapterController({
  scene,
  camera,
  rig,
  hotspotSystem,
  hotspotTimeline,
  timelineScrubber: { update: () => {}, setChapter: () => {}, setLoadingProgress: () => {}, showLoading, hideLoading, setEndReached: () => {}, setComplete: () => {} },
  onChapterChange: (chapter, index) => {
    nodeLabel.textContent = chapter.name;
  },
  onComplete: () => {
    controller.goToChapter(0);
  },
  onLoadingChange: (loading) => {
    if (loading) showLoading(); else hideLoading();
  }
});

const panel = document.getElementById('hotspotPanel');
window.addEventListener('hotspot:open', (e) => {
  const data = e.detail;
  document.getElementById('panelTitle').textContent = data.title;
  document.getElementById('panelText').textContent = data.text;
  document.getElementById('panelImage').src = data.image;
  panel.classList.add('open');
});
document.getElementById('panelClose').addEventListener('click', () => panel.classList.remove('open'));

// Recenter button
document.getElementById('recenterBtn').addEventListener('click', () => rig.recenter());

// Auto-enable gyro on all devices
async function enableGyro() {
  try {
    await gyro.enable();
  } catch (e) {
    console.log('Gyro not available, using touch controls');
  }
}

// Auto-start experience
async function startExperience() {
  showLoading();
  await controller.loadChapter(0);
  hideLoading();
  const played = await controller.playCurrent();
  if (!played) {
    // Autoplay blocked - show tap to play overlay
    showTapToPlay();
  }
  controller.loadChapter(1, true).catch(() => {});
}

function showTapToPlay() {
  const overlay = document.createElement('div');
  overlay.id = 'tapToPlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;color:white;font-family:system-ui;gap:16px;';
  overlay.innerHTML = `
    <svg width="80" height="80" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" fill="#ffd700"/></svg>
    <h1 style="margin:0;font-size:24px;">Toucher pour lire</h1>
  `;
  overlay.addEventListener('click', async () => {
    overlay.remove();
    await controller.playCurrent();
  }, { once: true });
  document.body.appendChild(overlay);
}

// Enable gyro immediately, then start experience
enableGyro().then(startExperience);

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  rig.update(dt);
  controller.update(dt);
  renderer.render(scene, camera);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});