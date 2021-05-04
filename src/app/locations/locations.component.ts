import { Component, OnInit } from '@angular/core';
import { CollectionMetadataService, Configuration, FeatureGeoJSON } from '../api';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {

  public locations: FeatureGeoJSON[] = [];
  public displayedColumns: string[] = ['id', 'name', 'latitude', 'longitude'];
  public loading: boolean = false;

  constructor(private metadataService: CollectionMetadataService) { }

  ngOnInit(): void {
    let config = new Configuration();
    config.basePath = "http://labs.metoffice.gov.uk/edr"
    this.metadataService.configuration = config

    this.loading = true;

    this.metadataService.listCollectionDataLocations("metar_demo").subscribe(
      (result) => {
        this.loading = false;
        this.locations = result.features;
      }
    );
  }

}
