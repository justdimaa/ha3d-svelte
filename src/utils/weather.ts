import * as mdiIcons from '@mdi/js';

export function getWeatherIcon(condition: string | undefined): string {
    return weatherIconMap[condition] ?? mdiIcons.mdiWeatherCloudyAlert
}

export function getWeatherLabel(condition: string | undefined): string {
    return weatherConditionMap[condition] || 'Unknown';
}

const weatherIconMap: { [key: string]: string } = {
    'clear-night': mdiIcons.mdiWeatherNight,
    'cloudy': mdiIcons.mdiWeatherCloudy,
    'fog': mdiIcons.mdiWeatherFog,
    'hail': mdiIcons.mdiWeatherHail,
    'lightning': mdiIcons.mdiWeatherLightning,
    'lightning-rainy': mdiIcons.mdiWeatherLightningRainy,
    'partlycloudy': mdiIcons.mdiWeatherPartlyCloudy,
    'pouring': mdiIcons.mdiWeatherPouring,
    'rainy': mdiIcons.mdiWeatherRainy,
    'snowy': mdiIcons.mdiWeatherSnowy,
    'snowy-rainy': mdiIcons.mdiWeatherSnowyRainy,
    'sunny': mdiIcons.mdiWeatherSunny,
    'windy': mdiIcons.mdiWeatherWindy,
    'windy-variant': mdiIcons.mdiWeatherWindy,
    'exceptional': mdiIcons.mdiTsunami
};

const weatherConditionMap = {
    'clear-night': 'Clear Night',
    'cloudy': 'Cloudy',
    'fog': 'Foggy',
    'hail': 'Hailing',
    'lightning': 'Lightning',
    'lightning-rainy': 'Thunderstorm',
    'partlycloudy': 'Partly Cloudy',
    'pouring': 'Heavy Rain',
    'rainy': 'Rainy',
    'snowy': 'Snowy',
    'snowy-rainy': 'Snow and Rain',
    'sunny': 'Sunny',
    'windy': 'Windy',
    'windy-variant': 'Windy and Cloudy',
    'exceptional': 'Exceptional'
};
