"use client"

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { BASE_PATH } from '@/lib/constants'
import { Loader } from 'lucide-react'

const modelPath = `${BASE_PATH}/models/3dvaren.glb`

function Model() {
  const { scene } = useGLTF(modelPath)
  const meshRef = useRef<THREE.Group>(null)
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const velocity = useRef(0)
  const autoRotate = useRef(true)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (!autoRotate.current) {
      velocity.current *= Math.pow(0.95, delta * 60)
      meshRef.current.rotation.y += velocity.current * delta

      if (Math.abs(velocity.current) < 0.01) {
        autoRotate.current = true
      }
    } else {
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group
      ref={meshRef}
      onPointerDown={(e) => {
        isDragging.current = true
        lastX.current = e.clientX
        autoRotate.current = false
        if (resumeTimer.current) clearTimeout(resumeTimer.current)
        velocity.current = 0
        e.stopPropagation()
        e.target.setPointerCapture(e.pointerId)
      }}
      onPointerUp={() => {
        isDragging.current = false
        velocity.current *= 0.5
        if (Math.abs(velocity.current) < 0.1) autoRotate.current = true
      }}
      onPointerMove={(e) => {
        if (!isDragging.current) return
        const dx = (e.clientX - lastX.current) * 0.005
        if (meshRef.current) {
          meshRef.current.rotation.y -= dx
          velocity.current = -dx / 0.016
        }
        lastX.current = e.clientX
      }}
    >
      <primitive object={scene} scale={8} />
    </group>
  )
}

export function Hero3D() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className="relative w-full max-w-[200px] aspect-square sm:w-[350px] sm:h-[350px] lg:w-[550px] lg:h-[700px] xl:w-[620px] xl:h-[780px]">
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] text-foreground/30">
          3D unavailable
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 38], fov: 50 }}
        onCreated={() => setLoaded(true)}
        style={{ width: '100%', height: '100%' }}
        onError={() => setError(true)}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ffd89b" />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}