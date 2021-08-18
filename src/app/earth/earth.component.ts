import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as WorldWind from '@nasaworldwind/worldwind';
import { Configuration, CollectionInfoJson, CollectionsService, MapsService, VectorFeaturesAndCatalogueRecordsService } from '../api-daraa';

@Component({
  selector: 'app-earth',
  templateUrl: './earth.component.html',
  styleUrls: ['./earth.component.scss']
})
export class EarthComponent implements OnInit, AfterViewInit {

  private wwd: any;
  private renderableLayer: any;

  public collections: CollectionInfoJson[];
  public selectedCollection: CollectionInfoJson;
  public selectedParameter: string;
  public datetime: Date;

  public bbox: number[];

  public loading: boolean;

  constructor(
    private mapsService: MapsService,
    private featuresService: VectorFeaturesAndCatalogueRecordsService,
    private collectionsService: CollectionsService) { }

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
    this.renderableLayer = new WorldWind.RenderableLayer("Renderables")

    this.wwd.addLayer(this.renderableLayer);

    this.wwd.navigator.range = 30000000;
    this.wwd.navigator.lookAtLocation.latitude = 0.0;
    this.wwd.navigator.lookAtLocation.longitude = 0.0;

    this.wwd.redraw();

    let config = new Configuration();
    config.credentials = {};
    config.basePath = "https://aws4ogc17.webmapengine.com/";

    this.collectionsService.configuration = config;
    this.featuresService.configuration = config;
    this.mapsService.configuration = config;

    this.getCollections();
  }

  getCollections() {
    this.collectionsService.collectionsGet().subscribe(result => {
      this.collections = result.collections;
    });
  }

  /**
   * Get features data and render it
   */
  getFeatures() {
    this.loading = true;

    // NOTE: The server can only return max. 1000 features in one request.
    // Results can be paginated with "offset" parameter but the generated API doesn't have this
    //NOTE: Order of coordinates in the bbox is inconsistent between collections
    this.featuresService.getFeatures(this.selectedCollection.id as any, "application/json", 1000,
      [this.bbox[1], this.bbox[0], this.bbox[3], this.bbox[2]]).subscribe(result => {
      console.log(result as any);

      this.loading = false;

      this.renderableLayer.removeAllRenderables();

      for (let feature of (result as any).features) {

        switch (feature.geometry.type) {
          case "Polygon":
            this.createPolygon(feature.geometry.coordinates, feature.id.toString());
            break;
          case "MultiPolygon":
            for (let coords of feature.geometry.coordinates) {
              this.createPolygon(coords, feature.id.toString());
            }
            break;
          case "Point":
            this.createPoint(feature.geometry.coordinates[1], feature.geometry.coordinates[0], feature.id.toString())
            break;
          case "LineString":
            this.createPath(feature.geometry.coordinates, feature.id.toString())
            break;
          case "MultiLineString":
            for (let coords of feature.geometry.coordinates) {
              this.createPath(coords, feature.id.toString())
            }
            break;
        }
      }

      // Move camera to the center of the bounding box
      let centroid = new WorldWind.Location();

      let sector = new WorldWind.Sector(this.bbox[1], this.bbox[3], this.bbox[0], this.bbox[2]);
      sector.centroid(centroid);
      let currentLocation = this.wwd.navigator.lookAtLocation;

      if (!sector.containsLocation(currentLocation.latitude, currentLocation.longitude)) {
        this.wwd.goTo(centroid);
      }

      this.wwd.redraw();
    }, err => {
      this.loading = false;
    })
  }

  /**
   * Create a point object in the renderable layer
   */
  createPoint(latitude: number, longitude: number, label = "") {
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

    this.renderableLayer.addRenderable(placemark);
  }

  /**
   * Create a polygon object in the renderable layer
   */
  createPolygon(coordinates, label = "") {
    var boundaries = [];

    let avgLat = 0;
    let avgLon = 0;

    for (let coords of coordinates) {
      let b = []
      for (let coordinate of coords) {
        b.push(new WorldWind.Position(coordinate[1], coordinate[0]));
        avgLat += coordinate[1];
        avgLon += coordinate[0];
      }
      boundaries.push(b);
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
    this.renderableLayer.addRenderable(polygon);

    this.createText(avgLat, avgLon, label);
  }

  /**
   * Create a path object in the renderable layer
   */
  createPath(coordinates, label = "") {
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

    this.renderableLayer.addRenderable(path);

    this.createText(avgLat, avgLon, label);
  }

  /**
   * Creates a text object in the renderable layer
   */
  createText(latitude, longitude, text) {
    let geoText = new WorldWind.GeographicText(new WorldWind.Position(latitude, longitude), text);
    geoText.altitudeMode = WorldWind.CLAMP_TO_GROUND;
    geoText.depthTest = false;
    this.renderableLayer.addRenderable(geoText);
  }

  onCollectionSelected() {
    console.log(this.selectedCollection);
    this.bbox = this.selectedCollection.extent.spatial.bbox[0];
  }

  /**
   * Get map data and render it
   */
  getMap() {
    this.loading = true;

    this.mapsService.mapGet([this.selectedCollection.id as any], undefined, "CRS84",
        this.bbox, undefined, undefined, undefined, undefined, undefined,
        undefined, "png", undefined, undefined, {httpHeaderAccept: "image/png"}).subscribe(result => {
      console.log(result);

      try {
        let imgUrl = window.URL.createObjectURL(new Blob([result], {type: "image/png"}));

        // Create canvas to hold the image
        let canvas = document.createElement("canvas")
        let ctx2d = canvas.getContext("2d");

        let img = new Image();
        img.src = imgUrl;

        img.onload = () => {
          canvas.height = img.height;
          canvas.width = img.width;
          ctx2d.drawImage(img, 0, 0);

          this.renderableLayer.removeAllRenderables();

          let sector = new WorldWind.Sector(this.bbox[1], this.bbox[3], this.bbox[0], this.bbox[2]);

          let surfaceImage = new WorldWind.SurfaceImage(
            sector,
            new WorldWind.ImageSource(canvas)
          );

          surfaceImage.opacity = 0.8;

          this.renderableLayer.addRenderable(surfaceImage);

          this.wwd.redraw();
          this.loading = false;
        }
      }
      catch (e) {
        console.error(e);
        this.loading = false;
      }

    }, err => {
      this.loading = false;
    });
  }

}
