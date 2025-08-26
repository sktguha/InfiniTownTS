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
window.addFullPageIframe = function addFullPageIframe(
  url = "https://5c2q73.csb.app/",
  id = "roads",
  topBarHeight = 60 // height of the top bar in px
) {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.id = id;
  iframe.style.position = "fixed";
  iframe.style.top = topBarHeight + "px"; // start below top bar
  iframe.style.left = "0";
  iframe.style.width = "100%";
  iframe.style.height = `calc(100% - ${topBarHeight}px)`; // fill remaining space
  iframe.style.border = "none";
  iframe.style.margin = "0";
  iframe.style.padding = "0";
  iframe.style.overflow = "hidden";
  iframe.style.zIndex = "0"; // behind top bar
  document.body.appendChild(iframe);
}
function createTopBar(options = {}) {
  const {
    height = 60,
    background = "#333",
    color = "#fff",
    text = "My Top Bar",
    blur = true
  } = options;

  const bar = document.createElement("div");
  // bar.innerText = text;
  bar.style.position = "fixed";
  bar.style.top = "0";
  bar.style.left = "0";
  bar.style.width = "100%";
  bar.style.height = height + "px";
  bar.style.backgroundColor = background;
  bar.style.color = color;
  bar.style.display = "flex";
  bar.style.alignItems = "center";
  bar.style.justifyContent = "center";
  bar.style.gap = "10px"; // spacing between buttons
  bar.style.zIndex = "1000";
  if (blur) bar.style.backdropFilter = "blur(5px)";

  function makeBtn(label: string, onClick: () => void) {
    const btn = document.createElement("button");
    btn.innerText = label;
    btn.onclick = onClick;
    bar.appendChild(btn);
  }

  // Main Page button
  makeBtn("City", () => {
    document.getElementById('interior')!.style.visibility = 'hidden';
    document.getElementById('roads')!.style.visibility = 'hidden';
  });

  // Show Interior
  makeBtn("Interior", () => {
    document.getElementById('interior')!.style.visibility = 'visible';
    document.getElementById('roads')!.style.visibility = 'hidden';
    document.getElementById('interior')!.focus();
  });

  // Show Roads
  makeBtn("Roads", () => {
    document.getElementById('interior')!.style.visibility = 'hidden';
    document.getElementById('roads')!.style.visibility = 'visible';
    document.getElementById('roads')!.focus();
  });

  document.body.appendChild(bar);
  return bar;
}

// Usage:
// createTopBar({ text: "Hello, I stay on top!" });
// window.addFullPageIframe('/interior.html', 'interior');
// window.addFullPageIframe('/sroads/index.html', 'roads');
// document.getElementById('interior')!.style.visibility = 'hidden';
// document.getElementById('roads')!.style.visibility = 'hidden';
let newWin: Window;
async function moveCameraForward(camera, speed = 10, duration = 4000) {
  return new Promise(resolve => {
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;

      if (elapsed < duration) {
        // Move camera forward in its local space
        camera.translateZ(-speed * 0.016); // ~60fps step
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

// usage:
// console.log("done moving");

document.addEventListener("keydown", async function (e) {
  // Check if key "9" is pressed (keyCode 57 or e.key === "9")
  if (e.key === "9") {
    await moveCameraForward(window.cameraController._camera, 20, 4000);
    newWin = newWin || window.open("/sroads/index.html", "_blank");
    if (newWin) {
      newWin.focus(); // shift focus to new window
    } else {
      alert("Popup blocked! Please allow popups for this site.");
    }
  }
});