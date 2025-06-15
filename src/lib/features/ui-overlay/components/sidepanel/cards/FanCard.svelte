<script lang="ts">
	import { mdiFan } from '@mdi/js';
	import CardBase from './CardBase.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { homeApi } from '$lib/shared/stores/global';
	import Slider from '$lib/shared/components/Slider.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	const handleToggle = async () => {
		console.log('Toggling fan:', entity.entity_id);
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'fan',
			service: isOn ? 'turn_off' : 'turn_on',
			service_data: { entity_id: entity.entity_id }
		});
	};

	const handleSpeedChange = async (step: number) => {
		const percentage = step * percentageStep;
		console.log('Changing fan speed to step:', step, 'percentage:', percentage);

		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'fan',
			service: 'set_percentage',
			service_data: { entity_id: entity.entity_id, percentage }
		});
	};

	const handlePresetChange = async (preset: string) => {
		console.log('Changing fan preset to:', preset);
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'fan',
			service: 'set_preset_mode',
			service_data: { entity_id: entity.entity_id, preset_mode: preset }
		});
	};

	const getSpeedGradient = () => {
		return `linear-gradient(to right, #cbd5e1 0%, #60a5fa ${speed}%, #e2e8f0 ${speed}%, #e2e8f0 100%)`;
	};

	const isOn = $derived(entity.state === 'on');
	const speed = $derived(entity.attributes.percentage || 0);
	const currentPreset = $derived(entity.attributes.preset_mode || null);
	const presetModes = $derived(entity.attributes.preset_modes || []);
	const percentageStep = $derived(entity.attributes.percentage_step || 33.33);
	const maxSteps = $derived(Math.floor(100 / percentageStep));
	const currentStep = $derived(Math.round((speed || 0) / percentageStep));
	const hasPresets = $derived(presetModes.length > 0);
</script>

<CardBase {entity} icon={mdiFan} showToggle={true} toggleState={isOn} onToggle={handleToggle}>
	<!-- Speed slider -->
	<Slider
		label="Speed"
		value={currentStep}
		displayValue={speed}
		min={0}
		max={maxSteps}
		unit="%"
		gradient={getSpeedGradient()}
		onchange={handleSpeedChange}
	/>

	<!-- Preset modes (if available) -->
	{#if hasPresets}
		<div class="mt-3 grid grid-cols-2 gap-2">
			{#each presetModes as preset}
				<button
					onclick={() => handlePresetChange(preset)}
					class="rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors {currentPreset ===
					preset
						? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300'
						: 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
				>
					{preset}
				</button>
			{/each}
		</div>
	{/if}
</CardBase>
