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
			interactive: false
		});
		await new Promise(resolve => map.on("load", resolve));
		rentals = await d3.csv("https://raw.githubusercontent.com/aaronwubshet/final_project/main/src/lib/top10.csv?token=GHSAT0AAAAAACQULPLSRPEN6IY2Y3IVZHHEZQTJR5Q");
		// TODO consolidate data and only have fields we need
		// calculate landlord score and likelihood to be purchased by a top 10 owner  in the next 5 years by using some clustering algorithms to determine similarity to current portfolio of properties owned by current top 10 owner
		
	})
	
	function getCoords (rental) {
		let point = new mapboxgl.LngLat(+rental.Long, +rental.Lat);
		let {x, y} = map.project(point);
		return {cx: x, cy: y};
	}
	
	let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
	$: map?.on("move", evt => mapViewChanged++);
	let hoveredOwner = null;
	let hoveredIndex = -1;
	// $: hoveredRental = rentals[hoveredIndex] ?? hoveredRental ?? {};

	// other features to add: time line slider, search functionality even if owner isnt top 10 for a score given an address\

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
		pointer-events: auto;
	}
	dl.info {
		display: grid;
		grid-template-columns: auto 1fr;
		margin: 0;
		gap: 0.5em;
		transition-duration: 500ms;
		transition-property: opacity, visibility;
		&[hidden]:not(:hover, :focus-within) {
			opacity: 0;
			visibility: hidden;
		}
	}

	dl.info dt {
		color: #888;
		font-weight: normal;
	}

	dl.info dd {
		margin-left: 0;
		font-weight: bold;
	}

	.tooltip {
		position: fixed;
		top: 5em;
		right: 45em;
		background-color: hsla(100, 0%, 100%, 0.8);
		padding: 1em;
		border-radius: 5px;
		box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(10px);
	}
	circle {
		transition: 200ms;
		transform-origin: center;
		transform-box: fill-box;
		&:hover {
			transform: scale(3);

		}
	}

	.grey {
    	fill: grey !important;
  	}
</style>

<svelte:head>
	<title>Who Owns Boston?</title>
</svelte:head>

<h1>Who Owns Boston?</h1>
<p>Below is a map of Boston with the relevant* rental properties. Those owned by the top 10 are highlighted in different colors.</p>
<dl>Features coming soon!!</dl>
	<dd><li> Hover over a circle owned by a top 10 owner to see details about the property and it's owner </li></dd>
	<dd><li> Address searching functionality </li></dd>
	<dd><li> Year over year view with timeline slider going back to 2014</li></dd>
	<p>	</p>
	
<!-- define how we decide what to include / exclude -->


<dl id="commit-tooltip" class="info tooltip" hidden={hoveredIndex === -1}>
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

	<dt>Eviction rate:</dt>
	<dd>...</dd>

	<dt>Code violations:</dt>
	<dd>...</dd>

	<dt>Overall Landlord Score:</dt>
	<dd>...</dd>

	<!-- TODO add connections to data source for field calculations  -->

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
					class:grey={hoveredOwner !== null && rental.OWNER !== hoveredOwner}
    				on:mouseenter={evt => { hoveredIndex = 0; hoveredOwner = rental.OWNER; }}
    				on:mouseleave={evt => { hoveredIndex = -1; hoveredOwner = null; }}				
				/> 
		
			{/each}
		{/key}
	</svg>

</div>

<p>* Relevant is defined using..</p>