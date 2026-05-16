"use client"

import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import { BASE_PATH } from '@/lib/constants'
import { Loader } from 'lucide-react'

const modelPath = `${BASE_PATH}/models/3dvaren.glb`

function Model() {
  const { scene } = useGLTF(modelPath)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z -= delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      <Center>
        <primitive
          object={scene}
          scale={3}
          rotation={[0, 0, 0]}
        />
      </Center>
    </group>
  )
}

export function Hero3D() {
  const [ready, setReady] = useState(false)

  return (
    <div className="relative w-[400px] h-[400px] lg:w-[500px] lg:h-[500px]">
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
