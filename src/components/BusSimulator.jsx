import { useState, useEffect } from "react";

/*
FIXED PRIORITY
Has a 'fixed priority order', cpu goes before dma, dma goes before disk
Runs through the PRIORITY_ORDER array, selects the first one they find (it's of higher priority)
*/
const PRIORITY_ORDER = ["cpu", "dma", "disk"];
function resolveFixedPriority(requestingIds) {
	return PRIORITY_ORDER.find((id) => requestingIds.includes(id)) ?? null;
}

/*
ROUND ROBIN
*/
function resolveRoundRobin(requestingIds, lastGrantedIndex) {
	for (let i = 1; i <= PRIORITY_ORDER.length; i++){
		const candidate = PRIORITY_ORDER[(lastGrantedIndex + i) % PRIORITY_ORDER.length];
		if (requestingIds.includes(candidate)){
			return candidate;
		}
	}
	return null;
}

/*
DAISY CHAIN
Same logic as fixed priority.
daisy chains priority order is determined by physical chain connection, just so happens its the same order as fixed
*/
function resolveDaisyChain(requestingIds) {
  return PRIORITY_ORDER.find((id) => requestingIds.includes(id)) ?? null;
}

export default function BusSimulator() {
	// Whats the current mode being used. defaults to fixed priority
	const [mode, setMode] = useState("fixed");

	// statuses of each device: idle, requesting, granted, denied
	const [devices, setDevices] = useState({
		cpu: "idle",
		dma: "idle",
		disk: "idle",
	});

	// Record the last winner for Round Robin
	const [lastGrantedIndex, setLastGrantedIndex] = useState(-1);

	// log at the bottom that notes all taken actions
	const [log, setLog] = useState([]);

	// Adds messages to log
	function addLog(message) {
		setLog((currLog) => [...currLog, message]);
	}

	// clears log
	function handleClearLog() {
		setLog([]);
	}

	// Sets device state to requesting if request button is pressed
	function handleRequest(id) {
		setDevices((currDevices) => ({ ...currDevices, [id]: "requesting" }));
		addLog(`${id.toUpperCase()} requested the bus.`);
	}

	// handles arbitrate button, changes statuses to grant/denied, uses arbbus algos to determine winner
	function handleArbitrate() {
		// gets all requesting devices, determines winner
		const requestingIds = Object.keys(devices).filter((id) => devices[id] === "requesting");

		let winner = null;

		if (mode === "fixed") {
			winner = resolveFixedPriority(requestingIds);
		} else if (mode === "roundrobin") {
			winner = resolveRoundRobin(requestingIds, lastGrantedIndex);
		} else if (mode === "daisychain") {
			winner = resolveDaisyChain(requestingIds);
		}

		if (!winner){
			addLog("Arbitrate pressed, but no devices are requesting.");
			return;
		}

		// Record the last device to be granted
		setLastGrantedIndex(PRIORITY_ORDER.indexOf(winner));

		// if device won, give it granted status, ortherwise denied
		setDevices((currDevices) => {
			const updDevices = { ...currDevices };
			Object.keys(updDevices).forEach((id) => {
				if (id === winner) updDevices[id] = "granted";
				else if (updDevices[id] === "requesting") updDevices[id] = "denied";
			});
			return updDevices;
		});

		addLog(`${winner.toUpperCase()} granted the bus.`);
	}

	// implements useEffect, when the devices are granted they have a 2 second timer then go back to idle
	useEffect(() => {
		const grantedId = Object.keys(devices).find((id) => devices[id] === "granted");
		const deniedIds = Object.keys(devices).filter((id) => devices[id] === "denied");

		// no devices with granted or denied status, nothing to do
		if (!grantedId && deniedIds.length === 0) return;

		const timer = setTimeout(() => {
			setDevices((currDevices) => {
				const updDevices = { ...currDevices };
				if (grantedId) updDevices[grantedId] = "idle";
				deniedIds.forEach((id) => {
					updDevices[id] = "idle";
				});
				return updDevices;
			});
			addLog(`${grantedId.toUpperCase()} released the bus.`);
		}, 2000);

		return () => clearTimeout(timer);
	}, [devices]);

	return (
		<div>
			<h3>Bus Simulator</h3>
			<select value={mode} onChange={(e) => setMode(e.target.value)}>
				<option value="fixed">Fixed Priority</option>
				<option value="roundrobin">Round Robin</option>
				<option value="daisychain">Daisy Chain</option>
			</select>
			<button onClick={handleArbitrate}>Arbitrate</button>
			<p>CPU: {devices.cpu}</p>
			<p>DMA: {devices.dma}</p>
			<p>Disk I/O: {devices.disk}</p>
			<button onClick={() => handleRequest("cpu")}>CPU: Request Bus</button>
			<button onClick={() => handleRequest("dma")}>DMA: Request Bus</button>
			<button onClick={() => handleRequest("disk")}>Disk I/O: Request Bus</button>

			<div>
				<h4>Transaction Log</h4>
				<button onClick={handleClearLog}>Clear Log</button>
				{log.length === 0 && <p>No activity yet.</p>}
				{log.map((message, i) => (
					<p key={i}>{message}</p>
				))}
			</div>
		</div>
	);
}
