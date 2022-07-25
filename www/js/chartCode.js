function plot(){
      /*  var pieData = [
            {
                value: 20,
                color:"#878BB6"
            },
            {
                value : 40,
                color : "#4ACAB4"
            },
            {
                value : 10,
                color : "#FF8153"
            },
            {
                value : 30,
                color : "#FFEA88"
            }
        ];
        // Get the context of the canvas element we want to select
        var countries= document.getElementById("myChart").getContext("2d");
        new Chart(countries).Pie(pieData);
        new Chart(countries {
        type: "pie",
        data: {
            labels: xValues,
            datasets: [{
            backgroundColor: barColors,
            data: yValues
            }]
        },
        options: {
            title: {
            display: true,
            text: "World Wide Wine Production"
            }
        }
        });
*/  
// Bar chart
    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
       //
}

