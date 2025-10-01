export default function About() {
  return (
    <div className="space-y-8">
      <header className="glass rounded-xl p-6 md:p-8 border">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">About CrewMind</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          We build assistive AI for frontline teams. Our liquid glass interface blends 3D spatial context with conversational understanding.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Mission", body: "Empower every worker with instant, context-aware assistance." },
          { title: "Approach", body: "Human-in-the-loop design, robust safety, and on-device privacy." },
          { title: "Tech", body: "3D digital twins, realtime telemetry, and multi‑modal AI." },
        ].map((c) => (
          <article key={c.title} className="glass rounded-xl p-6 border">
            <h3 className="font-semibold mb-1">{c.title}</h3>
            <p className="text-sm text-muted-foreground">{c.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
