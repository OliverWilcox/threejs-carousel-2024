import React, { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RectangleProps } from "./types";
import { lerp, calculatePosition, calculateScaleFactors } from "./utils";

export const Rectangle: React.FC<RectangleProps> = React.memo(
  ({ index, totalRectangles, scrollProgress, config }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const currentPosition = useMemo(() => new THREE.Vector3(), []);
    const currentRotation = useMemo(() => new THREE.Euler(), []);
    const currentScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

    const prevAngleRef = useRef(0);

    useFrame(() => {
      if (!mesh.current) return;

      const angleStep = (Math.PI * 2) / totalRectangles;
      const scrolledAngle =
        index * angleStep - scrollProgress * totalRectangles * angleStep;

      const distanceFromCenter = Math.abs(
        Math.atan2(Math.sin(scrolledAngle), -Math.cos(scrolledAngle))
      );

      // Check if the rectangle is on the front half of the circle
      const isOnFront = Math.abs(scrolledAngle) < Math.PI / 2;

      const forwardOffset =
        config.maxForwardDistance *
        Math.exp(-distanceFromCenter * config.falloffRate);

      const targetPosition = calculatePosition(
        scrolledAngle,
        config.radius,
        forwardOffset
      );

      let { widthScale } = calculateScaleFactors(
        distanceFromCenter,
        config.centerThreshold,
        config.adjacentThreshold,
        config.maxWidthIncrease,
        config.maxWidthDecrease,
        0, // No height increase
        0 // No height decrease
      );

      // Calculate animation intensity based on distance from center
      const animationIntensity = Math.max(
        0,
        1 - distanceFromCenter / (Math.PI / 2)
      );

      if (isOnFront && animationIntensity > 0) {
        const animationProgress = Math.sin(Date.now() * 0.005) * 0.5 + 0.5; // Oscillate between 0 and 1
        const animationAmplitude = 0.1; // Adjust this value to control the animation strength

        // Apply animation to width only, scaled by animation intensity
        widthScale +=
          animationProgress * animationAmplitude * animationIntensity;

        // Apply additional forward offset, scaled by animation intensity
        targetPosition.z -=
          config.maxForwardDistance * 0.5 * animationIntensity;
      }

      let targetAngle = Math.atan2(targetPosition.x, targetPosition.z);
      const prevAngle = prevAngleRef.current;
      const angleDiff =
        ((targetAngle - prevAngle + Math.PI) % (Math.PI * 2)) - Math.PI;
      const newAngle = prevAngle + angleDiff * config.rotationSmoothness;
      prevAngleRef.current = newAngle;

      const targetRotation = new THREE.Euler(0, newAngle, 0);
      const targetScale = new THREE.Vector3(widthScale, 1, 1); // Keep height scale at 1

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
    });

    const handlePointerOver = useCallback(() => setHovered(true), []);
    const handlePointerOut = useCallback(() => setHovered(false), []);

    return (
      <mesh
        ref={mesh}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[config.panelWidth, config.panelHeight]} />
        <meshPhysicalMaterial
          color={hovered ? config.hoverColor : config.panelColor}
          transparent={true}
          opacity={config.panelOpacity}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }
);
