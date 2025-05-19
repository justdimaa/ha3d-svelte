<script lang="ts">
	interface Props {
		value: number;
		hue: number;
		saturation: number;
		isColorActive: boolean;
		disabled?: boolean;
		ondragend?: () => void;
	}

	let {
		value = $bindable(), // Current brightness (0-255)
		hue, // Current hue (0-360)
		saturation, // Current saturation (0-100)
		isColorActive,
		disabled = false,
		ondragend
	}: Props = $props();

	// Derived state for track gradient
	const gradientStyle = $derived(() => {
		if (isColorActive) {
			return `linear-gradient(to right, hsl(${hue}, 0%, 0%), hsl(${hue}, ${saturation}%, 50%))`;
		} else {
			// Grayscale brightness gradient
			return `linear-gradient(to right, hsl(0, 0%, 0%), hsl(0, 0%, 100%))`;
		}
	});

	function handleChange() {
		if (ondragend) {
			ondragend();
		}
	}
</script>

<input
	type="range"
	bind:value
	min="2"
	max="255"
	step="0.01"
	{disabled}
	onchange={handleChange}
	class="brightness-range-slider"
	style="--track-gradient: {gradientStyle()};"
	aria-label="Brightness"
/>

<style>
	.brightness-range-slider {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		width: 100%;
		height: 1.5rem;
		background: transparent;
		cursor: pointer;
		padding: 0;
		margin: 0;
		touch-action: pan-y;
	}

	.brightness-range-slider:focus {
		outline: none;
	}

	.brightness-range-slider:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* WebKit (Chrome, Safari, Edge) */
	.brightness-range-slider::-webkit-slider-runnable-track {
		width: 100%;
		height: 1.5rem;
		background: var(--track-gradient);
		border-radius: 10px;
		border: none;
	}

	.brightness-range-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 1.25rem;
		height: 1.25rem;
		background-color: white;
		border: none;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		margin-top: 0.125rem; /* (track - thumb) / 2 */
		cursor: pointer;
	}

	.brightness-range-slider:disabled::-webkit-slider-thumb {
		background-color: #f0f0f0;
		border-color: #b0b0b0;
	}

	/* Mozilla Firefox */
	.brightness-range-slider::-moz-range-track {
		width: 100%;
		height: 1.5rem;
		background: var(--track-gradient);
		border-radius: 10px;
		border: none;
	}

	.brightness-range-slider::-moz-range-thumb {
		-moz-appearance: none;
		appearance: none;
		width: 1.25rem;
		height: 1.25rem;
		background-color: white;
		border: none;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}

	.brightness-range-slider:disabled::-moz-range-thumb {
		background-color: #f0f0f0;
		border-color: #b0b0b0;
	}
</style>
