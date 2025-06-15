<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiLightbulb, mdiPalette, mdiThermometer } from '@mdi/js';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import CardBase from './CardBase.svelte';
	import { homeApi } from '$lib/shared/stores/global';
	import Slider from '$lib/shared/components/Slider.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	const isOn = $derived(entity.state === 'on');
	const brightness = $derived(entity.attributes.brightness || 0);
	const brightnessPercent = $derived(Math.round((brightness / 255) * 100));
	const colorMode = $derived(entity.attributes.color_mode);

	const colorTempK = $derived(entity.attributes.color_temp_kelvin);
	const minColorTempK = $derived(entity.attributes.min_color_temp_kelvin);
	const maxColorTempK = $derived(entity.attributes.max_color_temp_kelvin);

	const rgbColor = $derived(entity.attributes.rgb_color);
	const hsColor = $derived(entity.attributes.hs_color);
	const supportedColorModes = $derived(entity.attributes.supported_color_modes || []);

	// Get hue and saturation values
	const hue = $derived(hsColor && Array.isArray(hsColor) ? hsColor[0] : 0);
	const saturation = $derived(hsColor && Array.isArray(hsColor) ? hsColor[1] : 0);

	// Check if light supports both color and color temp
	const supportsColor = $derived(
		supportedColorModes.some((mode: string) => ['rgb', 'rgbw', 'rgbww', 'hs', 'xy'].includes(mode))
	);
	const supportsColorTemp = $derived(supportsColor || supportedColorModes.includes('color_temp'));
	const supportsBothModes = $derived(supportsColor && supportsColorTemp);

	const handleToggle = async () => {
		console.log('Toggling light:', entity.entity_id);
		// TODO: Call Home Assistant service to toggle light
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service: isOn ? 'turn_off' : 'turn_on',
			service_data: { entity_id: entity.entity_id }
		});
	};

	// Mode switching functions
	const switchToColorMode = async () => {
		if (supportsColor && hsColor) {
			console.log('Switching to color mode:', entity.entity_id);
			await $homeApi?.sendMessagePromise({
				type: 'call_service',
				domain: 'light',
				service: 'turn_on',
				service_data: {
					entity_id: entity.entity_id,
					hs_color: [hue, saturation]
				}
			});
		}
	};

	const switchToTempMode = async () => {
		if (supportsColorTemp) {
			console.log('Switching to temperature mode:', entity.entity_id);
			await $homeApi?.sendMessagePromise({
				type: 'call_service',
				domain: 'light',
				service: 'turn_on',
				service_data: {
					entity_id: entity.entity_id,
					color_temp: colorTempK || 3500 // Use current temp or default to neutral
				}
			});
		}
	};

	// Get RGB color for display
	const getRgbColor = () => {
		if (rgbColor && Array.isArray(rgbColor) && rgbColor.length === 3) {
			return `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`;
		}
		return '#fbbf24'; // Default yellow
	};

	// Get color temperature description
	const getColorTempDescription = (temp: number) => {
		if (temp < 3000) return 'Warm';
		if (temp < 4000) return 'Neutral';
		return 'Cool';
	};

	// Convert HSL to RGB for slider backgrounds
	const hslToRgb = (h: number, s: number, l: number) => {
		h /= 360;
		s /= 100;
		l /= 100;

		const a = s * Math.min(l, 1 - l);
		const f = (n: number) => {
			const k = (n + h * 12) % 12;
			return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		};

		return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
	};

	// Get hue gradient for slider background
	const getHueGradient = () => {
		const colors = [];
		for (let i = 0; i <= 360; i += 60) {
			const [r, g, b] = hslToRgb(i, 100, 50);
			colors.push(`rgb(${r}, ${g}, ${b})`);
		}
		return `linear-gradient(to right, ${colors.join(', ')})`;
	};

	// Get saturation gradient for slider background
	const getSaturationGradient = () => {
		const [r1, g1, b1] = hslToRgb(hue, 0, 50);
		const [r2, g2, b2] = hslToRgb(hue, 100, 50);
		return `linear-gradient(to right, rgb(${r1}, ${g1}, ${b1}), rgb(${r2}, ${g2}, ${b2}))`;
	};

	// Get color temperature gradient
	const getColorTempGradient = () => {
		return 'linear-gradient(to right, #ff9500, #ffffff, #b3d9ff)';
	};

	// Handle slider changes
	const handleBrightnessChange = async (newBrightness: number) => {
		const brightness = Math.round((newBrightness / 100) * 255);
		console.log('Changing brightness:', entity.entity_id, brightness);
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service: 'turn_on',
			service_data: {
				entity_id: entity.entity_id,
				brightness: brightness
			}
		});
	};

	const handleHueChange = async (newHue: number) => {
		console.log('Changing hue:', entity.entity_id, newHue);
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service: 'turn_on',
			service_data: {
				entity_id: entity.entity_id,
				hs_color: [newHue, saturation]
			}
		});
	};

	const handleSaturationChange = async (newSaturation: number) => {
		console.log('Changing saturation:', entity.entity_id, newSaturation);
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service: 'turn_on',
			service_data: {
				entity_id: entity.entity_id,
				hs_color: [hue, newSaturation]
			}
		});
	};

	const handleColorTempChange = async (newColorTemp: number) => {
		console.log('Changing color temp:', entity.entity_id, newColorTemp);
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service: 'turn_on',
			service_data: {
				entity_id: entity.entity_id,
				color_temp_kelvin: newColorTemp
			}
		});
	};
</script>

<CardBase {entity} icon={mdiLightbulb} showToggle={true} toggleState={isOn} onToggle={handleToggle}>
	{#if isOn}
		<!-- Brightness slider -->
		{#if brightness > 0}
			<div class="space-y-3">
				<!-- Brightness -->
				<Slider
					label="Brightness"
					value={brightnessPercent}
					min={1}
					max={100}
					unit="%"
					gradient="linear-gradient(to right, #374151 0%, {getRgbColor()} 100%)"
					onchange={handleBrightnessChange}
				/>

				<!-- Color mode controls -->
				{#if colorMode !== 'color_temp' && hsColor}
					<!-- Hue slider -->
					<Slider
						label="Hue"
						value={hue}
						min={0}
						max={359}
						unit="°"
						gradient={getHueGradient()}
						onchange={handleHueChange}
					/>

					<!-- Saturation slider -->
					<Slider
						label="Saturation"
						value={saturation}
						min={0}
						max={100}
						unit="%"
						gradient={getSaturationGradient()}
						onchange={handleSaturationChange}
					/>
				{/if}

				<!-- Color temperature mode controls -->
				{#if colorMode === 'color_temp' && colorTempK}
					<Slider
						label="Color Temp"
						value={colorTempK}
						min={minColorTempK}
						max={maxColorTempK}
						unit="K"
						gradient={getColorTempGradient()}
						onchange={handleColorTempChange}
					/>
				{/if}
			</div>
		{/if}

		<!-- Mode selector -->
		{#if supportsBothModes}
			<div class="mt-3 grid grid-cols-2 gap-2">
				<!-- Color mode button -->
				<button
					onclick={switchToColorMode}
					class="flex items-center gap-1 rounded-lg border p-2 transition-colors {colorMode !==
					'color_temp'
						? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-900/20 dark:text-purple-300'
						: 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'}"
				>
					<SvgIcon
						type="mdi"
						path={mdiPalette}
						size="12"
						class={colorMode !== 'color_temp'
							? 'text-purple-500 dark:text-purple-400'
							: 'text-gray-400 dark:text-gray-500'}
					/>
					<span class="text-xs">Color</span>
					{#if colorMode !== 'color_temp' && rgbColor}
						<div
							class="ml-auto h-3 w-3 rounded-full border border-gray-300 dark:border-gray-600"
							style="background-color: {getRgbColor()};"
						></div>
					{/if}
				</button>

				<!-- Temperature mode button -->
				<button
					onclick={switchToTempMode}
					class="flex items-center gap-1 rounded-lg border p-2 transition-colors {colorMode ===
					'color_temp'
						? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
						: 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'}"
				>
					<SvgIcon
						type="mdi"
						path={mdiThermometer}
						size="12"
						class={colorMode === 'color_temp'
							? 'text-blue-500 dark:text-blue-400'
							: 'text-gray-400 dark:text-gray-500'}
					/>
					<span class="text-xs">
						{colorMode === 'color_temp' && colorTempK
							? getColorTempDescription(colorTempK)
							: 'Temp'}
					</span>
				</button>
			</div>
		{:else if supportsColor}
			<!-- Color mode only -->
			<div class="mt-3 grid grid-cols-1 gap-2">
				<div
					class="flex items-center gap-1 rounded-lg border border-purple-500 bg-purple-50 p-2 dark:border-purple-400 dark:bg-purple-900/20"
				>
					<SvgIcon
						type="mdi"
						path={mdiPalette}
						size="12"
						class="text-purple-500 dark:text-purple-400"
					/>
					<span class="text-xs text-purple-700 dark:text-purple-300">Color Mode</span>
					{#if rgbColor}
						<div
							class="ml-auto h-3 w-3 rounded-full border border-gray-300 dark:border-gray-600"
							style="background-color: {getRgbColor()};"
						></div>
					{/if}
				</div>
			</div>
		{:else if supportsColorTemp}
			<!-- Temperature mode only -->
			<div class="mt-3 grid grid-cols-1 gap-2">
				<div
					class="flex items-center gap-1 rounded-lg border border-blue-500 bg-blue-50 p-2 dark:border-blue-400 dark:bg-blue-900/20"
				>
					<SvgIcon
						type="mdi"
						path={mdiThermometer}
						size="12"
						class="text-blue-500 dark:text-blue-400"
					/>
					<span class="text-xs text-blue-700 dark:text-blue-300">
						{colorTempK
							? `${getColorTempDescription(colorTempK)} (${colorTempK}K)`
							: 'Temperature Mode'}
					</span>
				</div>
			</div>
		{:else}
			<!-- Fixed white light -->
			<div class="mt-3 grid grid-cols-1 gap-2">
				<div
					class="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-800"
				>
					<div
						class="h-3 w-3 rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-200"
					></div>
					<span class="text-xs text-gray-700 dark:text-gray-300">Fixed White</span>
				</div>
			</div>
		{/if}
	{/if}
</CardBase>
