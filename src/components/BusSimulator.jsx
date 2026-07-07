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

export default function BusSimulator() {
	const [devices, setDevices] = useState({
		cpu: "idle",
		dma: "idle",
		disk: "idle",
	});

	// Sets device state to requesting if request button is pressed
	function handleRequest(id) {
		setDevices((currDevices) => ({ ...currDevices, [id]: "requesting" }));
	}

	// handles arbitrate button, changes statuses to grant/denied, uses arbbus algos to determine winner
	function handleArbitrate() {
		// gets all requesting devices, determines winner
		const requestingIds = Object.keys(devices).filter((id) => devices[id] === "requesting");
		const winner = resolveFixedPriority(requestingIds);
		if (!winner) return;

		// if device won, give it granted status, ortherwise denied
		setDevices((currDevices) => {
			const updDevices = { ...currDevices };
			Object.keys(updDevices).forEach((id) => {
				if (id === winner) updDevices[id] = "granted";
				else if (updDevices[id] === "requesting") updDevices[id] = "denied";
			});
			return updDevices;
		});
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
		}, 2000);

		return () => clearTimeout(timer);
	}, [devices]);

	return (
		<div>
			<h3>Bus Simulator</h3>
			<button onClick={handleArbitrate}>Arbitrate</button>
			<p>CPU: {devices.cpu}</p>
			<p>DMA: {devices.dma}</p>
			<p>Disk I/O: {devices.disk}</p>
			<button onClick={() => handleRequest("cpu")}>CPU: Request Bus</button>
			<button onClick={() => handleRequest("dma")}>DMA: Request Bus</button>
			<button onClick={() => handleRequest("disk")}>Disk I/O: Request Bus</button>
		</div>
	);
}