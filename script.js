// fetch topology data
fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
.then(response => response.json())
.then(topoData => {

    // convert data from TopoJSON to GeoJSON using topojson library and store into geoDate
    const geoData = topojson.feature(topoData, topoData.objects.counties).features;

    // fetch education rate data
    fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
    .then(response => response.json())
    .then(educationData => {

        drawMap(geoData, educationData)
    })
});

function drawMap(geoData, educationData){
    const svgWidth = 960;
    const svgHeight = 600;

    const svg = d3.select("svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight);

    const tooltip = d3.select("#tooltip");

    //colors
    const DARK_RED = "#E81B23";
    const LIGHT_RED = "#FC6044";
    const LIGHT_BLUE = "#34AAE0";
    const DARK_BLUE = "#3333FF";

    // draw the map
    svg.append("g")
        .selectAll("path")
        .data(geoData)
        .enter()
        .append("path")
        .attr("d", d3.geoPath()) // convert the geoJSON to a path d3 can use
        .attr("class", "county")
        .attr("fill", geoDataItem => {
            const id = geoDataItem.id;    //get the id of county from geoData
            const county = educationData.find(item => item.fips === id);  // find the county from educationData that matches geoData county

            const percentage = county.bachelorsOrHigher;

            if (percentage <= 15){
                return DARK_RED;
            } 
            else if (percentage <= 20){
                return LIGHT_RED;
            } 
            else if (percentage <= 25){
                return LIGHT_BLUE;
            }
            else return DARK_BLUE;
            
        })
        .attr("data-fips", geoDataItem => geoDataItem.id)
        .attr("data-education", geoDataItem => {
            const id = geoDataItem.id;    //get the id of county from geoData
            const county = educationData.find(item => item.fips === id);  // find the county from educationData that matches geoData county

            return county.bachelorsOrHigher;
        })
        /*~~~~~~~~~~~~~~~~~~~~~~~  tooltip code   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
        .on("mouseover", (event, geoDataItem) => {
            tooltip.transition()
                .duration(200)
                .style("visibility", "visible")
                .style("opacity", 0.9);

                const id = geoDataItem.id;   
                const county = educationData.find(item => item.fips === id);  

            tooltip.html(`
                ${county.area_name}, ${county.state}:<br>
                ${county.bachelorsOrHigher}%
            `)

            tooltip.style("left", (event.pageX + 10)  + 'px')
                    .style("top", (event.pageY + 10) + 'px');

            tooltip.attr("data-education", county.bachelorsOrHigher);
                
        })
        .on("mouseout", () => {
            tooltip.transition()
                    .duration(500)
                    .style("visibility", "hidden");
        });
        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/




    /****************************  create legend  ************************/   
    const legendWidth = 100;
    const legendHeight = 150;
    const legendPadding = 15;
    
    const legend = d3.select("#legend")
                        .attr("width", legendWidth)
                        .attr("height", legendHeight)
                        .attr("id", "legend");

    const colors = [DARK_RED, LIGHT_RED, LIGHT_BLUE, DARK_BLUE];

    legend.selectAll("rect")
            .data(colors)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => (legendHeight / 4) * i + legendPadding)
            .attr("width", legendWidth / 4)
            .attr("height", (legendHeight / 4) - legendPadding)
            .attr("fill", c => c);


    /*****************************************************************************/




}
