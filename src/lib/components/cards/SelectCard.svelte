<script lang="ts">
	import { mdiMenuDown, mdiMenuUp, mdiFormatListBulleted, mdiCheck } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import CardBase from './CardBase.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { homeApi } from '../../../stores/global';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// State for dropdown (desktop only)
	let isOpen = $state(false);

	// Detect mobile device
	const isMobile = $derived(typeof window !== 'undefined' && window.innerWidth < 768);

	// Select option
	const selectOption = async (option: string) => {
		console.log('Selecting option:', option);
		await $homeApi?.sendMessagePromise({
			type: 'call_service',
			domain: 'select',
			service: 'select_option',
			service_data: {
				entity_id: entity.entity_id,
				option: option
			}
		});
		isOpen = false;
	};

	// Handle native select change
	const handleNativeSelect = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		selectOption(target.value);
	};

	// Close dropdown when clicking outside
	const handleClickOutside = (event: MouseEvent) => {
		if (isOpen && !event.target?.closest('.select-dropdown')) {
			isOpen = false;
		}
	};

	// Derived values
	const options = $derived(entity.attributes.options || []);
	const currentValue = $derived(entity.state);
</script>

<svelte:window on:click={handleClickOutside} />

<div class="select-dropdown relative">
	<CardBase
		{entity}
		icon={mdiFormatListBulleted}
		primaryValue={currentValue}
		secondaryText="Select • {options.length} options"
	>
		{#if isMobile}
			<!-- Native mobile select -->
			<div class="relative">
				<select
					value={currentValue}
					onchange={handleNativeSelect}
					class="w-full appearance-none rounded-lg bg-gray-50 p-3 pr-10 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				>
					{#each options as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
				<!-- Custom dropdown arrow -->
				<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
					<SvgIcon
						type="mdi"
						path={mdiMenuDown}
						size="16"
						class="text-gray-500 dark:text-gray-400"
					/>
				</div>
			</div>
		{:else}
			<!-- Custom desktop dropdown -->
			<button
				onclick={() => (isOpen = !isOpen)}
				class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
			>
				<span class="truncate text-sm text-gray-700 dark:text-gray-300">
					{currentValue}
				</span>
				<SvgIcon
					type="mdi"
					path={isOpen ? mdiMenuUp : mdiMenuDown}
					size="16"
					class="ml-2 flex-shrink-0 text-gray-500 transition-transform dark:text-gray-400 {isOpen
						? 'rotate-180'
						: ''}"
				/>
			</button>

			<!-- Dropdown options -->
			{#if isOpen}
				<div
					class="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
				>
					{#each options as option}
						<button
							onclick={() => selectOption(option)}
							class="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 {option ===
							currentValue
								? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
								: 'text-gray-700 dark:text-gray-300'}"
						>
							<span class="truncate">{option}</span>
							{#if option === currentValue}
								<SvgIcon
									type="mdi"
									path={mdiCheck}
									size="16"
									class="ml-2 flex-shrink-0 text-blue-600 dark:text-blue-400"
								/>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		{/if}
	</CardBase>
</div>

<style>
	/* Ensure dropdown appears above other cards */
	.select-dropdown {
		z-index: 10;
	}
</style>
