<script lang="ts">
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { onMount } from 'svelte';
	import iro from '@jaames/iro';
	import type { IroColorPicker } from '@jaames/iro/dist/ColorPicker';
	import { homeApi as homeApi } from '../../../stores/global';
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiLightSwitch } from '@mdi/js';

	// todo: sync color
	// todo: merge all lights of one mesh into one picker?
	// todo: check properties like brightness only, cold-warm only etc

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();
	let pickerId = `picker-${crypto.randomUUID()}`;

	let colorPicker: IroColorPicker | undefined = $state(undefined);

	// entities.subscribe(() => {
	// 	console.log(colorPicker);
	// 	if (!colorPicker) return;

	// 	let hs = entity.attributes.hs_color ?? [0, 0];
	// 	let v = haToIroBrightness(entity.attributes.brightness ?? 0);

	// 	colorPicker.color = new iro.Color({
	// 		h: hs[0],
	// 		s: hs[1],
	// 		v: v
	// 	});
	// 	colorPicker.forceUpdate();
	// });

	$effect(() => {});

	function haToIroBrightness(haBrightness: number): number {
		return Math.round((haBrightness * 100) / 255);
	}

	function iroToHaBrightness(iroBrightness: number): number {
		return Math.round((iroBrightness * 255) / 100);
	}

	onMount(async () => {
		let hs = entity.attributes.hs_color ?? [0, 0];
		let v = haToIroBrightness(entity.attributes.brightness ?? 0);

		colorPicker = new iro.ColorPicker('#' + pickerId, {
			color: new iro.Color({
				h: hs[0],
				s: hs[1],
				v: v
			}),
			layoutDirection: 'vertical',
			padding: 4,
			wheelLightness: false,
			layout: [
				// can also be 'saturation', 'value', 'red', 'green', 'blue', 'alpha' or 'kelvin'
				{
					component: iro.ui.Wheel
				},
				{
					component: iro.ui.Slider,
					options: {
						sliderType: 'saturation'
					}
				},
				{
					component: iro.ui.Slider,
					options: {
						sliderType: 'value'
					}
				},
				{
					component: iro.ui.Slider,
					options: {
						sliderType: 'kelvin'
					}
				}
			]
		});

		colorPicker.on('input:end', async (color: any) => {
			console.debug(color);
			let brightness = iroToHaBrightness(color.hsv.v);
			let service_data;

			if (entity.attributes.brightness == brightness) {
				service_data = { entity_id: entity.entity_id, hs_color: [color.hsv.h, color.hsv.s] };
			} else {
				service_data = { entity_id: entity.entity_id, brightness_pct: color.value };
			}

			await $homeApi?.sendMessagePromise({
				type: 'call_service',
				domain: 'light',
				service: 'turn_on',
				return_response: false,
				service_data
			});
		});
	});
</script>

<button
	class="flex justify-between gap-4 rounded-xl border border-white/10 bg-white/10 p-4 shadow"
	onclick={async () => {
		let service = entity.state == 'on' ? 'turn_off' : 'turn_on';

		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'light',
			service,
			return_response: false,
			service_data: { entity_id: entity.entity_id }
		});
	}}
>
	<div class="flex items-center gap-1">
		<SvgIcon type="mdi" path={entity.attributes.icon ?? mdiLightSwitch} size="20" />
		<span>{entity.attributes.friendly_name ?? entity.entity_id}</span>
	</div>
	<label class="inline-flex cursor-pointer items-center">
		<input type="checkbox" checked={entity.state == 'on'} value="" class="peer sr-only" />
		<div
			class="peer relative h-6 w-11 rounded-full bg-gray-700 outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"
		></div>
	</label>
</button>

<div class="flex flex-col gap-3">
	<div class="flex justify-center rounded-xl border border-white/10 bg-white/10 p-4 shadow">
		<div id={pickerId} class="drop-shadow"></div>
	</div>
</div>
