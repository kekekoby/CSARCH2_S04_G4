import { useEffect, useState } from "react";
import "../styles/centralizedDistributedAnimation.css";

export default function CentralizedDistributedAnimation() {
  const [mode, setMode] = useState("centralized");
  const [winner, setWinner] = useState(1); // 1, 2, or 3 — which device the arbiter grants

  useEffect(() => {
    const interval = setInterval(() => {
      setMode((prev) => (prev === "centralized" ? "distributed" : "centralized"));
      setWinner((prev) => (prev % 3) + 1); // rotates 1 -> 2 -> 3 -> 1 ...
    }, 8000); // was 5000 — gives the request/grant sequence room to read clearly

    return () => clearInterval(interval);
  }, []);

  // Device wire y-positions, keyed by device number. Single source of truth
  // so the SVG boxes, wires, and packets can never drift apart.
  const deviceY = { 1: 60, 2: 130, 3: 200 };
  const winnerY = deviceY[winner];

  return (
    <div className="cd-container">
      <h3 className="cd-title">
        {mode === "centralized" ? "Centralized Arbitration" : "Distributed Arbitration"}
      </h3>

      {mode === "centralized" ? (
        <div className="centralized">
          <svg viewBox="0 0 600 260" className="diagram">
            {/* Wires */}
            <line x1="150" y1="60" x2="360" y2="60" className="wire" />
            <line x1="150" y1="130" x2="360" y2="130" className="wire" />
            <line x1="150" y1="200" x2="360" y2="200" className="wire" />

            {/* Grant wire — drawn to the current winner's lane */}
            <line x1="360" y1={winnerY} x2="150" y2={winnerY} className="grant" />

            {/* Request Packets — a single scripted 8s cycle (matches the
                mode-switch interval, so each centralized mount plays exactly
                one full cycle): pause 0–1s, travel 1–2.5s, then invisible/
                paused for the rest of the loop while the grant happens. */}
            <circle r="5" className="packet p1" style={{ opacity: 0 }}>
              <animateMotion
                dur="8s"
                repeatCount="indefinite"
                calcMode="linear"
                keyTimes="0;0.125;0.3125;1"
                keyPoints="0;0;1;1"
                path="M150 60 L360 60"
              />
              <animate
                attributeName="opacity"
                dur="8s"
                repeatCount="indefinite"
                keyTimes="0;0.124;0.125;0.3125;0.326;1"
                values="0;0;1;1;0;0"
              />
            </circle>
            <circle r="5" className="packet p2" style={{ opacity: 0 }}>
              <animateMotion
                dur="8s"
                repeatCount="indefinite"
                calcMode="linear"
                keyTimes="0;0.125;0.3125;1"
                keyPoints="0;0;1;1"
                path="M150 130 L360 130"
              />
              <animate
                attributeName="opacity"
                dur="8s"
                repeatCount="indefinite"
                keyTimes="0;0.124;0.125;0.3125;0.326;1"
                values="0;0;1;1;0;0"
              />
            </circle>
            <circle r="5" className="packet p3" style={{ opacity: 0 }}>
              <animateMotion
                dur="8s"
                repeatCount="indefinite"
                calcMode="linear"
                keyTimes="0;0.125;0.3125;1"
                keyPoints="0;0;1;1"
                path="M150 200 L360 200"
              />
              <animate
                attributeName="opacity"
                dur="8s"
                repeatCount="indefinite"
                keyTimes="0;0.124;0.125;0.3125;0.326;1"
                values="0;0;1;1;0;0"
              />
            </circle>

            {/* Grant Packet — same 8s cycle, but its window sits later:
                pause until 4s, travel 4–5.5s, then pause until the cycle
                (and the mode) resets at 8s. `key` restarts SMIL when the
                winner changes. */}
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

            {/* Devices — real SVG elements, positioned in the same
                coordinate space as the wires above (device y - box height/2). */}
            {[1, 2, 3].map((n) => (
              <g key={n} className={winner === n ? "device active" : "device"}>
                <rect x="20" y={deviceY[n] - 22} width="110" height="44" rx="8" className="device-box" />
                <text x="75" y={deviceY[n] + 5} textAnchor="middle" className="device-label">
                  Device {n}
                </text>
              </g>
            ))}

            {/* Arbiter */}
            <g className="arbiter">
              <rect x="380" y="65" width="180" height="130" rx="12" className="arbiter-box" />
              <text x="470" y="135" textAnchor="middle" className="arbiter-label">
                ARBITER
              </text>
            </g>
          </svg>

        </div>
      ) : (
        <div className="distributed">
          <svg viewBox="0 0 600 260" className="diagram">
            <line x1="170" y1="70" x2="430" y2="70" className="wire" />
            <line x1="430" y1="70" x2="430" y2="190" className="wire" />
            <line x1="430" y1="190" x2="170" y2="190" className="wire" />
            <line x1="170" y1="190" x2="170" y2="70" className="wire" />

            <circle r="5" className="packet">
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                path="M170 70 L430 70 L430 190 L170 190 Z"
              />
            </circle>

            {/* Nodes — centered exactly on the wire-rectangle corners */}
            <g className="node">
              <rect x="120" y="50" width="100" height="40" rx="8" className="node-box" />
              <text x="170" y="75" textAnchor="middle" className="node-label">Device 1</text>
            </g>
            <g className="node">
              <rect x="380" y="50" width="100" height="40" rx="8" className="node-box" />
              <text x="430" y="75" textAnchor="middle" className="node-label">Device 2</text>
            </g>
            <g className="node">
              <rect x="380" y="170" width="100" height="40" rx="8" className="node-box" />
              <text x="430" y="195" textAnchor="middle" className="node-label">Device 3</text>
            </g>
            <g className="node">
              <rect x="120" y="170" width="100" height="40" rx="8" className="node-box" />
              <text x="170" y="195" textAnchor="middle" className="node-label">Device 4</text>
            </g>
          </svg>

          <p className="caption">Devices negotiate with each other. No central arbiter.</p>
        </div>
      )}
    </div>
  );
}