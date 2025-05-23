<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import {
		mdiBrightness7,
		mdiCreation,
		mdiInvertColors,
		mdiLightSwitch,
		mdiPalette
	} from '@mdi/js';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import { homeApi } from '../../../stores/global';
	import GradientSlider from '../controls/GradientSlider.svelte';
	import Switch from '../controls/Switch.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Current state driving the UI and API calls
	let currentHue = $state(0); // 0-360
	let saturationPosition = $state(100); // 0-100, represents saturation value
	let brightnessPosition = $state(50); // 0-255, represents brightness value
	let selectedEffect = $state<string | undefined>(undefined);

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

	let processedEffectList = $derived(() => {
		const list = entity?.attributes?.effect_list;
		if (list && Array.isArray(list)) {
			const stringList = list as string[];
			const uniqueEffects = Array.from(new Set(stringList));
			return uniqueEffects.sort((a, b) => a.localeCompare(b));
		}
		return [];
	});

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

	const callLightService = async (params?: {
		hue?: number;
		sat?: number;
		bright?: number;
		effect?: string;
	}) => {
		if (!entity || !$homeApi) return;

		const service_data: {
			entity_id: string;
			hs_color?: [number, number];
			brightness?: number;
			effect?: string;
		} = { entity_id: entity.entity_id };

		if (params?.hue !== undefined && params?.sat !== undefined) {
			service_data.hs_color = [params.hue, params.sat];
		}

		if (params?.bright !== undefined) {
			service_data.brightness = params.bright;
		}

		if (params?.effect) {
			service_data.effect = params.effect;
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

	const handleEffectChange = () => {
		if (!entity || !$homeApi || selectedEffect === undefined) return;
		callLightService({ effect: selectedEffect });
	};

	const syncStateFromEntity = () => {
		if (!entity) return;

		const hs = entity.attributes.hs_color ?? [0, 0];
		const v = entity.attributes.brightness ?? 0;
		const effect = entity.attributes.effect;

		const hue = hs[0] ?? 0;
		const sat = hs[1] ?? 0;

		currentHue = hue;
		saturationPosition = sat;
		brightnessPosition = v;
		selectedEffect = effect;
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
	<button class="flex w-full justify-between gap-2" onclick={toggleLight}>
		<div class="flex items-center gap-1">
			<SvgIcon
				class="flex-shrink-0"
				type="mdi"
				path={entity.attributes.icon ?? mdiLightSwitch}
				size="20"
			/>
			<span>{entity.attributes.friendly_name ?? entity.entity_id}</span>
		</div>
		<Switch checked={entity.state === 'on'} backgroundColor={currentColor()} />
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
					<GradientSlider
						bind:value={brightnessPosition}
						ondragend={handleBrightSliderDragEnd}
						min={2}
						max={255}
						step={0.01}
						gradient={`linear-gradient(to right, hsl(${currentHue}, 0%, 0%), hsl(${currentHue}, ${saturationPosition}%, 50%))`}
					/>
				</div>
			{/if}

			{#if isColorActive}
				<div class="flex w-full items-center justify-between gap-2">
					<div class="flex items-center gap-1">
						<SvgIcon type="mdi" path={mdiPalette} size="20" />
						<span>{String(Math.round(currentHue)).padStart(3, '0')}</span>
					</div>
					<GradientSlider
						bind:value={currentHue}
						ondragend={handleHueSliderDragEnd}
						min={0}
						max={359}
						step={0.01}
						gradient={'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))'}
					/>
				</div>
				<div class="flex w-full items-center justify-between gap-2">
					<div class="flex items-center gap-1">
						<SvgIcon type="mdi" path={mdiInvertColors} size="20" />
						<span>{String(Math.round(saturationPosition)).padStart(3, '0')}</span>
					</div>
					<GradientSlider
						bind:value={saturationPosition}
						ondragend={handleHueSliderDragEnd}
						min={0}
						max={100}
						step={0.01}
						gradient={`linear-gradient(to right, hsl(${currentHue}, 0%, ${brightnessPosition}%), hsl(${currentHue}, 100%, ${haBrightnessToPercent(brightnessPosition) / 2}%))`}
					/>
				</div>
			{/if}
		</div>
	{/if}

	{#if processedEffectList().length > 0 && entity.state === 'on'}
		<div class="flex w-full items-center gap-2">
			<SvgIcon type="mdi" path={mdiCreation} size="20" class="flex-shrink-0" />
			<select
				class="h-8 w-full select-none rounded-xl border border-white/10 bg-white/10 px-4 text-sm text-white hover:bg-white/20"
				bind:value={selectedEffect}
				onchange={handleEffectChange}
				title="Select an effect"
			>
				{#each processedEffectList() as effectName, i (i)}
					<option
						class="bg-white text-black"
						value={effectName}
						selected={selectedEffect === effectName}>{effectName}</option
					>
				{/each}
			</select>
		</div>
	{/if}
</div>
