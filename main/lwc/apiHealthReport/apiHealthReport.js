import { LightningElement, api } from "lwc";
import resource_ChartJS23 from '@salesforce/resourceUrl/ChartJS23'; 
import ersatz_getActiveChart from "@salesforce/apex/APIHealthReportController.getAPINHealthReport";
import { loadScript } from "lightning/platformResourceLoader";
import { NavigationMixin } from "lightning/navigation";

export default class ApiHealthReport extends NavigationMixin(LightningElement) {
    @api
    recordId = null;

    @api
    showSpinner = false;

    @api
    readyActiveChart = false;

    @api
    readyActiveChartId;

    @api
    totalActiveChart;


    renderedCallback() {
        if (this.ersatz_Initialized) {
            return;
        }

        this.ersatz_Initialized = true;

        loadScript(this, resource_ChartJS23).then(() => {
            this.afterScriptsLoaded();
        });
    }


    afterScriptsLoaded(event) {
        this.createActiveChart();
    }

    navigateToReport(event) {
        var sobjectId =  event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: "standard__webPage",

            attributes: {
                url: '/report/'+sobjectId
            }
        });
    }

    createActiveChart() {
        var chartCanvas = this.ersatz_FindElement("activeChart");
        var action = ersatz_getActiveChart;
        action().then(response => {
            this.showSpinner = false;
            this.readyActiveChart = false;
            this.readyActiveChartId = response.reportId;
            var reportResultData = JSON.parse(response.reportDetail);
           
            var chartData = [];
            var chartLabels = [];
            this.totalActiveChart = reportResultData.groupingsDown.groupings.length;
            for(var i=0; i < (reportResultData.groupingsDown.groupings.length); i++){
                //Collect all labels for Chart.js data
                var labelTemp = reportResultData.groupingsDown.groupings[i].label;
                chartLabels.push(labelTemp);
                
                var keyTemp = reportResultData.groupingsDown.groupings[i].key;
                //Collect all values for Chart.js data
                var valueTemp = reportResultData.factMap[keyTemp + '!T'].aggregates[0].value ;
                
                chartData.push(valueTemp);
                
            }
            //Construct chart
            var chart = new Chart(chartCanvas,{
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: "API Health Check",
                            data: chartData,
                            backgroundColor: [
                                "#E16405",
                                "#4e4e4e",
                                "#f6a570",
                                "#2ECC71",
                                "#FFB74D",
                                "#E67E22",
                                "#F8C471",
                                "#3498DB",
                                "#00BCD4",
                                "#D32F2F",
                                "#82E0AA",
                                "#AFB42B"
                            ]
                        }
                    ]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: function(value) {if (value % 1   === 0) {return value;}}
                            }
                        }]
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem,chart) {
                                return (chart.datasets[0].data[tooltipItem.index]).toLocaleString('en-US', {
                                    Type: 'time',
                                    time:{
                                        unit:'second'
                                    }                                    
                                });
                            }
                        }
                    },
                    cutoutPercentage: 50,
                    maintainAspectRatio: false,
                    legend: {
                        display: false,
                        position:'right',
                        fullWidth:false,
                        reverse:true,
                        labels: {
                            fontColor: '#000',
                            fontSize:10,
                            fontFamily:"Salesforce Sans, Arial, sans-serif SANS_SERIF"
                        },
                        layout: {
                            padding: 70,
                        }
                    }
                }
            });
            
        }).catch(response => {
            this.showSpinner = false;
            var errors = response;
            if (errors) {
                if (errors[0] && errors[0].message) {
                    console.log("Error message on createReport: " +
                                errors[0].message);
                }
            } else {
                console.log("Unknown error");
            }
        });
    }

    ersatz_FindElement(auraId) {
        return this.template.querySelectorAll(`[data-ersatz-aura-id='${auraId}']`).length === 1 ? this.template.querySelector(`[data-ersatz-aura-id='${auraId}']`) : this.template.querySelectorAll(`[data-ersatz-aura-id='${auraId}']`).length > 1 ? this.template.querySelectorAll(`[data-ersatz-aura-id='${auraId}']`) : undefined;
    }
}