import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
  ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

// Importing components and types
import { Scene } from "../components/scene";
import { Lights } from "../components/lights";

// Types
interface AppProps {
  children?: ReactNode;
}

interface ConfigType {
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

// Nav component
const Nav: React.FC<{ currentProject: number }> = ({ currentProject }) => {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "20px",
        display: "flex",
        fontSize: "16px",
        justifyContent: "space-between",
        color: "black",
        zIndex: 40,
      }}
    >
      <div>Oliver Wilcox</div>
      <div>Info</div>
    </nav>
  );
};

// Helper function to check for descending letters
const hasDescendingLetters = (text: string): boolean => {
  return /[gjpqy]/.test(text);
};

// AnimatedText component
const AnimatedText: React.FC<{
  children: ReactNode;
  splitLines?: boolean;
  animationKey: number | string;
  isVisible: boolean;
  fontSize?: string;
  lineHeight?: string;
  delay?: number;
  lines?: number;
}> = ({
  children,
  splitLines = false,
  animationKey,
  isVisible,
  fontSize = "16px",
  lineHeight = "1.8em",
  delay = 0.2,
  lines = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll("div > div");

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.timeline();

      if (isVisible) {
        animationRef.current
          .set(elements, { y: "100%", opacity: 0 })
          .to(elements, {
            y: "0%",
            opacity: 1,
            duration: 0.6,
            delay: 0.3,
            ease: "expo.out",
            stagger: 0.025,
          });
      } else {
        animationRef.current.to(elements, {
          y: "80%",
          opacity: 0,
          duration: 0.5,
          ease: "expo.in",
          stagger: 0.025,
        });
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [animationKey, isVisible, delay]);

  if (lines > 1 && typeof children === "string") {
    const words = children.split(" ");
    const linesArray = [];
    const wordsPerLine = Math.ceil(words.length / lines);

    for (let i = 0; i < lines; i++) {
      linesArray.push(
        words.slice(i * wordsPerLine, (i + 1) * wordsPerLine).join(" ")
      );
    }

    return (
      <div ref={containerRef}>
        {linesArray.map((line, index) => (
          <div key={index} style={{ overflow: "hidden", height: lineHeight }}>
            <div style={{ fontSize }}>{line}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ overflow: "hidden", height: lineHeight }}>
      <div style={{ fontSize }}>{children}</div>
    </div>
  );
};

// Info component
const Info: React.FC<{ currentProject: number; isVisible: boolean }> = ({
  currentProject,
  isVisible,
}) => {
  const projects = [
    {
      name: "Relationship Ready",
      date: "2021",
      client: "Coaching",
      role: "Design and Development",
      description:
        "Developed a new experience designed to help with building dyson spheres.",
    },
    {
      name: "Multivitamin Studio",
      date: "2023",
      client: "Web Agency",
      role: "Design and Creative Development",
      description:
        "Created an immersive web experience showcasing the latest advancements.",
    },
    // Add more projects as needed
  ];

  const project = projects[currentProject % projects.length];
  const projectNameLineHeight = hasDescendingLetters(project.name)
    ? "5.4em"
    : "5.05em";

  return (
    <>
      {/* Centered project name */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 10,
          display: "none",
        }}
      >
        <AnimatedText
          lineHeight={projectNameLineHeight}
          animationKey={currentProject}
          isVisible={isVisible}
          fontSize="64px"
          delay={0}
        >
          {project.name}
        </AnimatedText>
      </div>

      {/* Bottom left text */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          color: "black",
          zIndex: 10,
          visibility: "hidden",
        }}
      >
        <AnimatedText
          animationKey="developer-designer"
          isVisible={isVisible}
          fontSize="16px"
        >
          Developer and Designer
        </AnimatedText>
      </div>

      {/* Bottom centered description */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          color: "black",
          zIndex: 10,
          width: "30%",
          maxWidth: "400px",
          visibility: "hidden",
        }}
      >
        <AnimatedText
          animationKey={currentProject}
          isVisible={isVisible}
          fontSize="13px"
          lineHeight="1.2em"
          lines={3}
        >
          {project.description}
        </AnimatedText>
      </div>

      {/* Bottom right aligned details */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          textAlign: "right",
          color: "black",
          zIndex: 10,
        }}
      >
        {["date", "client", "role"].map((field) => (
          <AnimatedText
            key={field}
            animationKey={`${currentProject}-${field}`}
            isVisible={isVisible}
            fontSize="13px"
            lineHeight="1.2em"
          >
            <span style={{ opacity: 0.5 }}>
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </span>{" "}
            {project[field as keyof typeof project]}
          </AnimatedText>
        ))}
      </div>
    </>
  );
};

// App component
const App: React.FC<AppProps> = ({ children }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentProject, setCurrentProject] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const scrollRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const touchStartRef = useRef<number>(0);

  // Hardcoded config values (previously from Leva)
  const config: ConfigType = {
    totalProjects: 18,
    radius: 9.2,
    scrollMultiplier: 180,
    panelWidth: 2.9,
    panelHeight: 3.5,
    panelColor: "#ffffff",
    hoverColor: "#ffffff",
    panelOpacity: 0.4,
    maxForwardDistance: -1,
    maxWidthIncrease: 1.6,
    maxWidthDecrease: 0,
    maxHeightIncrease: 0.2,
    maxHeightDecrease: 0,
    falloffRate: 7,
    lerpFactor: 0.15,
    rotationSmoothness: 0.2,
    centerThreshold: 0.1,
    adjacentThreshold: 0.5,
    cameraZ: 14,
    fov: 120,
    scrollSensitivity: 0.16,
  };

  useEffect(() => {
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerWidth * (9 / 16),
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const totalWidth = config.totalProjects * config.scrollMultiplier;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scrollDelta = -event.deltaY * config.scrollSensitivity;
      updateScroll(scrollDelta);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartRef.current = event.touches[0].clientX;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartRef.current === null) return;

      const touchEnd = event.touches[0].clientX;
      const delta = touchStartRef.current - touchEnd;

      updateScroll(delta * config.scrollSensitivity * 2);

      touchStartRef.current = touchEnd;
    };

    const handleTouchEnd = () => {
      touchStartRef.current = 0;
    };

    const updateScroll = (scrollDelta: number) => {
      scrollRef.current += scrollDelta;
      scrollRef.current = (scrollRef.current + totalWidth) % totalWidth;
      const progress = scrollRef.current / totalWidth;
      setScrollProgress(progress);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      container.addEventListener("touchstart", handleTouchStart);
      container.addEventListener("touchmove", handleTouchMove);
      container.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
        container.removeEventListener("touchstart", handleTouchStart);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [config.totalProjects, config.scrollMultiplier, config.scrollSensitivity]);

  const handleCenterFocus = useCallback(
    (index: number) => {
      if (index !== currentProject) {
        setIsTextVisible(false);
        setTimeout(() => {
          setCurrentProject(index);
          setIsTextVisible(true);
        }, 600);
      }
    },
    [currentProject]
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Nav currentProject={currentProject} />

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: `${canvasSize.height}px`,
          position: "absolute",
          top: "50%",
          left: "50%",
          zIndex: +10,
          transform: "translate(-50%, -50%)",
          touchAction: "none", // Prevent default touch actions
        }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 0, config.cameraZ], fov: 120 }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <Suspense fallback={null}>
            <Lights />
            <Scene
              config={config}
              scrollProgress={scrollProgress}
              onCenterFocus={handleCenterFocus}
            />
          </Suspense>
        </Canvas>
      </div>

      <Info currentProject={currentProject} isVisible={isTextVisible} />
      {children}
    </div>
  );
};

export default App;
