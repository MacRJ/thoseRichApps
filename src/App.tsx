import { useEffect, useState } from "react";

/* ---------------- signal feed ---------------- */

type Pick = {
  ticker: string;
  name: string;
  side: "LONG" | "SHORT";
  entry: number;
  target: number;
  stop: number;
  horizon: string;
  confidence: number;
};
type Feed = { sample?: boolean; session: string; generatedAt: string; free: Pick; lockedCount: number };

// The public endpoint only ever returns one pick. Locked rows below are filler text
// so nothing real exists in the page to un-blur.
const SIGNAL_URL = "/api/signals/today.json";
const FILLER = ["XXXX LONG 000.00 000.00 000.00", "XXX SHORT 00.00 00.00 00.00", "XXXX LONG 000.00 000.00 000.00", "XX LONG 00.00 00.00 00.00", "XXX LONG 00.00 00.00 00.00", "XXXX SHORT 000.00 000.00 000.00"];

function fmtSession(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function useFeed() {
  const [state, setState] = useState<{ status: "loading" | "ok" | "empty"; feed?: Feed }>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    fetch(SIGNAL_URL, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((feed: Feed) => alive && setState({ status: feed?.free ? "ok" : "empty", feed }))
      .catch(() => alive && setState({ status: "empty" }));
    return () => { alive = false; };
  }, []);
  return state;
}

function SignalPanel() {
  const { status, feed } = useFeed();
  const [askedSub, setAskedSub] = useState(false);
  const p = feed?.free;
  const locked = Math.max(0, Math.min(feed?.lockedCount ?? 4, FILLER.length));
  const pct = (a: number, b: number) => (((b - a) / a) * 100).toFixed(1);

  return (
    <section className="panel sig" id="signals" aria-labelledby="sig-h">
      <div className="sig-head">
        <p className="k" id="sig-h">GET /api/signals/today</p>
        {status === "ok" && feed && (
          <span className="live"><i />{feed.sample ? "sample · " : ""}for {fmtSession(feed.session)}</span>
        )}
      </div>

      {status === "loading" && <div className="pick skeleton" aria-busy="true"><span /><span /><span /></div>}

      {status === "empty" && (
        <div className="pick empty">
          <p>No signal posted for the next session yet.</p>
          <p className="muted">New ideas go up after the market closes.</p>
        </div>
      )}

      {status === "ok" && p && (
        <div className="pick">
          <div className="pick-top">
            <span className="ticker">{p.ticker}</span>
            <span className={p.side === "LONG" ? "side long" : "side short"}>{p.side}</span>
            <span className="hz">{p.name} · {p.horizon}</span>
          </div>
          <dl className="levels">
            <div><dt>entry</dt><dd>{p.entry.toFixed(2)}</dd></div>
            <div><dt>target</dt><dd className="up">{p.target.toFixed(2)} <small>{pct(p.entry, p.target)}%</small></dd></div>
            <div><dt>stop</dt><dd className="dn">{p.stop.toFixed(2)} <small>{pct(p.entry, p.stop)}%</small></dd></div>
            <div><dt>conf</dt><dd>{p.confidence}%</dd></div>
          </dl>
          <div className="bar" role="img" aria-label={`Confidence ${p.confidence} percent`}><span style={{ width: `${p.confidence}%` }} /></div>
        </div>
      )}

      {status !== "empty" && locked > 0 && (
        <div className="locked-wrap">
          <div className="locked" aria-hidden="true">
            {FILLER.slice(0, locked).map((row, i) => (
              <div key={i} className="row">{row.split(" ").map((c, j) => <span key={j}>{c}</span>)}</div>
            ))}
          </div>
          <div className="gate">
            <p>[ {locked} more signal{locked === 1 ? "" : "s"} redacted ]</p>
            <button onClick={() => setAskedSub(true)}>subscribe --full</button>
            {askedSub && <p className="soon" role="status">Subscriptions open soon.</p>}
          </div>
        </div>
      )}

      <p className="fine">Trade ideas are for information only and are not investment advice. Past results don't guarantee future returns.</p>
    </section>
  );
}

/* ---------------- content ---------------- */

type Status = "live" | "building" | "idea";
const PROJECTS: { name: string; kind: string; blurb: string; stack: string[]; status: Status }[] = [
  { name: "Signal Desk", kind: "Trading bot", blurb: "Scans the market after close and publishes the next session's trade ideas to a JSON endpoint.", stack: ["Python", "AWS Lambda", "API Gateway"], status: "building" },
  { name: "SAM.gov Opportunity Watcher", kind: "Apify actor", blurb: "Pulls new federal contract postings by NAICS code and set-aside, ready to pipe into a sheet or Slack.", stack: ["Apify", "Node", "SAM API"], status: "idea" },
  { name: "Alaska METAR Feed", kind: "Apify actor", blurb: "Collects current weather observations for rural Alaska airstrips into one clean dataset.", stack: ["Apify", "Node"], status: "idea" },
  { name: "Tundra Coffee", kind: "Storefront", blurb: "Alaskan specialty coffee brand. Shopify store, content pipeline and email flows.", stack: ["Shopify", "Liquid", "Klaviyo"], status: "live" },
];

const TAPE = ["SPY", "QQQ", "XLE", "TLT", "GLD", "IWM", "DIA", "XLK"];

export default function App() {
  return (
    <div className="dk">
      <div className="tape" aria-hidden="true">
        <div className="tape-inner">{[...TAPE, ...TAPE].map((t, i) => <span key={i}>{t}</span>)}</div>
      </div>

      <header className="nav wrap">
        <a className="logo" href="/">&gt; thoseRichApps<span className="caret">_</span></a>
        <nav aria-label="Main">
          <a href="#projects">/projects</a>
          <a href="#signals">/signals</a>
          <a href="#about">/about</a>
        </nav>
      </header>

      <main className="grid wrap">
        <section className="panel who" id="about" aria-labelledby="who-h">
          <p className="k">whoami</p>
          <h1 id="who-h">Rich Jones</h1>
          <p className="role">Engineer · Marine vet · Nome, AK</p>
          <p className="bio">Marine Corps veteran, seven years writing software (including USAA), and now the EHR applications analyst keeping clinics running across rural Alaska. I build small, useful tools on the side and ship them here.</p>
          <dl>
            <div><dt>exp</dt><dd>7 yrs software</dd></div>
            <div><dt>cert</dt><dd>AWS Dev Assoc.</dd></div>
            <div><dt>base</dt><dd>Nome, Alaska</dd></div>
          </dl>
        </section>

        <SignalPanel />

        <section className="panel proj" id="projects" aria-labelledby="proj-h">
          <p className="k" id="proj-h">ls ./projects</p>
          <div className="tablewrap">
            <table>
              <thead><tr><th>name</th><th>type</th><th>stack</th><th>status</th></tr></thead>
              <tbody>
                {PROJECTS.map((p) => (
                  <tr key={p.name}>
                    <td><b>{p.name}</b><small>{p.blurb}</small></td>
                    <td>{p.kind}</td>
                    <td>{p.stack.join(" · ")}</td>
                    <td><span className={`st st-${p.status}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="foot wrap">
        <span>© {new Date().getFullYear()} Richard Jones</span>
        <span>built in Nome, AK · 64.50° N</span>
      </footer>
    </div>
  );
}
