import Image from "next/image";
import { Inter } from "next/font/google";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
//REPLACE WITH THIS LOADER SOON import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import axios from "axios";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import Logo from "./Logo";
import {
  DepthOfField,
  Bloom,
  Noise,
  Glitch,
  ToneMapping,
  Vignette,
  EffectComposer,
} from "@react-three/postprocessing";
import { GlitchMode, BlendFunction } from "postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const inter = Inter({ subsets: ["latin"] });

export default function Nav() {
  const navName = useRef<any>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(navName.current, {
      opacity: 0,
      scrollTrigger: {
        start: "top top",
        end: "+=100%",

        scrub: 1,
      },
    });
  }, []);

  return (
    <>
      <nav className="text-sm flex justify-between items-center px-7 py-5 text-white z-50 fixed w-screen font-satoshi-medium">
        <div>
          <a href="#" className="mr-0" ref={navName}>
            Oliver Wilcox
          </a>
        </div>
        <div>
          <div className="text-right flex justify-end">
            <a href="#" className="flex items-center">
              <i className="fab fa-twitter not-italic">Menu</i>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
