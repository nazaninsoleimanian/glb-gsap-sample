'use client'

import { useEffect, useMemo, useRef } from 'react'
import { ThreeElements, ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
    Box3,
    Group,
    LinearFilter,
    Material,
    Mesh,
    MeshBasicMaterial,
    OrthographicCamera,
    PlaneGeometry,
    RGBAFormat,
    Scene,
    ShaderMaterial,
    UnsignedByteType,
    Vector2,
    WebGLRenderTarget,
} from 'three'

const helmetModel = "/motorcycle_helmet.glb";

type MaterialShader = Parameters<Material['onBeforeCompile']>[0]

type MotocycleHelmetProps = ThreeElements['group'] & {
    revealBase?: number
}

const revealVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const revealFragmentShader = `
uniform sampler2D uPrevTexture;
uniform vec2 uBlob;
uniform float uRadius;
uniform float uStrength;
uniform float uFade;
uniform float uTime;
uniform float uAspect;
uniform vec2 uDir;
uniform float uStretch;

varying vec2 vUv;

// Single soft metaball field contribution (inverse square falloff),
// elongated along the travel direction so blobs look stretched.
float metaball(vec2 p, vec2 center, float r) {
    vec2 d = p - center;
    d.x *= uAspect;

    vec2 dir = normalize(uDir + vec2(1e-5, 0.0));
    vec2 perp = vec2(-dir.y, dir.x);
    float along = dot(d, dir) / uStretch;
    float across = dot(d, perp);
    d = dir * along + perp * across;

    float dist2 = dot(d, d);
    return (r * r) / (dist2 + 0.00002);
}

void main() {
    vec2 texel = vec2(1.0 / 512.0);
    float prev = texture2D(uPrevTexture, vUv).r * 0.34;

    prev += texture2D(uPrevTexture, vUv + vec2(texel.x, 0.0)).r * 0.14;
    prev += texture2D(uPrevTexture, vUv - vec2(texel.x, 0.0)).r * 0.14;
    prev += texture2D(uPrevTexture, vUv + vec2(0.0, texel.y)).r * 0.14;
    prev += texture2D(uPrevTexture, vUv - vec2(0.0, texel.y)).r * 0.14;
    prev += texture2D(uPrevTexture, vUv + texel).r * 0.05;
    prev += texture2D(uPrevTexture, vUv - texel).r * 0.05;
    prev *= uFade;

    // Organic gooey blob built from several merging metaballs (Lando-style).
    float field = 0.0;
    field += metaball(vUv, uBlob, uRadius * 0.74);

    for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float orbit = uTime * (0.45 + fi * 0.17) + fi * 2.3994;
        float wobble = 0.30 + 0.16 * sin(uTime * 0.8 + fi * 1.7);
        vec2 offset = vec2(cos(orbit), sin(orbit * 1.27)) * uRadius * wobble;
        field += metaball(vUv, uBlob + offset, uRadius * (0.40 - fi * 0.045));
    }

    // Thresholding the field produces the soft, rounded, merging edges.
    float blob = smoothstep(0.85, 1.7, field) * uStrength;
    float mask = clamp(max(prev, blob), 0.0, 1.0);

    gl_FragColor = vec4(vec3(mask), 1.0);
}
`

export default function MotocycleHelmet({
    revealBase = 0,
    ...props
}: MotocycleHelmetProps) {
    const ref = useRef<Group>(null)
    const wireframeShader = useRef<MaterialShader | null>(null)
    const revealShaders = useRef<Set<MaterialShader>>(new Set())
    const pointerSeen = useRef(false)
    const lastPointerAt = useRef(0)
    const blobPosition = useRef(new Vector2(0.5, 0.5))
    const prevBlobPosition = useRef(new Vector2(0.5, 0.5))
    const blobDir = useRef(new Vector2(1, 0))
    const blobDelta = useRef(new Vector2(0, 0))
    const sweep = useRef({
        start: new Vector2(-0.2, 0.5),
        end: new Vector2(1.2, 0.5),
        startTime: 0,
        duration: 5,
        initialized: false,
    })
    const { gl } = useThree()
    const { scene } = useGLTF(helmetModel, true)
    const scanBounds = useMemo(() => {
        const box = new Box3().setFromObject(scene)

        return {
            min: box.min.y,
            max: box.max.y,
        }
    }, [scene])

    const fbo = useMemo(() => {
        const targetOptions = {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            format: RGBAFormat,
            type: UnsignedByteType,
            depthBuffer: false,
            stencilBuffer: false,
        }
        const readTarget = new WebGLRenderTarget(256, 256, targetOptions)
        const writeTarget = new WebGLRenderTarget(256, 256, targetOptions)
        const fboScene = new Scene()
        const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
        const material = new ShaderMaterial({
            uniforms: {
                uPrevTexture: { value: readTarget.texture },
                uBlob: { value: new Vector2(0.5, 0.5) },
                uRadius: { value: 0.22 },
                uStrength: { value: 0.95 },
                uFade: { value: 0.94 },
                uTime: { value: 0 },
                uAspect: { value: 1 },
                uDir: { value: new Vector2(1, 0) },
                uStretch: { value: 2.2 },
            },
            vertexShader: revealVertexShader,
            fragmentShader: revealFragmentShader,
        })

        fboScene.add(new Mesh(new PlaneGeometry(2, 2), material))

        return {
            readTarget,
            writeTarget,
            scene: fboScene,
            camera,
            material,
        }
    }, [])
    const fboRef = useRef(fbo)

    const revealResolution = useMemo(() => new Vector2(1, 1), [])

    useMemo(() => {
        scene.traverse((child) => {
            if (child instanceof Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, [scene])

    const colorScene = useMemo(() => {
        const clone = scene.clone(true)

        clone.traverse((child) => {
            if (!(child instanceof Mesh)) return

            const hasMaterialArray = Array.isArray(child.material)
            const materials = Array.isArray(child.material) ? child.material : [child.material]
            const patchedMaterials = materials.map((material) => {
                const clonedMaterial = material.clone()
                const previousOnBeforeCompile = clonedMaterial.onBeforeCompile.bind(clonedMaterial)

                clonedMaterial.transparent = true
                clonedMaterial.depthWrite = false
                clonedMaterial.onBeforeCompile = (
                    shader: Parameters<Material['onBeforeCompile']>[0],
                    renderer: Parameters<Material['onBeforeCompile']>[1]
                ) => {
                    previousOnBeforeCompile(shader, renderer)
                    revealShaders.current.add(shader)
                    shader.uniforms.uRevealTexture = { value: fbo.readTarget.texture }
                    shader.uniforms.uRevealResolution = { value: revealResolution }
                    shader.uniforms.uRevealTime = { value: 0 }
                    shader.uniforms.uRevealBase = { value: revealBase }

                    shader.fragmentShader = shader.fragmentShader
                        .replace(
                            'void main() {',
                            `
                            uniform sampler2D uRevealTexture;
                            uniform vec2 uRevealResolution;
                            uniform float uRevealTime;
                            uniform float uRevealBase;

                            void main() {
                            `
                        )
                        .replace(
                            '#include <dithering_fragment>',
                            `
                            vec2 revealUv = gl_FragCoord.xy / uRevealResolution;
                            float revealMask = texture2D(uRevealTexture, revealUv).r;
                            float liquidReveal = max(uRevealBase, smoothstep(0.1, 0.58, revealMask));

                            if (liquidReveal < 0.015) discard;

                            gl_FragColor.a *= liquidReveal;
                            gl_FragColor.rgb *= 0.7 + liquidReveal * 0.3;

                            #include <dithering_fragment>
                            `
                        )
                }
                clonedMaterial.needsUpdate = true

                return clonedMaterial
            })

            child.castShadow = true
            child.receiveShadow = true
            child.material = hasMaterialArray ? patchedMaterials : patchedMaterials[0]
        })

        return clone
    }, [fbo.readTarget.texture, revealBase, revealResolution, scene])

    useEffect(() => {
        return () => {
            fbo.readTarget.dispose()
            fbo.writeTarget.dispose()
            fbo.material.dispose()
        }
    }, [fbo])

    useFrame((state) => {
        if (!ref.current) return

        const t = state.clock.getElapsedTime()
        const pointerIsRecent = pointerSeen.current && performance.now() - lastPointerAt.current < 900
        const fboState = fboRef.current

        gl.getDrawingBufferSize(revealResolution)

        prevBlobPosition.current.copy(blobPosition.current)

        if (pointerIsRecent) {
            blobPosition.current.set(
                state.pointer.x * 0.5 + 0.5,
                state.pointer.y * 0.5 + 0.5
            )
            fboState.material.uniforms.uRadius.value = 0.095
            fboState.material.uniforms.uStrength.value = 1
            fboState.material.uniforms.uStretch.value = 1.8
            sweep.current.initialized = false
        } else {
            const s = sweep.current

            if (!s.initialized || t - s.startTime >= s.duration) {
                const fromRight = Math.random() < 0.5
                const startX = fromRight ? 1.2 : -0.2
                const endX = fromRight ? -0.2 : 1.2

                s.start.set(startX, 0.18 + Math.random() * 0.64)
                s.end.set(endX, 0.18 + Math.random() * 0.64)
                s.startTime = t
                s.duration = 3.6 + Math.random() * 2.4
                s.initialized = true
            }

            const phase = Math.min((t - s.startTime) / s.duration, 1.0)
            blobPosition.current.lerpVectors(s.start, s.end, phase)
            fboState.material.uniforms.uRadius.value = 0.135
            fboState.material.uniforms.uStrength.value = 1
            fboState.material.uniforms.uStretch.value = 2.6
        }

        blobDelta.current.copy(blobPosition.current).sub(prevBlobPosition.current)
        if (blobDelta.current.lengthSq() > 1e-8) {
            blobDir.current.copy(blobDelta.current).normalize()
        }

        fboState.material.uniforms.uPrevTexture.value = fboState.readTarget.texture
        fboState.material.uniforms.uBlob.value = blobPosition.current
        fboState.material.uniforms.uTime.value = t
        fboState.material.uniforms.uDir.value = blobDir.current
        fboState.material.uniforms.uAspect.value = revealResolution.x / Math.max(revealResolution.y, 1)

        gl.setRenderTarget(fboState.writeTarget)
        gl.render(fboState.scene, fboState.camera)
        gl.setRenderTarget(null)

        const nextReadTarget = fboState.writeTarget
        fboState.writeTarget = fboState.readTarget
        fboState.readTarget = nextReadTarget

        revealShaders.current.forEach((shader) => {
            shader.uniforms.uRevealTexture.value = fboState.readTarget.texture
            shader.uniforms.uRevealResolution.value = revealResolution
            shader.uniforms.uRevealTime.value = t
            shader.uniforms.uRevealBase.value = revealBase
        })

        if (wireframeShader.current) {
            wireframeShader.current.uniforms.uTime.value = t
            wireframeShader.current.uniforms.uRevealTexture.value = fboState.readTarget.texture
            wireframeShader.current.uniforms.uRevealResolution.value = revealResolution
        }

        ref.current.rotation.set(
            Math.PI + Math.cos(t / 4) / 180,
            Math.sin(t / 3) / 180,
            Math.PI + Math.sin(t / 2) / 180
        )

        ref.current.position.y = Math.cos(t / 2) / 120
    })

    const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        pointerSeen.current = true
        lastPointerAt.current = performance.now()
    }

    const wireframeMaterial = useMemo(() => {
        const material = new MeshBasicMaterial({
            color: '#727275',
            wireframe: true,
            transparent: true,
            opacity: 0.18,
            depthTest: false,
            depthWrite: false,
        })

        material.onBeforeCompile = (shader) => {
            wireframeShader.current = shader
            shader.uniforms.uTime = { value: 0 }
            shader.uniforms.uScanMinY = { value: scanBounds.min }
            shader.uniforms.uScanMaxY = { value: scanBounds.max }
            shader.uniforms.uRevealTexture = { value: fbo.readTarget.texture }
            shader.uniforms.uRevealResolution = { value: revealResolution }

            shader.vertexShader = shader.vertexShader.replace(
                'void main() {',
                `
                varying vec3 vScanPosition;

                void main() {
                    vScanPosition = (modelMatrix * vec4(position, 1.0)).xyz;
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
                    uniform sampler2D uRevealTexture;
                    uniform vec2 uRevealResolution;

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
                    vec2 revealUv = gl_FragCoord.xy / uRevealResolution;
                    float revealMask = texture2D(uRevealTexture, revealUv).r;
                    float wireframeHide = 1.0 - smoothstep(0.16, 0.48, revealMask);

                    gl_FragColor.a *= max(softTrail * 0.38, brightEdge * 0.58) * wireframeHide;

                    #include <dithering_fragment>
                    `
                )
        }

        return material
    }, [fbo.readTarget.texture, revealResolution, scanBounds.max, scanBounds.min])

    const wireframeScene = useMemo(() => {
        const clone = scene.clone(true)

        clone.traverse((child) => {
            if (child instanceof Mesh) {
                child.castShadow = false
                child.receiveShadow = false
                child.renderOrder = 2
                child.material = wireframeMaterial
            }
        })

        return clone
    }, [scene, wireframeMaterial])

    return (
        <group
            ref={ref}
            onPointerMove={handlePointerMove}
            {...props}
        >
            <primitive object={colorScene} />
            <primitive object={wireframeScene} />
        </group>
    )
}

useGLTF.preload(helmetModel, true)