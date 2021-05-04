import { Component, OnInit } from '@angular/core';
import { CapabilitiesService, Collection, Configuration } from '../api';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {

  public collections: Collection[] = [];
  public displayedColumns: string[] = ['id', 'title'];
  public loading: boolean = false;

  constructor(private capabilitiesService: CapabilitiesService) {
  }

  ngOnInit(): void {
    let config = new Configuration();
    config.basePath = "http://labs.metoffice.gov.uk/edr"
    this.capabilitiesService.configuration = config
    this.loading = true;

    this.capabilitiesService.listCollections().subscribe((result) => {
      this.loading = false;
      this.collections = result.collections;
    });
  }

}
