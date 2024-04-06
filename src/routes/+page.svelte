<script>
	import * as d3 from 'd3';
	import mapboxgl from "mapbox-gl";
	import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
	mapboxgl.accessToken = "pk.eyJ1IjoiYXd1YnNoZXQiLCJhIjoiY2x1b2tiamFpMjAzMjJqbzN6NGQ3bjdwcyJ9.ipL3t_Mw0hLMfZJCF4oW3w";
	import { onMount } from "svelte";

	onMount(() => {
		let map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/mapbox/streets-v11",
			zoom: 12,
			center: [-71.0589,42.3601]
		});
	})

</script>

<style>
	@import url("$lib/global.css");
	#map {
		flex: 1;
	}

</style>

<svelte:head>
	<title>Who Owns Boston?</title>
</svelte:head>

<h1>Who Owns Boston?</h1>
<p>Below is a map of Boston with the properties owned by the top 10 owners highlighted in different colors</p>

<div id="map" />
