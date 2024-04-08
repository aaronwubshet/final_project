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
	
	let hoveredIndex = -1;
	$: hoveredRental = rentals[hoveredIndex] ?? hoveredRental ?? {};

	
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

	/* dl.info with grid layout so that the <dt>s are on the 1st column and the <dd>s on the 2nd, remove their default margins, and apply some styling to make the labels less prominent than the values. */

	.info {
		display: grid;
		grid-template-columns: auto 1fr;
		margin: 0;
	}

	.info dt {
		font-size: 0.8em;
		color: #888;
	}

	.tooltip {
		position: fixed;
		top: 5em;
		right: 45em;
	}


</style>

<svelte:head>
	<title>Who Owns Boston?</title>
</svelte:head>

<h1>Who Owns Boston?</h1>
<p>Below is a map of Boston with the properties owned by the top 10 owners highlighted in different colors {rentals.OWNER}</p>
<p>Hover over a circle to see details about the owner of the property</p>
<dl id="commit-tooltip" class="info tooltip">
	<dt>Number of properties:</dt>
	<dd>...</dd>

	<dt>Percentage of total properties:</dt>
	<dd>...</dd>

	<dt>Average total value:</dt>
	<dd>...</dd>

	<dt>Sum Total Value:</dt>
	<dd>...</dd>

	<dt>Year Built:</dt>
	<dd>...</dd>
</dl>
<div id="map">	
	<svg>
		{#key mapViewChanged}
			{#each rentals as rental }
				<circle 
					cx={ getCoords(rental).cx }
					cy={ getCoords(rental).cy }
					r="5" 
					fill={colorScale(rental.OWNER)}
					on:mouseenter={evt => hoveredIndex = index}
					on:mouseleave={evt => hoveredIndex = -1}
				/> 
		
			{/each}
		{/key}
	</svg>
</div>

