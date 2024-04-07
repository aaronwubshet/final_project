<script>
	import * as d3 from 'd3';
	
	import mapboxgl from "mapbox-gl";
	import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
	mapboxgl.accessToken = "pk.eyJ1IjoiYXd1YnNoZXQiLCJhIjoiY2x1b2tiamFpMjAzMjJqbzN6NGQ3bjdwcyJ9.ipL3t_Mw0hLMfZJCF4oW3w";
	import { onMount } from "svelte";
	

	let map;
	let stations = [];

	onMount( async() => {
		map  = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/awubshet/cluolh0dx016601pbfkif17ra",
			zoom: 12,
			center: [-71.0589,42.3601]
		});
		await new Promise(resolve => map.on("load", resolve));
		stations = await d3.csv("https://drive.google.com/file/d/1ohWuoCZ_fC5lokRx8jiBXI575DImU4FO/view")
		// "https://drive.google.com/file/d/1ohWuoCZ_fC5lokRx8jiBXI575DImU4FO/view?usp=sharing");
			// "https://vis-society.github.io/labs/8/data/bluebikes-stations.csv");
	})
	
	function getCoords (station) {
		let point = new mapboxgl.LngLat(+station.Long, +station.Lat);
		let {x, y} = map.project(point);
		return {cx: x, cy: y};
	}


</script>

<style>
	@import url("$lib/global.css");
	#map {
		flex: 1;
	}
	#map svg {
		position: absolute;
		z-index: 1;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

</style>

<svelte:head>
	<title>Who Owns Boston?</title>
</svelte:head>

<h1>Who Owns Boston?</h1>
<p>Below is a map of Boston with the properties owned by the top 10 owners highlighted in different colors {stations.length}</p>


<div id="map">	
	<svg>
		{#each stations as station }
			<circle 
				cx={ getCoords(station).cx }
				cy={ getCoords(station).cy }
				r="5" 
				fill="steelblue" />
		{/each}
	</svg>
</div>
