import { useEffect, useState } from "react";
import "../styles/centralizedDistributedAnimation.css";

// Shared device lanes for the centralized diagram (y positions).
const CENTRAL_Y = { 1: 60, 2: 130, 3: 200 };

// Device columns for the distributed diagram (x centers).
const DIST_DEVICES = [
  { n: 1, cx: 130, label: "Priority 1 (Highest)" },
  { n: 2, cx: 300, label: "Priority 2" },
  { n: 3, cx: 470, label: "Priority 3" },
];

const STEPS = {
  centralized: [
    "Every device sends its bus request (BR) to one central arbiter.",
    "The arbiter compares all requests in a single place and picks the highest priority.",
    "It returns a grant (BG) to the winning device; the others keep waiting.",
  ],
  distributed: [
    "Each device places its own priority code onto the shared arbitration lines.",
    "Every device compares the lines with its own priority — there is no central unit.",
    "Lower-priority devices withdraw; the highest-priority device wins the bus.",
  ],
};

function CentralizedDiagram({ winner }) {
  const winnerY = CENTRAL_Y[winner];
  return (
    <svg viewBox="0 0 600 260" className="diagram" role="img" aria-label="Centralized arbitration diagram">
      <line x1="150" y1="60" x2="360" y2="60" className="wire" />
      <line x1="150" y1="130" x2="360" y2="130" className="wire" />
      <line x1="150" y1="200" x2="360" y2="200" className="wire" />

      <line x1="360" y1={winnerY} x2="150" y2={winnerY} className="grant" />

      {[60, 130, 200].map((y, i) => (
        <g key={i}>
          <circle r="5" className="packet" style={{ opacity: 0 }}>
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
              keyTimes="0;0.125;0.3125;1"
              keyPoints="0;0;1;1"
              path={`M150 ${y} L360 ${y}`}
            />
            <animate
              attributeName="opacity"
              dur="8s"
              repeatCount="indefinite"
              keyTimes="0;0.124;0.125;0.3125;0.326;1"
              values="0;0;1;1;0;0"
            />
          </circle>
        </g>
      ))}

      <circle key={winner} r="5" className="grantPacket" style={{ opacity: 0 }}>
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          calcMode="linear"
          keyTimes="0;0.5;0.6875;1"
          keyPoints="0;0;1;1"
          path={`M360 ${winnerY} L150 ${winnerY}`}
        />
        <animate
          attributeName="opacity"
          dur="8s"
          repeatCount="indefinite"
          keyTimes="0;0.499;0.5;0.6875;0.6885;1"
          values="0;0;1;1;0;0"
        />
      </circle>

      {[1, 2, 3].map((n) => (
        <g key={n} className={winner === n ? "device active" : "device"}>
          <rect x="20" y={CENTRAL_Y[n] - 22} width="110" height="44" rx="8" className="device-box" />
          <text x="75" y={CENTRAL_Y[n] + 5} textAnchor="middle" className="device-label">
            Device {n}
          </text>
        </g>
      ))}

      <g className="arbiter">
        <rect x="380" y="65" width="180" height="130" rx="12" className="arbiter-box" />
        <text x="470" y="128" textAnchor="middle" className="arbiter-label">ARBITER</text>
        <text x="470" y="150" textAnchor="middle" className="arbiter-sub">one shared unit</text>
      </g>
    </svg>
  );
}

function DistributedDiagram({ winner }) {
  const busY = 60;
  const deviceTop = 200;
  return (
    <svg viewBox="0 0 600 300" className="diagram" role="img" aria-label="Distributed arbitration diagram">
      {/* Shared arbitration bus */}
      <text x="300" y="34" textAnchor="middle" className="cd-bus-label">Shared Arbitration Lines</text>
      <line x1="60" y1={busY} x2="540" y2={busY} className="cd-bus" />

      {/* Compare pulse on the shared bus (phase 2) */}
      <line key={`bus-${winner}`} x1="60" y1={busY} x2="540" y2={busY} className="cd-bus-glow">
        <animate
          attributeName="opacity"
          dur="9s"
          repeatCount="indefinite"
          keyTimes="0;0.22;0.24;0.44;0.46;1"
          values="0;0;1;1;0;0"
        />
        <animate
          attributeName="stroke-width"
          dur="9s"
          repeatCount="indefinite"
          keyTimes="0;0.22;0.33;0.44;1"
          values="4;4;9;4;4"
        />
      </line>

      {DIST_DEVICES.map((d) => {
        const isWinner = d.n === winner;
        return (
          <g key={`${d.n}-${winner}`}>
            {/* Connector from device up to the shared bus */}
            <line
              x1={d.cx}
              y1={deviceTop}
              x2={d.cx}
              y2={busY}
              className={isWinner ? "cd-connector cd-connector--win" : "cd-connector"}
            >
              {!isWinner && (
                <animate
                  attributeName="opacity"
                  dur="9s"
                  repeatCount="indefinite"
                  keyTimes="0;0.44;0.66;1"
                  values="0.9;0.9;0.2;0.2"
                />
              )}
            </line>

            {/* Request/ID packet asserted onto the shared lines (phase 1) */}
            <circle r="6" className="req-packet" style={{ opacity: 0 }}>
              <animateMotion
                dur="9s"
                repeatCount="indefinite"
                calcMode="linear"
                keyTimes="0;0.2;1"
                keyPoints="0;1;1"
                path={`M${d.cx} ${deviceTop} L${d.cx} ${busY}`}
              />
              <animate
                attributeName="opacity"
                dur="9s"
                repeatCount="indefinite"
                keyTimes="0;0.01;0.2;0.24;1"
                values="0;1;1;0;0"
              />
            </circle>

            {/* Winner keeps the bus — grant pulse travels back down (phase 3) */}
            {isWinner && (
              <circle r="6" className="cd-own-packet" style={{ opacity: 0 }}>
                <animateMotion
                  dur="9s"
                  repeatCount="indefinite"
                  calcMode="linear"
                  keyTimes="0;0.66;0.82;1"
                  keyPoints="0;0;1;1"
                  path={`M${d.cx} ${busY} L${d.cx} ${deviceTop}`}
                />
                <animate
                  attributeName="opacity"
                  dur="9s"
                  repeatCount="indefinite"
                  keyTimes="0;0.659;0.66;0.82;0.83;1"
                  values="0;0;1;1;0;0"
                />
              </circle>
            )}

            {/* Device with its own arbitration logic */}
            <g className={isWinner ? "node dist-node active" : "node dist-node"}>
              <rect x={d.cx - 60} y={deviceTop} width="120" height="70" rx="10" className="node-box">
                {!isWinner && (
                  <animate
                    attributeName="opacity"
                    dur="9s"
                    repeatCount="indefinite"
                    keyTimes="0;0.44;0.66;1"
                    values="1;1;0.35;0.35"
                  />
                )}
              </rect>
              <text x={d.cx} y={deviceTop + 28} textAnchor="middle" className="node-label">Device {d.n}</text>
              <text x={d.cx} y={deviceTop + 46} textAnchor="middle" className="node-sub">{d.label}</text>
              <text x={d.cx} y={deviceTop + 62} textAnchor="middle" className="node-logic">own arbiter logic</text>
            </g>

            {/* Winner / withdraw status tag */}
            <text
              x={d.cx}
              y={deviceTop - 12}
              textAnchor="middle"
              className={isWinner ? "dist-status dist-status--win" : "dist-status dist-status--out"}
            >
              <animate
                attributeName="opacity"
                dur="9s"
                repeatCount="indefinite"
                keyTimes="0;0.66;0.68;1"
                values="0;0;1;1"
              />
              {isWinner ? "WINS BUS" : "withdraws"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function CentralizedDistributedAnimation() {
  const [mode, setMode] = useState("centralized");
  const [winner, setWinner] = useState(1);

  // Rotate the winning device so the diagram stays lively and shows fairness
  // over time. Winner change restarts the SMIL packets via React keys.
  useEffect(() => {
    const interval = setInterval(() => {
      setWinner((prev) => (prev % 3) + 1);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cd-container">
      <div className="cd-toggle" role="tablist" aria-label="Arbitration architecture">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "centralized"}
          className={mode === "centralized" ? "cd-toggle__btn is-active" : "cd-toggle__btn"}
          onClick={() => setMode("centralized")}
        >
          Centralized
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "distributed"}
          className={mode === "distributed" ? "cd-toggle__btn is-active" : "cd-toggle__btn"}
          onClick={() => setMode("distributed")}
        >
          Distributed
        </button>
      </div>

      <h3 className="cd-title">
        {mode === "centralized" ? "Centralized Arbitration" : "Distributed Arbitration"}
      </h3>
      <p className="cd-subtitle">
        {mode === "centralized"
          ? "One dedicated arbiter decides for everyone."
          : "No central arbiter — the devices decide among themselves."}
      </p>

      <div className="cd-stage">
        {mode === "centralized" ? (
          <CentralizedDiagram winner={winner} />
        ) : (
          <DistributedDiagram winner={winner} />
        )}
      </div>

      <div className="cd-legend">
        <span className="cd-legend__item">
          <span className="cd-legend__swatch cd-legend__swatch--req" /> Request / ID asserted
        </span>
        <span className="cd-legend__item">
          <span className="cd-legend__swatch cd-legend__swatch--grant" /> Bus granted (winner)
        </span>
      </div>

      <ol className="cd-steps">
        {STEPS[mode].map((step, i) => (
          <li key={i} className="cd-step">{step}</li>
        ))}
      </ol>
    </div>
  );
}
