import { TextAttribute } from '@angular/compiler/src/render3/r3_ast';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as WorldWind from '@nasaworldwind/worldwind';
import { CapabilitiesService, Collection, CollectionDataQueriesService, Configuration, Parameter } from '../api';

@Component({
  selector: 'app-earth',
  templateUrl: './earth.component.html',
  styleUrls: ['./earth.component.scss'],
  host: {
    class: 'earth-flex'
  }
})
export class EarthComponent implements OnInit, AfterViewInit {

  private wwd: any;
  private placemarkLayer: any;
  private shapesLayer: any;

  public collections: Collection[];
  public selectedCollection: Collection;
  public selectedParameter: string;
  public datetime: Date;

  public bbox: number[];

  public loading: boolean;

  constructor(
    private dataService: CollectionDataQueriesService,
    private capabilitiesService: CapabilitiesService) { }

  ngOnInit(): void {
    this.datetime = new Date();
  }

  ngAfterViewInit() {
    this.wwd = new WorldWind.WorldWindow("earth");

    this.wwd.addLayer(new WorldWind.BMNGLayer());
    this.wwd.addLayer(new WorldWind.BMNGLandsatLayer());
    this.wwd.addLayer(new WorldWind.AtmosphereLayer());

    this.wwd.addLayer(new WorldWind.CompassLayer());
    this.wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(this.wwd));
    this.wwd.addLayer(new WorldWind.ViewControlsLayer(this.wwd));
    this.placemarkLayer = new WorldWind.RenderableLayer("Place Marks")

    this.shapesLayer = new WorldWind.RenderableLayer("Surface Shapes");
    this.wwd.addLayer(this.shapesLayer);

    this.wwd.addLayer(this.placemarkLayer);

    this.wwd.navigator.range = 20000000;
    this.wwd.navigator.lookAtLocation.latitude = 51.5;
    this.wwd.navigator.lookAtLocation.longitude = -0.3;

    this.wwd.redraw();

    let config = new Configuration();
    config.basePath = "labs.metoffice.gov.uk/edr"
    this.dataService.configuration = config;
    this.capabilitiesService.configuration = config;

    this.getCollections();
  }

  getCollections() {
    this.capabilitiesService.listCollections().subscribe(result => {
      this.collections = result.collections;
    });
  }

  getData() {
    let timeStr = this.datetime.toISOString();

    let z = undefined;

    let minLon = -180.0;
    let minLat = -90.0;
    let maxLon = 180.0;
    let maxLat = 90.0;

    let area = `POLYGON((${minLon} ${maxLat},${maxLon} ${maxLat},${maxLon} ${minLat},${minLon} ${minLat},${minLon} ${maxLat}))`;

    this.loading = true;

    this.dataService.getDataForArea(this.selectedCollection.id, area, z,
      timeStr, this.selectedParameter).subscribe(r => {
        console.log(r);
        this.loading = false;

        this.placemarkLayer.removeAllRenderables();

        let result = r as any;

        let goToLocation;

        if (result.coverages) {

          for (let coverage of result.coverages) {
            let value = coverage.ranges[this.selectedParameter].values[0].toString();
            let unit = result.parameters[this.selectedParameter].unit.label.en;

            this.createPlaceMark(
              `${value} ${unit}`,
              coverage.domain.axes.y.values[0],
              coverage.domain.axes.x.values[0]
            )

            goToLocation = new WorldWind.Location(coverage.domain.axes.y.values[0], coverage.domain.axes.x.values[0]);
          }
        }

        this.wwd.goTo(goToLocation);

        this.wwd.redraw();
      }, err =>{
        this.loading = false;
      });
  }

  createPlaceMark(label: string, latitude: number, longitude: number) {
    let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

    // Create the custom image for the placemark with a 2D canvas.
    let canvas = document.createElement("canvas")
    let ctx2d = canvas.getContext("2d");
    let size = 64;
    let c = size / 2 - 0.5;
    let outerRadius = 10;

    canvas.width = size;
    canvas.height = size;

    ctx2d.fillStyle = "red";
    ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
    ctx2d.fill();

    placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);

    let placemark = new WorldWind.Placemark(new WorldWind.Position(latitude, longitude, 0), false, placemarkAttributes);
    placemark.label = label;
    placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

    this.placemarkLayer.addRenderable(placemark);
  }

  onCollectionSelected() {
    this.bbox = this.selectedCollection.extent.spatial.bbox as any;
  }

}
