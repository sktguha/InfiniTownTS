# 🚀InfiniTownTS
> 🌍 [简体中文说明 / 中文版 README](./readme_zh_cn.md)

An open-source TypeScript implementation of the Three.js Infinite City demo.  This project closely replicates the core logic and algorithmic brilliance of the original InfiniTown while enhancing camera control, animation, car interaction, and scene rotation features. It is also built using the latest version of the Three.js engine.

[Visit the original InfiniTown demo by Little Workshop](https://demos.littleworkshop.fr/infinitown)

## 🌐 Live Demo
[🔗Try the open-source TypeScript version of InfiniTown](https://osoker.github.io/InfiniTownTS/)

## 📥 Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/osoker/InfiniTownTS.git
cd InfiniTownTS
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start development server

```bash
npm run dev
```

### 4️⃣ Build for production

```bash
npm run build
```

The production-ready files will be located in the dist/ directory and can be deployed to any static server or GitHub Pages.

---

## 🧭 Project Structure

```
InfiniTownTS/
├── docs/             # Static files for GitHub Pages
├── dist/             # Build output
├── src/              # TypeScript source code
│   ├── core/         # Core logic for infinite city generation
│   └── main.ts       # Entry point
├── public/           # Static assets
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

- [Three.js](https://threejs.org/)：WebGL rendering engine
- [TypeScript](https://www.typescriptlang.org/)：A statically typed superset of JavaScript
- [TWEEN.js](https://github.com/tweenjs/tween.js)：Tweening animation library

---

## 📌 Key Features

- ✨ Infinite city algorithm with dynamic loading and unloading of city blocks  
- 🧭 Camera orbit and focus control using OrbitControls  
- 🔧 TypeScript class-based architecture to help you better understand how InfiniTown works  

---

## 🎮 New Keyboard Controls (forked and added by sktguha, sktguha@gmail.com )

The fork extends navigation with **flight-style camera controls** and improved speed management.  
The view now **starts in a top-down orientation** for better scene awareness.  

### 🔑 Controls

| Key(s)       | Action                  | Axis / Effect            |
|--------------|-------------------------|--------------------------|
| ⬆ / ⬇       | Forward / Backward      | Move Z (world forward)   |
| ⬅ / ➡       | Strafe Left / Right     | Move X (world sideways)  |
| **Q / E**    | Rotate Left / Right     | **Yaw**                  |
| **R / F**    | Move Up / Down          | Move Y (vertical)        |
| **T / G**    | Look Up / Down          | **Pitch**                |
| **Y / H**    | Turn Left / Right       | **Yaw (view rotation)**  |
| **B / N**    | Tilt Left / Right       | **Roll**                 |

---

### ⚡ Speed Adjustment

| Key | Speed Mode        |
|-----|-------------------|
| `1` | Very Slow         |
| `2` | Slow              |
| `3` | Normal (default)  |
| `4` | Fast              |
| `5` | Cruise Mode (auto forward motion) |

---

## 💬 CallMe

- 📮 Email：osoker008@gmail.com
