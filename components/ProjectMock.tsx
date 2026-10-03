import type { Project } from "@/lib/content";

/*
 * Each project drawn as a small, living wireframe of its own interface,
 * in place of a screenshot. Everything is sized in em, so one blueprint
 * scales from the cursor preview up to the open case study. Animations
 * only run while `live` is set.
 */

function Health() {
  return (
    <div className="mock-health">
      <div className="m-bar">
        <i className="m-line w-[34%]" />
        <span className="m-tag">
          <span className="m-shield" /> guarded
        </span>
      </div>
      <div className="m-tiles">
        {[
          ["72", "bpm"],
          ["118/76", "mmHg"],
          ["98", "SpO₂"],
        ].map(([value, unit]) => (
          <div key={unit} className="m-tile">
            <b>{value}</b>
            <span>{unit}</span>
          </div>
        ))}
      </div>
      <div className="m-panel m-ecg-wrap">
        <svg className="m-ecg" viewBox="0 0 200 40" preserveAspectRatio="none">
          <path
            className="m-ecg-base"
            d="M0 22H38l5-12 6 26 5-20 4 6H98l5-12 6 26 5-20 4 6H158l5-12 6 26 5-20 4 6H200"
          />
          <path
            className="m-ecg-trace"
            pathLength={1}
            d="M0 22H38l5-12 6 26 5-20 4 6H98l5-12 6 26 5-20 4 6H158l5-12 6 26 5-20 4 6H200"
          />
        </svg>
      </div>
    </div>
  );
}

function Edu() {
  return (
    <div className="mock-edu">
      <div className="m-side">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} data-on={i === 1 || undefined} />
        ))}
      </div>
      <div className="m-main">
        <div className="m-roles">
          <span className="m-roles-thumb" />
          <span>Admin</span>
          <span>Teacher</span>
          <span>Student</span>
        </div>
        <div className="m-chart">
          {[46, 70, 58, 88, 64, 78].map((h, i) => (
            <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
        <div className="m-table">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <i className="w-[38%]" />
              <i className="w-[18%]" />
              <i className="w-[12%]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const stages = [
  { name: "Wishlist", cards: 2 },
  { name: "Applied", cards: 2 },
  { name: "Interview", cards: 1 },
  { name: "Offer", cards: 0 },
  { name: "Rejected", cards: 1 },
];

function Kanban() {
  return (
    <div className="mock-kanban">
      {stages.map((stage) => (
        <div key={stage.name} className="m-col">
          <span className="m-col-name">{stage.name}</span>
          {Array.from({ length: stage.cards }, (_, i) => (
            <div key={i} className="m-card">
              <i className="w-[70%]" />
              <i className="w-[45%]" />
            </div>
          ))}
        </div>
      ))}
      {/* The one application that keeps moving forward. */}
      <div className="m-card m-card-moving">
        <i className="w-[70%]" />
        <i className="w-[45%]" />
      </div>
    </div>
  );
}

function Vision() {
  return (
    <div className="mock-vision">
      <span className="m-corner m-tl" />
      <span className="m-corner m-tr" />
      <span className="m-corner m-bl" />
      <span className="m-corner m-br" />
      <div className="m-person">
        <span className="m-head" />
        <span className="m-shoulders" />
      </div>
      <span className="m-lock" />
      <span className="m-scan" />
      <span className="m-rec">
        <span className="m-rec-dot" /> live
      </span>
      <span className="m-marked">Marked present ✓</span>
    </div>
  );
}

const blueprints = { health: Health, edu: Edu, kanban: Kanban, vision: Vision };

export default function ProjectMock({ project, live }: { project: Project; live: boolean }) {
  const Blueprint = blueprints[project.mock];
  return (
    <div className="mock" data-live={live || undefined} aria-hidden>
      <div className="mock-chrome">
        <span />
        <span />
        <span />
        <em>{project.name}</em>
      </div>
      <div className="mock-body">
        <Blueprint />
      </div>
    </div>
  );
}
