import * as THREE from "three";

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const calculatePosition = (
  angle: number,
  radius: number,
  forwardOffset: number
) => {
  const x = Math.sin(angle) * radius;
  const z = -Math.cos(angle) * radius;
  return new THREE.Vector3(x, 0, z - forwardOffset);
};

export const calculateScaleFactors = (
  distanceFromCenter: number,
  centerThreshold: number,
  adjacentThreshold: number,
  maxWidthIncrease: number,
  maxWidthDecrease: number,
  maxHeightIncrease: number,
  maxHeightDecrease: number
) => {
  let widthScale, heightScale;

  if (distanceFromCenter < centerThreshold) {
    widthScale = 1 + maxWidthIncrease;
    heightScale = 1 + maxHeightIncrease;
  } else if (distanceFromCenter < adjacentThreshold) {
    widthScale = 1 - maxWidthDecrease;
    heightScale = 1 - maxHeightDecrease;
  } else {
    widthScale = 1;
    heightScale = 1;
  }

  return { widthScale, heightScale };
};
