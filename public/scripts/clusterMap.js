const map = new maplibregl.Map({
	container: 'clusterMap',
	style: 'https://demotiles.maplibre.org/style.json',
	center: [0, 20],
	zoom: 1,
	minZoom: 1,
	fadeDuration: 1 // this is in order for the text and circles to move "as-one"
});

map.on('load', () => {
	map.addSource('campgrounds', {
		type: 'geojson',
		data: clusterSource,
		cluster: true,
		clusterMaxZoom: 14, // Max zoom to cluster points on
		clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
	});

	map.addLayer({
		id: 'clusters',
		type: 'circle',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		paint: {
			// Use step expressions (https://maplibre.org/maplibre-style-spec/#expressions-step)
			// with three steps to implement three types of circles:
			//   * Blue, 20px circles when point count is less than 10
			//   * Pumpkin orange, 30px circles when point count is between 10 and 30
			//   * Pink, 40px circles when point count is greater than or equal to 30
			'circle-color': [
				'step',
				['get', 'point_count'],
				'#51BBD6',
				10,
				'#FB7D07',
				30,
				'#F28CB1'
			],
			'circle-radius': [
				'step',
				['get', 'point_count'],
				20,
				10,
				30,
				30,
				40
			]
		}
	});

	map.addLayer({
		id: 'cluster-count',
		type: 'symbol',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		layout: {
			'text-field': '{point_count_abbreviated}',
			'text-font': ['Noto Sans Regular'],
			'text-size': 12
		}
	});

	map.addLayer({
		id: 'unclustered-point',
		type: 'circle',
		source: 'campgrounds',
		filter: ['!', ['has', 'point_count']],
		paint: {
			'circle-color': '#f00',
			'circle-radius': 4,
			'circle-stroke-width': 1,
			'circle-stroke-color': '#fff'
		}
	});

	map.on('click', 'clusters', async (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['clusters']
		});
		const clusterId = features[0].properties.cluster_id;
		const zoom = await map.getSource('campgrounds').getClusterExpansionZoom(clusterId);
		map.easeTo({
			center: features[0].geometry.coordinates,
			zoom
		});
	});

	map.on('click', 'unclustered-point', (e) => {
		const coordinates = e.features[0].geometry.coordinates.slice();
		const { popup } = e.features[0].properties
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}
		new maplibregl.Popup()
			.setLngLat(coordinates)
			.setHTML(
				popup
			)
			.addTo(map);
	});

	map.on('mouseenter', 'clusters', () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'clusters', () => {
		map.getCanvas().style.cursor = '';
	});
	map.on('mouseenter', 'unclustered-point', () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'unclustered-point', () => {
		map.getCanvas().style.cursor = '';
	});
});