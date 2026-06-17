import { useTexture } from '@react-three/drei';
import { useFrame, extend } from '@react-three/fiber';
import { useRef } from 'react';
import { RepeatWrapping, PlaneGeometry, Vector3 } from 'three';

import { Water } from "three/examples/jsm/objects/Water.js";

extend({ Water });

export default function Ocean({ mode, sunDir })
{
    const oceanRef = useRef();
    const waterNormals = useTexture('./Textures/waternormals.jpg')
    waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping

    const isNight = mode === 'dark'
    const waterColor = isNight ? 0x001a33 : 0x006682
    const sunColor = isNight ? 0x222244 : 0xeb8934
    const direction = sunDir || new Vector3(0.6, 0.3, 0.7).normalize()

    useFrame(({ clock }) => {
        oceanRef.current.material.uniforms.time.value = clock.getElapsedTime() * 0.4;
    });


    return <>
        <water
            ref={oceanRef}
            args={[
                new PlaneGeometry(200, 300),
                {
                    textureWidth: 64,
                    textureHeight: 64,
                    waterNormals,
                    sunDirection: direction,
                    sunColor,
                    waterColor,
                    distortionScale: 5,
                    fog: false,
                },
                
            ]}
            rotation-x={-Math.PI / 2}
        />
    </>
}