import { Reveal, RevealItem, StaggerGroup } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { SectionHeading } from "@/components/ui/section-heading";
import { capabilities, profile } from "@/lib/data";
import { publicAsset } from "@/lib/assets";

export function About() {
  return (
    <section id="about" className="section-y relative z-10 bg-bg">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          {/* Portrait */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal direction="right">
              <TiltCard max={5} className="rounded-xl">
                <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
                  <PlaceholderImage
                    src={publicAsset("/images/portrait.jpg")}
                    alt={`Portrait of ${profile.fullName}`}
                    label="Portrait"
                    hint="/images/portrait.jpg"
                    ratio="4 / 5"
                    rounded="none"
                    sizes="(max-width: 1024px) 100vw, 38vw"
                  />
                  {/* Name plate */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
                    <div>
                      <p className="text-label text-white/70">{profile.role}</p>
                      <p className="font-display text-2xl text-white">{profile.fullName}</p>
                    </div>
                    <span className="text-mono-sm text-white/70">{profile.timezone}</span>
                  </div>
                </div>
              </TiltCard>
            </Reveal>

            <StaggerGroup className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
              {[
                { k: "Based in", v: profile.location },
                { k: "Experience", v: `${profile.yearsExperience} years` },
                { k: "Languages", v: profile.languages.join(", ") },
                { k: "Status", v: "Open to work" },
              ].map((row) => (
                <RevealItem key={row.k} className="bg-bg p-4">
                  <p className="text-label text-fg-subtle">{row.k}</p>
                  <p className="mt-1.5 text-sm text-fg">{row.v}</p>
                </RevealItem>
              ))}
            </StaggerGroup>
          </div>

          {/* Copy */}
          <div className="flex flex-col gap-10">
            <SectionHeading
              index="01"
              eyebrow="About"
              title="Four years turning requirements into interfaces people trust."
              accentWords={["trust."]}
            />

            <div className="flex flex-col gap-5">
              {profile.longSummary.map((paragraph, i) => (
                <Reveal key={i} direction="up" delay={i * 0.06}>
                  <p className="text-[1.0625rem] leading-[1.75] text-fg-muted">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <div className="rule-fade" aria-hidden />

            <div>
              <Reveal>
                <h3 className="text-label mb-6 text-fg-subtle">What I do</h3>
              </Reveal>
              <StaggerGroup className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
                {capabilities.map((cap, i) => (
                  <RevealItem key={cap.title} className="group bg-bg p-6 transition-colors duration-300 hover:bg-surface-2">
                    <span className="text-label text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <h4 className="mt-3 text-lg font-medium tracking-tight">{cap.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">{cap.body}</p>
                  </RevealItem>
                ))}
              </StaggerGroup>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
