import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

const GlitchMaterialImpl = shaderMaterial(
  {
    tDiffuse: null,
    time: 0,
    distortionAmount: 0.1,
    glitchIntensity: 0.05,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float distortionAmount;
    uniform float glitchIntensity;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      
      // Vertical wave distortion
      uv.x += sin(uv.y * 10.0 + time) * distortionAmount;
      
      // Horizontal glitch effect
      float glitchLine = step(0.99, sin(uv.y * 100.0 + time * 10.0));
      uv.x += glitchLine * sin(time * 1000.0) * glitchIntensity;

      // Color separation
      vec2 rUv = uv + vec2(glitchIntensity * sin(time), 0.0);
      vec2 gUv = uv;
      vec2 bUv = uv - vec2(glitchIntensity * sin(time), 0.0);

      vec4 color;
      color.r = texture2D(tDiffuse, rUv).r;
      color.g = texture2D(tDiffuse, gUv).g;
      color.b = texture2D(tDiffuse, bUv).b;
      color.a = 1.0;

      // Noise
      float noise = rand(uv + time) * 0.1;
      color.rgb += noise;

      gl_FragColor = color;
    }
  `
);

extend({ GlitchMaterialImpl });

type GlitchMaterialType = typeof GlitchMaterialImpl & {
  key: string;
};

export const GlitchMaterial = GlitchMaterialImpl as GlitchMaterialType;
