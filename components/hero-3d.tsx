"use client"

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'

function Model() {
  const { scene } = useGLTF('/models/3dvaren.glb')
  const ref = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.25
    }
  })

  return <primitive ref={ref} object={scene} scale={1} position={[0, -0.5, 0]} />
}

export function Hero3D() {
  return (
    <div className="w-[400px] h-[400px] lg:w-[500px] lg:h-[500px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} />
          <Model />
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.3}
            scale={4}
            blur={3}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
