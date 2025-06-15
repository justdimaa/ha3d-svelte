<script lang="ts">
	import SvgIcon from '$lib/shared/components/SvgIcon.svelte';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import { DateTime } from 'luxon';
	import type { Snippet } from 'svelte';

	interface Props {
		// Entity data
		entity: HassEntity;

		// Icon and styling - can be either icon or picture
		icon?: string;
		iconBg?: string;
		iconColor?: string;

		// Picture support (alternative to icon)
		pictureUrl?: string;
		pictureAlt?: string;
		showPictureBorder?: boolean;

		// Status indicator (optional dot)
		showStatusDot?: boolean;
		statusDotColor?: string;

		// Right side content - either toggle or values
		showToggle?: boolean;
		toggleState?: boolean;
		onToggle?: () => void;

		// OR text values (when not using toggle)
		primaryValue?: string;
		primaryValueColor?: string;
		secondaryText?: string;

		// Additional styling
		className?: string;

		// Custom subtext (overrides the default "Updated X ago")
		customSubtext?: string;

		// Children snippet
		children?: Snippet;
	}

	let {
		entity,
		icon,
		iconBg = 'bg-gray-100 dark:bg-gray-700',
		iconColor = 'text-gray-600 dark:text-gray-300',
		pictureUrl,
		pictureAlt,
		showPictureBorder = true,
		showStatusDot = false,
		statusDotColor = 'bg-gray-400 dark:bg-gray-500',
		showToggle = false,
		toggleState = false,
		onToggle,
		primaryValue,
		primaryValueColor = 'text-gray-900 dark:text-white',
		secondaryText,
		className = '',
		customSubtext,
		children
	}: Props = $props();

	// Format timestamp to readable format using Luxon
	const formatLastUpdated = (timestamp: string) => {
		const date = DateTime.fromISO(timestamp);
		const now = DateTime.now();
		const diff = now.diff(date, ['days', 'hours', 'minutes']);

		if (diff.minutes < 1) return 'Just now';
		if (diff.hours < 1) return `${Math.floor(diff.minutes)}m ago`;
		if (diff.days < 1) return `${Math.floor(diff.hours)}h ago`;
		if (diff.days < 7) return `${Math.floor(diff.days)}d ago`;

		return date.toFormat('MMM d, h:mm a');
	};

	// Get entity display name
	const entityName = $derived(entity.attributes.friendly_name || entity.entity_id);

	// Determine whether to show picture or icon
	const showPicture = $derived(pictureUrl && pictureUrl.trim() !== '');

	// Get subtext - either custom or default updated time
	const subtext = $derived(customSubtext || `Updated ${formatLastUpdated(entity.last_updated)}`);
</script>

<div
	class="space-y-3 rounded-xl bg-white p-4 shadow-sm transition-all dark:bg-gray-800 {className}"
>
	<!-- Header Row -->
	<div class="flex items-center justify-between gap-3">
		<div class="flex min-w-0 flex-1 items-center gap-3">
			<div class="relative flex-shrink-0">
				{#if showPicture}
					<!-- Picture display -->
					<div
						class="relative h-10 w-10 overflow-hidden rounded-lg {showPictureBorder
							? 'border-2 border-gray-200 dark:border-gray-600'
							: ''}"
					>
						<img
							src={pictureUrl}
							alt={pictureAlt || entityName}
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					</div>
				{:else if icon}
					<!-- Icon display -->
					<div class="rounded-lg {iconBg} p-2">
						<SvgIcon type="mdi" path={icon} size="18" class={iconColor} />
					</div>
				{:else}
					<!-- Fallback when neither picture nor icon is provided -->
					<div class="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
						<SvgIcon
							type="mdi"
							path="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
							size="18"
							class="text-gray-400 dark:text-gray-500"
						/>
					</div>
				{/if}

				{#if showStatusDot}
					<div
						class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white {statusDotColor} dark:border-gray-800"
					></div>
				{/if}
			</div>

			<div class="min-w-0 flex-1">
				<h4 class="truncate font-medium text-gray-900 dark:text-white">{entityName}</h4>
				<p class="truncate text-sm text-gray-500 dark:text-gray-400">
					{subtext}
				</p>
			</div>
		</div>

		<div class="flex flex-shrink-0 items-center gap-2">
			{#if showToggle}
				<!-- Toggle Switch -->
				<div class="flex items-center gap-2">
					<span
						class="truncate text-sm font-medium {toggleState
							? 'text-green-600 dark:text-green-400'
							: 'text-gray-500 dark:text-gray-400'}"
					>
						{toggleState ? 'On' : 'Off'}
					</span>
					<button
						onclick={onToggle}
						class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 {toggleState
							? 'bg-green-500 dark:bg-green-600'
							: 'bg-gray-300 dark:bg-gray-600'}"
						role="switch"
						aria-checked={toggleState}
						aria-label="Toggle {entityName} {toggleState ? 'off' : 'on'}"
					>
						<span
							class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform dark:bg-gray-200 {toggleState
								? 'translate-x-6'
								: 'translate-x-1'}"
						></span>
					</button>
				</div>
			{:else}
				<!-- Text Values -->
				<div class="min-w-0 text-right">
					{#if primaryValue}
						<div class="truncate text-lg font-bold {primaryValueColor}">{primaryValue}</div>
					{/if}
					{#if secondaryText}
						<div class="truncate text-xs text-gray-500 dark:text-gray-400">{secondaryText}</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Content Slot -->
	{#if children}
		{@render children?.()}
	{/if}
</div>
