"use client"

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Center, useCursor } from '@react-three/drei'
import { BASE_PATH } from '@/lib/constants'
import { Loader } from 'lucide-react'

const modelPath = `${BASE_PATH}/models/3dvaren.glb`

function Model() {
  const { scene } = useGLTF(modelPath)
  const groupRef = useRef<THREE.Group>(null)
  const draggingRef = useRef(false)
  const prevXRef = useRef(0)
  const [hovered, setHovered] = useState(false)

  useCursor(hovered, 'grab')

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!draggingRef.current || !groupRef.current) return
      const dx = e.clientX - prevXRef.current
      groupRef.current.rotation.z += dx * 0.005
      prevXRef.current = e.clientX
    }
    const handleUp = () => {
      draggingRef.current = false
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [])

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        draggingRef.current = true
        prevXRef.current = e.clientX
        e.stopPropagation()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Center position={[0, 0.35, 0]}>
        <primitive
          object={scene}
          scale={3}
          rotation={[0.03, 0, 0]}
        />
      </Center>
    </group>
  )
}

export function Hero3D() {
  const [ready, setReady] = useState(false)

  return (
    <div className="relative w-[300px] h-[300px] lg:w-[600px] lg:h-[600px]">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 35 }}
        gl={{ antialias: true }}
        style={{ opacity: ready ? 1 : 0 }}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}
