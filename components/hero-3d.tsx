"use client"

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { BASE_PATH } from '@/lib/constants'
import { Loader } from 'lucide-react'

const modelPath = `${BASE_PATH}/models/3dvaren.glb`

function Model() {
  const { scene } = useGLTF(modelPath)
  const { gl } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const draggingRef = useRef(false)
  const autoPausedRef = useRef(false)
  const isSpinningRef = useRef(false)
  const spinVelocityRef = useRef(0)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevAngleRef = useRef(0)
  const angleSetRef = useRef(false)
  const lastTimeRef = useRef(0)
  const [hovered, setHovered] = useState(false)

  useCursor(hovered, 'grab')

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (isSpinningRef.current) {
      groupRef.current.rotation.z += spinVelocityRef.current * delta
      spinVelocityRef.current *= (1 - 3 * delta)
      if (Math.abs(spinVelocityRef.current) < 0.001) {
        isSpinningRef.current = false
        spinVelocityRef.current = 0
        scheduleResume()
      }
    } else if (!autoPausedRef.current) {
      groupRef.current.rotation.z += delta * 0.1
    }
  })

  useEffect(() => {
    if (!innerRef.current) return

    scene.updateMatrixWorld(true)

    const centroid = new THREE.Vector3()
    let count = 0
    const vec = new THREE.Vector3()

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geom = child.geometry
        if (!geom) return
        const pos = geom.getAttribute('position')
        if (!pos) return

        for (let i = 0; i < pos.count; i++) {
          vec.fromBufferAttribute(pos, i)
          vec.applyMatrix4(child.matrixWorld)
          centroid.add(vec)
          count++
        }
      }
    })

    if (count > 0) {
      centroid.divideScalar(count)
      innerRef.current.position.set(-centroid.x, -centroid.y, -centroid.z)
    }
  }, [scene])

  const scheduleResume = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => {
      autoPausedRef.current = false
    }, 2000)
  }

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!draggingRef.current || !groupRef.current) return

      const rect = gl.domElement.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2

      const angle = Math.atan2(e.clientY - cy, e.clientX - cx)

      if (!angleSetRef.current) {
        prevAngleRef.current = angle
        angleSetRef.current = true
        return
      }

      let delta = angle - prevAngleRef.current
      if (delta > Math.PI) delta -= Math.PI * 2
      if (delta < -Math.PI) delta += Math.PI * 2

      groupRef.current.rotation.z -= delta

      const now = performance.now()
      const dt = (now - lastTimeRef.current) / 1000
      if (dt > 0 && dt < 0.1) {
        spinVelocityRef.current = -delta / dt
      }
      lastTimeRef.current = now

      prevAngleRef.current = angle
    }
    const handleUp = () => {
      draggingRef.current = false
      angleSetRef.current = false

      const now = performance.now()
      const dt = (now - lastTimeRef.current) / 1000
      if (dt > 0.001 && dt < 0.5 && Math.abs(spinVelocityRef.current) > 0.01) {
        isSpinningRef.current = true
      } else {
        scheduleResume()
      }
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }, [gl])

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        draggingRef.current = true
        autoPausedRef.current = true
        isSpinningRef.current = false
        spinVelocityRef.current = 0
        angleSetRef.current = false
        lastTimeRef.current = performance.now()
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
        e.stopPropagation()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={innerRef}>
        <primitive
          object={scene}
          scale={3}
          rotation={[0, 0, 0]}
        />
      </group>
    </group>
  )
}

export function Hero3D() {
  const [ready, setReady] = useState(false)

  return (
    <div className="relative w-full max-w-[300px] aspect-square sm:w-[300px] sm:h-[300px] lg:w-[600px] lg:h-[600px]">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 35 }}
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
