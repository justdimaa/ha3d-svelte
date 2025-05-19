<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiBrightness7, mdiInvertColors, mdiLightSwitch, mdiPalette } from '@mdi/js';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import { homeApi } from '../../../stores/global';
	import HueSlider from './sliders/HueSlider.svelte';
	import SaturationSlider from './sliders/SaturationSlider.svelte';
	import BrightnessSlider from './sliders/BrightnessSlider.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Current state driving the UI and API calls
	let currentHue = $state(0); // 0-360
	let saturationPosition = $state(100); // 0-100, represents saturation value
	let brightnessPosition = $state(50); // 0-255, represents brightness value

	let isColorActive = $derived(
		entity &&
			entity.state === 'on' &&
			(entity.attributes.supported_color_modes?.some(
				(
					mode: string // Added type for mode
				) => ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].includes(mode)
			) ??
				false)
	);
	let currentColor = $derived(() =>
		isColorActive
			? `hsl(${currentHue}, ${saturationPosition}%, ${haBrightnessToPercent(brightnessPosition) / 2}%)`
			: undefined
	);

	let showBrightnessSlider = $derived(
		entity &&
			entity.state === 'on' &&
			(entity.attributes.supported_color_modes?.includes('brightness') || isColorActive)
	);

	const toggleLight = async () => {
		if (!entity || !$homeApi) return;

		const service = entity.state === 'on' ? 'turn_off' : 'turn_on';
		await $homeApi.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service,
			return_response: false,
			service_data: { entity_id: entity.entity_id }
		});
	};

	const callLightService = async (params?: { hue?: number; sat?: number; bright?: number }) => {
		if (!entity || !$homeApi) return;

		const service_data: {
			entity_id: string;
			hs_color?: [number, number];
			brightness?: number;
			// Potentially other params like color_temp, etc. if supported
		} = { entity_id: entity.entity_id };

		if (params?.hue && params?.sat) {
			service_data.hs_color = [params.hue, params.sat];
		}

		if (params?.bright) {
			service_data.brightness = params.bright;
		}

		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service: 'turn_on',
			return_response: false,
			service_data
		});
	};

	const haBrightnessToPercent = (b: number | undefined | null): number =>
		typeof b === 'number' ? Math.round((b * 100) / 255) : 100;

	const handleHueSliderDragEnd = () => {
		callLightService({
			hue: currentHue,
			sat: saturationPosition
		});
	};

	const handleBrightSliderDragEnd = () => {
		callLightService({
			bright: brightnessPosition
		});
	};

	const syncStateFromEntity = () => {
		if (!entity) return;

		const hs = entity.attributes.hs_color ?? [0, 0];
		const v = entity.attributes.brightness ?? 0;

		const hue = hs[0] ?? 0;
		const sat = hs[1] ?? 0;

		currentHue = hue;
		saturationPosition = sat;
		brightnessPosition = v;
	};

	onMount(syncStateFromEntity);

	$effect(() => {
		if (entity) {
			syncStateFromEntity();
		}
	});
</script>

<div
	class="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/10 p-4 shadow lg:backdrop-blur-2xl"
>
	<button class="flex w-full justify-between gap-2 rounded-xl" onclick={toggleLight}>
		<div class="flex items-center gap-1">
			<SvgIcon type="mdi" path={entity.attributes.icon ?? mdiLightSwitch} size="20" />
			<span>{entity.attributes.friendly_name ?? entity.entity_id}</span>
		</div>
		<label class="inline-flex cursor-pointer items-center">
			<input type="checkbox" checked={entity.state === 'on'} class="peer sr-only" />
			<div
				class="peer relative h-6 w-11 rounded-full outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"
				style:background-color={currentColor() ?? 'rgba(255 255 255 / .1)'}
			></div>
		</label>
	</button>

	{#if showBrightnessSlider || isColorActive}
		<div class="flex w-full flex-col gap-3">
			{#if showBrightnessSlider}
				<div class="flex w-full items-center justify-between gap-2">
					<div class="flex items-center gap-1">
						<SvgIcon type="mdi" path={mdiBrightness7} size="20" />
						<span
							>{String(Math.round(haBrightnessToPercent(brightnessPosition))).padStart(
								3,
								'0'
							)}</span
						>
					</div>
					<BrightnessSlider
						bind:value={brightnessPosition}
						hue={currentHue}
						saturation={saturationPosition}
						{isColorActive}
						ondragend={handleBrightSliderDragEnd}
					/>
				</div>
			{/if}

			{#if isColorActive}
				<div class="flex w-full items-center justify-between gap-2">
					<div class="flex items-center gap-1">
						<SvgIcon type="mdi" path={mdiPalette} size="20" />
						<span>{String(Math.round(currentHue)).padStart(3, '0')}</span>
					</div>
					<HueSlider bind:value={currentHue} ondragend={handleHueSliderDragEnd} />
				</div>
				<div class="flex w-full items-center justify-between gap-2">
					<div class="flex items-center gap-1">
						<SvgIcon type="mdi" path={mdiInvertColors} size="20" />
						<span>{String(Math.round(saturationPosition)).padStart(3, '0')}</span>
					</div>
					<SaturationSlider
						bind:value={saturationPosition}
						hue={currentHue}
						brightness={brightnessPosition}
						ondragend={handleHueSliderDragEnd}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
