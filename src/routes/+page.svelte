<script>
	import * as d3 from 'd3';
	import mapboxgl from "mapbox-gl";
	import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
	import { onMount } from "svelte";

	// overall variables
	let rentals = [];
	mapboxgl.accessToken = "pk.eyJ1IjoiYXd1YnNoZXQiLCJhIjoiY2x1b2tiamFpMjAzMjJqbzN6NGQ3bjdwcyJ9.ipL3t_Mw0hLMfZJCF4oW3w";
	let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
	let format = d3.format(",.2f")
	let filteredRentals = [];
	//search variables
	let query = "";

	//time filter variables
	let timeFilterLabel;
	let filterYear = 2024; //initial filter year

	//map object and view change counter
	let map2;
	let mapViewChanged2 = 0;
	let mapViewChanged = 0;
	let map;
	
	//tool tip and ciricle selection variables
	let hoveredOwner = null;
	let hoveredIndex = -1;
	let totalPropertiesByOwner= 0;
	let totalProperties = 0;
	let percentageOfTotalProperties = 0;
	let averageTotalValue = 0;
	let ownerRentals =[];
	let totalValue = 0;
	let yearBuilt = 0;
	let avgEvictRate = 0;
	let totalCodeViolations = 0;
	let futurePurchaseProbability = 0;
	let landlordScore = 0;

	onMount( async() => {
		// create map object
		map  = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/awubshet/cluolh0dx016601pbfkif17ra",
			zoom: 11.5,
			center: [-71.0589,42.3601],
			interactive: true
		}); 
		await new Promise(resolve => map.on("load", resolve)); // wait until the map is fully loaded before start next map 

		// create map object
		map2  = new mapboxgl.Map({
			container: "map2",
			style: "mapbox://styles/awubshet/cluolh0dx016601pbfkif17ra",
			zoom: 11.5,
			center: [-71.0589,42.3601],
			interactive: true
		});
		await new Promise(resolve => map2.on("load", resolve)); // wait until the map is fully loaded before loading data
		
		// https://raw.githubusercontent.com/aaronwubshet/final_project/main/src/lib/consolidated_data.csv
		rentals = await d3.csv("https://raw.githubusercontent.com/aaronwubshet/final_project/main/src/lib/test_data.csv", row => ({
        ...row,
        _id: Number(row._id), // or just +row.line
        Lat: Number(row.Lat),
		Long: Number(row.Long),
		TOTAL_VALUE: +row.TOTAL_VALUE,
		YR_BUILT: Number(row.YR_BUILT),
		Evict_rate: Number(row.Evict_rate),
		Code_violation_count: Number(row.Code_violation_count),
		Likelihood_of_purchase: Number(row.Likelihood_of_purchase),
		Landlord_score: Number(row.Landlord_score),
		Top_10_owner: Number(row.Top_10_owner),
		DATA_YR: Number(row.DATA_YR)
        }) ); // load data
		// TODO consolidate data and only have fields we need
		
		
	})
	

	// two getCoords functions one for each map
	function getCoords (rental) {
		let point = new mapboxgl.LngLat(+rental.Long, +rental.Lat);
		let {x, y} = map.project(point);
		return {cx: x, cy: y};
	}

	function getCoords2 (rental) {
		let point = new mapboxgl.LngLat(+rental.Long, +rental.Lat);
		let {x, y} = map2.project(point);
		return {cx: x, cy: y};
	}
	
	function handleMouseExit(index, evt) {
		hoveredIndex = -1;
		hoveredOwner = null;
	}

	// recalculate tooltip data when hovering over a circle
	function handleMouseEnter(index, evt) {
		hoveredIndex = index;
		hoveredOwner = filteredRentals[hoveredIndex].OWNER;	
		totalPropertiesByOwner = filteredRentals.filter(r => r.OWNER === hoveredOwner).length;
		percentageOfTotalProperties = (totalPropertiesByOwner/totalProperties) * 100;
		ownerRentals = filteredRentals.filter(r => r.OWNER === hoveredOwner);
    	totalValue = d3.sum(ownerRentals, r => +r.TOTAL_VALUE);
    	averageTotalValue = totalValue / ownerRentals.length;
		yearBuilt = filteredRentals[hoveredIndex].YR_BUILT;
		avgEvictRate = d3.mean(ownerRentals, r => +r.Evict_rate);
		totalCodeViolations = d3.sum(ownerRentals, r => +r.Code_violation_count);
		futurePurchaseProbability = d3.mean(ownerRentals, r => +r.Likelihood_of_purchase);
		landlordScore = d3.mean(ownerRentals, r => +r.Landlord_score);
	}
	
	$: totalProperties = filteredRentals.length;
	
	$: console.log("total properties:", totalProperties);
	
	// update view change counter when either map is moved
	$: map?.on("move", evt => mapViewChanged++); 
	$: map2?.on("move", evt => mapViewChanged2++);
	
	// Time filtering data being piped to the map
  	$: timeFilterLabel = new Date(filterYear, 0, 1).toLocaleString("en", {year: "numeric"}); // Update the time filter label whenever the filter year changes

	// connect filterYear to actually filter dataset
	$: filteredRentals = rentals.filter(r => r.DATA_YR === filterYear);

	$:console.log("filtered rentals:", filteredRentals);

	// Search functionality

	// Landlord score
	// calculate landlord score and likelihood to be purchased by a top 10 owner  in the next 5 years by using some clustering algorithms to determine similarity to current portfolio of properties owned by current top 10 owner


</script>

<style>
	@import url("$lib/global.css");
	#map2 {
		flex: 1;
	}
	#map2 svg {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 700px;
		pointer-events: none;
	}

	#map {
		flex: 1;
	}
	#map svg {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 700px;
		pointer-events: none;
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
		top: 1em;
		right: 1em;
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
		pointer-events: auto;
	}

	.grey {
    	fill: grey !important;
  	}

	.search {
			width: 100%;
			font-size: 2em;
	}
</style>

<svelte:head>
	<title>Who Owns Boston?</title>
</svelte:head>

<h1>Who Owns Boston? (and why you need to know them before signing your lease) </h1>

<h3> Introduction</h3>
<p> Boston is a city with a rich history and a diverse population. It is also a city with a high cost of living and a competitive rental market. In recent years, the city has seen a surge in the number of rental properties owned by large companies and investment firms. These companies, often referred to as "corporate landlords," own thousands of rental units in the city and have a significant impact on the local rental market. </p>
<p></p>

<h3> Interactive map of top 10 owners</h3>
<p>Below is a map of Boston with the relevant* rental properties. Those owned by the top 10 are highlighted in different colors. Try out the slider to see how this has changed in the last 10 years!</p>
<dl>Features coming soon!!</dl>
	<dd><li> Hover over a circle owned by a top 10 owner to see details about the property and it's owner </li></dd>
	<dd><li> Address searching functionality </li></dd>
	<dd><li> Year over year view with timeline slider going back to 2014</li></dd>
	<dd><li> More comprehensive set of data points (approximately 2,000 shown below)</li></dd>
	<dd><li> Zoom and interactive flexibility + other bug fixes</li></dd>
	<p>	</p>
	

<label for="year-slider">Filter Year: {timeFilterLabel}</label>
<input id="year-slider" type="range" min={2014} max={2024} step="1" bind:value={filterYear} />
<p>	</p>
<dl id="commit-tooltip" class="info tooltip" hidden={hoveredIndex === -1}>
	<dt>Number of properties:</dt>
	<dd>{totalPropertiesByOwner}</dd>

	<dt>Percentage of total properties:</dt>
	<dd>{percentageOfTotalProperties.toFixed(2)}%</dd>

	<dt>Average total value:</dt>
	<dd>${format(averageTotalValue)}</dd>

	<dt>Sum Total Value:</dt>
	<dd>${format(totalValue)}</dd>

	<dt>Year Built:</dt>
	<dd>{yearBuilt}</dd>

	<dt>Eviction rate:</dt>
	<dd>{avgEvictRate.toFixed(2)}%</dd>

	<dt>Code violations:</dt>
	<dd>{totalCodeViolations}</dd>

	<dt>Future purchase probability^:</dt>
	<dd>{futurePurchaseProbability.toFixed(2)}%</dd>

	<dt>Overall Landlord Score:</dt>
	<dd>{landlordScore}</dd>

	<!-- TODO add connections to data source for field calculations  -->

</dl>
<div id="map">	
	<svg>
		{#key mapViewChanged}
			{#each filteredRentals as rental, index (rental._id) }
				<circle 
					cx={ getCoords(rental).cx }
					cy={ getCoords(rental).cy }
					r="5" 
					fill={rental.Top_10_owner === 1 ? colorScale(rental.OWNER): "grey"}
					class:grey={hoveredOwner !== null && rental.OWNER !== hoveredOwner}
					on:mouseleave={evt => handleMouseExit(index, evt)}
					on:mouseenter={evt => handleMouseEnter(index,evt)}			
				/> 
			{/each}
		{/key}
	</svg>

</div>

<div id="article-section">	
	<h3>Eviction rates</h3>
	<p>Eviction rates are important for...</p>

	<img src="images/graph1.png" alt="Image description" />

</div>

<div id="article-section">	
	<h3>Impact on low income communities</h3>
	<p>Impact on low income....</p>

	<img src="images/graph3.png" alt="Image description" />
</div>

<div id="article-section">	
	<h3>What you can do</h3>
	<p>you have the power to influence the boston market for renters</p>
	<p>do your research</p>

	<img src="images/graph1.png" alt="Image description" />

</div>


<input class="search"
        type="search"
        bind:value="{query}"
        aria-label="Search projects"
        placeholder="🔍 Search projects…"
/>
<div id="map2">	
	<svg>
		{#key mapViewChanged2}
			{#each filteredRentals as rental }
				<circle 
					cx={ getCoords2(rental).cx }
					cy={ getCoords2(rental).cy }
					r="5" 
					fill={rental.Top_10_owner === 1 ? colorScale(rental.OWNER): "grey"}
					class:grey={hoveredOwner !== null && rental.OWNER !== hoveredOwner}
					/>
			{/each}
		{/key}
	</svg>

</div>

<!-- {rental.Top_10_owner === "1" ? colorScale(rental.OWNER): "grey"}		 -->
<div id="footer">
<p>* Relevant is defined using land use codes from <a href= "https://data.boston.gov/dataset/property-assessment/resource/fda18178-b7f8-49fc-be3e-75ddc0be4117"> Boston Property Assessment Data</a></p>
<p> ^Estimated probabilty of property to be purchased by a top 10 owner in the future</p>
</div>
<!-- define how we decide what to include / exclude -->