let dailyTrendChart, subjectDistributionChart, weeklyHoursChart, efficiencyChart;

function initCharts() {
    // Daily Study Trend Chart
    const dailyTrendCtx = document.getElementById('daily-trend-chart').getContext('2d');
    dailyTrendChart = new Chart(dailyTrendCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Study Hours',
                data: [3, 5, 2, 4, 6, 3, 4],
                backgroundColor: 'rgba(13, 110, 253, 0.2)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' hours';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                }
            }
        }
    });

    // Subject Distribution Chart
    const subjectDistCtx = document.getElementById('subject-distribution-chart').getContext('2d');
    subjectDistributionChart = new Chart(subjectDistCtx, {
        type: 'doughnut',
        data: {
            labels: ['Physics', 'Chemistry', 'Mathematics'],
            datasets: [{
                data: [30, 35, 35],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} hours (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Weekly Hours Chart
    const weeklyHoursCtx = document.getElementById('weekly-hours-chart').getContext('2d');
    weeklyHoursChart = new Chart(weeklyHoursCtx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Study Hours',
                data: [25, 30, 28, 32],
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' hours';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                }
            }
        }
    });

    // Efficiency Chart
    const efficiencyCtx = document.getElementById('efficiency-chart').getContext('2d');
    efficiencyChart = new Chart(efficiencyCtx, {
        type: 'radar',
        data: {
            labels: ['Physics', 'Chemistry', 'Mathematics', 'Speed', 'Accuracy', 'Consistency'],
            datasets: [{
                label: 'Current Week',
                data: [75, 80, 70, 65, 85, 75],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
            }, {
                label: 'Previous Week',
                data: [65, 70, 60, 55, 75, 65],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

function updateCharts(data) {
    // Update charts with new data
    // This will be called when new data is available
    // Example:
    // dailyTrendChart.data.datasets[0].data = data.dailyTrend;
    // dailyTrendChart.update();
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', initCharts);