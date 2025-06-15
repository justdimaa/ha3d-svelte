export function getWeatherLabel(condition: string | undefined): string {
	if (condition === undefined) {
		return 'Unknown';
	}
	return weatherConditionMap[condition as keyof typeof weatherConditionMap] || 'Unknown';
}

const weatherConditionMap: { [key: string]: string } = {
	'clear-night': 'Clear Night',
	cloudy: 'Cloudy',
	fog: 'Foggy',
	hail: 'Hailing',
	lightning: 'Lightning',
	'lightning-rainy': 'Thunderstorm',
	partlycloudy: 'Partly Cloudy',
	pouring: 'Heavy Rain',
	rainy: 'Rainy',
	snowy: 'Snowy',
	'snowy-rainy': 'Snow and Rain',
	sunny: 'Sunny',
	windy: 'Windy',
	'windy-variant': 'Windy and Cloudy',
	exceptional: 'Exceptional'
};

export function getConditionIcon(condition: string, isDay: boolean): string {
	const basePath = '/img/weather/icons/';
	let iconName: string;

	switch (condition) {
		case 'clear-night':
			iconName = 'clear-night.svg';
			break;
		case 'sunny':
			iconName = 'sunny.svg';
			break;
		case 'partlycloudy':
			iconName = isDay ? 'partlycloudy.svg' : 'partlycloudy-night.svg';
			break;
		case 'cloudy':
			iconName = 'cloudy.svg';
			break;
		case 'fog':
			iconName = 'fog.svg';
			break;
		case 'hail':
			iconName = 'hail.svg';
			break;
		case 'lightning':
			iconName = 'lightning.svg';
			break;
		case 'lightning-rainy':
			iconName = 'lightning-rainy.svg';
			break;
		case 'pouring':
			iconName = 'pouring.svg';
			break;
		case 'rainy':
			iconName = 'rainy.svg';
			break;
		case 'snowy':
			iconName = 'snowy.svg';
			break;
		case 'snowy-rainy':
			iconName = 'snowy-rainy.svg';
			break;
		case 'windy':
			iconName = 'windy.svg';
			break;
		case 'windy-variant':
			iconName = 'windy-variant.svg';
			break;
		case 'exceptional':
			iconName = 'cloudy.svg';
			break;
		default:
			iconName = 'cloudy.svg';
			break;
	}

	return basePath + iconName;
}

export function getConditionImage(condition: string, isDay: boolean): string {
	const basePath = '/img/weather/bg/';
	let imageName: string;

	switch (condition) {
		case 'sunny':
			imageName = 'pexels-photo-1072839.avif';
			break;
		case 'clear-night':
			imageName = 'pexels-photo-2098428.avif';
			break;
		case 'cloudy':
			imageName = isDay ? 'pexels-photo-6398583.avif' : 'pexels-photo-16621205.avif';
			break;
		case 'windy':
		case 'windy-variant':
			imageName = isDay ? 'pexels-photo-946186.avif' : 'pexels-photo-4488071.avif';
			break;
		case 'rainy':
			imageName = isDay ? 'pexels-photo-5466446.avif' : 'pexels-photo-20064354.avif';
			break;
		case 'pouring':
			imageName = isDay ? 'pexels-photo-39811.avif' : 'pexels-photo-8624646.avif';
			break;
		case 'hail':
		case 'snowy-rainy':
			imageName = isDay ? 'pexels-photo-4190056.avif' : 'pexels-photo-1853542.avif';
			break;
		case 'snowy':
			imageName = isDay ? 'pexels-photo-19373236.avif' : 'pexels-photo-3751007.avif';
			break;
		case 'lightning':
		case 'lightning-rainy':
			imageName = 'pexels-photo-13520675.avif';
			break;
		case 'fog':
			imageName = isDay ? 'pexels-photo-3408552.avif' : 'pexels-photo-16566066.avif';
			break;
		case 'exceptional':
			imageName = isDay ? 'pexels-photo-18819323.avif' : 'pexels-photo-13337516.avif';
			break;
		case 'partlycloudy':
		default:
			imageName = isDay ? 'my-partly-cloudy.avif' : 'pexels-photo-2885320.avif';
			break;
	}

	return basePath + imageName;
}
