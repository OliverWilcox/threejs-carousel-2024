import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { RectangleProps } from "./types";
import { lerp, calculatePosition } from "./utils";
import gsap from "gsap";

// SHADER CODE
// These shaders create the curved effect and handle texturing

// Vertex shader: Creates the curved shape of the rectangle
// Customization: Adjust the 'curvature' uniform to change the curve intensity
const curvedVertexShader = `
  uniform float curvature;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    // Change the sign here to curve inward or outward
    float z = pos.z + curvature * pow(abs(pos.x), 2.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.x, pos.y, z, 1.0);
  }
`;

// Fragment shader: Handles texturing, color transitions, and opacity
// Customization: Modify color calculations, add effects, or change the grayscale algorithm
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
    // Customize this function to change how grayscale is calculated
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    return vec4(gray, gray, gray, color.a);
  }

  void main() {
    // Calculate aspect ratios for texture fitting
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

    // Select texture based on index
    // Customization: Add more texture options or change selection logic
    vec4 texColor;
    if (textureIndex == 0) texColor = texture2D(diffuseTextures[0], adjustedUV);
    else if (textureIndex == 1) texColor = texture2D(diffuseTextures[1], adjustedUV);
    else if (textureIndex == 2) texColor = texture2D(diffuseTextures[2], adjustedUV);
    else texColor = texture2D(diffuseTextures[3], adjustedUV);
    
    // Apply grayscale with smooth transition
    // Customization: Modify this to change the color transition effect
    vec4 grayColor = toGrayscale(texColor);
    texColor = mix(grayColor, texColor, colorTransition);
    
    gl_FragColor = vec4(texColor.rgb * color, texColor.a * opacity);
  }
`;

// MAIN COMPONENT
export const Rectangle: React.FC<RectangleProps> = React.memo(
  ({ index, totalRectangles, scrollProgress, config, onCenterFocus }) => {
    // Refs and state
    const mesh = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);
    const [isCenter, setIsCenter] = useState(false);

    // Memoized values for performance
    const currentPosition = useMemo(() => new THREE.Vector3(), []);
    const currentRotation = useMemo(() => new THREE.Euler(), []);
    const currentScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

    // Refs for animation and transitions
    const prevAngleRef = useRef(0);
    const isCenterRef = useRef(false);
    const transitionTimeRef = useRef(0);
    const opacityRef = useRef(config.panelOpacity);
    const colorTransitionRef = useRef({ value: 0 });
    const scaleTransitionRef = useRef({ width: 1, height: 1 });
    const curvatureRef = useRef({ value: -2 });
    const scaleAnimationRef = useRef<gsap.core.Tween | null>(null);
    const curvatureAnimationRef = useRef<gsap.core.Tween | null>(null);

    // Load textures
    // Customization: Replace these with your own textures or dynamically load them
    const dummyTextures = useLoader(THREE.TextureLoader, [
      "y2k1.jpg",
      "y2k3.jpg",
      "y2k1.jpg",
      "y2k3.jpg",
    ]);

    // Create shader material
    // Customization: Modify uniform values or add new uniforms for additional effects
    const curvedShaderMaterial = useMemo(() => {
      return new THREE.ShaderMaterial({
        uniforms: {
          curvature: { value: -2 },
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

    // Setup and cleanup GSAP timeline
    useEffect(() => {
      return () => {
        if (scaleAnimationRef.current) {
          scaleAnimationRef.current.kill();
        }
        if (curvatureAnimationRef.current) {
          curvatureAnimationRef.current.kill();
        }
      };
    }, []);

    // Main animation frame
    useFrame((state, delta) => {
      if (!mesh.current) return;

      // Calculate angle for this rectangle
      const angleStep = (Math.PI * 2) / totalRectangles;
      const scrolledAngle =
        index * angleStep - scrollProgress * totalRectangles * angleStep;

      // Determine if this rectangle is at the center back
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

      // Handle center state change
      if (newIsCenter !== isCenter) {
        setIsCenter(newIsCenter);
        if (newIsCenter) {
          onCenterFocus(index);
        }

        // Kill any ongoing animations
        if (scaleAnimationRef.current) {
          scaleAnimationRef.current.kill();
        }
        if (curvatureAnimationRef.current) {
          curvatureAnimationRef.current.kill();
        }

        // Animate color transition
        gsap.to(colorTransitionRef.current, {
          value: newIsCenter ? 1 : 0,
          duration: 0.2,
          delay: 0,
          ease: "power2.inOut",
          onUpdate: () => {
            if (curvedShaderMaterial.uniforms) {
              curvedShaderMaterial.uniforms.colorTransition.value =
                colorTransitionRef.current.value;
            }
          },
        });

        if (newIsCenter) {
          // Animate width and height scale with delay when becoming the center
          scaleAnimationRef.current = gsap.to(scaleTransitionRef.current, {
            width: 1 + config.maxWidthIncrease,
            height: 1 + config.maxHeightIncrease,
            duration: 0.25,
            delay: 0.5,
            ease: "power2.inOut",
          });

          // Animate curvature transition when becoming center
          curvatureAnimationRef.current = gsap.to(curvatureRef.current, {
            value: 0.25,
            duration: 0.5,
            delay: 0.5,
            ease: "power2.inOut",
          });
        } else {
          // Immediate transition back to normal size
          gsap.to(scaleTransitionRef.current, {
            width: 1,
            height: 1,
            duration: 0.5,
            ease: "power2.inOut",
          });

          // Immediate transition back to normal curvature
          gsap.to(curvatureRef.current, {
            value: -2,
            duration: 0.5,
            ease: "power2.inOut",
          });
        }
      }

      // Width transition parameters
      // Customization: Adjust these values for different transition speeds
      const transitionDelay = 0.2;
      const transitionDuration = 0.5;

      // Handle transition timing
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

      // Calculate transition progress
      let transitionProgress;
      if (newIsCenter) {
        transitionProgress =
          Math.max(0, transitionTimeRef.current) / transitionDuration;
      } else {
        transitionProgress = 1 - transitionTimeRef.current / transitionDuration;
      }
      transitionProgress = Math.min(Math.max(transitionProgress, 0), 1);

      // Calculate forward offset
      // Customization: Modify this calculation to change how panels move forward
      let forwardOffset =
        config.maxForwardDistance *
        Math.exp(-distanceFromCenter * config.falloffRate);

      if (newIsCenter || isCenterRef.current) {
        forwardOffset += config.maxForwardDistance * transitionProgress;
      }

      // Calculate position
      const targetPosition = calculatePosition(
        scrolledAngle,
        config.radius,
        forwardOffset
      );

      // Calculate rotation
      // Customization: Modify rotation calculation for different orientations
      let targetAngle = Math.atan2(targetPosition.x, targetPosition.z);
      const prevAngle = prevAngleRef.current;
      const angleDiff =
        ((targetAngle - prevAngle + Math.PI) % (Math.PI * 2)) - Math.PI;
      const newAngle = prevAngle + angleDiff * config.rotationSmoothness;
      prevAngleRef.current = newAngle;

      const targetRotation = new THREE.Euler(0, newAngle, 0);
      const targetScale = new THREE.Vector3(
        scaleTransitionRef.current.width,
        scaleTransitionRef.current.height,
        1
      );

      // Interpolate position, rotation, and scale
      // Customization: Adjust lerpFactor in config for smoother or more immediate transitions
      currentPosition.lerp(targetPosition, config.lerpFactor);
      currentRotation.set(
        lerp(currentRotation.x, targetRotation.x, config.lerpFactor),
        lerp(currentRotation.y, targetRotation.y, config.lerpFactor),
        lerp(currentRotation.z, targetRotation.z, config.lerpFactor)
      );
      currentScale.lerp(targetScale, config.lerpFactor);

      // Apply transformations
      mesh.current.position.copy(currentPosition);
      mesh.current.rotation.copy(currentRotation);
      mesh.current.scale.copy(currentScale);

      // Calculate opacity
      // Customization: Modify this calculation for different opacity effects
      const quarterTotalRectangles = totalRectangles / 2.6;
      const opacityFactor = Math.pow(
        1 - distanceFromCenterBackPanel / quarterTotalRectangles,
        5
      );
      const targetOpacity = newIsCenter
        ? 0.8
        : config.panelOpacity * Math.max(opacityFactor, 0);

      // Animate opacity change
      // Customization: Adjust duration or easing function for different fade effects
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

      // Update shader uniforms
      // Customization: Modify these values or add new uniforms for different visual effects
      if (curvedShaderMaterial.uniforms) {
        curvedShaderMaterial.uniforms.curvature.value =
          curvatureRef.current.value;
        curvedShaderMaterial.uniforms.color.value.setStyle(
          hovered ? config.hoverColor : config.panelColor
        );
        curvedShaderMaterial.uniforms.isCenter.value = newIsCenter ? 1 : 0;
        curvedShaderMaterial.uniforms.textureIndex.value = index % 4;
      }
    });

    // Event handlers
    const handlePointerOver = useCallback(() => setHovered(true), []);
    const handlePointerOut = useCallback(() => setHovered(false), []);

    // Render
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

Rectangle.displayName = "Rectangle";
