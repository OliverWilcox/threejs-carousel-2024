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
import { Scene } from "./scene";
import { Lights } from "./lights";
import { AppProps, ConfigType } from "../types";

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
        zIndex: 10,
      }}
    >
      <div>Oliver Wilcox</div>
      <div>Info</div>
    </nav>
  );
};

// Updated AnimatedText component
const AnimatedText: React.FC<{
  children: ReactNode;
  splitLines?: boolean;
  animationKey: number | string;
  isVisible: boolean;
  fontSize?: string;
  lineHeight?: string;
  delay?: number;
}> = ({
  children,
  splitLines = false,
  animationKey,
  isVisible,
  fontSize = "16px",
  lineHeight = "1.5em",
  delay = 0.2,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll("div > div");

      // Kill any ongoing animation
      if (animationRef.current) {
        animationRef.current.kill();
      }

      // Create a new timeline
      animationRef.current = gsap.timeline();

      if (isVisible) {
        // Animate in
        animationRef.current
          .set(elements, { y: "100%", opacity: 0 })
          .to(elements, {
            y: "0%",
            opacity: 1,
            duration: 0.6,
            delay: delay,
            ease: "power2.out",
            stagger: 0.025,
          });
      } else {
        // Animate out
        animationRef.current.to(elements, {
          y: "-100%",
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
          stagger: 0,
        });
      }
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [animationKey, isVisible, delay]);

  if (splitLines && typeof children === "string") {
    const words = children.split(" ");
    const midpoint = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, midpoint).join(" ");
    const secondLine = words.slice(midpoint).join(" ");

    return (
      <div ref={containerRef}>
        <div style={{ overflow: "hidden", height: lineHeight }}>
          <div style={{ fontSize }}>{firstLine}</div>
        </div>
        <div
          style={{ overflow: "hidden", height: lineHeight, marginTop: "-2px" }}
        >
          <div style={{ fontSize }}>{secondLine}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ overflow: "hidden", height: lineHeight }}>
      <div style={{ fontSize }}>{children}</div>
    </div>
  );
};

// Updated Info component
const Info: React.FC<{ currentProject: number; isVisible: boolean }> = ({
  currentProject,
  isVisible,
}) => {
  const projects = [
    {
      name: "Project One",
      date: "2021",
      client: "Coaching",
      role: "Design and Development",
      description:
        "Developed a new experience designed to help with building dyson spheres",
    },
    {
      name: "Project Two",
      date: "2023",
      client: "Web Agency",
      role: "Design and Creative Development",
      description:
        "Developed a new experience designed to help with building dyson spheres",
    },
    {
      name: "Project Three",
      date: "2022",
      client: "Record Label",
      role: "Product Design",
      description:
        "Developed a new experience designed to help with building dyson spheres",
    },
    {
      name: "Project Four",
      date: "2024",
      client: "Railway Company",
      role: "Creative Dev and Design",
      description:
        "Developed a new experience designed to help with building dyson spheres",
    },
    // Add more projects as needed
  ];

  const project = projects[currentProject % projects.length];

  return (
    <>
      {/* Centered project title */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 20,
        }}
      >
        <AnimatedText
          animationKey={currentProject}
          isVisible={isVisible}
          fontSize="90px"
          lineHeight="130px" // Increased to prevent "J" from being cut off
          delay={0} // Reduced delay for project name
        >
          {project.name}
        </AnimatedText>
      </div>

      {/* Other info at the bottom */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          color: "black",
          zIndex: 10,
        }}
      >
        <div
          style={{ fontSize: "16px", display: "flex", alignItems: "flex-end" }}
        >
          <span style={{ opacity: 1 }}>Email</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <div
            style={{
              fontSize: "13px",
              marginRight: "30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <AnimatedText
              animationKey={currentProject}
              splitLines={true}
              isVisible={isVisible}
              fontSize="13px"
              lineHeight="1.5em"
            >
              {project.description}
            </AnimatedText>
          </div>
          <div style={{ fontSize: "13px" }}>
            {["date", "client", "role"].map((field) => (
              <AnimatedText
                key={field}
                animationKey={`${currentProject}-${field}`}
                isVisible={isVisible}
                fontSize="13px"
                lineHeight="1.5em"
              >
                <span style={{ opacity: 0.5 }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </span>{" "}
                {project[field as keyof typeof project]}
              </AnimatedText>
            ))}
          </div>
        </div>
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
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 }); // Default size

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
    maxWidthIncrease: 4.34,
    maxWidthDecrease: 0,
    maxHeightIncrease: 1.3,
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
    // Update canvas size on mount and window resize
    const updateSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerWidth * (9 / 16), // Maintaining a 16:9 aspect ratio
      });
    };

    // Set initial size
    updateSize();

    // Add event listener
    window.addEventListener("resize", updateSize);

    // Clean up
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const totalWidth = config.totalProjects * config.scrollMultiplier;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scrollDelta = -event.deltaY * config.scrollSensitivity;
      scrollRef.current += scrollDelta;
      scrollRef.current = (scrollRef.current + totalWidth) % totalWidth;
      const progress = scrollRef.current / totalWidth;
      setScrollProgress(progress);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
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
        }, 600); // Adjust this delay to match your animation duration
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
          transform: "translate(-50%, -50%)",
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
