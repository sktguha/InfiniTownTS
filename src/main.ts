import { SceneManager } from './core/SceneManager';
import { CubeObject } from './objects/CubeObject';
import { setupUI } from './ui/Controls';
import { setupFPSCounter } from './utils/fpsCounter';

// Declare global properties on the window object for TypeScript
declare global {
    interface Window {
        sceneManager: SceneManager;
        getParams: (key: string) => string | null;
        camera: any; // Or a more specific THREE.Camera type
        THREE: any; // Assuming THREE is globally available
        isCameraNearAnything: (camera: any, scene: any, threshold?: number) => boolean;
        addFullPageIframe: (url?: string, id?: string, topBarHeight?: number) => void;
        cameraController: any; // Or a more specific controller type
    }
}


// 初始化场景
const container = document.getElementById('app') as HTMLElement;
const sceneManager = new SceneManager(container);
window.sceneManager = sceneManager;
const getParams = (key: string) => new URLSearchParams(window.location.search).get(key);
window.getParams = getParams;

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

function isCameraNearAnything(camera: any, scene: any, threshold = 5) {
    const camPos = new window.THREE.Vector3();
    camera.getWorldPosition(camPos);

    let near = false;

    scene.traverse((obj: any) => {
        if (obj.isMesh) {
            const box = new window.THREE.Box3().setFromObject(obj);
            const closest = box.clampPoint(camPos, new window.THREE.Vector3());
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
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.margin = "0";
    iframe.style.padding = "0";
    iframe.style.overflow = "hidden";
    iframe.style.zIndex = "0";
    document.body.appendChild(iframe);
    iframe.style.visibility = 'hidden';
}

function createTopBar(options: any = {}) {
    const {
        height = 60,
        background = "#333",
        color = "#fff",
        blur = true
    } = options;

    const bar = document.createElement("div");
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
    bar.style.gap = "10px";
    bar.style.zIndex = "1000";
    if (blur) bar.style.backdropFilter = "blur(5px)";

    function makeBtn(label: string, onClick: () => void) {
        const btn = document.createElement("button");
        btn.innerText = label;
        btn.onclick = onClick;
        bar.appendChild(btn);
    }

    makeBtn("City", () => {
        document.getElementById('interior')!.style.visibility = 'hidden';
        document.getElementById('roads')!.style.visibility = 'hidden';
    });

    makeBtn("Interior", () => {
        document.getElementById('interior')!.style.visibility = 'visible';
        document.getElementById('roads')!.style.visibility = 'hidden';
        document.getElementById('interior')!.focus();
    });

    makeBtn("Roads", () => {
        document.getElementById('interior')!.style.visibility = 'hidden';
        document.getElementById('roads')!.style.visibility = 'visible';
        document.getElementById('roads')!.focus();
    });

    document.body.appendChild(bar);
    return bar;
}

// NOTE: The iframe is created here but is no longer used by the keydown listener.
// You could remove this line if the topBar is also not being used.
window.addFullPageIframe('/interior.html', 'interior');

let newWin: (Window & { resetAndRandomize?: () => void; }) | null;
let interiorWindow: Window | null = null; // Variable for the interior pop-up

async function moveCameraForward(h = 4, speed = 10 * 7, duration = 4000) {
    const camera = window.cameraController._camera;
    return new Promise<void>(resolve => {
        const start = performance.now();
        camera.position.y = h;
        camera.updateProjectionMatrix();
        function step(now: number) {
            const elapsed = now - start;
            if (elapsed < duration) {
                camera.translateZ(-speed * 0.016);
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}

document.addEventListener("keydown", async function (e) {
    if (e.key === "8") {
        await moveCameraForward(12, 10 * 7, 4000);
        newWin = newWin || window.open(window.getParams('sroads') || window.getParams('slowroads') || "/sroads/index.html", "_blank");
        if (newWin) {
            newWin.focus();
            if (typeof newWin.resetAndRandomize === 'function') {
                newWin.resetAndRandomize();
            }
        } else {
            alert("Popup blocked! Please allow popups for this site.");
        }
    } else if (e.key === "6") {
        // Simplified logic: Always close any old window and open a fresh one.
        if (interiorWindow && !interiorWindow.closed) {
            interiorWindow.close();
        }

        interiorWindow = window.open('/interior.html', 'interiorView');
        if (interiorWindow) {
            interiorWindow.focus();
        } else {
            alert("Popup blocked! Please allow popups for this site to view the interior.");
        }
    } else if (e.key === "7") {
        // '7' simply closes the window if it's open.
        if (interiorWindow && !interiorWindow.closed) {
            interiorWindow.close();
            interiorWindow = null;
        }
    }
});


function setupAudio(src: string) {
    const audio = new Audio(src);
    audio.loop = true;

    audio.play().catch(() => {
        const startOnClick = () => {
            audio.play();
            document.removeEventListener("click", startOnClick);
        };
        document.addEventListener("click", startOnClick, { once: true });
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            audio.pause();
        } else {
            audio.play().catch(() => { });
        }
    });

    return audio;
}

const bgm = setupAudio("/city.mp3");