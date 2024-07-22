export interface AppProps {
  children?: React.ReactNode;
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
  onCenterFocus: (index: number) => void;
}
