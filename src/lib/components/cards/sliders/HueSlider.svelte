<script lang="ts">
	interface Props {
		value: number;
		disabled?: boolean;
		ondragend?: () => void;
	}

	let { value = $bindable(), disabled = false, ondragend }: Props = $props();

	function handleChange() {
		if (ondragend) {
			ondragend();
		}
	}
</script>

<input
	type="range"
	bind:value
	min="0"
	max="359"
	step="0.01"
	{disabled}
	onchange={handleChange}
	class="custom-hue-slider"
	aria-label="Hue"
/>

<style>
	.custom-hue-slider {
		width: 100%;
		height: 1.5rem;
		background: transparent; /* Essential for custom track styling */
		cursor: pointer;
		-webkit-appearance: none; /* Remove default WebKit appearance */
		appearance: none; /* Remove default appearance */
		padding: 0;
		margin: 0;
		vertical-align: middle; /* Helps with alignment in some layouts */
	}

	.custom-hue-slider:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.custom-hue-slider:focus {
		outline: none; /* Remove default focus outline, custom style below */
	}

	/* --- WebKit (Chrome, Safari, newer Edge, Opera) --- */
	.custom-hue-slider::-webkit-slider-runnable-track {
		width: 100%;
		height: 1.5rem;
		background: linear-gradient(
			to right,
			hsl(0, 100%, 50%),
			hsl(60, 100%, 50%),
			hsl(120, 100%, 50%),
			hsl(180, 100%, 50%),
			hsl(240, 100%, 50%),
			hsl(300, 100%, 50%),
			hsl(360, 100%, 50%)
		);
		border-radius: 10px;
		border: none;
	}

	.custom-hue-slider::-webkit-slider-thumb {
		-webkit-appearance: none; /* Required to style thumb */
		appearance: none;
		width: 1.25rem;
		height: 1.25rem;
		background-color: white;
		border: none;
		border-radius: 50%;
		margin-top: 0.125rem; /* (track - thumb) / 2 */
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}

	/* --- Firefox --- */
	.custom-hue-slider::-moz-range-track {
		width: 100%;
		height: 1.5rem;
		background: linear-gradient(
			to right,
			hsl(0, 100%, 50%),
			hsl(60, 100%, 50%),
			hsl(120, 100%, 50%),
			hsl(180, 100%, 50%),
			hsl(240, 100%, 50%),
			hsl(300, 100%, 50%),
			hsl(360, 100%, 50%)
		);
		border-radius: 10px;
		border: white;
	}

	.custom-hue-slider::-moz-range-thumb {
		width: 1.25rem;
		height: 1.25rem;
		background-color: white;
		border: none;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}
</style>
