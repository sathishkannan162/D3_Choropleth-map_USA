const projectName = "Choropleth Map";

const margin = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0 };


const width = 950 - margin.right - margin.left;
const height = 600 - margin.top - margin.bottom;

const educationURL =
"https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

const countiesURL =
"https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

var eduData;

const colorBrewer = {
  BnGn: {
    6: ["#edf8fb", "#ccece6", "#99d8c9", "#66c2a4", "#2ca25f", "#006d2c"],
    9: [
    "#f7fcfd",
    "#e5f5f9",
    "#ccece6",
    "#99d8c9",
    "#66c2a4",
    "#41ae76",
    "#238b45",
    "#006d2c",
    "#00441b"] },


  Gn: {
    6: ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c"],
    9: [
    "#f7fcf5",
    "#e5f5e0",
    "#c7e9c0",
    "#a1d99b",
    "#74c476",
    "#41ab5d",
    "#238b45",
    "#006d2c",
    "#00441b"] },


  Bu: {
    9: [
    "#f7fbff",
    "#deebf7",
    "#c6dbef",
    "#9ecae1",
    "#6baed6",
    "#4292c6",
    "#2171b5",
    "#08519c",
    "#08306b"] } };




const colors = colorBrewer.Gn[9];

const heading1 = d3.
select("body").
append("h1").
attr("id", "title").
text("United States Educational Attainment");

const heading2 = d3.
select("body").
append("h3").
attr("id", "description").
text(
"Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");


const section = d3.select("body").append("div").attr("id", "section");

var tip = d3.
tip().
attr("class", "d3-tip").
attr("id", "tooltip").
html(d => d).
direction("n").
offset([-10, 0]);

const svg = d3.
select("body").
append("div").
attr("id", "svg-container").
append("svg").
attr("width", width + margin.left + margin.right).
attr("height", height + margin.top + margin.bottom).
attr("transform", "translate(" + margin.left + "," + margin.top + ")").
call(tip);

const source = d3.
select("body").
append("p").
attr("id", "source").
html(
"Source: " +
'<a href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx">USDA Economic Research Service</a>');

// attribution 
d3.select('body')
.append('p').attr('id','attribution').html('<strong>Attribution:</strong> This chart is an exact replica of freecodecamp project at the url: <a href="https://codepen.io/freeCodeCamp/full/EZKqza">https://codepen.io/freeCodeCamp/full/EZKqza</a> and it was done as a part of coursework of data visualisation on freecodecamp.');

var path = d3.geoPath();

d3.json(countiesURL).
then(countiesGenerator).
catch(err => console.log(err, "counties"));

d3.json(educationURL).
then(eduDataHandle).
catch(err => console.log(err, "education"));

function eduDataHandle(edu) {
  eduData = edu;
}

function countiesGenerator(us) {


  const color = d3.scaleThreshold();

  const maxBachelors = d3.max(eduData, d => d.bachelorsOrHigher);
  const minBachelors = d3.min(eduData, d => d.bachelorsOrHigher);

  function arrayGen(min, max, count) {
    var arr = [];
    var step = (max - min) / count;
    for (let i = 0; i < count; i++) {
      arr.push(min + i * step);
    }
    return arr;
  }

  color.domain(arrayGen(minBachelors, maxBachelors, colors.length));
  color.range(colors);

  //color linear scale
  let startpos = 600;
  let endpos = 850;
  let barWidth = (endpos - startpos) / color.domain().length;
  let barHeight = 10; // same a ticksize

  const colorScale = d3.scaleLinear();
  colorScale.domain([minBachelors / 100, maxBachelors / 100]);
  colorScale.range([startpos, endpos]);

  const colorAxis = d3.axisBottom(colorScale);
  colorAxis.tickValues(color.domain().map(d => d / 100));
  colorAxis.tickSize(barHeight);
  let newTicks = color.domain().map(d => d / 100);
  colorAxis.tickFormat(d3.format(".0%"));

  svg.
  append("g").
  attr("id", "legend").
  selectAll("nothing").
  data(color.domain()).
  join("rect").
  attr("fill", d => color(d)).
  attr("id", (d, i) => "rect" + i).
  attr("x", (d, i) => startpos + barWidth * i).
  attr("y", 30).
  attr("width", barWidth).
  attr("height", barHeight);
  d3.select("#rect" + (color.domain().length - 1)).
  attr("fill", "white").
  remove();

  svg.append("g").call(colorAxis).attr("transform", "translate(0,30)");

  svg.select(".domain").remove();

  svg.
  append("g").
  selectAll("path").
  data(topojson.feature(us, us.objects.counties).features).
  enter().
  append("path").
  attr("data-fips", d => {
    var newObj = eduData.filter(item => {
      return item.fips === d.id;
    });
    return newObj[0].fips;
  }).
  attr("data-education", d => {
    var newObj = eduData.filter(item => {
      return item.fips === d.id;
    });
    return newObj[0].bachelorsOrHigher;
  }).
  attr("d", path).
  attr("class", "county").
  attr("fill", d => {
    var newObj = eduData.filter(item => {
      return item.fips === d.id;
    });
    return color(newObj[0].bachelorsOrHigher);
  }).
  on("mouseover", function (event, d) {
    var newObj = eduData.filter(item => {
      return item.fips === d.id;
    });
    var str =
    "<span>" +
    newObj[0].area_name +
    ", " +
    newObj[0].state +
    ": " +
    newObj[0].bachelorsOrHigher +
    "%";
    "</span>";
    tip.attr("data-education", newObj[0].bachelorsOrHigher);
    tip.show(str, this);
  }).
  on("mouseout", tip.hide);

  svg.
  append("path").
  attr("class", "state-borders").
  attr(
  "d",
  path(
  topojson.mesh(us, us.objects.states, function (a, b) {
    return a !== b;
  })));


}