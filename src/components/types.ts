// types.ts

export interface AppProps {
  children?: React.ReactNode;
}

export interface SceneProps {
  config: ConfigType;
  scrollProgress: number;
}

export interface RectangleProps {
  index: number;
  totalRectangles: number;
  scrollProgress: number;
  config: ConfigType;
  animationIntensity: number;
}

export interface ConfigType {
  totalProjects: number;
  radius: number;
  scrollMultiplier: number;
  panelWidth: number;
  panelHeight: number;
  panelColor: string;
  hoverColor: string;
  panelOpacity: number;
  maxForwardDistance: number;
  maxWidthIncrease: number;
  maxWidthDecrease: number;
  maxHeightIncrease: number;
  maxHeightDecrease: number;
  falloffRate: number;
  lerpFactor: number;
  rotationSmoothness: number;
  centerThreshold: number;
  adjacentThreshold: number;
  cameraZ: number;
  fov: number;
  scrollSensitivity: number;
}

export interface LevaControls extends ConfigType {
  enableOrbitControls: boolean;
  cameraZ: number;
  fov: number;
}

export interface LightsProps {}

// Add any other types you might need for your project

// ... other types remain the same

export interface SceneProps {
  config: ConfigType;
  scrollProgress: number;
  onCenterFocus: (index: number) => void;
}

export interface RectangleProps {
  index: number;
  totalRectangles: number;
  scrollProgress: number;
  config: ConfigType;
  animationIntensity: number;
  onCenterFocus: (index: number) => void;
}
