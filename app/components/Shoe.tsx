'use client'

import { useMemo, useRef } from 'react'
import { ThreeElements, ThreeEvent, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, useGLTF } from '@react-three/drei'
import { Group, Mesh, Vector2 } from 'three'

const helmetModel = "/motorcycle_helmet.glb";

type MaterialShader = {
    uniforms: Record<string, { value: unknown }>
    vertexShader: string
    fragmentShader: string
}

type HelmetNodes = {
    Object_4: Mesh
}

export default function Shoe(props: ThreeElements['group']) {
    const ref = useRef<Group>(null)
    const hoverShader = useRef<MaterialShader | null>(null)
    const wireframeShader = useRef<MaterialShader | null>(null)
    const hoverUv = useRef(new Vector2(0.5, 0.5))
    const hoverStrength = useRef(0)
    const hoverTarget = useRef(0)
    const { scene, nodes } = useGLTF(helmetModel, true)
    console.log("========================", nodes);
    const { Object_4 } = nodes as unknown as HelmetNodes
    const scanBounds = useMemo(() => {
        Object_4.geometry.computeBoundingBox()
        const box = Object_4.geometry.boundingBox

        return {
            min: box?.min.y ?? -1,
            max: box?.max.y ?? 1,
        }
    }, [Object_4.geometry])

    useMemo(() => {
        scene.traverse((child) => {
            if (child instanceof Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, [scene])

    useFrame((state, delta) => {
        if (!ref.current) return

        const t = state.clock.getElapsedTime()
        hoverStrength.current += (hoverTarget.current - hoverStrength.current) * Math.min(delta * 8, 1)

        if (hoverShader.current) {
            hoverShader.current.uniforms.uHoverStrength.value = hoverStrength.current
        }

        if (wireframeShader.current) {
            wireframeShader.current.uniforms.uTime.value = t
        }

        ref.current.rotation.set(
            Math.PI + Math.cos(t / 4) / 64,
            Math.PI + Math.sin(t / 3) / 56,
            Math.PI + Math.sin(t / 2) / 64
        )

        ref.current.position.y = (0.5 + Math.cos(t / 2)) / 28
    })

    const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()

        if (event.uv) {
            hoverUv.current.copy(event.uv)
        }

        hoverTarget.current = 1
    }

    const handlePointerLeave = () => {
        hoverTarget.current = 0
    }

    return (
        <group ref={ref} {...props}>
            <mesh
                receiveShadow
                castShadow
                geometry={Object_4.geometry}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
            >
                <MeshDistortMaterial
                    color="yellow"
                    distort={0}
                    speed={0}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    onBeforeCompile={(shader) => {
                        hoverShader.current = shader
                        shader.uniforms.uHoverUv = { value: hoverUv.current }
                        shader.uniforms.uHoverStrength = { value: 0 }
                        shader.uniforms.uBlobSize = { value: 0.16 }

                        shader.vertexShader = shader.vertexShader.replace(
                            'void main() {',
                            `
                            varying vec2 vHoverUv;

                            void main() {
                                vHoverUv = uv;
                            `
                        )

                        shader.fragmentShader = shader.fragmentShader
                            .replace(
                                'void main() {',
                                `
                                varying vec2 vHoverUv;
                                uniform vec2 uHoverUv;
                                uniform float uHoverStrength;
                                uniform float uBlobSize;

                                void main() {
                                `
                            )
                            .replace(
                                '#include <dithering_fragment>',
                                `
                                float hoverDistance = distance(vHoverUv, uHoverUv);
                                float hoverBlob = 1.0 - smoothstep(0.0, uBlobSize, hoverDistance);
                                gl_FragColor.a = max(gl_FragColor.a, hoverBlob * uHoverStrength * 0.85);

                                #include <dithering_fragment>
                                `
                            )
                    }}
                />
            </mesh>
            <lineSegments>
                <edgesGeometry args={[Object_4.geometry]} />
                <lineBasicMaterial
                    transparent
                    opacity={0.09}
                    depthWrite={false}
                    color="#111111"
                    onBeforeCompile={(shader) => {
                        wireframeShader.current = shader
                        shader.uniforms.uTime = { value: 0 }
                        shader.uniforms.uScanMinY = { value: scanBounds.min }
                        shader.uniforms.uScanMaxY = { value: scanBounds.max }

                        shader.vertexShader = shader.vertexShader.replace(
                            'void main() {',
                            `
                            varying vec3 vScanPosition;

                            void main() {
                                vScanPosition = position;
                            `
                        )

                        shader.fragmentShader = shader.fragmentShader
                            .replace(
                                'void main() {',
                                `
                                varying vec3 vScanPosition;
                                uniform float uTime;
                                uniform float uScanMinY;
                                uniform float uScanMaxY;

                                void main() {
                                `
                            )
                            .replace(
                                '#include <dithering_fragment>',
                                `
                                float normalizedY = clamp((vScanPosition.y - uScanMinY) / max(uScanMaxY - uScanMinY, 0.001), 0.0, 1.0);
                                float scanHead = 1.15 - fract(uTime * 0.18) * 1.4;
                                float distanceFromHead = normalizedY - scanHead;
                                float softTrail = smoothstep(0.0, 0.08, distanceFromHead) * (1.0 - smoothstep(0.34, 0.72, distanceFromHead));
                                float brightEdge = 1.0 - smoothstep(0.0, 0.035, abs(distanceFromHead));

                                gl_FragColor.a *= max(softTrail * 0.38, brightEdge * 0.58);

                                #include <dithering_fragment>
                                `
                            )
                    }}
                />
            </lineSegments>
        </group>
    )
}

useGLTF.preload(helmetModel, true)