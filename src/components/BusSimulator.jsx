import { useState } from "react";

export default function BusSimulator() {
	const [devices, setDevices] = useState({
		cpu: "idle",
		dma: "idle",
		disk: "idle",
	});

	return (
		<div>
			<h3>Bus Simulator</h3>
			<p>CPU: {devices.cpu}</p>
			<p>DMA: {devices.dma}</p>
			<p>Disk I/O: {devices.disk}</p>
			<button>CPU: Request Bus</button>
			<button>DMA: Request Bus</button>
			<button>Disk I/O: Request Bus</button>
		</div>
	);
}