import * as mdiIcons from '@mdi/js';
import type { HassEntity } from 'home-assistant-js-websocket';

export function getEntityIcon(entity: HassEntity): string {
	let path = getIconPath(entity.attributes.icon);

	if (path) {
		return path;
	}

	path = deviceIcons[entity.attributes.device_class ?? ''];

	if (path) {
		return path;
	}

	let entityType = entity.entity_id.split('.').at(0)!;
	path = entityIcons[entityType];

	if (path) {
		return path;
	}

	return mdiIcons.mdiDevices;
}

export function getIconPath(iconName: string | undefined): string | undefined {
	if (!iconName) return undefined;

	// Remove the "mdi:" prefix from the icon name
	const mdiIconName = iconName.replace(/^mdi:/, '');

	// Convert to camelCase, e.g., "school-outline" becomes "mdiSchoolOutline"
	const iconKey = `mdi${mdiIconName
		.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) // Convert to camelCase
		.replace(/^[a-z]/, (g) => g.toUpperCase())}`; // Capitalize the first letter

	return (mdiIcons as Record<string, string>)[iconKey];
}

export const deviceIcons: { [key: string]: string } = {
	date: mdiIcons.mdiCalendar,
	enum: mdiIcons.mdiFormatListBulleted,
	timestamp: mdiIcons.mdiClockOutline,
	apparent_power: mdiIcons.mdiFlash,
	aqi: mdiIcons.mdiAirFilter,
	atmospheric_pressure: mdiIcons.mdiGauge,
	battery: mdiIcons.mdiBattery,
	carbon_monoxide: mdiIcons.mdiMoleculeCo,
	carbon_dioxide: mdiIcons.mdiMoleculeCo2,
	current: mdiIcons.mdiCurrentAc,
	data_rate: mdiIcons.mdiSwapVertical,
	data_size: mdiIcons.mdiDatabase,
	distance: mdiIcons.mdiMapMarkerDistance,
	duration: mdiIcons.mdiTimer,
	energy: mdiIcons.mdiLightningBolt,
	energy_storage: mdiIcons.mdiBatteryPlus,
	frequency: mdiIcons.mdiSineWave,
	gas: mdiIcons.mdiGasCylinder,
	humidity: mdiIcons.mdiWaterPercent,
	illuminance: mdiIcons.mdiBrightness5,
	irradiance: mdiIcons.mdiWeatherSunny,
	moisture: mdiIcons.mdiWater,
	monetary: mdiIcons.mdiCurrencyUsd,
	nitrogen_dioxide: mdiIcons.mdiChemicalWeapon, // Alternative for Nitrogen Dioxide
	nitrogen_monoxide: mdiIcons.mdiChemicalWeapon, // Alternative for Nitrogen Monoxide
	nitrous_oxide: mdiIcons.mdiChemicalWeapon, // Alternative for Nitrous Oxide
	ozone: mdiIcons.mdiWeatherSunny, // Alternative for Ozone (represents the sun, often linked with ozone layer)
	ph: mdiIcons.mdiTestTube,
	pm1: mdiIcons.mdiBlur,
	pm10: mdiIcons.mdiBlurLinear,
	pm25: mdiIcons.mdiBlurRadial,
	power_factor: mdiIcons.mdiPowerPlug,
	power: mdiIcons.mdiPower,
	precipitation: mdiIcons.mdiWeatherRainy,
	precipitation_intensity: mdiIcons.mdiWeatherPouring,
	pressure: mdiIcons.mdiGauge,
	reactive_power: mdiIcons.mdiFlashOutline,
	signal_strength: mdiIcons.mdiSignal,
	sound_pressure: mdiIcons.mdiVolumeHigh,
	speed: mdiIcons.mdiSpeedometer,
	sulphur_dioxide: mdiIcons.mdiChemicalWeapon, // Alternative for Sulphur Dioxide
	temperature: mdiIcons.mdiThermometer,
	volatile_organic_compounds: mdiIcons.mdiMolecule,
	volatile_organic_compounds_parts: mdiIcons.mdiMolecule,
	voltage: mdiIcons.mdiFlash,
	volume: mdiIcons.mdiCubeOutline,
	volume_storage: mdiIcons.mdiDatabase,
	volume_flow_rate: mdiIcons.mdiWaterPump,
	water: mdiIcons.mdiWater,
	weight: mdiIcons.mdiWeight,
	wind_speed: mdiIcons.mdiWeatherWindy
};

const entityIcons: { [key: string]: string } = {
	air_quality: mdiIcons.mdiCloudOutline,
	alarm_control_panel: mdiIcons.mdiShieldLockOutline,
	assist_satellite: mdiIcons.mdiSatelliteUplink,
	binary_sensor: mdiIcons.mdiCheckboxBlankCircleOutline,
	button: mdiIcons.mdiMouse,
	calendar: mdiIcons.mdiCalendarOutline,
	camera: mdiIcons.mdiCameraOutline,
	climate: mdiIcons.mdiThermometer,
	cover: mdiIcons.mdiWindowMaximize,
	date: mdiIcons.mdiCalendarOutline,
	datetime: mdiIcons.mdiClockOutline,
	device_tracker: mdiIcons.mdiMapMarkerRadius,
	event: mdiIcons.mdiCalendarCheckOutline,
	fan: mdiIcons.mdiFan,
	geolocation: mdiIcons.mdiMapMarkerOutline,
	humidifier: mdiIcons.mdiWaterOutline,
	image: mdiIcons.mdiImageOutline,
	image_processing: mdiIcons.mdiImageSearchOutline,
	lawn_mower: mdiIcons.mdiMower,
	light: mdiIcons.mdiLightbulbOutline,
	lock: mdiIcons.mdiLockOutline,
	media_player: mdiIcons.mdiPlayCircleOutline,
	notifications: mdiIcons.mdiBellOutline,
	number: mdiIcons.mdiNumeric,
	remote: mdiIcons.mdiRemote,
	scene: mdiIcons.mdiPaletteOutline,
	select: mdiIcons.mdiCheckCircleOutline,
	sensor: mdiIcons.mdiLeak,
	siren: mdiIcons.mdiAlarmLightOutline,
	speech_to_text: mdiIcons.mdiMicrophoneOutline,
	switch: mdiIcons.mdiToggleSwitchVariantOff,
	tag: mdiIcons.mdiTagOutline,
	text: mdiIcons.mdiText,
	time: mdiIcons.mdiClockTimeFourOutline,
	todo: mdiIcons.mdiCheckAll,
	text_to_speech: mdiIcons.mdiVolumeHigh,
	update: mdiIcons.mdiUpdate,
	vacuum: mdiIcons.mdiVacuumOutline,
	valve: mdiIcons.mdiValve,
	wake_word_detection: mdiIcons.mdiHeadphones,
	water_heater: mdiIcons.mdiThermometer,
	weather: mdiIcons.mdiWeatherSunny
};
