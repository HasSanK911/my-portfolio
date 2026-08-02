import { Reveal, RevealItem, StaggerGroup } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Marquee } from "@/components/ui/marquee";
import { skillGroups, skillMarquee } from "@/lib/data";

export function Skills() {
  return (
    <section id="skills" className="section-y relative z-10 border-t border-line bg-bg">
      <div className="shell flex flex-col gap-14">
        <SectionHeading
          index="04"
          eyebrow="Capabilities"
          title="The toolkit behind the work."
          accentWords={["toolkit"]}
          description="Frameworks and tools I reach for daily, grouped by the job they do."
        />

        <StaggerGroup className="grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-2">
          {skillGroups.map((group, i) => (
            <RevealItem key={group.title} className="bg-bg">
              <div className="flex h-full flex-col gap-5 p-7 md:p-9">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl leading-tight tracking-tight">
                      {group.title}
                    </h3>
                    <p className="mt-1 text-sm text-fg-muted">{group.caption}</p>
                  </div>
                  <span className="text-label text-accent">{String(i + 1).padStart(2, "0")}</span>
                </div>

                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-fg-muted transition-colors duration-[260ms] hover:border-brand/50 hover:text-accent"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </StaggerGroup>
      </div>

      <Reveal direction="none" className="mt-16 border-y border-line py-6">
        <Marquee
          items={skillMarquee}
          duration={48}
          className="text-lg text-fg-subtle md:text-xl"
        />
      </Reveal>
    </section>
  );
}
