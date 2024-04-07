<script>
	import * as d3 from 'd3';
	import mapboxgl from "mapbox-gl";
	import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
	mapboxgl.accessToken = "pk.eyJ1IjoiYXd1YnNoZXQiLCJhIjoiY2x1b2tiamFpMjAzMjJqbzN6NGQ3bjdwcyJ9.ipL3t_Mw0hLMfZJCF4oW3w";
	import { onMount } from "svelte";
	
	let mapViewChanged = 0;

	let map;
	let rentals = [];

	onMount( async() => {
		map  = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/awubshet/cluolh0dx016601pbfkif17ra",
			zoom: 11.5,
			center: [-71.0589,42.3601],
			dragPan: false
		});
		await new Promise(resolve => map.on("load", resolve));
		rentals = await d3.csv("https://raw.githubusercontent.com/aaronwubshet/final_project/main/src/lib/top10.csv?token=GHSAT0AAAAAACQULPLT2XVQQ2BZ3EXJWIUQZQTHSWA");
		// https://raw.githubusercontent.com/aaronwubshet/final_project/main/src/lib/dataset.csv?token=GHSAT0AAAAAACQULPLTVEEFEROYS4OZHXE2ZQTFKNQ") 
	})
	
	function getCoords (rental) {
		let point = new mapboxgl.LngLat(+rental.Long, +rental.Lat);
		let {x, y} = map.project(point);
		return {cx: x, cy: y};
	}
	
	let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
	$: map?.on("move", evt => mapViewChanged++);
	
	
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
<p>Below is a map of Boston with the properties owned by the top 10 owners highlighted in different colors {rentals.OWNER}</p>
<svg>

</svg>
<div id="map">	
	<svg>
		{#key mapViewChanged}
			{#each rentals as rental }
				<circle 
					cx={ getCoords(rental).cx }
					cy={ getCoords(rental).cy }
					r="5" 
					fill={colorScale(rental.OWNER)}
				/> 
		
			{/each}
		{/key}
		
	</svg>
</div>
