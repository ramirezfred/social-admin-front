import { NgModule } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { StatusCardComponent } from './status-card/status-card.component';
import { ContactsComponent } from './contacts/contacts.component';
import { RoomsComponent } from './rooms/rooms.component';
import { RoomSelectorComponent } from './rooms/room-selector/room-selector.component';
import { TemperatureComponent } from './temperature/temperature.component';
import { TemperatureDraggerComponent } from './temperature/temperature-dragger/temperature-dragger.component';
import { TeamComponent } from './team/team.component';
import { KittenComponent } from './kitten/kitten.component';
import { SecurityCamerasComponent } from './security-cameras/security-cameras.component';
import { ElectricityComponent } from './electricity/electricity.component';
import { ElectricityChartComponent } from './electricity/electricity-chart/electricity-chart.component';
import { WeatherComponent } from './weather/weather.component';
import { SolarComponent } from './solar/solar.component';
import { PlayerComponent } from './rooms/player/player.component';
import { TrafficComponent } from './traffic/traffic.component';
import { TrafficChartComponent } from './traffic/traffic-chart.component';

//Mis imports
import { LoadingModule, ANIMATION_TYPES  } from 'ngx-loading';
import { ToasterModule } from 'angular2-toaster';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartModule } from 'angular2-chartjs';

import { ChartjsBarComponent } from './chartjs-mouvers/chartjs-bar.component';
import { ChartjsLineComponent } from './chartjs-mouvers/chartjs-line.component';
import { ChartjsPieComponent } from './chartjs-mouvers/chartjs-pie.component';
import { ChartjsMultipleXaxisComponent } from './chartjs-mouvers/chartjs-multiple-xaxis.component';
import { ChartjsBarHorizontalComponent } from './chartjs-mouvers/chartjs-bar-horizontal.component';
import { ChartjsRadarComponent } from './chartjs-mouvers/chartjs-radar.component';

import { EchartsLineComponent } from './echarts-mouvers/echarts-line.component';
import { EchartsPieComponent } from './echarts-mouvers/echarts-pie.component';
import { EchartsBarComponent } from './echarts-mouvers/echarts-bar.component';
import { EchartsMultipleXaxisComponent } from './echarts-mouvers/echarts-multiple-xaxis.component';
import { EchartsAreaStackComponent } from './echarts-mouvers/echarts-area-stack.component';
import { EchartsBarAnimationComponent } from './echarts-mouvers/echarts-bar-animation.component';
import { EchartsRadarComponent } from './echarts-mouvers/echarts-radar.component';

@NgModule({
  imports: [
    NgxChartsModule,
    ChartModule,
    ThemeModule,
    NgxEchartsModule,
    ToasterModule,
    LoadingModule.forRoot({
        animationType: ANIMATION_TYPES.chasingDots,
        backdropBackgroundColour: 'rgba(0,0,0,0.5)', 
        backdropBorderRadius: '4px',
        primaryColour: '#ffffff', 
        secondaryColour: '#ffffff', 
        tertiaryColour: '#ffffff',
        fullScreenBackdrop: false
    }),
  ],
  declarations: [
    DashboardComponent,
    StatusCardComponent,
    TemperatureDraggerComponent,
    ContactsComponent,
    RoomSelectorComponent,
    TemperatureComponent,
    RoomsComponent,
    TeamComponent,
    KittenComponent,
    SecurityCamerasComponent,
    ElectricityComponent,
    ElectricityChartComponent,
    WeatherComponent,
    PlayerComponent,
    SolarComponent,
    TrafficComponent,
    TrafficChartComponent,

    ChartjsBarComponent,
    ChartjsLineComponent,
    ChartjsPieComponent,
    ChartjsMultipleXaxisComponent,
    ChartjsBarHorizontalComponent,
    ChartjsRadarComponent,
    EchartsLineComponent,
    EchartsPieComponent,
    EchartsBarComponent,
    EchartsMultipleXaxisComponent,
    EchartsAreaStackComponent,
    EchartsBarAnimationComponent,
    EchartsRadarComponent,
  ],
})
export class DashboardModule { }
