import { SceneManager } from './core/SceneManager';
import { CubeObject } from './objects/CubeObject';
import { setupUI } from './ui/Controls';
import { setupFPSCounter } from './utils/fpsCounter';

// 初始化场景
const container = document.getElementById('app') as HTMLElement;
const sceneManager = new SceneManager(container);
window.sceneManager = sceneManager;

// 设置UI
setupUI({
  addCube: () => {
    const newCube = new CubeObject();
    sceneManager.addObject(newCube);
  },
  addSphere: () => {
    // implement addSphere if needed
  },
  resetScene: () => {
    sceneManager.removeAllObjects();
  }
});

// 设置FPS计数器
setupFPSCounter();

setTimeout(() => {
  try {
    window.camera.setPosition(new window.THREE.Vector3(
      -50.77595575780843,
      1.9999999999982334,
      22.465322255919943
    ));
    window.camera.getCamera().rotation.x = -0.03568420969271251;
  } catch (e) { }
}, 3000);
// 双击进入全屏并自动聚焦
container.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    container.requestFullscreen().then(() => {
      // 聚焦容器内部的 canvas，确保键盘事件立即生效
      const canvas = container.querySelector("canvas") as HTMLCanvasElement;
      if (canvas) canvas.focus();
    }).catch((err) => {
      console.warn("Failed to enter fullscreen:", err);
    });
  }
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  sceneManager.update();
}

animate();
function isCameraNearAnything(camera, scene, threshold = 5) {
  const camPos = new THREE.Vector3();
  camera.getWorldPosition(camPos);

  let near = false;

  scene.traverse((obj) => {
    if (obj.isMesh) {
      const box = new THREE.Box3().setFromObject(obj);
      const closest = box.clampPoint(camPos, new THREE.Vector3());
      const dist = camPos.distanceTo(closest);
      if (dist < threshold) near = true;
    }
  });

  return near;
}
window.isCameraNearAnything = isCameraNearAnything;
window.addFullPageIframe = function addFullPageIframe(url="https://5c2q73.csb.app/",id='roads') {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.id = id;
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.margin = "0";
  iframe.style.padding = "0";
  iframe.style.overflow = "hidden";
  iframe.style.zIndex = "9999"; // stay on top
  document.body.appendChild(iframe);
}
// window.addFullPageIframe('/interior.html', 'interior');
window.addFullPageIframe('/sroads/index.html', 'roads');