import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { RectangleProps } from "../types";
import { lerp, calculatePosition } from "../utils";

import gsap from "gsap";

// Enhanced curved shader with multiple textures and color transition
const curvedVertexShader = `
  uniform float curvature;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float z = pos.z + curvature * pow(abs(pos.x), 2.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.x, pos.y, z, 1.0);
  }
`;

const curvedFragmentShader = `
  uniform vec3 color;
  uniform float opacity;
  uniform sampler2D diffuseTextures[4];
  uniform int textureIndex;
  uniform float isCenter;
  uniform vec2 textureSize;
  uniform vec2 planeSize;
  uniform float colorTransition;
  varying vec2 vUv;

  vec4 toGrayscale(vec4 color) {
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    return vec4(gray, gray, gray, color.a);
  }

  void main() {
    // Calculate aspect ratios
    float texAspect = textureSize.x / textureSize.y;
    float planeAspect = planeSize.x / planeSize.y;
    
    // Adjust UV coordinates to maintain aspect ratio
    vec2 adjustedUV = vUv;
    if (texAspect > planeAspect) {
      float scale = planeAspect / texAspect;
      adjustedUV.y = (vUv.y - 0.5) * scale + 0.5;
    } else {
      float scale = texAspect / planeAspect;
      adjustedUV.x = (vUv.x - 0.5) * scale + 0.5;
    }

    vec4 texColor;
    if (textureIndex == 0) texColor = texture2D(diffuseTextures[0], adjustedUV);
    else if (textureIndex == 1) texColor = texture2D(diffuseTextures[1], adjustedUV);
    else if (textureIndex == 2) texColor = texture2D(diffuseTextures[2], adjustedUV);
    else texColor = texture2D(diffuseTextures[3], adjustedUV);
    
    // Apply grayscale with smooth transition
    vec4 grayColor = toGrayscale(texColor);
    texColor = mix(grayColor, texColor, colorTransition);
    
    gl_FragColor = vec4(texColor.rgb * color, texColor.a * opacity);
  }
`;

const Rectangle: React.FC<RectangleProps> = React.memo(
  ({ index, totalRectangles, scrollProgress, config, onCenterFocus }) => {
    Rectangle.displayName = "Rectangle";

    const mesh = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const [isCenter, setIsCenter] = useState(false);

    const currentPosition = useMemo(() => new THREE.Vector3(), []);
    const currentRotation = useMemo(() => new THREE.Euler(), []);
    const currentScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

    const prevAngleRef = useRef(0);
    const isCenterRef = useRef(false);
    const transitionTimeRef = useRef(0);
    const opacityRef = useRef(config.panelOpacity);
    const colorTransitionRef = useRef({ value: 0 });

    // Load dummy textures
    const dummyTextures = useLoader(THREE.TextureLoader, [
      "city.jpg",
      "mountain.jpg",
      "city.jpg",
      "mountain.jpg",
    ]);

    const curvedShaderMaterial = useMemo(() => {
      return new THREE.ShaderMaterial({
        uniforms: {
          curvature: { value: 0.1 },
          color: { value: new THREE.Color(config.panelColor) },
          opacity: { value: config.panelOpacity },
          diffuseTextures: { value: dummyTextures },
          textureIndex: { value: index % 4 },
          isCenter: { value: 0 },
          textureSize: {
            value: new THREE.Vector2(
              dummyTextures[0].image.width,
              dummyTextures[0].image.height
            ),
          },
          planeSize: {
            value: new THREE.Vector2(config.panelWidth, config.panelHeight),
          },
          colorTransition: { value: 0 },
        },
        vertexShader: curvedVertexShader,
        fragmentShader: curvedFragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
      });
    }, [
      config.panelColor,
      config.panelOpacity,
      dummyTextures,
      config.panelWidth,
      config.panelHeight,
      index,
    ]);

    useEffect(() => {
      const tl = gsap.timeline();
      return () => {
        tl.kill();
      };
    }, []);

    useFrame((state, delta) => {
      if (!mesh.current) return;

      const angleStep = (Math.PI * 2) / totalRectangles;
      const scrolledAngle =
        index * angleStep - scrollProgress * totalRectangles * angleStep;

      const distanceFromCenter = Math.abs(
        Math.atan2(Math.sin(scrolledAngle), -Math.cos(scrolledAngle))
      );
      const isOnBack = Math.abs(scrolledAngle) > Math.PI / 2;

      const centerBackPanelIndex =
        (Math.round(scrollProgress * totalRectangles) + totalRectangles / 2) %
        totalRectangles;
      const distanceFromCenterBackPanel = Math.min(
        Math.abs(index - centerBackPanelIndex),
        Math.abs(index - centerBackPanelIndex + totalRectangles),
        Math.abs(index - centerBackPanelIndex - totalRectangles)
      );

      const newIsCenter = distanceFromCenterBackPanel === 0 && isOnBack;
      if (newIsCenter !== isCenter) {
        setIsCenter(newIsCenter);
        if (newIsCenter) {
          onCenterFocus(index);
        }

        // Animate color transition with delay
        gsap.to(colorTransitionRef.current, {
          value: newIsCenter ? 1 : 0,
          duration: 1,
          delay: 0.3,
          ease: "in out",
          onUpdate: () => {
            if (curvedShaderMaterial.uniforms) {
              curvedShaderMaterial.uniforms.colorTransition.value =
                colorTransitionRef.current.value;
            }
          },
        });
      }

      // Width transition parameters
      const transitionDelay = 0.1;
      const transitionDuration = 0.2;

      if (newIsCenter && !isCenterRef.current) {
        transitionTimeRef.current = -transitionDelay;
        isCenterRef.current = true;
      } else if (!newIsCenter && isCenterRef.current) {
        transitionTimeRef.current = 0;
        isCenterRef.current = false;
      }

      transitionTimeRef.current = Math.min(
        transitionTimeRef.current + delta,
        transitionDuration
      );

      let transitionProgress;
      if (newIsCenter) {
        transitionProgress =
          Math.max(0, transitionTimeRef.current) / transitionDuration;
      } else {
        transitionProgress = 1 - transitionTimeRef.current / transitionDuration;
      }
      transitionProgress = Math.min(Math.max(transitionProgress, 0), 1);

      let forwardOffset =
        config.maxForwardDistance *
        Math.exp(-distanceFromCenter * config.falloffRate);

      // Updated width and height scale calculations
      let widthScale = 1 + config.maxWidthIncrease * transitionProgress;
      let heightScale = 1 + config.maxHeightIncrease * transitionProgress;

      if (newIsCenter || isCenterRef.current) {
        forwardOffset += config.maxForwardDistance * transitionProgress;
      }

      const targetPosition = calculatePosition(
        scrolledAngle,
        config.radius,
        forwardOffset
      );

      let targetAngle = Math.atan2(targetPosition.x, targetPosition.z);
      const prevAngle = prevAngleRef.current;
      const angleDiff =
        ((targetAngle - prevAngle + Math.PI) % (Math.PI * 2)) - Math.PI;
      const newAngle = prevAngle + angleDiff * config.rotationSmoothness;
      prevAngleRef.current = newAngle;

      const targetRotation = new THREE.Euler(0, newAngle, 0);
      const targetScale = new THREE.Vector3(widthScale, heightScale, 1);

      currentPosition.lerp(targetPosition, config.lerpFactor);
      currentRotation.set(
        lerp(currentRotation.x, targetRotation.x, config.lerpFactor),
        lerp(currentRotation.y, targetRotation.y, config.lerpFactor),
        lerp(currentRotation.z, targetRotation.z, config.lerpFactor)
      );
      currentScale.lerp(targetScale, config.lerpFactor);

      mesh.current.position.copy(currentPosition);
      mesh.current.rotation.copy(currentRotation);
      mesh.current.scale.copy(currentScale);

      // Calculate target opacity with more pronounced staggering
      const quarterTotalRectangles = totalRectangles / 2.6;
      const opacityFactor = Math.pow(
        1 - distanceFromCenterBackPanel / quarterTotalRectangles,
        2
      );
      const targetOpacity = newIsCenter
        ? 0.8
        : config.panelOpacity * Math.max(opacityFactor, 0);

      // Smoothly animate opacity change
      gsap.to(opacityRef, {
        current: targetOpacity,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: () => {
          if (curvedShaderMaterial.uniforms) {
            curvedShaderMaterial.uniforms.opacity.value = opacityRef.current;
          }
        },
      });

      // Update curved shader uniforms
      if (curvedShaderMaterial.uniforms) {
        curvedShaderMaterial.uniforms.curvature.value = newIsCenter
          ? 0.1 * transitionProgress
          : 0;
        curvedShaderMaterial.uniforms.color.value.setStyle(
          hovered ? config.hoverColor : config.panelColor
        );
        curvedShaderMaterial.uniforms.isCenter.value = newIsCenter ? 1 : 0;
        curvedShaderMaterial.uniforms.textureIndex.value = index % 4;
      }
    });

    const handlePointerOver = useCallback(() => setHovered(true), []);
    const handlePointerOut = useCallback(() => setHovered(false), []);

    return (
      <mesh
        ref={mesh}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[config.panelWidth, config.panelHeight, 32, 32]} />
        <primitive object={curvedShaderMaterial} attach="material" />
      </mesh>
    );
  }
);

export default Rectangle;
