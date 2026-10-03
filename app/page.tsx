import About from "@/components/About";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Journey from "@/components/Journey";
import Toolkit from "@/components/Toolkit";
import Work from "@/components/Work";
import { listFrames } from "@/lib/frames-server";

export default async function Home() {
  const [poster] = await listFrames();

  return (
    <main className="relative z-[1]">
      <Hero poster={poster ?? null} />
      <About />
      <Journey />
      <Work />
      <Toolkit />
      <Contact />
    </main>
  );
}
