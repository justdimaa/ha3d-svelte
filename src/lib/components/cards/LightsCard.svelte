<script lang="ts">
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import iro from '@jaames/iro';
	import type { IroColorPicker, ColorPickerProps } from '@jaames/iro/dist/ColorPicker';
	import { homeApi } from '../../../stores/global';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import { mdiLightSwitch } from '@mdi/js';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();
	let colorPicker: IroColorPicker | undefined = $state(undefined);
	let pickerDiv: HTMLElement;
	let currentColor: string | undefined = $state(undefined);

	// Utility functions
	const haToIroBrightness = (haBrightness: number): number =>
		Math.round((haBrightness * 100) / 255);

	const iroToHaBrightness = (iroBrightness: number): number =>
		Math.min(Math.round((iroBrightness * 255) / 100), 254);

	// Home Assistant API calls
	const toggleLight = async () => {
		const service = entity.state === 'on' ? 'turn_off' : 'turn_on';
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service,
			return_response: false,
			service_data: { entity_id: entity.entity_id }
		});
	};

	const updateLight = async (color: iro.Color) => {
		const brightness = iroToHaBrightness(color.hsv.v);
		const service_data =
			entity.attributes.brightness === brightness
				? {
						entity_id: entity.entity_id,
						hs_color: [color.hsv.h, color.hsv.s]
					}
				: {
						entity_id: entity.entity_id,
						brightness_pct: color.value
					};

		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service: 'turn_on',
			return_response: false,
			service_data
		});
	};

	// Initialize color picker
	const initColorPicker = () => {
		const hs = entity.attributes.hs_color ?? [0, 0];
		const v = haToIroBrightness(entity.attributes.brightness ?? 0);
		const colorModes: string[] = entity.attributes.supported_color_modes;

		const layout = [];

		if (
			colorModes.includes('xy') ||
			colorModes.includes('rgbww') ||
			colorModes.includes('rgbw') ||
			colorModes.includes('rgb') ||
			colorModes.includes('hs')
		) {
			layout.push({
				component: iro.ui.Wheel
			});
			layout.push({
				component: iro.ui.Slider,
				options: { sliderType: 'saturation' }
			});
		}

		if (
			colorModes.includes('xy') ||
			colorModes.includes('rgbww') ||
			colorModes.includes('rgbw') ||
			colorModes.includes('rgb') ||
			colorModes.includes('hs') ||
			colorModes.includes('color_temp') ||
			colorModes.includes('brightness')
		) {
			layout.push({
				component: iro.ui.Slider,
				options: { sliderType: 'value' }
			});
		}

		if (
			colorModes.includes('xy') ||
			colorModes.includes('rgbww') ||
			colorModes.includes('rgbw') ||
			colorModes.includes('rgb') ||
			colorModes.includes('hs') ||
			colorModes.includes('color_temp')
		) {
			layout.push({
				component: iro.ui.Slider,
				options: { sliderType: 'kelvin' }
			});
		}

		const config: ColorPickerProps = {
			color: { h: hs[0], s: hs[1], v },
			layoutDirection: 'vertical',
			padding: 4,
			wheelLightness: false,
			borderWidth: 1,
			borderColor: '#ffffff60',
			layout
		};

		colorPicker = iro.ColorPicker(pickerDiv, config);
		colorPicker.on('input:end', updateLight);
		currentColor = v ? colorPicker.color.hexString : undefined;
	};

	// Update color picker when entity changes
	const updateColorPicker = () => {
		if (!colorPicker || !entity) return;

		const hs = entity.attributes.hs_color ?? [0, 0];
		const v = haToIroBrightness(entity.attributes.brightness ?? 0);

		console.log(colorPicker.color);

		// Only update if values are different to prevent jitter
		const pickerColor = colorPicker.color;
		if (
			Math.abs(pickerColor.hsv.h - hs[0]) > 4 ||
			Math.abs(pickerColor.hsv.s - hs[1]) > 4 ||
			Math.abs(pickerColor.hsv.v - v) > 2
		) {
			colorPicker.color.set({ h: hs[0], s: hs[1], v });
		}

		currentColor = v ? colorPicker.color.hexString : undefined;
	};

	// Lifecycle
	onMount(initColorPicker);

	$effect(() => {
		// Watch for changes in entity attributes
		if (entity) {
			updateColorPicker();
		}
	});
</script>

<div
	class="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/10 p-4 shadow backdrop-blur-2xl"
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
				style:background-color={currentColor ?? 'rgba(255 255 255 / .1)'}
			></div>
		</label>
	</button>
	<div
		class="drop-shadow {entity.state === 'on' ? '' : 'pointer-events-none hidden'}"
		bind:this={pickerDiv}
	></div>
</div>
