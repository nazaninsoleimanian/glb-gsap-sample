'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
    MeshTransmissionMaterial,
} from '@react-three/drei'
import { easing } from 'maath'
import { store } from './store'
import { Color, Material, Mesh } from 'three'

type MaterialWithColor = Material & {
    color: Color
}

export default function Selector({
    children,
}: {
    children: React.ReactNode
}) {
    const ref = useRef<Mesh>(null)

    useFrame(({ viewport, camera, pointer }, delta) => {
        if (!ref.current) return

        const { width, height } =
            viewport.getCurrentViewport(camera, [0, 0, 3])

        easing.damp3(
            ref.current.position,
            [(pointer.x * width) / 2, (pointer.y * height) / 2, 3],
            store.open ? 0 : 0.1,
            delta
        )

        easing.damp3(
            ref.current.scale,
            store.open ? 4 : 0.01,
            store.open ? 0.5 : 0.2,
            delta
        )

        const material = ref.current.material as MaterialWithColor

        easing.dampC(
            material.color,
            store.open ? '#f0f0f0' : '#ccc',
            0.1,
            delta
        )
    })

    return (
        <>
            <mesh ref={ref}>
                <circleGeometry args={[1, 64, 64]} />
                <MeshTransmissionMaterial
                    samples={16}
                    resolution={512}
                    anisotropicBlur={0.1}
                    thickness={0.1}
                    roughness={0.4}
                    toneMapped
                />
            </mesh>

            <group
                onPointerEnter={() => (store.open = true)}
                onPointerLeave={() => (store.open = false)}
                onPointerDown={() => (store.open = true)}
                onPointerUp={() => (store.open = false)}
            >
                {children}
            </group>
        </>
    )
}