import { Component, OnDestroy, Input, OnInit } from '@angular/core';
import { NbThemeService, NbColorHelper } from '@nebular/theme';

@Component({
  selector: 'ngx-chartjs-bar',
  template: `
    <chart type="bar" [data]="data" [options]="options"></chart>
  `,
})
export class ChartjsBarComponent implements OnInit {
  data: any;
  options: any;
  themeSubscription: any;

  @Input() dataDiagrama:any;
  etiquetas = [];
  datos = [];
  colores = [];

  auxColores = ['#61380B', '#011c3d', '#8a7fff', '#40dc7e', '#4ca6ff', '#ffa100', '#ff4c6a'];


  constructor(private theme: NbThemeService) {

  }

  ngOnInit() {
    for (var i = 0; i < this.dataDiagrama.length; ++i) {

      this.etiquetas.push(this.dataDiagrama[i].hora);
      this.datos.push(this.dataDiagrama[i].count_solicitados);

      /*const colorIndex = Math.floor(Math.random() * this.auxColores.length);
      this.colores.push(this.auxColores[colorIndex]);*/
    }

    //this.themeSubscription = this.theme.getJsTheme().subscribe(config => {

      //const colors: any = config.variables;
      //const chartjs: any = config.variables.chartjs;

      this.data = {
        labels: this.etiquetas,
        datasets: [{
          data: this.datos,
          label: 'Pedidos',
          backgroundColor: NbColorHelper.hexToRgbA('#8a7fff', 0.8),
        }/*, {
          data: [28, 48, 40, 19, 86, 27, 150],
          label: 'Series B',
          backgroundColor: NbColorHelper.hexToRgbA(colors.infoLight, 0.8),
        }*/],
      };

      this.options = {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          labels: {
            fontColor: '#484848',
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
                color: '#cccccc',
              },
              ticks: {
                fontColor: '#484848',
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
                color: '#cccccc',
              },
              ticks: {
                fontColor: '#484848',
              },
            },
          ],
        },
      };
    //});
  }

  /*ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }*/
}
