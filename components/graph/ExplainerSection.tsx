export function ExplainerSection() {
  return (
    <section className="mx-auto w-full max-w-2xl px-6 py-16">
      <h2 className="text-2xl font-semibold">Why build this</h2>
      <p className="mt-2 text-foreground/70">
        A second-brain wiki only stays useful if an LLM (or a human) can load fresh, relevant
        context on demand instead of re-reading everything from scratch. The Karpathy pattern —
        raw sources compiled into a maintained wiki, backlinked page to page — is what makes that
        dynamic context possible. But a folder of Markdown files hides its own structure: you
        can&apos;t see which pages are richly connected and which ones are quietly isolated just by
        browsing a file tree.
      </p>
      <p className="mt-4 text-foreground/70">
        Rendering the same backlink structure as a graph makes that structure visible. Dense
        clusters show where the wiki&apos;s thinking is well-connected; thin or missing edges show
        where a concept was written down but never linked back to the ideas it logically relates
        to — a content gap an LLM (or a person) would otherwise silently work around instead of
        surfacing.
      </p>
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-foreground/60">
        Try it yourself
      </h3>
      <p className="mt-2 text-foreground/70">
        In <strong>force-directed</strong> mode (switch via Options &amp; help), use the status
        and folder filters above the graph to isolate a cluster, then look for a node
        that&apos;s visibly smaller than its neighbors — that&apos;s a page with markedly fewer
        connections than its peers. Click it and check the side panel&apos;s related-pages list:
        a short list on a page that reads like it should connect to more of the wiki is a
        missing link made concrete, not just a claim.
      </p>
    </section>
  );
}
