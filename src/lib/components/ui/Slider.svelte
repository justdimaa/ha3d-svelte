<script lang="ts">
	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		unit?: string;
		gradient?: string;
		debounceMs?: number;
		onchange?: (value: number) => void;
		oninput?: (value: number) => void;
		disabled?: boolean;
		labelWidth?: string;
		valueWidth?: string;
		displayValue?: number;
	}

	let {
		label,
		value = 0,
		min = 0,
		max = 100,
		step = 1,
		unit = '',
		gradient = 'linear-gradient(to right, #cbd5e1 0%, #60a5fa 50%, #e2e8f0 100%)',
		debounceMs = 300,
		onchange,
		oninput,
		disabled = false,
		labelWidth = 'w-16',
		valueWidth = 'w-8',
		displayValue // If provided, this will be shown instead of value
	}: Props = $props();

	let debounceTimeout: NodeJS.Timeout | undefined = $state(undefined);

	const handleInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const newValue = parseFloat(target.value);

		// Call immediate input handler if provided
		oninput?.(newValue);

		// Handle debounced change
		if (onchange) {
			clearTimeout(debounceTimeout);
			debounceTimeout = setTimeout(() => {
				onchange(newValue);
			}, debounceMs);
		}
	};

	const handleChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const newValue = parseFloat(target.value);

		// Clear any pending debounced calls and call immediately
		clearTimeout(debounceTimeout);
		onchange?.(newValue);
	};

	const formatValue = (val: number) => {
		return `${Math.round(val)}${unit}`;
	};

	// Use displayValue if provided, otherwise use value
	const valueToDisplay = $derived(displayValue !== undefined ? displayValue : value);
</script>

<div class="flex items-center gap-2">
	<span class="{labelWidth} text-xs text-gray-500 dark:text-gray-400">{label}</span>
	<input
		type="range"
		{min}
		{max}
		{step}
		{value}
		{disabled}
		oninput={handleInput}
		onchange={handleChange}
		class="slider h-1 w-full flex-1 cursor-pointer appearance-none rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
		style="background: {gradient};"
	/>
	<span class="{valueWidth} text-right text-xs text-gray-500 dark:text-gray-400"
		>{formatValue(valueToDisplay)}</span
	>
</div>

<style>
	/* Custom slider styling */
	.slider {
		background: transparent;
	}

	.slider::-webkit-slider-thumb {
		appearance: none;
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: #ffffff;
		border: 2px solid #6b7280;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.slider::-moz-range-thumb {
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: #ffffff;
		border: 2px solid #6b7280;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: none;
	}

	.slider::-webkit-slider-track {
		height: 8px;
		border-radius: 4px;
	}

	.slider::-moz-range-track {
		height: 8px;
		border-radius: 4px;
		border: none;
	}

	.slider:disabled::-webkit-slider-thumb {
		background: #9ca3af;
		border-color: #9ca3af;
	}

	.slider:disabled::-moz-range-thumb {
		background: #9ca3af;
		border-color: #9ca3af;
	}
</style>
