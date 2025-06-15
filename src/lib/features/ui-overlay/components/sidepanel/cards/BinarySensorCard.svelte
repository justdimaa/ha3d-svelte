<script lang="ts">
	import {
		mdiDoorOpen,
		mdiDoorClosed,
		mdiMotionSensor,
		mdiWindowOpen,
		mdiWindowClosed,
		mdiWater,
		mdiShield,
		mdiShieldOff,
		mdiEye,
		mdiEyeOff,
		mdiAlert,
		mdiBatteryAlert,
		mdiBatteryHigh,
		mdiLock,
		mdiLockOpen,
		mdiRefresh,
		mdiThermometer
	} from '@mdi/js';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import CardBase from './CardBase.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Get sensor info based on device class and state
	const getSensorInfo = (deviceClass: string | undefined, state: string) => {
		const isOn = state === 'on';

		switch (deviceClass) {
			// Critical alert states
			case 'carbon_monoxide':
			case 'gas':
			case 'smoke':
			case 'problem':
			case 'tamper':
				return {
					icon: mdiAlert,
					label: isOn ? 'Alert' : 'Clear'
				};

			// Safety states
			case 'safety':
				return {
					icon: isOn ? mdiShieldOff : mdiShield,
					label: isOn ? 'Unsafe' : 'Safe'
				};

			// Opening states
			case 'door':
			case 'garage_door':
			case 'opening':
				return {
					icon: isOn ? mdiDoorOpen : mdiDoorClosed,
					label: isOn ? 'Open' : 'Closed'
				};

			case 'window':
				return {
					icon: isOn ? mdiWindowOpen : mdiWindowClosed,
					label: isOn ? 'Open' : 'Closed'
				};

			// Lock state
			case 'lock':
				return {
					icon: isOn ? mdiLockOpen : mdiLock,
					label: isOn ? 'Unlocked' : 'Locked'
				};

			// Activity detection states
			case 'motion':
			case 'occupancy':
			case 'vibration':
			case 'sound':
				return {
					icon: mdiMotionSensor,
					label: isOn ? 'Detected' : 'Clear'
				};

			// Moisture detection
			case 'moisture':
				return {
					icon: mdiWater,
					label: isOn ? 'Wet' : 'Dry'
				};

			// Battery states
			case 'battery':
				return {
					icon: isOn ? mdiBatteryAlert : mdiBatteryHigh,
					label: isOn ? 'Low' : 'Normal'
				};

			// Temperature states
			case 'cold':
			case 'heat':
				return {
					icon: mdiThermometer,
					label: isOn ? (deviceClass === 'cold' ? 'Cold' : 'Hot') : 'Normal'
				};

			// Update available
			case 'update':
				return {
					icon: mdiRefresh,
					label: isOn ? 'Available' : 'Up to date'
				};

			// Informational states
			case 'battery_charging':
			case 'connectivity':
			case 'light':
			case 'moving':
			case 'plug':
			case 'power':
			case 'presence':
			case 'running':
			default:
				return {
					icon: isOn ? mdiEye : mdiEyeOff,
					label: isOn ? 'On' : 'Off'
				};
		}
	};

	const isOn = $derived(entity.state === 'on');
	const sensorInfo = $derived(getSensorInfo(entity.attributes.device_class, entity.state));
</script>

<CardBase
	{entity}
	icon={sensorInfo.icon}
	iconBg={isOn ? 'bg-orange-50 dark:bg-orange-900/20' : undefined}
	iconColor={isOn ? 'text-orange-600 dark:text-orange-400' : undefined}
	primaryValue={sensorInfo.label}
	primaryValueColor={isOn ? 'text-orange-600 dark:text-orange-400' : undefined}
	secondaryText={entity.attributes.device_class
		? entity.attributes.device_class.charAt(0).toUpperCase() +
			entity.attributes.device_class.slice(1)
		: 'Sensor'}
/>
