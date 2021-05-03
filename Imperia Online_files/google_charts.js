var chart = {
    show: tryToDrawCharts
};

function tryToDrawCharts() {
    var dataJsonColumn;
    var resource = $("#res-type-charts").val();
    $.get(
        "generate_chart_colums.php",
        { resType: resource },
        function (data) {
            dataJsonColumn = JSON.parse(data);
            var options = {packages: ['corechart'], callback: drawChartColums};
            google.load('visualization', '1', options);

            function drawChartColums() {

                var elements = dataJsonColumn.elements;
                var xAxis = dataJsonColumn.x_axis;
                var yaxis = dataJsonColumn.y_axis;
                var yLegend = dataJsonColumn.y_legend;

                var arr = new Array();
                arr[0] = new Array('x', yLegend.text);
                for (var i = 0; i < xAxis.labels.labels.length; i++) {
                    arr[i + 1] = new Array(xAxis.labels.labels[i], elements[0].values[i]);
                }
                var data = google.visualization.arrayToDataTable(arr);
                var options = {
                    title: elements[0].text,
                    backgroundColor: '#F8F8D8',
                    titleTextStyle: {color: elements[0].colour},
                    colors: [elements[0].colour, elements[0].colour],
                    chartArea: {width: '90%'},
                    legend: {position: 'bottom'},
                    hAxis: {showTextEvery: 1, minTextSpacing: 1}
                };

                var chart = new google.visualization.ColumnChart(document.getElementById('graph-chart-colums1'));
                chart.draw(data, options);
            }
        }
    );
    var dataJson;
    $.get(
        "generate_chart.php",
        { resType: resource },
        function (data) {
            dataJson = JSON.parse(data);

            var options = {packages: ['corechart'], callback: drawLineChart};
            google.load('visualization', '1', options);

            function drawLineChart() {

                var elements = dataJson.elements;
                var xAxis = dataJson.x_axis;
                var yaxis = dataJson.y_axis;
                var yLegend = dataJson.y_legend;

                var arr = new Array();
                arr[0] = new Array('x', yLegend.text);
                for (var i = 0; i < xAxis.labels.labels.length; i++) {
                    arr[i + 1] = new Array(xAxis.labels.labels[i], elements[0].values[i].value);
                }
                var data = google.visualization.arrayToDataTable(arr);
                var options = {
                    title: elements[0].text,
                    backgroundColor: '#F8F8D8',
                    titleTextStyle: {color: elements[0].colour},
                    colors: [elements[0].colour, elements[0].colour],
                    chartArea: {width: '90%'},
                    legend: {position: 'bottom'},
                    hAxis: {showTextEvery: 1, minTextSpacing: 1}
                };

                var chart = new google.visualization.LineChart(document.getElementById('graph-chart1'));
                chart.draw(data, options);
            }
        }
    );
}
