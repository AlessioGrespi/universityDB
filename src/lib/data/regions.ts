export interface Region {
	id: string;
	label: string;
	/** Centre point for distance calculations */
	lat: number;
	lng: number;
	/** Bounding box [south, west, north, east] */
	bounds: [number, number, number, number];
}

/**
 * UK regions with approximate bounding boxes and centre points.
 * Used by the quiz to filter universities by location preference.
 */
export const regions: Region[] = [
	{
		id: 'london',
		label: 'London',
		lat: 51.509,
		lng: -0.118,
		bounds: [51.28, -0.51, 51.69, 0.34]
	},
	{
		id: 'south-east',
		label: 'South East',
		lat: 51.3,
		lng: -0.74,
		bounds: [50.7, -1.85, 51.75, 1.42]
	},
	{
		id: 'south-west',
		label: 'South West',
		lat: 50.95,
		lng: -3.22,
		bounds: [50.0, -5.72, 51.68, -1.85]
	},
	{
		id: 'east',
		label: 'East of England',
		lat: 52.24,
		lng: 0.9,
		bounds: [51.45, -0.5, 52.95, 1.77]
	},
	{
		id: 'west-midlands',
		label: 'West Midlands',
		lat: 52.48,
		lng: -1.9,
		bounds: [52.0, -3.08, 52.95, -1.2]
	},
	{
		id: 'east-midlands',
		label: 'East Midlands',
		lat: 52.83,
		lng: -1.25,
		bounds: [52.0, -1.85, 53.55, -0.25]
	},
	{
		id: 'north-west',
		label: 'North West',
		lat: 53.76,
		lng: -2.7,
		bounds: [53.0, -3.6, 54.78, -1.9]
	},
	{
		id: 'north-east',
		label: 'North East',
		lat: 54.97,
		lng: -1.6,
		bounds: [54.4, -2.35, 55.81, -0.85]
	},
	{
		id: 'yorkshire',
		label: 'Yorkshire & Humber',
		lat: 53.8,
		lng: -1.55,
		bounds: [53.3, -2.55, 54.5, -0.15]
	},
	{
		id: 'scotland',
		label: 'Scotland',
		lat: 56.49,
		lng: -4.2,
		bounds: [54.63, -7.58, 60.86, -0.72]
	},
	{
		id: 'wales',
		label: 'Wales',
		lat: 52.13,
		lng: -3.78,
		bounds: [51.35, -5.35, 53.44, -2.65]
	},
	{
		id: 'northern-ireland',
		label: 'Northern Ireland',
		lat: 54.6,
		lng: -6.65,
		bounds: [54.0, -8.18, 55.36, -5.43]
	}
];

/** Haversine distance in miles between two lat/lng points */
export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
	const R = 3959; // Earth radius in miles
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Check if a point falls within a region's bounding box */
export function isInRegion(lat: number, lng: number, region: Region): boolean {
	const [south, west, north, east] = region.bounds;
	return lat >= south && lat <= north && lng >= west && lng <= east;
}
