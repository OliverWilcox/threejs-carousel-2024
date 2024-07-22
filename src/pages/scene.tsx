import React, { useMemo } from "react";
import Rectangle from "./rectangle";
import { SceneProps } from "../types";

export const Scene: React.FC<SceneProps> = React.memo(
  ({ config, scrollProgress, onCenterFocus }) => {
    const rectangles = useMemo(() => {
      const totalRectangles = config.totalProjects;
      const centerIndex = Math.floor(scrollProgress * totalRectangles);

      return Array.from({ length: totalRectangles }).map((_, index) => {
        const distance = Math.min(
          Math.abs(index - centerIndex),
          Math.abs(index - centerIndex + totalRectangles),
          Math.abs(index - centerIndex - totalRectangles)
        );
        const animationIntensity = Math.max(
          0,
          1 - distance / (totalRectangles / 4)
        );

        return (
          <Rectangle
            key={index}
            index={index}
            totalRectangles={totalRectangles}
            scrollProgress={scrollProgress}
            config={config}
            onCenterFocus={onCenterFocus}
          />
        );
      });
    }, [config, scrollProgress, onCenterFocus]);

    return <>{rectangles}</>;
  }
);

Scene.displayName = "Scene";
export default Scene;
