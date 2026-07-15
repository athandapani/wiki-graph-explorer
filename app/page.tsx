import Link from "next/link";
import { Footer } from "@/components/graph/Footer";
import { Header } from "@/components/graph/Header";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
        <div>
          <h2 className="text-2xl font-semibold">Turn a wiki into an explorable graph</h2>
          <p className="mt-2 text-foreground/70">
            Wiki Graph Explorer reads a Karpathy-pattern wiki&apos;s backlink structure and
            renders it as a clickable graph, plus a live semantic search demo over the same
            content — all running client-side, no server required.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
            How to use it
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-foreground/70">
            <li>Click any node or pill to open its details, tags, and related pages.</li>
            <li>
              <strong>Swim-lane</strong> mode groups pages into folder lanes and reveals
              connections when you click a node.
            </li>
            <li>
              <strong>Force-directed</strong> mode shows the whole graph as a freely explorable,
              physics-based network.
            </li>
            <li>Switch between them, and between light/dark themes, from Options &amp; help.</li>
            <li>Use the search box to highlight pages matching your query.</li>
          </ul>
        </div>
        <Link
          href="/graph"
          className="inline-flex w-fit items-center rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          Open the graph →
        </Link>
      </main>
      <Footer />
    </div>
  );
}
