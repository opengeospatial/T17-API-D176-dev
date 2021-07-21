import { TextAttribute } from '@angular/compiler/src/render3/r3_ast';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as WorldWind from '@nasaworldwind/worldwind';
import { CapabilitiesService, Collection, Configuration, DataService } from '../api-features';

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
  private featuresLayer: any;
  private shapesLayer: any;

  public collections: Collection[];
  public selectedCollection: Collection;
  public selectedParameter: string;
  public datetime: Date;

  public bbox: number[];

  public loading: boolean;

  constructor(
    private dataService: DataService,
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
    this.featuresLayer = new WorldWind.RenderableLayer("Features")

    this.shapesLayer = new WorldWind.RenderableLayer("Surface Shapes");
    this.wwd.addLayer(this.shapesLayer);

    this.wwd.addLayer(this.featuresLayer);

    this.wwd.navigator.range = 300000;
    this.wwd.navigator.lookAtLocation.latitude = 32.6;
    this.wwd.navigator.lookAtLocation.longitude = 36.0;

    this.wwd.redraw();

    let config = new Configuration();
    config.basePath = "https://test.cubewerx.com/cubewerx/cubeserv/demo/ogcapi/Daraa"
    this.dataService.configuration = config;
    this.capabilitiesService.configuration = config;

    this.getCollections();
  }

  getCollections() {
    this.capabilitiesService.getCollections().subscribe(result => {
      this.collections = result.collections;
    });
  }

  getFeatures() {
    this.loading = true;

    this.dataService.getFeatures(this.selectedCollection.id, 1000, this.bbox.join(",") as any).subscribe(result => {
      console.log(result);

      this.loading = false;

      this.featuresLayer.removeAllRenderables();

      for (let feature of result.features) {

        switch (feature.geometry.type) {
          case "Polygon":
            this.createPolygon(feature.geometry.coordinates[0], feature.id.toString());
            break;
          case "Point":
            this.createPoint(feature.geometry.coordinates[1], feature.geometry.coordinates[0], feature.id.toString())
            break;
          case "LineString":
            this.createPath(feature.geometry.coordinates, feature.id.toString())
            break;
        }
      }
    }, err => {
      this.loading = false;
    })
  }

  /**
   * Create a point object in the renderable layer
   */
  createPoint(latitude: number, longitude: number, label="") {
    let placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

    // Create the custom image for the placemark with a 2D canvas.
    let canvas = document.createElement("canvas")
    let ctx2d = canvas.getContext("2d");
    let size = 64;
    let c = size / 2 - 0.5;
    let outerRadius = 5;

    canvas.width = size;
    canvas.height = size;

    ctx2d.fillStyle = "blue";
    ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
    ctx2d.fill();

    placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);

    let placemark = new WorldWind.Placemark(new WorldWind.Position(latitude, longitude, 0), false, placemarkAttributes);
    placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    placemark.label = label;

    this.featuresLayer.addRenderable(placemark);
  }

  /**
   * Create a polygon object in the renderable layer
   */
  createPolygon(coordinates, label="") {
    var boundaries = [];
    boundaries[0] = []; // outer boundary

    let avgLat = 0;
    let avgLon = 0;

    for (let coordinate of coordinates) {
      boundaries[0].push(new WorldWind.Position(coordinate[1], coordinate[0]));
      avgLat += coordinate[1];
      avgLon += coordinate[0];
    }

    avgLat /= coordinates.length;
    avgLon /= coordinates.length;

    // Create the polygon and assign its attributes.

    var polygon = new WorldWind.SurfacePolygon(boundaries, null);
    polygon.extrude = true; // extrude the polygon edges to the ground

    var polygonAttributes = new WorldWind.ShapeAttributes(null);
    polygonAttributes.drawInterior = true;
    polygonAttributes.drawOutline = true;
    polygonAttributes.outlineColor = WorldWind.Color.BLUE;
    polygonAttributes.interiorColor = new WorldWind.Color(0, 1, 1, 0.5);
    polygonAttributes.applyLighting = true;
    polygon.attributes = polygonAttributes;

    // Add the polygon to the layer
    this.featuresLayer.addRenderable(polygon);

    this.createText(avgLat, avgLon, label);

  }

  /**
   * Create a path object in the renderable layer
   */
  createPath(coordinates, label="") {
    // Create the path's positions.
    var pathPositions = [];

    let avgLat = 0;
    let avgLon = 0;

    for (let coordinate of coordinates) {
      pathPositions.push(new WorldWind.Position(coordinate[1], coordinate[0]));
      avgLat += coordinate[1];
      avgLon += coordinate[0];
    }

    avgLat /= coordinates.length;
    avgLon /= coordinates.length;

    // Create the path.
    var path = new WorldWind.Path(pathPositions, null);
    path.altitudeMode = WorldWind.CLAMP_TO_GROUND;
    path.followTerrain = true;
    path.useSurfaceShapeFor2D = true; // Use a surface shape in 2D mode.

    // Create and assign the path's attributes.
    var pathAttributes = new WorldWind.ShapeAttributes(null);
    pathAttributes.outlineColor = WorldWind.Color.BLUE;
    path.attributes = pathAttributes;

    this.featuresLayer.addRenderable(path);

    this.createText(avgLat, avgLon, label);
  }

  /**
   * Creates a text object in the renderable layer
   */
  createText(latitude, longitude, text) {
    let geoText = new WorldWind.GeographicText(new WorldWind.Position(latitude, longitude), text);
    geoText.altitudeMode = WorldWind.CLAMP_TO_GROUND;
    geoText.depthTest = false;
    this.featuresLayer.addRenderable(geoText);
  }

  onCollectionSelected() {
    console.log(this.selectedCollection);
    this.bbox = this.selectedCollection.extent.spatial.bbox[0];
  }

}
