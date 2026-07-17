import Link from "next/link";
import { Footer } from "@/components/graph/Footer";
import { Header } from "@/components/graph/Header";

const HERO_NODES = [
  { cx: 160, cy: 160, r: 11 }, // hub
  { cx: 70, cy: 80, r: 6 },
  { cx: 250, cy: 70, r: 5 },
  { cx: 270, cy: 190, r: 7 },
  { cx: 90, cy: 250, r: 6 },
  { cx: 220, cy: 270, r: 5 },
  { cx: 40, cy: 180, r: 4 },
];

const HERO_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [0, 6],
  [1, 6],
  [3, 5],
];

function HomeHeroGraphic() {
  return (
    <svg
      viewBox="0 0 320 320"
      aria-hidden="true"
      className="mx-auto hidden h-auto w-full max-w-md text-blue-500 lg:block"
    >
      {HERO_EDGES.map(([a, b], i) => {
        const from = HERO_NODES[a];
        const to = HERO_NODES[b];
        return (
          <line
            key={i}
            x1={from.cx}
            y1={from.cy}
            x2={to.cx}
            y2={to.cy}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeOpacity={0.25}
          />
        );
      })}
      {HERO_NODES.map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill="currentColor"
          className="origin-center animate-[hero-pulse_3s_ease-in-out_infinite] motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
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
        </div>
        <HomeHeroGraphic />
      </main>
      <Footer />
    </div>
  );
}
