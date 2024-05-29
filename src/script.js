import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let canvas;
let camera;
let renderer;
let scene;
let controls;
let text = 'This is Three.js';
let userInput = false;
let mesh;
let font;
let debounceTimeout;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

function createScene() {
  scene = new THREE.Scene();

  const fov = 75;
  const aspect = sizes.width / sizes.height;
  const near = 0.1;
  const far = 100;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(1, 1, 3);

  renderer = new THREE.WebGL1Renderer({ canvas });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.add(camera);
  renderer.render(scene, camera);
}

function createMesh() {
  const textureLoader = new THREE.TextureLoader();
  const textTexture = textureLoader.load('/textures/matcaps/8.png');
  textTexture.colorSpace = THREE.SRGBColorSpace;

  const textMaterial = new THREE.MeshMatcapMaterial({ matcap: textTexture });

  const fontLoader = new FontLoader();
  fontLoader.load('/fonts/helvetiker_regular.typeface.json', (fontObject) => {
    font = fontObject;
    const textGeometry = new TextGeometry(
      text,
      {
        font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5,
      },
    );
    textGeometry.center();
    mesh = new THREE.Mesh(textGeometry, textMaterial);
    scene.add(mesh);
  });
}

function createControls() {
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWndowResize() {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);
}

function resetCamera(geometry) {
  geometry.computeBoundingBox();
  const adjustBoxParameters = -0.2 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
  mesh.position.x = adjustBoxParameters;
}

function resetText() {
  const textGeometry = new TextGeometry(
    text,
    {
      font,
      size: 0.5,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    },
  );
  textGeometry.center();
  mesh.geometry.dispose();
  mesh.geometry = textGeometry;
  resetCamera(textGeometry);
}

function onKeyDown(event) {
  if (!userInput) {
    userInput = true;
    text = '';
  }
  if (event.keyCode === 8) {
    clearTimeout(debounceTimeout);
    event.preventDefault();
    text = text.slice(0, -1);
    resetText();
  }
}

function onKeyPress(event) {
  clearTimeout(debounceTimeout);
  if (event.keyCode === 8) {
    event.preventDefault();
  } else {
    const { key } = event;
    text += key;
  }
  resetText();
}

function setUpListeners() {
  window.addEventListener('resize', onWndowResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keypress', onKeyPress);
}

function init() {
  canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  createScene();
  createMesh();
  createControls();
  animate();
  setUpListeners();
}

init();
