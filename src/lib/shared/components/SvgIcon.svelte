<!--
    Based on @jamescoyle/svelte-icon
    Adapted for Svelte 5 with TypeScript support
-->
<script lang="ts">
	interface IconType {
		size: number;
		viewbox: string;
	}

	interface Props {
		type?: 'mdi' | 'simple-icons' | null;
		path: string;
		size?: string | number | null;
		viewbox?: string | null;
		flip?: 'none' | 'horizontal' | 'vertical' | 'both';
		rotate?: number | string;
		[key: string]: any; // For rest props
	}

	let {
		type = null,
		path,
		size = null,
		viewbox = null,
		flip = 'none',
		rotate = 0,
		...restProps
	}: Props = $props();

	const types: Record<string, IconType> = {
		mdi: {
			size: 24,
			viewbox: '0 0 24 24'
		},
		'simple-icons': {
			size: 24,
			viewbox: '0 0 24 24'
		},
		default: {
			size: 0,
			viewbox: '0 0 0 0'
		}
	};

	const defaults = $derived(types[type || 'default'] || types.default);
	const sizeValue = $derived(size || defaults.size);
	const viewboxValue = $derived(viewbox || defaults.viewbox);
	const sx = $derived(['both', 'horizontal'].includes(flip) ? '-1' : '1');
	const sy = $derived(['both', 'vertical'].includes(flip) ? '-1' : '1');
	const r = $derived(isNaN(Number(rotate)) ? rotate : rotate + 'deg');
</script>

<svg
	width={sizeValue}
	height={sizeValue}
	viewBox={viewboxValue}
	style="--sx: {sx}; --sy: {sy}; --r: {r}"
	{...restProps}
>
	<path d={path} />
</svg>

<style>
	svg {
		transform: rotate(var(--r, 0deg)) scale(var(--sx, 1), var(--sy, 1));
	}

	path {
		fill: currentColor;
	}
</style>
