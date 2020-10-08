orange = "#1e87f0"

palette = [
    orange,
    "hsl(28, 45%, 50%)",
    "hsl(118, 45%, 50%)",
    "hsl(298, 35%, 60%)",


]

// I don't completely get this one, but it is quite important
Chart.defaults.global.maintainAspectRatio = false

Chart.defaults.global.title.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"';
Chart.defaults.global.title.fontColor = "rgba(0,0,0, 0.7)";
Chart.defaults.global.title.fontSize = 16
Chart.defaults.global.title.lineHeight = 1.2
Chart.defaults.global.title.padding = 10
Chart.defaults.global.layout = {
    padding: {
        left: 5,
        right: 5,
        top: 10,
        bottom: 10
    }
}

pieBorderColor = 'white'
pieBorderWidth = 1.2

Chart.defaults.global.defaultFontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"';

NO_DATA_TEXT = 'No data for selected time'
NO_DATA_FONT_SIZE = "12px"
NO_DATA_FONT_STYLE = "italic"
NO_DATA_FONT = Chart.defaults.global.defaultFontFamily
NO_DATA_HTML = '<div style="font-size: ' + NO_DATA_FONT_SIZE + ';margin-top: 5em; text-align: center; font-style: ' + NO_DATA_FONT_STYLE + ';">' + NO_DATA_TEXT + '</div>'


function drawMetaVars() {
    var els, i
    for (key in metaData) {
        els = document.getElementsByClassName("metavar_" + key);
        for (i = 0; i < els.length; i++) {
            els[i].innerHTML = escapeHtml(metaData[key])
        }
    }
}


function drawUTCOffsetVar() {
    document.getElementById("utcoffset").innerHTML = getUTCOffset()
}


function drawMap(elemId) {
    jQuery("#world svg").remove()
    jQuery("#" + elemId).vectorMap({
        map: 'world_en',
        backgroundColor: '#fff',
        color: '#ffffff',
        hoverOpacity: 0.7,
        selectedColor: null,
        enableZoom: false,
        showTooltip: true,
        borderOpacity: 0.8,
        color: '#eee',
        values: data.country,
        scaleColors: ['#73B4F3', '#0457A8'],
        normalizeFunction: 'polynomial',
        onLabelShow: function(event, label, region) {
            label[0].innerHTML += (
                '&nbsp;<img title="' + escapeHtml(region) +
                '" src="/famfamfam_flags/gif/' +
                escapeHtml(region) +
                '.gif"></img> </br>' +
                (data.country[region] || "0") +
                " Visits")
        }
    });
}


function drawTitle(user) {
    document.title = "Counter Analytics for " + user
}






function draw() {
    console.log("redrawing")
    destroyRegisteredCharts()

    pageOnly("page-graphs")
    document.getElementById("share-account").style.display = "block" // hacky


    Array.from(document.querySelectorAll(getGeneratedTagNames().join(','))).map(el => {
        if (el.consumes) {

            // very britle hack, refactor this away
            if (el.consumes[0] === 'log') {
                el.draw(logData)
            } else {
                el.draw(...el.consumes.map(key => data[key]))
            }
        }
    })


    drawUTCOffsetVar()
    drawMap("world")
    drawTitle(user)

    var date_keys;
    var date_vals;
    [date_keys, date_vals] = dGetNormalizedDateData(timedData.all.date)

    //drawPie("browser", dGroupData(data.browser, 3), "Browsers")
    //drawPie("platform", dGroupData(data.platform, 3), "Platforms")
    //drawPie("device", dGroupData(data.device, 3), "Devices")


    registerChart(new Chart(document.getElementById("graph"), {
        type: 'bar',
        data: {
            labels: date_keys.map(x => x),
            datasets: [{
                maxBarThickness: 15,
                data: date_vals,
                label: 'Visits',
                backgroundColor: makeGradient("graph"),
                borderColor: orange,
                pointBorderColor: orange,
                pointBackgroundColor: orange,
            }, ],
        },
        options: {
            title: {
                display: true,
                text: "All days"
            },
            tooltips: {
                enabled: true,
                mode: "index",
                intersect: false,
            },
            scales: {
                yAxes: [{
                    gridLines: {
                        display: true,
                    },
                    "scaleLabel": {
                        display: true,
                        labelString: "Visits",
                    },
                    ticks: {
                        beginAtZero: true,
                        userCallback: function(label) {
                            if (Math.floor(label) === label) return kFormat(label);
                        },
                    },
                }, ],
                xAxes: [{
                    gridLines: {
                        display: false,
                    },
                    type: 'time',
                    time: {
                        unit: 'week'
                    },
                    "scaleLabel": {
                        display: false,
                        //labelString: "Date",
                    },
                }, ]
            },
            legend: {
                display: false
            },
        },
    }))


}

function drawSiteSelector(sitesHash, select) {
    var html = ""
    sites = Object.keys(sitesHash)
    sites.sort()
    for (let i in sites) {
        var site = sites[i]
        if (site === select) {
            html += "<option selected=selected value='" + escapeHtml(site) + "'>" + escapeHtml(site) + "</option>"
        } else {
            html += "<option value='" + escapeHtml(site) + "'>" + escapeHtml(site) + "</option>"
        }
    }
    document.getElementById("site-selector").innerHTML = html
}

function emptyIfSumZero(arr) {
    if (arr.reduce((pv, cv) => pv + cv, 0) === 0) {
        return []
    }
    return arr
}


Chart.plugins.register({
    afterDraw: function(chart) {
        if (chart.data.datasets[0].data.length === 0) {
            // No data is present
            ctx = chart.chart.ctx;
            var width = chart.chart.width;
            var height = chart.chart.height;
            chart.clear();
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = NO_DATA_FONT_STYLE + " " + NO_DATA_FONT_SIZE + " " + NO_DATA_FONT;
            ctx.fillText(NO_DATA_TEXT, width / 2, height / 2);
            ctx.restore();
        }
    }
});
