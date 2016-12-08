
// Run script after content loads
document.addEventListener("DOMContentLoaded", function(e) {
  
  /*   GLOBAL VARIABLES   */

  var pageTitle = "Happiness: A Global Affair";
  var cIndex;              // Index of country currently viewed
  var avgQ2ByCountry = []; // Array of each country's average happy rating

  // Data nested by categories
  var childrenNest;
  var countryNest;
  var happyNest;
  var genderNest;
  var ageNest;
  var employmentNest;
  var relationshipNest;
  var happyCountryNest;
  var countrySexHappy;
  var countryAgeHappy;
  var countryEmployHappy;
  var countryRelHappy;
  var countryChildHappy;

  var filters; // Categories to filter data
  var simulation; // Force simulation used for particles

  // Keys in data
  var qHappiness = "Q2. Imagine a ladder with steps numbered from 0 at the bottom to 10 at the top.  The top represents the best possible life for you; the bottom, the worst possible life.  On which step do you feel you personally stand at present time?";
  var qGender = "Q132. Gender";
  var qAge = "Q133. How old were you at your last birthday?";
  var qEmployment = "Q140. Which of the following employment situations best describes your current status?";
  var qRelationship = "Q153. Are you currently married, in a legal civil union, widowed, divorced, separated, or none of these?";
  var qChildren = "Q157. How many children have you had?  Please count all your biological children who were born at any time in your life. [In Russia: but do not count adopted children or stepchildren].";

    var colorQ = d3.scaleLinear()
      .domain([0, 5, 10])
      .range(["#7B7B7B", "#F79CAF", "#FAFF0F"]);

  /*   FUNCTIONS   */

  // Draw each country and color based on average happiness
  var drawAvg = function(data) {
    var cWidth = 100; // Width of country rectangle
    var cHeight = 50; // Height of country rectangle
    var rMargin = 20; // Space bewteen country columns
    var bMargin = 55; // Space between country rows
    var width = d3.select(".main-wrapper--countries").node().getBoundingClientRect().width;
    var columns = Math.floor(width/(cWidth + rMargin));
    var height = (cHeight + bMargin) * Math.ceil(data.length/columns);
    var svg = d3.select(".main-wrapper--countries")
      .append("svg")
      .attr("class", "country--svg")
      .style("width", width)
      .style("height", height);

    var rects = svg.selectAll("rect").data(data);     // Element for country
    var nameText = svg.selectAll("text").data(data);  // Element for country's name

    // Assign color based on average
      var color = d3.scaleLinear()
      .domain([4, 6, 8])
      .range(["#7B7B7B", "#E5CCA4", "#FAFF0F"]);

      function calculateX(index) { return (cWidth + rMargin)*(index%columns); }
      function calculateY(index, space) {
        space = (space == null) ? 0 : space; // add more spacing between rows
        return (40 - space) + ((cHeight + bMargin) * Math.floor(index/columns));
      }

      // Add rectangle to SVG
    rects.enter().append("rect")
    .attr("class", "country")
    .attr("width", cWidth)
    .attr("height", cHeight)
    .attr("id",   function(d, i) { return "c" + i; })
    .attr("x",    function(d, i) { return calculateX(i); })
    .attr("y",    function(d, i) { return calculateY(i); })
    .attr("fill", function(d, i) {
      return color(avgQ2ByCountry[i]);
    })
    .on("mouseover", function(d, i) {

      // Show average happiness for this country on hover
      var offset = d3.select(".main-wrapper--countries")
        .node()
        .getBoundingClientRect();
      var x = parseInt(d3.select(this).attr("x")) + offset.left;
      var y = parseInt(d3.select(this).attr("y")) + offset.top;
      d3.select("#L" + i).style("text-decoration", "underline");
      d3.select(".main-wrapper--countries")
        .append("div")
        .attr("class", "avg")
        .style("top", y + "px")
        .style("left", x + "px")
        .style("color", d3.select(this).attr("fill"))
        .text(avgQ2ByCountry[i].toFixed(1));
    })
    .on("mouseout", function(d, i) {

      d3.select("#L" + i).style("text-decoration", "none");
      d3.select(".main-wrapper--countries .avg")
        .remove();
    });

    // Add Text element to SVG
      var name = nameText.enter().append("text")
        .attr("class", "country--name")
        .attr("x",  function(d, i) { return calculateX(i); })
        .attr("y",  function(d, i) { return calculateY(i, 5); })
        .attr("id", function(d, i) { return "L" + i; })
        .html(function(d) {
          var html = d.key;
          if (d.key.length > 12) {
            var arr = d.key.split(" ");
            var x = d3.select(this).attr("x");
            html = '<tspan x="' + x + '" dy="-16">' + arr[0] + 
              '</tspan>' + '<tspan x="' + x + '" dy="16">' + 
              arr[1] + '</tspan>';
          }
          return html;
        });

      createOnClick(data);
  }

  // Creates an on click function for each item in data
  function createOnClick(data) {
      for (var n in data) {
        var id = "#c" + n;
        var mDataWrapper = d3.select(".main-wrapper--data");

      d3.select(id).on("click", function(e) {
        cIndex = this.id.replace("c", "");
        d3.select(".data-header").text(data[cIndex].key);
        d3.select(".main-wrapper--countries").style("display", "none");
        d3.select(".color-scale").style("display", "none");

        mDataWrapper.selectAll("*").remove();
        mDataWrapper.style("display", "block");
        d3.select(".btn-wrapper").style("display", "inline-block");
        addFilterBtns();
      });
      }
  }

  // Adds filter buttons
  function addFilterBtns() {
      var mDataWrapper = d3.select(".main-wrapper--data");
    var btnWrap = d3.select(".btn-wrapper");
    var dataWrap = mDataWrapper
      .append("div")
      .attr("class", "data-wrapper");

    d3.select(".data-copy")
      .append("a")
      .attr("class", "back-btn")
      .attr("href", "javascript:goBack()")
      .text("Choose a different country");

    // Return an array of keys from data's children
    function getChildArr(data) {
      var arr = [];
      var item = (data[0].key != "") ? data[0].key : data[1].key;
      if (isNaN(parseInt(item))) {
        for (var n in data) {
          if (data[n].key != "Refused" 
            && data[n].key != "Dont know") {
            arr.push(data[n].key);
          }
        }
      } else {
        for (var n in data) {
          if (data[n].key < 98 
            && data[n].key != "") {
            arr.push(data[n].key);
          }
        }
      }
      return arr;
    }

    filters = {
      "Happy": ["Happiness"],
      "Sex": getChildArr(genderNest),
      "Age": getChildArr(ageNest).sort(function(a,b) {return a-b}),
      "Job Status": getChildArr(employmentNest),
      "Marital Status": getChildArr(relationshipNest),
      "# of Children": getChildArr(childrenNest).sort(function(a,b) {return a-b})
    };

    // Create a button for each item in filters and create onclick functions
    for (var n in filters) {
      var btn = btnWrap.append("button")
        .attr("id", n)
        .attr("class", "filter-btn")
        .text(n);

      // If first load, display subcategories of first item in filters
      if (d3.select(".data-wrapper").html() == "") {
        displaySubs(filters[n], n);
      }

      // On click, clear old children and add new subcategories
      btn.on("click", function(e) {
        dataWrap.selectAll("*").remove();
        d3.select(".percent-bd").remove();
        displaySubs(filters[this.id], this.id);
      });
    }

    var top = d3.select(".top-wrapper").node().getBoundingClientRect().top;
    var height = d3.select(".top-wrapper").node().getBoundingClientRect().height;
    var yO = top + height;

    d3.select(".data-wrapper").style("padding-top", yO + "px");
  }

  // Add subcategories to page
  function displaySubs(arr, filter) {
    var objArr = [];
    for (var n in arr) {
      var cat = d3.select(".data-wrapper").append("span")
        .attr("class", "category")
        .attr("id", "cat" + n)
        .text(arr[n]);
    }

    setSubcatCoords(objArr);
    drawClusters(countryNest, objArr, cIndex, filter);
  }

  // Calculate subcategory coordinates for data positioning, and push object to array 
  function setSubcatCoords(arr) {
    var top = d3.select(".top-wrapper").node().getBoundingClientRect().top;
    var height = d3.select(".top-wrapper").node().getBoundingClientRect().height;
    var yO = top + height;

    d3.select(".data-wrapper").style("padding-top", yO + "px");

    d3.selectAll(".category").each(function() {
      var w = this.getBoundingClientRect().width;
      var h = this.getBoundingClientRect().height;
      var l = this.getBoundingClientRect().left;
      var t = this.getBoundingClientRect().top;

      var xOffset = d3.select(".data-wrapper").node().getBoundingClientRect().left;
      var yOffset = d3.select(".data-wrapper").node().getBoundingClientRect().top;

      var temp = {
        "key": d3.select(this).text(),
        "x": l + (w/2) - xOffset,
        "y": t + (h/2) - yO
      }

      arr.push(temp);
    });
  }

  // Return to homepage
  function goBack() {
    d3.select('.back-btn').remove();
    d3.select('.data-header').text(pageTitle);
    d3.select('.main-wrapper--data').style("display", "none");
    d3.select('.main-wrapper--countries').style("display", "block");
    d3.select(".color-scale").style("display", "inline-block");
    d3.select(".btn-wrapper").style("display", "none");
    d3.select(".btn-wrapper").selectAll("*").remove();

    simulation.stop();
    d3.select(".data-wrapper svg").remove();
    d3.select(".percent-bd").remove();
  }

  // Calculate the happy percent breakdown of a country returns an array of objects
  // pass country > category > happy rating
  function calcPercent(country, lvl) {
    lvl = (lvl == null) ? false : true;
    var temp = [];
    if (lvl && (country.values[0].key != "Happiness")) {
      country.values = [
        {
          "key": "Happiness",
          "values": country.values
        }
      ];
    } 

    for (var i in country.values) {
      if ((isNaN(parseInt(country.values[i].key))
          && country.values[i].key != "Refused" 
          && country.values[i].key != "Dont know") ||
        (parseInt(country.values[i].key) < 97
          && country.values[i].key != "")) {

        var total = 0;
        var oArr = [];
        var catObj = { "key": country.values[i].key };

        // Sort happy ratings in ascending order
        country.values[i].values.sort(function(a,b) { return a.key - b.key});

        for (var j in country.values[i].values) {
          if (parseInt(country.values[i].values[j].key) < 97) {
            total = total + country.values[i].values[j].values.length;
            var t = {
              "key": country.values[i].values[j].key,
              "percent": country.values[i].values[j].values.length,
              "color": colorQ(country.values[i].values[j].key)
            }

            oArr.push(t);
          }
        }

        for (var i in oArr) {
          oArr[i].percent = ((oArr[i].percent / total) * 100).toFixed(2).replace(".00", "");
        }
        catObj.breakdown = oArr;
        temp.push(catObj);
      }
    }
    
    return temp;
  }

  // Draw each participants response and place under subcategories
  function drawClusters(data, objArr, countIndex, filter) {
    if (simulation != null) { simulation.stop(); }
    var filKey;  // Data key associated with active filter
    var percents;


    var mainWrap = d3.select(".main-wrapper--data").node().getBoundingClientRect().height;
    var top = d3.select(".top-wrapper").node().getBoundingClientRect().top;
    var tHeight = d3.select(".top-wrapper").node().getBoundingClientRect().height;
    var yOffset = top + tHeight;

    var width = d3.select(".data-wrapper")
          .node()
          .getBoundingClientRect().width,
        height = d3.select(".data-wrapper")
          .node()
          .getBoundingClientRect()
          .height;
    var clusters = [];
    for (var i = 0; i < 11; i++) {
      var obj = { "key": i };
      clusters.push(obj);
    }

    switch(filter) {
      case "Happy":
        filKey = qHappiness;
        percents = happyCountryNest[countIndex];
        break;
      case "Sex":
        filKey = qGender;
        percents = countrySexHappy[countIndex];
        break;
      case "Age":
        filKey = qAge;
        percents = countryAgeHappy[countIndex];
        break;
      case "Job Status":
        filKey = qEmployment;
        percents = countryEmployHappy[countIndex];
        break;
      case "Marital Status":
        filKey = qRelationship;
        percents = countryRelHappy[countIndex];
        break;
      case "# of Children":
        filKey = qChildren;
        percents = countryChildHappy[countIndex];
        break;
      default:
        filKey = "Something went wrong...";
        percents = "God, what is happening";
    }

    simulation = d3.forceSimulation()
            .force("collide",d3.forceCollide(2).strength(0))
            .force("charge", d3.forceManyBody().strength(-5))
            .force("y", d3.forceY(function(d) {
                var temp = -999;  // Lazily hide the things that don't apply
                for (var i = 0; i < objArr.length; i++) {
                  if (d[filKey].includes(objArr[i].key) || filKey == qHappiness) {
                    // Add first data point of color group to array and gravitate to center
                    if (d[qHappiness] < 97 
                      && clusters[d[qHappiness]][objArr[i].key] == null) {
                      clusters[d[qHappiness]][objArr[i].key] = {
                        "point": d,
                        "y": objArr[i].y,
                        "x": objArr[i].x
                      };
                      temp = objArr[i].y;
                    } else if (d[qHappiness] < 97) {
                      // gravitate other points to first point of color group
                      temp = clusters[d[qHappiness]][objArr[i].key].y;
                    }
                  }
                }
                return temp;
              })
              .strength(0.7))
            .force("x", d3.forceX(function(d) {
                var temp = -999;
                for (var i = 0; i < objArr.length; i++) {
                  if (d[filKey].includes(objArr[i].key) || filKey == qHappiness) {
                    if (d[qHappiness] < 97 
                      && clusters[d[qHappiness]][objArr[i].key].point == d) {
                      temp = objArr[i].x;
                    } else if (d[qHappiness] < 97) {
                      temp = clusters[d[qHappiness]][objArr[i].key].x;
                    }
                  }
                }
                return temp;
              })
              .strength(0.7))
            .force("cluster", clustering);

    var svg = d3.select(".data-wrapper").append("svg").attr("width", width).attr("height", height - yOffset);
    svg.style("padding-top", yOffset + "px").style("min-height", mainWrap-yOffset + "px");
    var circles = svg.selectAll("circle").data(data[countIndex].values);
    var centers = svg.selectAll("circle").data(objArr);

      var opacity = d3.scaleLinear()
        .domain([0, 5, 10])
        .range([0.2, 0.6, 1])

      var radius = d3.scaleLinear()
        .domain([0, 20, 100])
        .range([45, 80, 100]);

      var colorArr = [];
      for (var i = 0; i < 11; i++) {
        colorArr.push(colorQ(i));
      }

    var circle = circles.enter()
      .append("circle")
      .attr("r", 2)
      .attr("fill", function(d, i) {
        var happy = d[qHappiness];
        if (parseInt(happy) < 97 && happy != "") {
          return colorQ(happy);
        } else {
          return "black";
        }
      });

    var center = centers.enter()
      .append("circle")
      .attr("id", function(d) {
        return "cent" + d.key;
      })
      .attr("r", 50)
      .attr("fill", "transparent")
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      })
      .on("mouseover", function(d) {
        d3.select(".percent-bd").remove();
        var cp = (filKey == qHappiness) ? calcPercent(percents, true) : calcPercent(percents);
        var pw = d3.select(".data-wrapper").append("div").attr("class", "percent-wrap");
        var pwIW = pw.append("div").attr("class", "inner-wrap");
        var te = d3.select("body").append("div").attr("class", "percent-bd");
        te.append("span").attr("class", "percent-cat").text(d.key);

        for (var i in cp) {
          if (d.key == cp[i].key) {
            for (var j in cp[i].breakdown) {
              var size = cp[i].breakdown.length * 22 + 50;
              size = (size > 150) ? size : 150;
              pwIW.style("width", size + "px").style("height", size + "px");
              var pwBox = pw.node().getBoundingClientRect();
              var t = d.y - (pwBox.height/2);
              var l = d.x - (pwBox.width/2);
              pw.style("left", l+"px").style("top", t+"px");

              var block = te.append("div")
                .style("width", (cp[i].breakdown[j].percent - 0.01) + "%")
                .style("height", "100%")
                .style("display", "inline-block")
                .style("position", "relative")
                .style("background-color", cp[i].breakdown[j].color);

              var label = block.append("div")
                .attr("class", "percent-label")
                .style("border-color", cp[i].breakdown[j].color);

              if (block.node().getBoundingClientRect().width < 50) {
                var m = 40;
                var n = 60;
                if (j < 5) {
                  label.attr("class", "percent-label--left")
                    .style("height", ((m*(4-j))+n)+"px")
                    .style("top", ((-m*(4-j))-n)+"px")
                    .style("z-index", 10-j);
                } else {
                  label.attr("class", "percent-label--right")
                    .style("height", ((m*(j-5))+n)+"px")
                    .style("top", ((-m*(j-5))-n)+"px")
                    .style("z-index", 10-j);
                }
              }

              label.append("mark")
                .attr("class", "rating")
                .text(cp[i].breakdown[j].key)

              label.append("mark")
                .text(cp[i].breakdown[j].percent + "%");
            }
          }
        }
      })
      .on("mouseout", function(d) {
        d3.select(".percent-wrap").remove();
      });


        // cluster the color groups
        function clustering(alpha) {
        circle.each(function(d) {
          if (d[filKey] != "Refused" 
            && d[filKey] != "Dont know" 
            && d[filKey] != "" 
            && d[qHappiness] < 97
            && (isNaN(d[filKey]) || d[filKey] < 97))
          {
            // magic math stuff
              var cluster = clusters[d[qHappiness]][d[filKey]];
              if (filKey == qHappiness) { 
                cluster = clusters[d[qHappiness]]["Happiness"];
              };

            var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = 4;
            if (l !== r) {
              l = (l - r) / l * alpha;
                d.x -= x *= l; 
                d.y -= y *= l;
                cluster.x += x;
                cluster.y += y;
            }
          }
        });
    }

        function ticked(e) {
            circle
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }
        
        simulation
            .nodes(data[countIndex].values)
            .on("tick", ticked)
            .alphaDecay(0.007);
  }

  d3.csv("Global Attitudes - shortCSV.csv", function(error, data) {
    d3.select("#loading").remove();
    function nestDataBy(category) {
      return d3.nest()
        .key(function(d, i) {
          return d[category];
        }).sortKeys(d3.ascending)
        .entries(data);
    }

    function nest2DataBy(c1, c2) {
      return d3.nest()
        .key(function(d) {
          return d[c1];
        }).sortKeys(d3.ascending)
        .key(function(d) {
          return d[c2];
        }).sortKeys(d3.ascending)
        .entries(data);
    }

    function nest3DataBy(c1, c2, c3) {
      return d3.nest()
        .key(function(d) {
          return d[c1];
        }).sortKeys(d3.ascending)
        .key(function(d) {
          return d[c2];
        }).sortKeys(d3.ascending)
        .key(function(d) {
          return d[c3];
        }).sortKeys(d3.ascending)
        .entries(data);
    }

    countryNest = nestDataBy("Country");
    happyNest = nestDataBy(qHappiness);
    genderNest = nestDataBy(qGender);
    ageNest = nestDataBy(qAge);
    employmentNest = nestDataBy(qEmployment);
    relationshipNest = nestDataBy(qRelationship);
    childrenNest = nestDataBy(qChildren);
    happyCountryNest = nest2DataBy("Country", qHappiness);
    countrySexHappy = nest3DataBy("Country", qGender, qHappiness);
    countryAgeHappy = nest3DataBy("Country", qAge, qHappiness);
    countryEmployHappy = nest3DataBy("Country", qEmployment, qHappiness);
    countryRelHappy = nest3DataBy("Country", qRelationship, qHappiness);
    countryChildHappy = nest3DataBy("Country", qChildren, qHappiness);

    // Calculate average happiness for each country and push to avgQ2ByCountry
      for (var i = 0; i < countryNest.length; i++) {
        var temp = 0;
        var total = countryNest[i].values.length;
        for (var j = 0; j < countryNest[i].values.length; j++) {
          var val = countryNest[i].values[j][qHappiness];
          if (!isNaN(parseInt(val)) && parseInt(val) != 98 && parseInt(val) != 99) {
            temp = temp + parseInt(val);
          } else { total = total - 1; }
        }
        var average = temp / total;
        avgQ2ByCountry.push(average);
      }

      console.log(countryNest);
      drawAvg(countryNest);
  });

});
