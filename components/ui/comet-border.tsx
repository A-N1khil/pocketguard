export default function CometBorder() {
	return (
		<svg
			className="pointer-events-none absolute inset-0 size-full overflow-visible"
			preserveAspectRatio="none"
		>
			<rect
				x="1"
				y="1"
				width="calc(100% - 2px)"
				height="calc(100% - 2px)"
				rx="6"
				fill="none"
				stroke="#22c55e"
				strokeWidth="2"
				pathLength="100"
				strokeDasharray="60 40"
				strokeLinecap="round"
				className="animate-comet drop-shadow-[0_0_4px_#22c55e]"
			/>
		</svg>
	);
}
