import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Square, 
  Copy, 
  Check, 
  Download, 
  Code2, 
  Box, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Volume2, 
  Sliders,
  ExternalLink,
  Layers,
  FileCode
} from 'lucide-react';
import { SynesthesiaResult } from '../types/aie';
import { compileSensoryProfileTo3DPrototype } from '../utils/sensoryCodeCompiler';

interface Sensory3DSimulatorProps {
  profile: SynesthesiaResult;
}

export const Sensory3DSimulator: React.FC<Sensory3DSimulatorProps> = ({ profile }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'3d-canvas' | 'standalone-html' | 'react-code' | 'json-spec'>('3d-canvas');
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  // Compile code blocks on demand
  const compiledCodes = compileSensoryProfileTo3DPrototype(profile);

  // --- THREE.JS LIVE 3D CANVAS MOUNT ---
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090e1a, 0.03);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Lighting
    const ambient = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambient);

    const dominantColor = new THREE.Color().setHSL(
      profile.visual.dominantHue / 360,
      profile.visual.saturation / 100,
      profile.visual.lightness / 100
    );
    const accentColor = new THREE.Color(profile.visual.accentHex);

    const keyLight = new THREE.PointLight(dominantColor, 3.5, 45);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(accentColor, 2.5, 35);
    rimLight.position.set(-5, -4, -4);
    scene.add(rimLight);

    // Geometry Generation
    let geom: THREE.BufferGeometry;
    switch (profile.visual.geometryType) {
      case 'crystalline-fractal':
        geom = new THREE.IcosahedronGeometry(2.3, 2);
        break;
      case 'hyperbolic-lattice':
        geom = new THREE.TorusKnotGeometry(1.5, 0.5, 120, 28, 2, 3);
        break;
      case 'organic-spiral':
        geom = new THREE.TorusGeometry(1.9, 0.65, 28, 120);
        break;
      case 'quantum-cloud':
        geom = new THREE.SphereGeometry(2.2, 40, 40);
        break;
      case 'fluid-vortices':
      default:
        geom = new THREE.OctahedronGeometry(2.3, 3);
        break;
    }

    // Material properties tuned by tactile texture
    let metalness = 0.3;
    let roughness = 0.5;
    if (profile.visual.tactileTexture === 'metallic') {
      metalness = 0.95;
      roughness = 0.15;
    } else if (profile.visual.tactileTexture === 'crystalline') {
      metalness = 0.5;
      roughness = 0.1;
    } else if (profile.visual.tactileTexture === 'viscous') {
      metalness = 0.1;
      roughness = 0.85;
    } else if (profile.visual.tactileTexture === 'smooth') {
      metalness = 0.2;
      roughness = 0.2;
    }

    const material = new THREE.MeshStandardMaterial({
      color: dominantColor,
      emissive: accentColor,
      emissiveIntensity: 0.25,
      metalness,
      roughness,
      wireframe: isWireframe
    });

    const coreMesh = new THREE.Mesh(geom, material);
    group.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // Subtle outer halo cage
    const cageGeom = geom.clone();
    const cageMat = new THREE.MeshBasicMaterial({
      color: accentColor,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const cageMesh = new THREE.Mesh(cageGeom, cageMat);
    cageMesh.scale.set(1.08, 1.08, 1.08);
    group.add(cageMesh);

    // Particle Cloud Aura
    const particleCount = 600;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPos: number[] = [];

    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.8 + Math.random() * 2.2;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;
      initialPos.push(x, y, z);
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      color: accentColor,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    group.add(particles);

    // Interactive Drag Rotation
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotSpeed = { x: 0.002, y: 0.004 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      group.rotation.y += dx * 0.008;
      group.rotation.x += dy * 0.008;

      rotSpeed = { x: dy * 0.001, y: dx * 0.001 };
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(3.5, Math.min(16, camera.position.z + e.deltaY * 0.01));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Tick
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const speed = (profile.visual.motionSpeed || 1.0) * speedMultiplier;

      if (!isDragging) {
        group.rotation.y += rotSpeed.y;
        group.rotation.x += rotSpeed.x;
        rotSpeed.x *= 0.98;
        rotSpeed.y *= 0.98;
        if (Math.abs(rotSpeed.y) < 0.002) rotSpeed.y = 0.003 * speed;
      }

      // Harmonic vertex oscillation
      if (coreMesh) {
        const pulse = 1.0 + Math.sin(elapsed * 2.2 * speed) * 0.04;
        coreMesh.scale.set(pulse, pulse, pulse);
      }

      // Particle oscillation
      const posAttr = particles.geometry.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      for (let i = 0; i < posArr.length; i += 3) {
        posArr[i] = initialPos[i] + Math.sin(elapsed * speed + initialPos[i + 1]) * 0.09;
        posArr[i + 1] = initialPos[i + 1] + Math.cos(elapsed * speed + initialPos[i]) * 0.09;
        posArr[i + 2] = initialPos[i + 2] + Math.sin(elapsed * speed + initialPos[i + 2]) * 0.09;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geom.dispose();
      material.dispose();
      container.innerHTML = '';
    };
  }, [profile, isWireframe, speedMultiplier]);

  // Audio Sonification Toggle
  const toggleSonification = () => {
    if (isPlayingAudio) {
      stopAudio();
      setIsPlayingAudio(false);
    } else {
      startAudio();
      setIsPlayingAudio(true);
    }
  };

  const startAudio = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    stopAudio();

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.2, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(profile.audio.filterCutoff || 2400, ctx.currentTime);

    master.connect(filter);
    filter.connect(ctx.destination);

    const harmonics = profile.audio.chordHarmonics?.length 
      ? profile.audio.chordHarmonics 
      : [profile.audio.rootFrequency, profile.audio.rootFrequency * 1.5];

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = profile.audio.timbre || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1.0 / (idx + 1), ctx.currentTime);

      osc.connect(gain);
      gain.connect(master);
      osc.start();
      oscillatorsRef.current.push(osc);
    });

    // Momentary visual pulse on mesh
    if (coreMeshRef.current) {
      coreMeshRef.current.scale.set(1.2, 1.2, 1.2);
      setTimeout(() => {
        if (coreMeshRef.current) coreMeshRef.current.scale.set(1.0, 1.0, 1.0);
      }, 250);
    }
  };

  const stopAudio = () => {
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    oscillatorsRef.current = [];
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Standalone HTML file
  const handleDownloadHtml = () => {
    const blob = new Blob([compiledCodes.standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = profile.sensoryMetaphor.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 30);
    link.href = url;
    link.download = `synesthetic_simulation_${safeName}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-sky-800/60 bg-gradient-to-b from-slate-900/90 via-slate-950 to-sky-950/30 rounded-xl overflow-hidden shadow-xl space-y-4">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-950 border border-sky-800 text-sky-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-sky-400 uppercase tracking-wider font-bold">
                Compiled 3D Simulation Prototype
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700/80 text-sky-300">
                WebGL · Three.js · Web Audio
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight mt-0.5">
              "{profile.sensoryMetaphor}"
            </h3>
          </div>
        </div>

        {/* Action Buttons: Play Sound, Download HTML, Copy */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleSonification}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isPlayingAudio
                ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md animate-pulse'
                : 'bg-slate-800 text-sky-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlayingAudio ? 'Stop Tone' : 'Play Harmonics'}</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            title="Download Standalone HTML prototype runnable in any browser"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export .HTML</span>
          </button>

          <button
            onClick={() => handleCopyCode(
              activeTab === 'standalone-html' ? compiledCodes.standaloneHtml :
              activeTab === 'react-code' ? compiledCodes.reactComponentCode :
              JSON.stringify(profile, null, 2)
            )}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 px-4 border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('3d-canvas')}
          className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 transition-all font-semibold ${
            activeTab === '3d-canvas'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Interactive 3D Viewport</span>
        </button>

        <button
          onClick={() => setActiveTab('standalone-html')}
          className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 transition-all font-semibold ${
            activeTab === 'standalone-html'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Standalone HTML Prototype</span>
        </button>

        <button
          onClick={() => setActiveTab('react-code')}
          className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 transition-all font-semibold ${
            activeTab === 'react-code'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>React + Three.js Component</span>
        </button>

        <button
          onClick={() => setActiveTab('json-spec')}
          className={`flex items-center gap-1.5 pb-2.5 px-2 border-b-2 transition-all font-semibold ${
            activeTab === 'json-spec'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Sensory Profile Spec (JSON)</span>
        </button>
      </div>

      {/* Main View Area */}
      <div className="p-4 pt-0">
        
        {/* TAB 1: LIVE 3D CANVAS */}
        {activeTab === '3d-canvas' && (
          <div className="space-y-3">
            <div className={`relative w-full ${isFullscreen ? 'h-[600px]' : 'h-[440px]'} bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner group transition-all`}>
              
              {/* Three.js DOM Canvas Mount */}
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* In-Canvas HUD Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 border border-slate-700 text-sky-300 w-fit backdrop-blur-sm">
                  Chromo-Geometry: {profile.visual.geometryType}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 border border-slate-700 text-cyan-300 w-fit backdrop-blur-sm">
                  Texture: {profile.visual.tactileTexture} · Hue: {profile.visual.dominantHue}°
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 border border-slate-700 text-emerald-300 w-fit backdrop-blur-sm">
                  Acoustic Tone: {profile.audio.rootFrequency} Hz ({profile.audio.timbre})
                </span>
              </div>

              {/* Viewport Control Bar */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 z-10">
                <button
                  onClick={() => setIsWireframe(!isWireframe)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-medium border transition-colors ${
                    isWireframe ? 'bg-sky-950 border-sky-600 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title="Toggle wireframe topology"
                >
                  Wireframe
                </button>

                <button
                  onClick={() => setSpeedMultiplier(prev => (prev === 1.0 ? 2.5 : prev === 2.5 ? 0.4 : 1.0))}
                  className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                  title="Cycle rotation speed"
                >
                  Speed: {speedMultiplier}x
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
                  title="Toggle viewport height"
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Interaction Hint */}
              <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded border border-slate-800 pointer-events-none hidden sm:block">
                [Drag] Rotate · [Scroll] Zoom · [Click Mesh] Momentary Chime
              </div>
            </div>

            {/* Parameter Compilation Ledger */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Chromo-Geometry</span>
                <div className="font-semibold text-white mt-0.5">{profile.visual.geometryType}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Hue {profile.visual.dominantHue}° · Sat {profile.visual.saturation}%
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Tactile PBR Shader</span>
                <div className="font-semibold text-cyan-300 mt-0.5 capitalize">{profile.visual.tactileTexture}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Accent: {profile.visual.accentHex}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Harmonic Spectrum</span>
                <div className="font-semibold text-sky-400 mt-0.5">{profile.audio.rootFrequency} Hz</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {profile.audio.chordHarmonics?.slice(0, 3).map(h => Math.round(h) + 'Hz').join(', ')}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Haptic Cadence</span>
                <div className="font-semibold text-emerald-400 mt-0.5">
                  {profile.haptic.vibrationPatternMs?.length || 0} Pulses
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  [{profile.haptic.vibrationPatternMs?.slice(0, 3).join(', ')}] ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STANDALONE HTML PROTOTYPE CODE */}
        {activeTab === 'standalone-html' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-900/80 px-3 py-2 rounded-t-lg border border-slate-800">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <FileCode className="w-3.5 h-3.5" />
                <span>synesthetic_simulation_prototype.html (Self-contained, runnable single-file HTML5/WebGL)</span>
              </span>
              <span>{compiledCodes.standaloneHtml.split('\n').length} lines</span>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px] leading-relaxed selection:bg-sky-900">
              <code>{compiledCodes.standaloneHtml}</code>
            </pre>
          </div>
        )}

        {/* TAB 3: REACT + THREE.JS CODE BLOCK */}
        {activeTab === 'react-code' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-900/80 px-3 py-2 rounded-t-lg border border-slate-800">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Code2 className="w-3.5 h-3.5" />
                <span>Synesthetic3DSimulator.tsx (React 19 + TypeScript + Three.js Component)</span>
              </span>
              <span>{compiledCodes.reactComponentCode.split('\n').length} lines</span>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px] leading-relaxed selection:bg-sky-900">
              <code>{compiledCodes.reactComponentCode}</code>
            </pre>
          </div>
        )}

        {/* TAB 4: SENSORY PROFILE SPEC (JSON) */}
        {activeTab === 'json-spec' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-900/80 px-3 py-2 rounded-t-lg border border-slate-800">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Sliders className="w-3.5 h-3.5" />
                <span>sensory_profile_specification.json</span>
              </span>
              <span>Raw Cross-Modal Schema</span>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-b-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-[480px] leading-relaxed selection:bg-sky-900">
              <code>{JSON.stringify(profile, null, 2)}</code>
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
