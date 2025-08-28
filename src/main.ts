// @ts-nocheck
import { SceneManager } from './core/SceneManager';
import { CubeObject } from './objects/CubeObject';
import { setupUI } from './ui/Controls';
import { setupFPSCounter } from './utils/fpsCounter';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from './api';
import * as desc_map from './desc.ts';

// 🔑 Get your API key from https://aistudio.google.com/
// (Don't hardcode in production; use env var instead)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function askGemini(prompt: string, model = "gemini-1.5-flash") {
    try {
        const modelClient = genAI.getGenerativeModel({ model });
        const result = await modelClient.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("Error calling Gemini API:", err);
    }
}

// // Example usage
// (async () => {
//     const reply = await askGemini("Write a short motivational quote.");
//     console.log("Gemini says:", reply);
// })();

// 初始化场景
const container = document.getElementById('app') as HTMLElement;
const sceneManager = new SceneManager(container);
window.sceneManager = sceneManager;
const getParams = key => new URLSearchParams(window.location.search).get(key);
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

window.onload = () => {
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
}
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
    iframe.style.top = "0"; // start below top bar
    iframe.style.left = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    // `calc(100% - ${topBarHeight}px)`; // fill remaining space
    iframe.style.border = "none";
    iframe.style.margin = "0";
    iframe.style.padding = "0";
    iframe.style.overflow = "hidden";
    iframe.style.zIndex = "0"; // behind top bar
    document.body.appendChild(iframe);
    iframe.style.visibility = 'hidden';
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
window.addFullPageIframe('/interior.html', 'interior');
// window.addFullPageIframe('/sroads/index.html', 'roads');
// document.getElementById('interior')!.style.visibility = 'hidden';
// document.getElementById('roads')!.style.visibility = 'hidden';
let newWin: Window;
async function moveCameraForward(h = 4, speed = 10 * 7, duration = 4000) {
    const camera = window.cameraController._camera;
    return new Promise(resolve => {
        const start = performance.now();
        camera.position.y = h; // keep height constant
        camera.updateProjectionMatrix();
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
    const iframe = document.getElementById('interior')!;
    if (e.key === "8") {
        await moveCameraForward(12, 10 * 7, 4000);
        newWin = newWin || window.open(window.getParams('sroads') || window.getParams('slowroads') || "/sroads/index.html", "_blank");
        if (newWin) {
            newWin.focus(); // shift focus to new window
        } else {
            alert("Popup blocked! Please allow popups for this site.");
        }
    } else if (e.key === "6") {
        iframe.style.visibility = 'visible';
        iframe.focus();
    } else if (e.key === "7") {
        iframe.style.visibility = 'hidden'
    } else if (e.key === "5") {
        function dropBanner(text, position) {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            ctx.font = '40px Arial';
            ctx.fillStyle = 'yellow';
            ctx.textBaseline = 'top';

            const maxWidth = canvas.width - 40; // padding
            const lineHeight = 50;

            function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
                const words = text.split(' ');
                let line = '';
                let lines = [];

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        lines.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                for (let k = 0; k < lines.length; k++) {
                    ctx.fillText(lines[k], x, y + k * lineHeight);
                }
            }

            wrapText(ctx, text, 20, 20, maxWidth, lineHeight);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const sprite = new THREE.Sprite(material);

            const camera = window.cameraController._camera;
            sprite.scale.set(10, 5, 1);

            // place in front of camera
            sprite.position.copy(position);
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            sprite.position.add(dir.multiplyScalar(5));

            const scene = window.sceneManager.scene;
            scene.add(sprite);
        }


        // askGemini(
        //     "write a beautiful warm piece quaint small description of a " + place
        //     +
        //     " place. It is basically for a video game. make it cute and nice."
        //     + " basically its some establishment").
        //     then((reply) => {
        //         // window.alert(reply);
        //         dropBanner(reply);
        //         localStorage.setItem(place! + Date.now(), reply || '');
        //     });
        window.desc_map = desc_map;
        async function generatePlaceDescription() {

            const keys = Object.keys(desc_map);
            const place = window.prompt(
                "What kind of place should I describe?\n" + keys
                    .map((item, index) => `${index + 1}. ${item}`)
                    .join("\n"));

            if (!place) {
                console.log("No input given.");
                return;
            }
            const getRandomElArr = arr => arr[Math.floor(Math.random() * arr.length)];
            if (!isNaN(place * 1)) {
                const allDesc = desc_map[keys[place * 1 - 1]];
                return getRandomElArr(
                    allDesc
                );
            }
            const prompt = `
          You are a friendly storyteller for a cozy video game.
          Describe a **${place}** in a warm, cute, and whimsical way.
          Keep it short (3 sentences), playful, and inviting.
          `;

            const response = await fetch("http://localhost:11434/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "phi3:mini",
                    messages: [{ role: "user", content: prompt }]
                })
            });

            const data = await response.json();
            console.log("✨", data.choices[0].message.content);
            return data.choices[0].message.content;
        }

        // Run it:
        const camera = window.cameraController._camera;
        const position = camera.position;
        generatePlaceDescription().then((reply) => {
            // window.alert(reply)
            dropBanner(reply || '', position);
        });

    }
});

function setupAudio(src) {
    const audio = new Audio(src);
    audio.loop = true;

    // try autoplay instantly
    audio.play().catch(() => {
        // if blocked, wait for first click/tap
        const startOnClick = () => {
            audio.play();
            document.removeEventListener("click", startOnClick);
        };
        document.addEventListener("click", startOnClick, { once: true });
    });

    // pause/resume when tab visibility changes
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            audio.pause();
        } else {
            audio.play().catch(() => { });
        }
    });

    return audio;
}

// usage
// https://www.youtube.com/watch?v=ukbZkjnbPCQ&t=58s
const bgm = setupAudio("/city.mp3");

