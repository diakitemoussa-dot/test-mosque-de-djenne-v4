import * as THREE from 'three';
import { CameraRig } from './CameraRig.js';
import { GyroControls } from './GyroControls.js';
import { TouchControls } from './TouchControls.js';
import { HotspotSystem } from './HotspotSystem.js';
import { VideoChapterController } from './VideoChapterController.js';
import { TimelineScrubber } from './TimelineScrubber.js';
import { HotspotTimeline } from './HotspotTimeline.js';
import { CHAPTERS } from './chapters.js';

const app = document.getElementById('app');
const hotspotLayer = document.getElementById('hotspotLayer');
const navLayer = document.getElementById('navLayer');
const timelineContainer = document.getElementById('timelineContainer');
const motionPrompt = document.getElementById('motionPrompt');
const startOverlay = document.getElementById('startOverlay');
const endScreen = document.getElementById('endScreen');
const restartBtn = document.getElementById('restartBtn');
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

const timelineScrubber = new TimelineScrubber({
  container: timelineContainer,
  onSeek: (time) => controller.seek(time),
  onEndReached: () => {}
});

const hotspotTimeline = new HotspotTimeline({ layer: hotspotLayer, camera });

const controller = new VideoChapterController({
  scene,
  camera,
  rig,
  hotspotSystem,
  hotspotTimeline,
  timelineScrubber,
  onChapterChange: (chapter, index) => {
    nodeLabel.textContent = chapter.name;
  },
  onComplete: () => {
    endScreen.classList.remove('hidden');
  },
  onLoadingChange: (isLoading) => {
    if (isLoading) {
      timelineScrubber.showLoading();
    } else {
      timelineScrubber.hideLoading();
    }
  }
});

document.getElementById('recenterBtn').addEventListener('click', () => rig.recenter());

restartBtn.addEventListener('click', () => {
  endScreen.classList.add('hidden');
  controller.goToChapter(0);
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

const needsPermission =
  typeof DeviceOrientationEvent !== 'undefined' &&
  typeof DeviceOrientationEvent.requestPermission === 'function';

if (needsPermission) {
  motionPrompt.hidden = false;
  motionPrompt.addEventListener('click', async () => {
    await gyro.enable();
    motionPrompt.hidden = true;
    startExperience();
  }, { once: true });
} else {
  gyro.attach();
  setTimeout(() => {
    if (!gyro.available) console.info('Gyroscope unavailable, using touch controls.');
  }, 1000);
  startOverlay.hidden = false;
  startOverlay.addEventListener('click', startExperience, { once: true });
}

async function startExperience() {
  startOverlay.hidden = true;
  timelineScrubber.showLoading();
  await controller.loadChapter(0);
  timelineScrubber.hideLoading();
  await controller.playCurrent();
  controller.loadChapter(1, true).catch(() => {});
}

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