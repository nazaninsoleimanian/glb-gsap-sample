'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useAnimations, useGLTF } from '@react-three/drei'
import { ThreeElements, ThreeEvent, useFrame } from '@react-three/fiber'
import { Group, Material, Mesh, MeshBasicMaterial, Vector3 } from 'three'

const surgeonModel = '/person.glb'

type MaterialShader = {
    uniforms: Record<string, { value: unknown }>
    vertexShader: string
    fragmentShader: string
}

function restoreBaseMaterial(material: Material) {
    material.transparent = false
    material.opacity = 1
    material.depthWrite = true
    material.onBeforeCompile = () => { }
    material.needsUpdate = true
}

export default function Person(props: ThreeElements['group']) {
    const ref = useRef<Group>(null)
    const overlayShader = useRef<MaterialShader | null>(null)
    const capLift = useRef(0)
    const capTarget = useRef(0)
    const localPointer = useRef(new Vector3())
    const { scene, animations } = useGLTF(surgeonModel, true)
    const { actions } = useAnimations(animations, ref)

    useEffect(() => {
        scene.traverse((child) => {
            if (child instanceof Mesh) {
                const materials = Array.isArray(child.material) ? child.material : [child.material]

                materials.forEach(restoreBaseMaterial)
                child.castShadow = true
                child.receiveShadow = true
                child.frustumCulled = false
            }
        })
    }, [scene])

    useEffect(() => {
        const action = actions[animations[0]?.name]

        if (!action) return

        action.reset().fadeIn(0.4).play()
        action.setEffectiveTimeScale(0.6)
        action.setEffectiveWeight(0.42)

        return () => {
            action.fadeOut(0.25)
        }
    }, [actions, animations])

    const wireframeMaterial = useMemo(() => {
        const material = new MeshBasicMaterial({
            color: '#0083BF',
            wireframe: true,
            transparent: true,
            opacity: 0.16,
            depthWrite: false,
        })

        material.onBeforeCompile = (shader) => {
            overlayShader.current = shader
            shader.uniforms.uTime = { value: 0 }
            shader.uniforms.uCapLift = { value: 0 }

            shader.vertexShader = shader.vertexShader.replace(
                'void main() {',
                `
                varying vec3 vWirePosition;
                uniform float uCapLift;

                void main() {
                    vWirePosition = position;
                `
            ).replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>

                float capMask = smoothstep(138.0, 148.0, position.y);
                transformed.y += capMask * uCapLift;
                transformed.z -= capMask * uCapLift * 0.18;
                `
            )

            shader.fragmentShader = shader.fragmentShader
                .replace(
                    'void main() {',
                    `
                    varying vec3 vWirePosition;
                    uniform float uTime;

                    void main() {
                    `
                )
                .replace(
                    '#include <dithering_fragment>',
                    `
                    float headAndMask = smoothstep(123.0, 137.0, vWirePosition.y);
                    float hands = smoothstep(23.0, 31.0, abs(vWirePosition.x))
                        * smoothstep(38.0, 54.0, vWirePosition.y)
                        * (1.0 - smoothstep(96.0, 116.0, vWirePosition.y));
                    float selectedArea = max(headAndMask, hands);

                    if (selectedArea < 0.04) discard;

                    float scan = fract((vWirePosition.y * -0.018) + (uTime * 0.22));
                    float scanFade = smoothstep(0.0, 0.18, scan) * (1.0 - smoothstep(0.55, 1.0, scan));
                    float breathingGlow = 0.65 + sin(uTime * 1.8) * 0.18;

                    gl_FragColor.a *= selectedArea * max(scanFade, 0.28) * breathingGlow;

                    #include <dithering_fragment>
                    `
                )
        }

        return material
    }, [])

    const wireframeScene = useMemo(() => {
        const clone = scene.clone(true)

        clone.traverse((child) => {
            if (child instanceof Mesh) {
                child.castShadow = false
                child.receiveShadow = false
                child.frustumCulled = false
                child.renderOrder = 2
                child.material = wireframeMaterial
            }
        })

        return clone
    }, [scene, wireframeMaterial])

    useEffect(() => {
        return () => {
            wireframeMaterial.dispose()
        }
    }, [wireframeMaterial])

    useFrame((state, delta) => {
        if (!ref.current) return

        const t = state.clock.getElapsedTime()
        capLift.current += (capTarget.current - capLift.current) * Math.min(delta * 5, 1)

        if (overlayShader.current) {
            overlayShader.current.uniforms.uTime.value = t
            overlayShader.current.uniforms.uCapLift.value = capLift.current
        }

        ref.current.rotation.y = Math.sin(t / 4) / 24
        ref.current.position.y = Math.sin(t / 2.8) / 24
    })

    const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
        if (!ref.current) return

        localPointer.current.copy(event.point)
        ref.current.worldToLocal(localPointer.current)
        capTarget.current = localPointer.current.y > 136 ? 8 : 0
    }

    const handlePointerLeave = () => {
        capTarget.current = 0
    }

    return (
        <group
            ref={ref}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            {...props}
        >
            <primitive object={scene} />
            <primitive object={wireframeScene} />
        </group>
    )
}

useGLTF.preload(surgeonModel, true)
