import { TextAttribute } from '@angular/compiler/src/render3/r3_ast';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as WorldWind from '@nasaworldwind/worldwind';
import { CollectionDataQueriesService, Configuration } from '../api';

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

  constructor(private dataService: CollectionDataQueriesService) { }

  ngOnInit(): void {
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

    this.wwd.navigator.range = 500000;
    this.wwd.navigator.lookAtLocation.latitude = 51.5;
    this.wwd.navigator.lookAtLocation.longitude = -0.3;

    this.wwd.redraw();

    this.getData();
  }

  getData() {
    let config = new Configuration();
    config.basePath = "labs.metoffice.gov.uk/edr"
    this.dataService.configuration = config

    let longitude = -0.45;
    let latitude = 51.483;

    let radius = 100;
    let radiusUnit = "km";

    let collection = "metar_demo";

    let attributes = new WorldWind.ShapeAttributes(null);
    attributes.outlineColor = WorldWind.Color.BLUE;
    attributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);

    let circle = new WorldWind.SurfaceCircle(new WorldWind.Location(latitude, longitude), radius*1000, attributes);
    this.shapesLayer.addRenderable(circle);

    let time = new Date();
    let end = time.toISOString();
    time.setDate(time.getDate() - 1);
    let start = time.toISOString();

    let z = undefined;

    let parameter = "Air Temperature";

    this.dataService.getDataForRadius(collection,
      `POINT(${longitude} ${latitude})`, radius, radiusUnit, z,
      `${start}/${end}`, parameter).subscribe(r => {
        console.log(r);

        let result = r as any;

        for (let coverage of result.coverages) {
          this.createPlaceMark(
            coverage.ranges[parameter].values[0].toString()+"°C",
            coverage.domain.axes.y.values[0],
            coverage.domain.axes.x.values[0]
          )
        }
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


}
