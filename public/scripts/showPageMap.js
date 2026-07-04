const map = new maplibregl.Map({
	container: 'map',
	style: {
		'version': 8,
		'sources': {
			'raster-tiles': {
				'type': 'raster',
				'tiles': ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
				'tileSize': 256,
				'minzoom': 2,
				'maxzoom': 21,
				'attribution': `${campgroundTitle}-Yelpcamp`,
			}
		},
		'layers': [
			{
				'id': 'simple-tiles',
				'type': 'raster',
				'source': 'raster-tiles',
			}
		],
		'id': 'blank'
	},
	center: geometry.coordinates,
	zoom: 15
});

const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
	`<h6 style="padding-top: 1rem;">${campgroundTitle}</h6>
		<p style="text-align: center;">${campgroundLocation}</p>`
);

const el = document.createElement('div');
el.id = 'marker';

const marker = new maplibregl.Marker({ color: "red" })
	.setLngLat(geometry.coordinates)
	.setPopup(popup)
	.addTo(map)
	.togglePopup();