<script lang="ts">
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { homeApi } from '../../../stores/global';
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { getEntityIcon } from '../../../utils/icons';
	import { onMount } from 'svelte';
	import GradientSlider from './sliders/GradientSlider.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	let fanSpeedPosition = $state(0);

	const handleSliderDragEnd = () => {
		const newStepValue = fanSpeedPosition;
		const percentage = newStepValue * entity.attributes.percentage_step;
		setPercentage(percentage);
	};

	const callService = async (service: string, data = {}) => {
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'fan',
			service,
			service_data: {
				entity_id: entity.entity_id,
				...data
			}
		});
	};

	const togglePower = () => callService(entity.state === 'on' ? 'turn_off' : 'turn_on');
	const setPercentage = (percentage: number) => callService('set_percentage', { percentage });
	const setPresetMode = (mode: string) => callService('set_preset_mode', { preset_mode: mode });
	const increaseSpeed = () => callService('increase_speed');
	const decreaseSpeed = () => callService('decrease_speed');

	const syncStateFromEntity = () => {
		if (!entity) return;

		fanSpeedPosition = Math.round(
			(entity.attributes.percentage ?? 0) / entity.attributes.percentage_step
		);
	};

	onMount(syncStateFromEntity);

	$effect(() => {
		if (entity) {
			syncStateFromEntity();
		}
	});
</script>

<div
	class="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-white/10 p-4 shadow lg:backdrop-blur-2xl"
>
	<!-- Header with name and power -->
	<button class="flex items-start justify-between" onclick={togglePower}>
		<div class="flex items-center gap-2">
			<SvgIcon type="mdi" path={getEntityIcon(entity)} size="24" />
			<span>{entity.attributes.friendly_name ?? entity.entity_id}</span>
		</div>
		<label class="pointer-events-none inline-flex cursor-pointer items-center">
			<input type="checkbox" checked={entity.state === 'on'} class="peer sr-only" />
			<div
				class="peer relative h-6 w-11 rounded-full bg-white/10 outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-neutral-500 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"
			></div>
		</label>
	</button>

	{#if entity.state === 'on' && entity.attributes.percentage_step}
		{@const maxSteps = Math.floor(100 / entity.attributes.percentage_step)}
		<!-- Speed control -->
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-1">
				<span
					>{String(Math.floor(fanSpeedPosition * entity.attributes.percentage_step) ?? 0).padStart(
						3,
						'0'
					)}</span
				>
			</div>
			<GradientSlider
				min={0}
				max={maxSteps}
				step={1}
				bind:value={fanSpeedPosition}
				disabled={entity.state !== 'on'}
				ondragend={handleSliderDragEnd}
				gradient={`linear-gradient(to right, #4a5568, #a0aec0)`}
			/>
			<div class="flex items-center gap-2">
				<button
					class="h-6 rounded-lg border border-white/10 bg-white/10 px-3 text-sm hover:bg-white/20"
					disabled={entity.state !== 'on'}
					onclick={decreaseSpeed}
				>
					-
				</button>
				<button
					class="h-6 rounded-lg border border-white/10 bg-white/10 px-3 text-sm hover:bg-white/20"
					disabled={entity.state !== 'on'}
					onclick={increaseSpeed}
				>
					+
				</button>
			</div>
		</div>
	{/if}

	<!-- Preset modes -->
	{#if entity.attributes.preset_modes?.length}
		<div class="flex flex-wrap gap-2">
			{#each entity.attributes.preset_modes as mode}
				<button
					class="flex h-8 grow items-center rounded-lg border border-white/10 px-3 text-sm {entity.state ===
						'on' && entity.attributes.preset_mode === mode
						? 'bg-white/20'
						: 'bg-white/10 hover:bg-white/20'}"
					onclick={() => setPresetMode(mode)}
				>
					{mode}
				</button>
			{/each}
		</div>
	{/if}
</div>
