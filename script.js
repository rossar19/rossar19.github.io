
// Run script after content loads
document.addEventListener("DOMContentLoaded", function(e) {

  // Shrink/Enlarge SVG size
  d3.select("#size").on("click", function(e) {
    var item = "#kandinsky";
    if (d3.select(item).classed("enlarge")) {
      d3.select(item).classed("shrink", true).classed("enlarge", false);
      d3.select(this).text("Zoom In");
    } else {
      d3.select(item).classed("enlarge", true).classed("shrink", false);
      d3.select(this).text("Zoom Out");
    }
  });

  // Display/Hide SVG elements
  d3.select("#animate").on("click", function(e) {
    var item = "#kandinsky";
    var action = d3.select(this).attr("data-action"); // the action to perform
    var t = d3.transition().duration(00); // use transition to perform callback
    var array = [];
    var state = "none"; // visibility state
    var newState = "Animate"; // new state for btn to perform

    if (action == "Animate") {
      state = "block";
      newState = "Disappear";
    }

    // Hides/Displays sibling element after current element is hidden/shown
    var stepThruAni = function(i, arr) {
      if (i < arr.length) {
        d3.select(arr[i]).transition(t).style("display", state).on("end", function(e) {
          stepThruAni(1+i, arr);
        });
      } else { return; }
    }

    // Put SVG elements in array
    d3.select(item).selectAll("*").each(function(e) {
      array.push(this);
    });
    stepThruAni(1, array);
    d3.select(this).attr("data-action", newState).text(newState);
  });
  






});
