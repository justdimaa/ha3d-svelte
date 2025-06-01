<script lang="ts">
	import {
		mdiMenu,
		mdiFullscreenExit,
		mdiFullscreen,
		mdiWeatherSunny,
		mdiWeatherNight,
		mdiCircleOutline,
		mdiCircleOffOutline
	} from '@mdi/js';
	import OverlayButton from './OverlayButton.svelte';
	import { onMount } from 'svelte';
	import { theme } from '../../../stores/theme';
	import { showDotIndicators } from '../../../stores/global';

	interface Props {
		roomName: string;
	}

	let { roomName }: Props = $props();

	let isFullscreen = $state(false);

	// Overlay handlers
	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
			isFullscreen = true;
		} else {
			document.exitFullscreen();
			isFullscreen = false;
		}
	};

	const toggleIndicators = () => {
		$showDotIndicators = !$showDotIndicators;
	};

	const handleFullscreenChange = () => {
		isFullscreen = !!document.fullscreenElement;
	};

	onMount(() => {
		// Initialize theme on mount
		theme.init();

		// Handle fullscreen change events
		document.addEventListener('fullscreenchange', handleFullscreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	});
</script>

<div class="flex w-full justify-between">
	<div class="flex gap-2">
		<OverlayButton icon={mdiMenu} ariaLabel="Open menu" />
		<OverlayButton text={roomName} ariaLabel="Room info" />
	</div>
	<div class="flex gap-2">
		<OverlayButton
			icon={$showDotIndicators ? mdiCircleOffOutline : mdiCircleOutline}
			onclick={toggleIndicators}
			ariaLabel={$showDotIndicators ? 'Hide indicators' : 'Show indicators'}
			class="p-3"
		/>

		<OverlayButton
			icon={$theme ? mdiWeatherSunny : mdiWeatherNight}
			onclick={theme.toggle}
			ariaLabel={$theme ? 'Switch to light mode' : 'Switch to dark mode'}
			class="p-3"
		/>
		<OverlayButton
			icon={isFullscreen ? mdiFullscreenExit : mdiFullscreen}
			onclick={toggleFullscreen}
			ariaLabel="Toggle fullscreen"
			class="hidden lg:block"
		/>
	</div>
</div>
