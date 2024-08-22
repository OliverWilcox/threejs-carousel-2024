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

        fontSize: "12px",
        justifyContent: "space-between",
        color: "black",
        zIndex: 40,
        display: "none",
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
  fontSize = "12px",
  lineHeight = "1.8em",
  delay = 0,
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
            duration: 0.5,
            delay: 0.2,
            ease: "expo.out",
          });
      } else {
        animationRef.current.to(elements, {
          y: "-80%",
          opacity: 0,

          duration: 0.4,
          ease: "in out",
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

const Info: React.FC<{ currentProject: number; isVisible: boolean }> = ({
  currentProject,
  isVisible,
}) => {
  const projects = [
    {
      index: "001",
      name: "MULTIVITAMIN STUDIO",
      date: "2023",
      brand: "WEB AGENCY",
      role: "DESIGN AND CREATIVE DEVELOPMENT",
      description:
        "CREATED AN IMMERSIVE WEB EXPERIENCE SHOWCASING THE LATEST ADVANCEMENTS IN TECHNOLOGY AND DESIGN.",
    },
    {
      index: "002",
      name: "RELATIONSHIP READY",
      date: "2021",
      brand: "COACHING",
      role: "DESIGN AND CREATIVE DEVELOPMENT",
      description:
        "A program designed to help with relationship problems and build confidence within yourself.",
    },
    // Add more projects as needed
  ];

  const project = projects[currentProject % projects.length];

  const fields = ["index", "name", "date", "brand", "role", "description"];

  const getColumnWidth = (field: string) => {
    switch (field) {
      case "name":
        return "14%";
      case "date":
        return "3%";
      case "brand":
        return "8%";
      case "role":
        return "15%";
      case "location":
        return "5%";
      case "description":
        return "40%";
      default:
        return "auto";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        right: "20%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        color: "black",
        zIndex: 10,
        textTransform: "uppercase",
      }}
    >
      {fields.map((field) => (
        <div
          key={field}
          style={{
            display: "flex",
            flexDirection: "column",
            width: getColumnWidth(field),
            marginRight: "10px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              lineHeight: "0.2em",
              opacity: 0.5,
              marginBottom: "8px",
              height: "14px", // Fixed height for label
            }}
          >
            {field.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: "12px",
              lineHeight: "1.2em",
              position: "relative",
              bottom: "0",

              display: "flex",
              height: "30px",
              flexDirection: "column",
              justifyContent: "flex-start", // Align content to bottom
            }}
          >
            <AnimatedText
              animationKey={`${currentProject}-${field}`}
              isVisible={isVisible}
              fontSize="12px"
              lineHeight="30px"
            >
              <div
                style={{
                  position: "absolute",

                  bottom: "-30px",
                }}
              >
                {project[field as keyof typeof project]}
              </div>
            </AnimatedText>
          </div>
        </div>
      ))}
    </div>
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
  const touchStartRef = useRef<number | null>(null);
  const touchLastRef = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const isAutoScrollingRef = useRef(false);

  // Hardcoded config values (previously from Leva)
  const config: ConfigType = {
    totalProjects: 18,
    radius: 10,
    scrollMultiplier: 160,
    panelWidth: 2,
    panelHeight: 3.5,
    panelColor: "#ffffff",
    hoverColor: "#ffffff",
    panelOpacity: 0.4,
    maxForwardDistance: -1.1,
    maxWidthIncrease: 2,
    maxWidthDecrease: 0,
    maxHeightIncrease: 0,
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

  // Array of background colors for each project
  const backgroundColors = ["#E3E5EF", "#E9F1FF"];
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust this threshold as needed
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const totalWidth = config.totalProjects * config.scrollMultiplier;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scrollDelta = event.deltaY * config.scrollSensitivity;
      updateScroll(scrollDelta);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartRef.current = event.touches[0].clientY;
      touchLastRef.current = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (touchLastRef.current === null) return;

      const touchEnd = event.touches[0].clientY;
      const delta = touchLastRef.current - touchEnd;

      updateScroll(delta * config.scrollSensitivity * 4);

      touchLastRef.current = touchEnd;
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
      touchLastRef.current = null;
    };

    const updateScroll = (scrollDelta: number) => {
      scrollRef.current += scrollDelta;
      scrollRef.current = (scrollRef.current + totalWidth) % totalWidth;
      const progress = scrollRef.current / totalWidth;
      setScrollProgress(progress);
    };

    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.documentElement.style.height = "100%";

    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.height = "";

      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [config.totalProjects, config.scrollMultiplier, config.scrollSensitivity]);

  const bgAnimationRef = useRef<gsap.core.Tween | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const lastScrollTime = useRef(Date.now());
  const isScrolling = useRef(false);
  const handleScroll = useCallback(() => {
    lastScrollTime.current = Date.now();
    if (!isScrolling.current) {
      isScrolling.current = true;
      if (bgAnimationRef.current) {
        bgAnimationRef.current.kill();
      }
      bgAnimationRef.current = gsap.to(containerRef.current, {
        backgroundColor: "#ffffff",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, []);

  useEffect(() => {
    const checkScrollEnd = () => {
      if (Date.now() - lastScrollTime.current > 150) {
        isScrolling.current = false;
      } else {
        requestAnimationFrame(checkScrollEnd);
      }
    };

    window.addEventListener("wheel", handleScroll);
    window.addEventListener("touchmove", handleScroll);

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
    };
  }, [handleScroll]);

  const handleCenterFocus = useCallback(
    (index: number) => {
      if (index !== currentProject) {
        setIsTextVisible(false);

        // Kill any ongoing background animation
        if (bgAnimationRef.current) {
          bgAnimationRef.current.kill();
        }

        // Animate background color out
        bgAnimationRef.current = gsap.to(containerRef.current, {
          backgroundColor: "#ffffff",
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            setCurrentProject(index);
            const newColor = backgroundColors[index % backgroundColors.length];
            setBackgroundColor(newColor);

            // Animate background color in with delay
            bgAnimationRef.current = gsap.to(containerRef.current, {
              backgroundColor: newColor,
              duration: 0.8,
              delay: 0, // 0.5-second delay added here
              ease: "power2.inOut",
              onStart: () => {
                // Set text to visible slightly before the background transition completes
                gsap.delayedCall(0.4, () => setIsTextVisible(true));
              },
            });
          },
        });
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
        backgroundColor: backgroundColor,
      }}
    >
      <Nav currentProject={currentProject} />

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: `100%`,
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
        }}
      >
        <Canvas
          shadows
          camera={{
            position: [0, 0, config.cameraZ],
            fov: isMobile ? 85 : 140,
          }}
          style={{
            width: "100vw",
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
