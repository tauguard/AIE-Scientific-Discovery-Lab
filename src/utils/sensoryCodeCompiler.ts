import { SynesthesiaResult } from '../types/aie';

/**
 * Compiles a specific sensory profile into a self-contained, runnable 3D simulation prototype code block.
 * Includes Three.js rendering, WebGL materials, particle dynamics, and Web Audio API acoustic harmonics.
 */
export function compileSensoryProfileTo3DPrototype(profile: SynesthesiaResult): {
  standaloneHtml: string;
  reactComponentCode: string;
  threeJsModuleCode: string;
} {
  const { inputDescription, sensoryMetaphor, visual, audio, haptic } = profile;

  const bgHex = '#080c16';
  const dominantHue = visual.dominantHue || 210;
  const saturation = visual.saturation || 75;
  const lightness = visual.lightness || 50;
  const accentHex = visual.accentHex || '#38bdf8';
  const geometryType = visual.geometryType || 'crystalline-fractal';
  const tactileTexture = visual.tactileTexture || 'crystalline';
  const motionSpeed = visual.motionSpeed || 1.2;

  const rootFreq = audio.rootFrequency || 432;
  const timbre = audio.timbre || 'sine';
  const chordHarmonics = audio.chordHarmonics && audio.chordHarmonics.length > 0 
    ? audio.chordHarmonics 
    : [rootFreq, rootFreq * 1.25, rootFreq * 1.5, rootFreq * 1.875];
  const filterCutoff = audio.filterCutoff || 2400;

  const vibrationPattern = haptic.vibrationPatternMs && haptic.vibrationPatternMs.length > 0 
    ? haptic.vibrationPatternMs 
    : [100, 50, 150];

  // 1. Standalone Single-File HTML5 + Three.js + Web Audio API Prototype
  const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Synesthetic 3D Prototype: ${escapeHtml(sensoryMetaphor)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: ${bgHex};
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      user-select: none;
    }
    #canvas-container {
      width: 100vw;
      height: 100vh;
      position: absolute;
      top: 0;
      left: 0;
    }
    .hud-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      max-width: 420px;
      background: rgba(10, 15, 29, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 12px;
      padding: 18px 20px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      z-index: 10;
      pointer-events: auto;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-family: monospace;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      margin-bottom: 8px;
      letter-spacing: 0.05em;
    }
    h1 {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    p.metaphor {
      font-size: 12px;
      color: #94a3b8;
      font-style: italic;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .spec-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      font-size: 11px;
      margin-bottom: 14px;
    }
    .spec-item {
      background: rgba(15, 23, 42, 0.6);
      padding: 6px 8px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .spec-label {
      color: #64748b;
      font-size: 9px;
      font-family: monospace;
      text-transform: uppercase;
      display: block;
    }
    .spec-val {
      color: #f1f5f9;
      font-weight: 600;
    }
    .action-btn {
      width: 100%;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border: none;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
    }
    .action-btn:hover {
      background: linear-gradient(135deg, #0369a1, #1d4ed8);
      transform: translateY(-1px);
    }
    .action-btn:active {
      transform: translateY(0);
    }
    .controls-hint {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-family: monospace;
      color: #64748b;
      background: rgba(10, 15, 29, 0.7);
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      pointer-events: none;
    }
  </style>
  <!-- Three.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <div id="canvas-container"></div>

  <div class="hud-panel">
    <span class="badge">AIE v1.0 · Synesthesia 3D Simulator</span>
    <h1>"${escapeHtml(sensoryMetaphor)}"</h1>
    <p class="metaphor">Prompt: "${escapeHtml(inputDescription)}"</p>

    <div class="spec-grid">
      <div class="spec-item">
        <span class="spec-label">Chromo-Geometry</span>
        <span class="spec-val">${geometryType}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Tactile Texture</span>
        <span class="spec-val" style="color: ${accentHex};">${tactileTexture}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Fundamental Tone</span>
        <span class="spec-val">${rootFreq} Hz (${timbre})</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Haptic Cadence</span>
        <span class="spec-val">[${vibrationPattern.slice(0, 3).join(', ')}] ms</span>
      </div>
    </div>

    <button id="audio-btn" class="action-btn" onclick="toggleHarmonicSonification()">
      <span>▶ Play Synesthetic Harmonics</span>
    </button>
  </div>

  <div class="controls-hint">
    [Left Click + Drag] Rotate 3D Sensorium · [Scroll] Zoom · [Right Click] Pan · [Click Object] Trigger Acoustic Pulse
  </div>

  <script>
    // --- 1. SENSORY PROFILE SPECIFICATION ---
    const SENSORY_SPEC = {
      dominantHue: ${dominantHue},
      saturation: ${saturation},
      lightness: ${lightness},
      accentHex: '${accentHex}',
      geometryType: '${geometryType}',
      tactileTexture: '${tactileTexture}',
      motionSpeed: ${motionSpeed},
      rootFrequency: ${rootFreq},
      timbre: '${timbre}',
      chordHarmonics: ${JSON.stringify(chordHarmonics)},
      filterCutoff: ${filterCutoff},
      vibrationPattern: ${JSON.stringify(vibrationPattern)}
    };

    // --- 2. THREE.JS SCENE SETUP ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080c16, 0.035);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- 3. SYNTHETIC LIGHTING RIG ---
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.5);
    scene.add(ambientLight);

    const dominantColor = new THREE.Color().setHSL(SENSORY_SPEC.dominantHue / 360, SENSORY_SPEC.saturation / 100, SENSORY_SPEC.lightness / 100);
    const keyLight = new THREE.PointLight(dominantColor, 3.5, 50);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const accentColor = new THREE.Color(SENSORY_SPEC.accentHex);
    const rimLight = new THREE.PointLight(accentColor, 2.5, 40);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    // --- 4. GEOMETRY GENERATOR BASED ON PROFILE ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    let coreMesh;
    let particleSystem;
    const initialPositions = [];

    function buildSensoryGeometry() {
      // Material tuning based on tactile texture
      let metalness = 0.2;
      let roughness = 0.5;
      let wireframe = false;

      if (SENSORY_SPEC.tactileTexture === 'metallic') {
        metalness = 0.9;
        roughness = 0.15;
      } else if (SENSORY_SPEC.tactileTexture === 'crystalline') {
        metalness = 0.4;
        roughness = 0.1;
      } else if (SENSORY_SPEC.tactileTexture === 'viscous') {
        metalness = 0.1;
        roughness = 0.8;
      } else if (SENSORY_SPEC.tactileTexture === 'aerated') {
        metalness = 0.1;
        roughness = 0.9;
        wireframe = true;
      }

      const pbrMaterial = new THREE.MeshStandardMaterial({
        color: dominantColor,
        emissive: accentColor,
        emissiveIntensity: 0.25,
        metalness: metalness,
        roughness: roughness,
        wireframe: wireframe
      });

      let geom;
      switch (SENSORY_SPEC.geometryType) {
        case 'crystalline-fractal':
          geom = new THREE.IcosahedronGeometry(2.4, 2);
          break;
        case 'hyperbolic-lattice':
          geom = new THREE.TorusKnotGeometry(1.6, 0.55, 128, 32, 2, 3);
          break;
        case 'organic-spiral':
          geom = new THREE.TorusGeometry(2.0, 0.7, 30, 200);
          break;
        case 'quantum-cloud':
          geom = new THREE.SphereGeometry(2.2, 48, 48);
          break;
        case 'fluid-vortices':
        default:
          geom = new THREE.OctahedronGeometry(2.4, 3);
          break;
      }

      coreMesh = new THREE.Mesh(geom, pbrMaterial);
      mainGroup.add(coreMesh);

      // Outer Wireframe Cage
      const wireMat = new THREE.MeshBasicMaterial({
        color: accentColor,
        wireframe: true,
        transparent: true,
        opacity: 0.25
      });
      const outerCage = new THREE.Mesh(geom.clone(), wireMat);
      outerCage.scale.set(1.08, 1.08, 1.08);
      mainGroup.add(outerCage);

      // Particle Aura System
      const particleCount = 700;
      const particleGeom = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 2.8 + Math.random() * 2.0;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        posArray[i] = x;
        posArray[i + 1] = y;
        posArray[i + 2] = z;
        initialPositions.push(x, y, z);
      }

      particleGeom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMat = new THREE.PointsMaterial({
        size: 0.05,
        color: accentColor,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });

      particleSystem = new THREE.Points(particleGeom, particleMat);
      mainGroup.add(particleSystem);
    }

    buildSensoryGeometry();

    // --- 5. ORBIT MOUSE CONTROLS ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0.003, y: 0.005 };

    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('.hud-panel')) return;
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      mainGroup.rotation.y += deltaX * 0.008;
      mainGroup.rotation.x += deltaY * 0.008;

      rotationVelocity.x = deltaY * 0.001;
      rotationVelocity.y = deltaX * 0.001;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('wheel', (e) => {
      camera.position.z = Math.max(3.5, Math.min(18, camera.position.z + e.deltaY * 0.01));
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- 6. REAL WEB AUDIO SYNTHESIZER ---
    let audioCtx = null;
    let isPlayingAudio = false;
    let activeOscillators = [];

    function toggleHarmonicSonification() {
      const btn = document.getElementById('audio-btn');
      if (isPlayingAudio) {
        stopAudio();
        btn.innerHTML = '<span>▶ Play Synesthetic Harmonics</span>';
        isPlayingAudio = false;
      } else {
        startAudio();
        btn.innerHTML = '<span>■ Stop Harmonics</span>';
        isPlayingAudio = true;
      }
    }

    function startAudio() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      activeOscillators = [];
      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(SENSORY_SPEC.filterCutoff, audioCtx.currentTime);

      masterGain.connect(filter);
      filter.connect(audioCtx.destination);

      SENSORY_SPEC.chordHarmonics.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        osc.type = SENSORY_SPEC.timbre;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(1.0 / (idx + 1), audioCtx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        activeOscillators.push(osc);
      });
    }

    function stopAudio() {
      activeOscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      activeOscillators = [];
    }

    // Interactive Trigger Pulse on Mesh Click
    window.addEventListener('click', (e) => {
      if (e.target.closest('.hud-panel')) return;
      // Pulse animation
      const scaleUp = 1.25;
      coreMesh.scale.set(scaleUp, scaleUp, scaleUp);
      setTimeout(() => { coreMesh.scale.set(1.0, 1.0, 1.0); }, 240);

      // Play momentary acoustic chime
      if (!isPlayingAudio) {
        startAudio();
        setTimeout(stopAudio, 1200);
      }
    });

    // --- 7. ANIMATION TICK LOOP ---
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const speed = SENSORY_SPEC.motionSpeed;

      if (!isDragging) {
        mainGroup.rotation.y += rotationVelocity.y;
        mainGroup.rotation.x += rotationVelocity.x;
        rotationVelocity.x *= 0.98;
        rotationVelocity.y *= 0.98;
        if (Math.abs(rotationVelocity.y) < 0.002) rotationVelocity.y = 0.0025 * speed;
      }

      // Breathing harmonic vertex deformation
      if (coreMesh) {
        const breath = 1.0 + Math.sin(elapsed * 2.0 * speed) * 0.035;
        coreMesh.scale.set(breath, breath, breath);
      }

      // Particle oscillation
      if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const initX = initialPositions[i];
          const initY = initialPositions[i + 1];
          const initZ = initialPositions[i + 2];

          positions[i] = initX + Math.sin(elapsed * speed + initY) * 0.08;
          positions[i + 1] = initY + Math.cos(elapsed * speed + initX) * 0.08;
          positions[i + 2] = initZ + Math.sin(elapsed * speed + initZ) * 0.08;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    animate();
  </script>
</body>
</html>`;

  // 2. React + Three.js Component Code Block
  const reactComponentCode = `import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Synesthetic3DViewerProps {
  dominantHue?: number;
  saturation?: number;
  lightness?: number;
  accentHex?: string;
  geometryType?: 'organic-spiral' | 'hyperbolic-lattice' | 'fluid-vortices' | 'crystalline-fractal' | 'quantum-cloud';
  tactileTexture?: 'smooth' | 'crystalline' | 'viscous' | 'aerated' | 'metallic' | 'fibrous';
  motionSpeed?: number;
  rootFrequency?: number;
  timbre?: 'sine' | 'triangle' | 'sawtooth' | 'square';
  chordHarmonics?: number[];
  filterCutoff?: number;
}

export const Synesthetic3DSimulator: React.FC<Synesthetic3DViewerProps> = ({
  dominantHue = ${dominantHue},
  saturation = ${saturation},
  lightness = ${lightness},
  accentHex = '${accentHex}',
  geometryType = '${geometryType}',
  tactileTexture = '${tactileTexture}',
  motionSpeed = ${motionSpeed},
  rootFrequency = ${rootFreq},
  timbre = '${timbre}',
  chordHarmonics = ${JSON.stringify(chordHarmonics)},
  filterCutoff = ${filterCutoff}
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dominantColor = new THREE.Color().setHSL(dominantHue / 360, saturation / 100, lightness / 100);
    const pointLight = new THREE.PointLight(dominantColor, 3, 40);
    pointLight.position.set(4, 5, 5);
    scene.add(pointLight);

    // Geometry Generation
    const group = new THREE.Group();
    scene.add(group);

    let geom: THREE.BufferGeometry;
    switch (geometryType) {
      case 'crystalline-fractal': geom = new THREE.IcosahedronGeometry(2.2, 2); break;
      case 'hyperbolic-lattice': geom = new THREE.TorusKnotGeometry(1.5, 0.5, 120, 24); break;
      case 'organic-spiral': geom = new THREE.TorusGeometry(1.8, 0.6, 24, 100); break;
      case 'quantum-cloud': geom = new THREE.SphereGeometry(2.0, 32, 32); break;
      default: geom = new THREE.OctahedronGeometry(2.2, 2); break;
    }

    const material = new THREE.MeshStandardMaterial({
      color: dominantColor,
      emissive: new THREE.Color(accentHex),
      emissiveIntensity: 0.25,
      metalness: tactileTexture === 'metallic' ? 0.9 : 0.3,
      roughness: tactileTexture === 'smooth' ? 0.1 : 0.6
    });

    const mesh = new THREE.Mesh(geom, material);
    group.add(mesh);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.005 * motionSpeed;
      group.rotation.x += 0.003 * motionSpeed;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [dominantHue, saturation, lightness, accentHex, geometryType, tactileTexture, motionSpeed]);

  const toggleSonification = () => {
    if (isPlaying) {
      oscillatorsRef.current.forEach(osc => osc.stop());
      oscillatorsRef.current = [];
      setIsPlaying(false);
    } else {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.15, ctx.currentTime);
      master.connect(ctx.destination);

      chordHarmonics.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = timbre;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(1 / (i + 1), ctx.currentTime);
        osc.connect(gain);
        gain.connect(master);
        osc.start();
        oscillatorsRef.current.push(osc);
      });
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative w-full h-[450px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <button
        onClick={toggleSonification}
        className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all"
      >
        {isPlaying ? '■ Stop Harmonics' : '▶ Play Synesthetic Harmonics'}
      </button>
    </div>
  );
};
`;

  // 3. Three.js Pure ESM Script
  const threeJsModuleCode = `import * as THREE from 'three';

export function createSensorySimulation(container, config) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 7;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const dominantColor = new THREE.Color().setHSL(config.dominantHue / 360, config.saturation / 100, config.lightness / 100);
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.2, 2),
    new THREE.MeshStandardMaterial({
      color: dominantColor,
      metalness: config.tactileTexture === 'metallic' ? 0.9 : 0.3,
      roughness: 0.2
    })
  );
  scene.add(mesh);

  const light = new THREE.PointLight(dominantColor, 3, 40);
  light.position.set(5, 5, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.y += 0.005 * config.motionSpeed;
    mesh.rotation.x += 0.003 * config.motionSpeed;
    renderer.render(scene, camera);
  }
  animate();
}
`;

  return {
    standaloneHtml,
    reactComponentCode,
    threeJsModuleCode
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
