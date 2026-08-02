"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshDistortMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/hooks/use-device-tier";

const BRAND = "#bc2739";
const BRAND_LIGHT = "#e3556b";

/** Particle budget per tier — profiled against the 3000-point mobile ceiling. */
const PARTICLE_COUNT: Record<DeviceTier, number> = {
  high: 2600,
  medium: 1300,
  low: 600,
};

/**
 * Deterministic PRNG (mulberry32). A fixed seed keeps the constellation
 * identical across renders, hot reloads and device tiers — `Math.random()`
 * would reshuffle the field on every re-render, which reads as a glitch.
 */
function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type SceneProps = {
  tier: DeviceTier;
  isDark: boolean;
  /** Live reduced-motion flag — freezes all autonomous animation when true. */
  noMotion: boolean;
};

/* -------------------------------------------------------------------------- */
/*  Shared input                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The canvas sits behind the page with `pointer-events: none`, so R3F never
 * receives pointer events of its own. We read them from the window instead and
 * keep them in a ref — writing to state per frame would re-render the tree.
 */
function useWindowInput() {
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    // Touch devices get the same parallax from a drag.
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      pointer.current.x = (t.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((t.clientY / window.innerHeight) * 2 - 1);
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? window.scrollY / max : 0;
    };

    onScroll();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { pointer, scroll };
}

/* -------------------------------------------------------------------------- */
/*  Particle field                                                            */
/* -------------------------------------------------------------------------- */

function ParticleField({
  count,
  isDark,
  noMotion,
  scroll,
}: {
  count: number;
  isDark: boolean;
  noMotion: boolean;
  scroll: React.RefObject<number>;
}) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const rand = seededRandom(0xbc2739);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute on a spherical shell with jittered radius so the field
      // reads as volumetric rather than as a hollow ball.
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const r = 3.2 + Math.pow(rand(), 0.6) * 5.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.72;
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current || noMotion) return;
    const d = Math.min(delta, 0.05); // clamp so tab-restore doesn't jump
    ref.current.rotation.y += d * 0.028;
    ref.current.rotation.x = (scroll.current ?? 0) * 0.9;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isDark ? 0.028 : 0.024}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={isDark ? 0.85 : 0.62}
        color={isDark ? "#f0dfe2" : "#8a1f2c"}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*  Orbit rings                                                               */
/* -------------------------------------------------------------------------- */

function OrbitRings({ isDark, noMotion }: { isDark: boolean; noMotion: boolean }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (noMotion) return;
    const d = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    if (a.current) {
      a.current.rotation.z += d * 0.16;
      a.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.25) * 0.12;
    }
    if (b.current) {
      b.current.rotation.z -= d * 0.1;
      b.current.rotation.y = Math.PI / 3.4 + Math.cos(t * 0.2) * 0.15;
    }
  });

  const opacity = isDark ? 0.5 : 0.34;

  return (
    <group>
      <mesh ref={a} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[2.35, 0.005, 3, 160]} />
        <meshBasicMaterial color={BRAND_LIGHT} transparent opacity={opacity} />
      </mesh>
      <mesh ref={b} rotation={[0, Math.PI / 3.4, Math.PI / 5]}>
        <torusGeometry args={[3.05, 0.004, 3, 180]} />
        <meshBasicMaterial color={BRAND} transparent opacity={opacity * 0.7} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Core                                                                      */
/* -------------------------------------------------------------------------- */

function Core({
  tier,
  isDark,
  noMotion,
  scroll,
}: {
  tier: DeviceTier;
  isDark: boolean;
  noMotion: boolean;
  scroll: React.RefObject<number>;
}) {
  const shell = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  // Geometry detail scales with the device budget.
  const detail = tier === "high" ? 32 : tier === "medium" ? 16 : 8;

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const s = scroll.current ?? 0;

    if (inner.current) {
      if (!noMotion) inner.current.rotation.y += d * 0.14;
      // The core recedes and drifts up as the page scrolls, handing the
      // foreground over to the content.
      inner.current.position.y = THREE.MathUtils.lerp(
        inner.current.position.y,
        s * 1.6,
        0.06,
      );
      const target = 1 - s * 0.28;
      inner.current.scale.setScalar(
        THREE.MathUtils.lerp(inner.current.scale.x, Math.max(target, 0.6), 0.06),
      );
    }

    if (shell.current && !noMotion) {
      shell.current.rotation.y -= d * 0.09;
      shell.current.rotation.x += d * 0.04;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
      shell.current.scale.setScalar(pulse);
    }
  });

  return (
    <Float
      speed={noMotion ? 0 : 1.1}
      rotationIntensity={noMotion ? 0 : 0.28}
      floatIntensity={noMotion ? 0 : 0.6}
      floatingRange={[-0.12, 0.12]}
    >
      <group>
        <mesh ref={inner} castShadow={false}>
          <icosahedronGeometry args={[1.15, detail]} />
          <MeshDistortMaterial
            color={BRAND}
            distort={noMotion ? 0.14 : 0.26}
            speed={noMotion ? 0 : 1.2}
            // Partly metallic: high enough to catch the rim light, low enough
            // that the crimson base colour still reads in light mode (a fully
            // metallic surface shows only its environment, which renders black).
            roughness={0.18}
            metalness={isDark ? 0.7 : 0.42}
            envMapIntensity={isDark ? 1.4 : 2.1}
            emissive={BRAND}
            emissiveIntensity={isDark ? 0.28 : 0.16}
          />
        </mesh>

        <mesh ref={shell}>
          <icosahedronGeometry args={[1.62, 1]} />
          <meshBasicMaterial
            color={isDark ? BRAND_LIGHT : BRAND}
            wireframe
            transparent
            opacity={isDark ? 0.16 : 0.14}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene root                                                                */
/* -------------------------------------------------------------------------- */

export function Scene({ tier, isDark, noMotion }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const { pointer, scroll } = useWindowInput();
  const { viewport } = useThree();

  // Phones have no empty column to put the object in, so it shrinks hard and
  // lifts above the copy block — combined with the mobile scrim in `Backdrop`,
  // the scene reads as texture behind the text rather than competing with it.
  const narrow = viewport.width < 6.5;
  const scale = narrow ? 0.5 : viewport.width < 9 ? 0.85 : 1;
  // On wide screens the hero copy occupies the left column, so the object
  // slides right into the empty half rather than sitting under the headline.
  const offsetX = viewport.width > 8.5 ? 1.85 : narrow ? 0 : 1.1;
  const offsetY = narrow ? 1.35 : 0;

  useFrame(() => {
    if (!group.current || noMotion) return;
    const p = pointer.current;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, p.x * 0.22, 0.035);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -p.y * 0.16, 0.035);
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      offsetX + p.x * 0.22,
      0.03,
    );
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      offsetY + p.y * 0.12,
      0.03,
    );
  });

  return (
    <>
      <color attach="background" args={[isDark ? "#08080a" : "#fbfaf9"]} />
      <fog attach="fog" args={[isDark ? "#08080a" : "#fbfaf9", 7, 16]} />

      <ambientLight intensity={isDark ? 0.4 : 1.6} />
      <pointLight position={[4, 3, 4]} intensity={isDark ? 26 : 22} color={BRAND_LIGHT} distance={22} />
      <pointLight position={[-5, -2, 2]} intensity={isDark ? 14 : 16} color="#ffffff" distance={20} />

      {/* Procedural environment — no HDR fetched over the network. */}
      <Environment resolution={tier === "high" ? 256 : 128} frames={1}>
        <Lightformer
          form="rect"
          intensity={isDark ? 2.2 : 5}
          position={[0, 4, -6]}
          scale={[10, 6, 1]}
          color="#ffffff"
        />
        <Lightformer
          form="circle"
          intensity={isDark ? 5 : 4}
          position={[-4, 1, 3]}
          scale={4}
          color={BRAND}
        />
        <Lightformer
          form="circle"
          intensity={isDark ? 3 : 3.5}
          position={[5, -2, 2]}
          scale={3}
          color="#ff8fa0"
        />
      </Environment>

      <group ref={group} scale={scale} position={[offsetX, offsetY, 0]}>
        <Core tier={tier} isDark={isDark} noMotion={noMotion} scroll={scroll} />
        <OrbitRings isDark={isDark} noMotion={noMotion} />
        <ParticleField
          count={PARTICLE_COUNT[tier]}
          isDark={isDark}
          noMotion={noMotion}
          scroll={scroll}
        />
      </group>
    </>
  );
}
