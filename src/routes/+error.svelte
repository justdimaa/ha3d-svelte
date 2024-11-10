<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex w-screen flex-col items-center justify-center gap-2 p-4">
	<h1 class="text-xl">{$page.status} | {$page.error?.message} 😭</h1>
	<a href="/" style="text-decoration: underline;">Go back to home page</a>
</div>
