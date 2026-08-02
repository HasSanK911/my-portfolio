import { Award as AwardIcon, GraduationCap, Presentation } from "lucide-react";
import { Reveal, RevealItem, StaggerGroup } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { awards, conferences, education } from "@/lib/data";

export function Credentials() {
  return (
    <section id="credentials" className="section-y relative z-10 border-t border-line bg-bg">
      <div className="shell flex flex-col gap-14">
        <SectionHeading
          index="05"
          eyebrow="Background"
          title="Education, honours and the rooms I've learned in."
          accentWords={["honours"]}
        />

        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* Education */}
          <div className="flex flex-col gap-7">
            <Reveal className="flex items-center gap-2.5">
              <GraduationCap className="h-4 w-4 text-brand" aria-hidden />
              <h3 className="text-label text-fg-subtle">Education</h3>
            </Reveal>

            <StaggerGroup className="flex flex-col">
              {education.map((item) => (
                <RevealItem
                  key={item.qualification}
                  className="group border-t border-line py-6 transition-colors duration-300 last:border-b hover:border-brand/40"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h4 className="text-lg font-medium tracking-tight transition-colors duration-300 group-hover:text-accent">
                        {item.qualification}
                      </h4>
                      <span className="text-mono-sm shrink-0 text-fg-subtle">{item.period}</span>
                    </div>
                    <p className="text-sm text-fg-muted">{item.institution}</p>
                    {item.detail ? (
                      <p className="mt-1 text-sm leading-relaxed text-fg-subtle">{item.detail}</p>
                    ) : null}
                  </div>
                </RevealItem>
              ))}
            </StaggerGroup>
          </div>

          {/* Honours + conferences */}
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-7">
              <Reveal className="flex items-center gap-2.5">
                <AwardIcon className="h-4 w-4 text-brand" aria-hidden />
                <h3 className="text-label text-fg-subtle">Honours &amp; awards</h3>
              </Reveal>

              <StaggerGroup className="flex flex-col">
                {awards.map((item) => (
                  <RevealItem
                    key={item.title}
                    className="group border-t border-line py-6 transition-colors duration-300 last:border-b hover:border-brand/40"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <h4 className="max-w-md text-lg font-medium leading-snug tracking-tight transition-colors duration-300 group-hover:text-accent">
                          {item.title}
                        </h4>
                        <span className="text-mono-sm shrink-0 text-fg-subtle">{item.date}</span>
                      </div>
                      <p className="text-sm text-fg-muted">{item.issuer}</p>
                      <p className="mt-1 text-sm leading-relaxed text-fg-subtle">{item.detail}</p>
                    </div>
                  </RevealItem>
                ))}
              </StaggerGroup>
            </div>

            <div className="flex flex-col gap-7">
              <Reveal className="flex items-center gap-2.5">
                <Presentation className="h-4 w-4 text-brand" aria-hidden />
                <h3 className="text-label text-fg-subtle">Conferences &amp; seminars</h3>
              </Reveal>

              <StaggerGroup className="flex flex-col">
                {conferences.map((item) => (
                  <RevealItem
                    key={item.title}
                    className="group border-t border-line py-6 transition-colors duration-300 last:border-b hover:border-brand/40"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h4 className="max-w-md text-base font-medium leading-snug tracking-tight transition-colors duration-300 group-hover:text-accent">
                        {item.title}
                      </h4>
                      <span className="text-mono-sm shrink-0 text-fg-subtle">{item.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-fg-muted">{item.issuer}</p>
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
