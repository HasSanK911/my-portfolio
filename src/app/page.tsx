import { Backdrop } from "@/components/three/backdrop";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Work } from "@/components/sections/work";
import { Experience } from "@/components/sections/experience";
import { Skills } from "@/components/sections/skills";
import { Credentials } from "@/components/sections/credentials";
import { Contact } from "@/components/sections/contact";

export default function HomePage() {
  return (
    <>
      {/* Rendered outside the hero so no ancestor with `overflow: hidden` can
          clip the fixed WebGL surface. */}
      <Backdrop />
      <Hero />
      <About />
      <Work />
      <Experience />
      <Skills />
      <Credentials />
      <Contact />
    </>
  );
}
