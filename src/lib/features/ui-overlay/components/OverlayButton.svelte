<script lang="ts">
	import SvgIcon from '$lib/shared/components/SvgIcon.svelte';

	interface Props {
		icon?: string;
		size?: string;
		text?: string;
		onclick?: () => void;
		ariaLabel?: string;
		class?: string;
		hidden?: boolean;
		disabled?: boolean;
	}

	let {
		icon,
		size = '20',
		text,
		onclick,
		ariaLabel,
		class: additionalClass = '',
		disabled = false
	}: Props = $props();

	const baseClass =
		'pointer-events-auto rounded-xl bg-white/10 p-2.5 shadow-sm backdrop-blur-xl transition-all hover:bg-white/20 active:scale-95 dark:bg-gray-800/80 dark:hover:bg-gray-700/80';
	const combinedClass = $derived(`${baseClass} ${additionalClass}`);
</script>

<button class={combinedClass} class:disabled {onclick} aria-label={ariaLabel} {disabled}>
	{#if icon}
		<SvgIcon type="mdi" path={icon} {size} class="text-gray-800 dark:text-gray-100" />
	{/if}
	{#if text}
		<span class="text-gray-800 dark:text-gray-100">{text}</span>
	{/if}
</button>

<style>
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button:disabled:hover {
		background: inherit;
		transform: none;
	}
</style>
