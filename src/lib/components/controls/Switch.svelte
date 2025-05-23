<script lang="ts">
	interface Props {
		checked: boolean;
		backgroundColor?: string;
		disabled?: boolean;
		onclick?: () => void;
	}

	let {
		checked = false,
		backgroundColor = 'rgba(255 255 255 / .6)',
		disabled = false,
		onclick
	}: Props = $props();

	const handleClick = () => {
		if (!disabled && onclick) {
			onclick();
		}
	};
</script>

<label class="pointer-events-none inline-flex cursor-pointer items-center">
	<input type="checkbox" {checked} {disabled} class="peer sr-only" onchange={handleClick} />
	<div
		class="peer relative h-2 w-10 rounded-full outline-none after:absolute after:start-[0px] after:top-[-6px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-[0_2px_4px_rgba(0,0,0,0.2)] after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-50 rtl:peer-checked:after:-translate-x-full"
		style:background-color={checked ? backgroundColor : 'rgba(255 255 255 / .2)'}
	></div>
</label>
