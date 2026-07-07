import { useState } from "react";

export default function BusSimulator() {
	const [devices, setDevices] = useState({
		cpu: "idle",
		dma: "idle",
		disk: "idle",
	});

	function handleRequest(id) {
		setDevices((prev) => ({ ...prev, [id]: "requesting" }));
	}

	return (
		<div>
			<h3>Bus Simulator</h3>
			<p>CPU: {devices.cpu}</p>
			<p>DMA: {devices.dma}</p>
			<p>Disk I/O: {devices.disk}</p>
			<button onClick={() => handleRequest("cpu")}>CPU: Request Bus</button>
			<button onClick={() => handleRequest("dma")}>DMA: Request Bus</button>
			<button onClick={() => handleRequest("disk")}>Disk I/O: Request Bus</button>
		</div>
	);
}