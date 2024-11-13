import * as mdiIcons from '@mdi/js';

export function getIconPath(iconName: string | undefined, fallback: string): string {
    if (!iconName) return fallback;

    // Remove the "mdi:" prefix from the icon name
    const mdiIconName = iconName.replace(/^mdi:/, '');

    // Convert to camelCase, e.g., "school-outline" becomes "mdiSchoolOutline"
    const iconKey = `mdi${mdiIconName
        .replace(/-([a-z])/g, (g) => g[1].toUpperCase()) // Convert to camelCase
        .replace(/^[a-z]/, (g) => g.toUpperCase())}`; // Capitalize the first letter

    // Return the path if it exists, otherwise return a default icon
    return mdiIcons[iconKey] || fallback; // mdiAlert as a fallback icon
}
