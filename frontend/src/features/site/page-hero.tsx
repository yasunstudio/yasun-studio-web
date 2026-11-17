export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-brand-canvas relative overflow-hidden text-white">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <span className="bg-yellow-brand absolute top-10 right-[8%] hidden size-4 rounded-sm md:block" />
      <div className="container-page hero-y relative">
        {eyebrow && <p className="text-eyebrow text-cyan-brand uppercase">{eyebrow}</p>}
        <h1 className="text-title-1 mt-3 max-w-3xl">{title}</h1>
        {description && <p className="text-lead mt-4 max-w-2xl text-white/75">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
