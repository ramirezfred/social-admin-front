import { Component, OnDestroy, Input, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-chartjs-pie',
  template: `
    <chart type="pie" [data]="data" [options]="options"></chart>
  `,
})
export class ChartjsPieComponent implements OnDestroy, OnInit {
  data: any;
  options: any;
  themeSubscription: any;

  @Input() dataDiagrama:any;
  etiquetas = [];
  datos = [];
  colores = [];

  //auxColores = ['#61380B', '#011c3d', '#8a7fff', '#40dc7e', '#4ca6ff', '#ffa100', '#ff4c6a'];

  auxColores = [
  '#00FF7F', '#4682B4', '#D2B48C', '#008080',
  '#D8BFD8', '#FF6347', '#40E0D0', '#EE82EE',
  '#9ACD32', '#800080'
  ];

  constructor(private theme: NbThemeService) {

    
  }

  ngOnInit() {
    for (var i = 0; i < this.dataDiagrama.length; ++i) {

      this.etiquetas.push(this.dataDiagrama[i].nombre);
      this.datos.push(this.dataDiagrama[i].count_solicitados);

      const colorIndex = Math.floor(Math.random() * this.auxColores.length);
      this.colores.push(this.auxColores[colorIndex]);
    }

    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

      const colors: any = config.variables;
      const chartjs: any = config.variables.chartjs;

      this.data = {
        labels: this.etiquetas,
        datasets: [{
          data: this.datos,
          backgroundColor: this.colores,
        }],
      };

      this.options = {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [
            {
              display: false,
            },
          ],
          yAxes: [
            {
              display: false,
            },
          ],
        },
        legend: {
          labels: {
            fontColor: chartjs.textColor,
          },
        },
      };
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}
