import { Component, OnInit } from '@angular/core';
import { CollectionDataQueriesService, Configuration } from '../api';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss']
})
export class DataComponent implements OnInit {

  public data: any[] = [{
    name: "Air Temperature", series: []
  },
  {
    name: "Wind Speed", series: []
  }];

  view: [number, number] = [800, 600];

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Time';
  yAxisLabel: string = 'Value';
  timeline: boolean = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  public loading: boolean = false;

  constructor(private dataService: CollectionDataQueriesService) { }

  ngOnInit(): void {
    let config = new Configuration();
    config.basePath = "http://labs.metoffice.gov.uk/edr"
    this.dataService.configuration = config

    let longitude = -0.45;
    let latitude = 51.483;

    let start = "2021-01-01T00:00:00Z";
    let end = "2021-06-01T00:00:00Z";

    let z = undefined;

    let parameter = "Air Temperature,Wind Speed";

    this.loading = true;

    this.dataService.getDataForPoint("metar_demo",
      `POINT(${longitude} ${latitude})`, z,
      `${start}/${end}`, parameter).subscribe(r => {
        this.loading = false;
        let result = r as any;

        for (let i=0; i<result.coverages[0].ranges["Air Temperature"].values.length; i++) {
          this.data[0].series.push({
            name: new Date(result.coverages[0].domain.axes.t.values[i]),
            value: result.coverages[0].ranges["Air Temperature"].values[i]
          });

          this.data[1].series.push({
            name: new Date(result.coverages[0].domain.axes.t.values[i]),
            value: result.coverages[0].ranges["Wind Speed"].values[i]
          });
        }

        console.log(this.data);
      });


  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

}
