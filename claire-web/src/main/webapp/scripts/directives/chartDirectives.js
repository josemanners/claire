'use strict';

angular.module('claire.directives').
directive('trianglify', ["$window", function($window) {
    var getTrianglifyPattern = function() {
        var pattern = Trianglify({
            height: $(window).height(),
            width: $(window).width(),
            x_colors: ["#9aeedb","#8aead7","#74e3d2","#63ddd0","#5ed9d2","#52cfd7","#4dcbd9","#59cdde","#6ed1e4","#7bd4e8"],
            color_space: 'lab',
            cell_size: 200
        });

        return pattern;
    };

    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            var pattern;

            if (!scope.isDetailsPage) {
                pattern = getTrianglifyPattern();
                $(element[0]).append(pattern.canvas());

                $(window).on("resize.doResize", function() {
                    element.find("canvas").remove();
                    pattern = getTrianglifyPattern();
                    $(element[0]).append(pattern.canvas());
                });

                scope.$on("$destroy", function() {
                    $(window).off("resize.doResize");
                });
            }
        }
    }
}]).
directive('pieChart', ["$window", function($window) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            scope.$watch("twitterStats", function(newValue, oldValue) {
                if (newValue && newValue !== oldValue) {
                  
                    var positiveTweets = newValue.percentPositive / newValue.totalTweets;
                    var neutralTweets = newValue.percentUnknown / newValue.totalTweets;
                    var negativeTweets = newValue.percentNegative / newValue.totalTweets;
                  
                    radialProgress(element[0])
                        .id('cumulativeBlue')
                        .diameter('200')
                        .margin({top:0, right:0, bottom:0, left:0})
                        .showLegend(false)
                        
                        .value(newValue.percentNegative, 0)
                        .arcDesc('Negative', 0)
                        .value(newValue.percentUnknown, 1)
                        .arcDesc('Neutral', 1)
                        .value(newValue.percentPositive, 2)
                        .arcDesc('Positive', 2)

                        .theme('blue')
                        .style('cumulative')
                        .render();
                        
                }
            });
        }
    };
}]).
directive('pieChartSml', ["$window", function($window) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            scope.$watch("twitterStats", function(newValue, oldValue) {
                if (newValue && newValue !== oldValue) {
                    
                    if ( element[0].id == "positiveTweets") {
                      var thisid = "positiveTweets"
                      var tweets = newValue.percentPositive;
                    } else if ( element[0].id == "neutralTweets") {
                      var thisid = "negativeTweets"
                      var tweets = newValue.percentUnknown;
                    } else if ( element[0].id == "negativeTweets") {
                      var thisid = "negativeTweets"
                      var tweets = newValue.percentNegative;
                    }
                  
                    radialProgressSml(element[0])
                        .id(thisid)
                        .diameter('60')
                        .margin({top:0, right:0, bottom:0, left:0})
                        .showLegend(false)
                        .value(tweets, 0)
                        .theme('blue')
                        .style('cumulative')
                        .render();
                }
            });
        }
    };
}]).
directive('lineChart', ["$window", function($window) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {

            element.bind('plotclick', function(event, pos, item) {
                if (item) {
                    var hoverDate = new Date(Math.floor(pos.x1));
                    var minDate = new Date(hoverDate);
                    var maxDate = new Date(hoverDate);

                    minDate.setDate(minDate.getDate() - 1);
                    maxDate.setDate(maxDate.getDate() + 1);

                    minDate.setUTCHours(0, 0, 0, 0);
                    maxDate.setUTCHours(0, 0, 0, 0);

                    var minTime = Math.floor(minDate.getTime() / 1000);
                    var maxTime = Math.floor(maxDate.getTime() / 1000);

                    $window.open("http://www.topsy.com/s?q=" + scope.drug.brandName + "&mintime=" + minTime + "&maxtime=" + maxTime + "&language=en");
                }
            });

            element.bind('plothover', function(event, pos, item) {
                var hoverDate = new Date(Math.floor(pos.x1));
                var tooltip = "<div class='date'>" + (hoverDate.getMonth() + 1) + '/' + hoverDate.getDate() + '/' +  hoverDate.getFullYear() + "</div>";
                
                if (item) {
                    tooltip += "<div class='value'>";

                    // Check if there is additional custom data to disply in the tooltip
                    if (item.series.data[0].length >= 3 && item.series.data[0][2].data) {
                        var pointData;
                        var length = item.series.data.length;
                        for (var i = 0; i < length; i++) {
                            if (item.datapoint[0] === (new Date(item.series.data[i][0])).valueOf()) {
                                pointData = item.series.data[i];
                                break;
                            }
                        }
                        tooltip += pointData[2].data;
                    } else {
                        tooltip += Math.round(item.datapoint[1]);
                    }

                    tooltip += "</div>";
                }

                $('.flot-tooltip').remove();
                $("<div class='flot-tooltip'>" + tooltip + "</div>").css({
                    position: 'absolute',
                    top: pos.pageY - 20,
                    left: pos.pageX + 15,
                    "z-index": 100000,
                    display: "none"
                }).appendTo("body").fadeIn();
            });

            element.bind('mouseout', function(event) {
                $(".flot-tooltip").remove();
            });

            scope.$watch('mainChartData', function(newValue, oldValue) {
                if (newValue && newValue !== oldValue) {
                    var options = {
                        series: {
                            lines: { 
                                show: true,
                                lineWidth: 2,
                                steps: false,
                            },
                            curvedLines: {
                                active: true
                            },
                            clickable: true,
                            hoverable: true,
                            shadowSize: 0
                        },
                        grid: {
                            show: true,
                            color: "#CCC",
                            borderWidth: { top: 0, right: 0, bottom: 0, left: 0 },
                            clickable: true,
                            hoverable: true,
                            autoHighlight: true
                        },
                        tooltip: {
                            show: true,
                            content: "<span>%y%</span>",
                            defaultTheme: false,
                            shifts: {
                                x: -30,
                                y: -38
                            }
                        },
                        colors: [ 
                            "#56c54e",
                            "#eb6b42",
                            "#b9cace",
                            "rgba(78,197,195,0.5)",
                            "rgba(255,0,205,0.3)"
                        ],
                        xaxis: {
                            font: { 
                              size: 11,
                              lineHeight: 16,
                              weight: "300",
                              family: "Raleway",
                              color: "#444"
                            },
                            mode: "time",
                            tickLength: 10,
                            reserveSpace: true
                        },
                        yaxis: {
                            font: { 
                              size: 11,
                              lineHeight: 16,
                              weight: "300",
                              family: "Raleway",
                              color: "#444"
                            },
                            min: scope.drugChartOptions.min,
                            max: scope.drugChartOptions.max
                        },
                        crosshair: {
                            mode: "x",
                            color: "rgba(100,100,100,0.4)"
                        }
                    };
                    $.plot(element[0], newValue, options);
                }
            });
        }
    };
}]);
