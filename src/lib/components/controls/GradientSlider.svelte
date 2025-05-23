<script lang="ts">
	interface Props {
		value: number;
		disabled?: boolean;
		ariaLabel?: string;
		gradient?: string;
		min?: number;
		max?: number;
		step?: number;
		ondragend?: () => void;
	}

	let {
		value = $bindable(),
		disabled = false,
		ariaLabel,
		gradient,
		min,
		max,
		step,
		ondragend
	}: Props = $props();

	const DEFAULT_GRADIENT =
		'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))';

	let trackBackground = $derived(gradient ?? DEFAULT_GRADIENT);

	function handleChange() {
		if (ondragend) {
			ondragend();
		}
	}
</script>

<input
	type="range"
	bind:value
	{min}
	{max}
	{step}
	{disabled}
	onchange={handleChange}
	class="custom-slider"
	aria-label={ariaLabel}
	style:--slider-track-background={trackBackground}
/>

<style>
	.custom-slider {
		width: 100%;
		height: 1.5rem; /* This is the overall component height, not the track */
		background: transparent; /* Essential for custom track styling */
		cursor: pointer;
		-webkit-appearance: none; /* Remove default WebKit appearance */
		appearance: none; /* Remove default appearance */
		padding: 0;
		margin: 0;
		vertical-align: middle; /* Helps with alignment in some layouts */

		--slider-track-height: 0.5rem; /* Default track height */
		--slider-thumb-height: 1.25rem; /* Thumb height */
	}

	.custom-slider:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.custom-slider:focus {
		outline: none; /* Remove default focus outline, custom style below */
	}

	/* --- WebKit (Chrome, Safari, newer Edge, Opera) --- */
	.custom-slider::-webkit-slider-runnable-track {
		width: 100%;
		height: var(--slider-track-height);
		background: var(--slider-track-background);
		border-radius: 10px;
		border: none;
	}

	.custom-slider::-webkit-slider-thumb {
		-webkit-appearance: none; /* Required to style thumb */
		appearance: none;
		width: var(--slider-thumb-height);
		height: var(--slider-thumb-height);
		background-color: white;
		border: none;
		border-radius: 50%;
		/* Vertically center the thumb on the track */
		margin-top: calc((var(--slider-track-height) - var(--slider-thumb-height)) / 2);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}

	/* --- Firefox --- */
	.custom-slider::-moz-range-track {
		width: 100%;
		height: var(--slider-track-height);
		background: var(--slider-track-background);
		border-radius: 10px;
		border: white;
	}

	.custom-slider::-moz-range-thumb {
		width: var(--slider-thumb-height);
		height: var(--slider-thumb-height);
		background-color: white;
		border: none;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
</style>
