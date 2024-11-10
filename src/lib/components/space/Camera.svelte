<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { cameraSettings } from '../../../stores/global';
</script>

<T.PerspectiveCamera
	makeDefault
	fov={50}
	zoom={1.25}
	position={[10, 10, 10]}
	oncreate={(ref) => {
		ref.lookAt(0, 1, 0);
	}}
>
	<OrbitControls enableDamping={$cameraSettings.enableDamping} target={[0, 0, 0]} />
</T.PerspectiveCamera>
