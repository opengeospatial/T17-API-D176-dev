import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as WorldWind from 'worldwind-ogctb17';

import { h3ToGeoBoundary } from "h3-js";

import { Subscription, timer } from 'rxjs';
import { Configuration, CollectionInfoJson, CollectionsService, MapsService, VectorFeaturesAndCatalogueRecordsService } from 'api-daraa';
import { CapabilitiesService, Collection, CollectionDataQueriesService, CollectionMetadataService, FeatureGeoJSON } from 'api-edr';
import { DGGSAccessService } from 'api-dggs-old';

@Component({
  selector: 'app-earth',
  templateUrl: './earth.component.html',
  styleUrls: ['./earth.component.scss']
})
export class EarthComponent implements OnInit, AfterViewInit {

  private wwd: any;
  private renderableLayer: any;

  public edrCollections: Collection[];
  public selectedEdrCollection: Collection = null;
  public featureCollections: CollectionInfoJson[];
  public selectedFeatureCollection: CollectionInfoJson = null;

  public selectedParameter: string = null;
  public parameters: string[];
  public locations: FeatureGeoJSON[];
  public selectedLocation: FeatureGeoJSON = null;
  public currentEdrFeature: any;
  public selectedTime: Date;
  public selectedTimeMs: number;
  public minTimeMs: number;
  public maxTimeMs: number;

  public bbox: number[];

  public loading: boolean = true;

  public playTimer: Subscription;

  public servers: Server[] = [
    {
      url: "/tb16.geo-solutions.it/geoserver/ogc/dggs",
      type: "dggs"
    },
    {
      url: "https://aws4ogc17.webmapengine.com/edr",
      type: "edr"
    },
    {
      url: "https://aws4ogc17.webmapengine.com/wfs3",
      type: "features"
    },
    {
      url: "/ogcapi.pixalytics.com",
      type: "features"
    }
  ]

  public selectedServer: Server = this.servers[0];

  constructor(
    private mapsService: MapsService,
    private featuresService: VectorFeaturesAndCatalogueRecordsService,
    private featureCollectionsService: CollectionsService,
    private edrDataService: CollectionDataQueriesService,
    private edrCapabilitiesService: CapabilitiesService,
    private edrMetadataService: CollectionMetadataService,
    private dggsAccessService: DGGSAccessService) { }

  ngOnInit(): void {
    //WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_INFO);

    this.selectedTime = new Date();
    this.selectedTime.setHours(this.selectedTime.getHours() - 1);
    this.selectedTimeMs = this.selectedTime.getTime();

    this.maxTimeMs = this.selectedTimeMs;

    let minTime = new Date();
    minTime.setHours(minTime.getHours() - 24);

    this.minTimeMs = minTime.getTime();
  }

  ngAfterViewInit() {
    this.wwd = new WorldWind.WorldWindow("earth");

    let oiLayer = new WorldWind.BMNGOneImageLayer();
    oiLayer.minActiveAltitude = 0;
    this.wwd.addLayer(oiLayer);
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

    let clickRecognizer = new WorldWind.ClickRecognizer(this.wwd, this.handlePick.bind(this));

    this.updateServerConfiguration();

    this.wwd.redraw();
  }

  /**
   * Handle pick event
   */
  handlePick(o) {
    let x = o.clientX;
    let y = o.clientY;
    if (this.selectedServer.type == "dggs") {
      let pickList = this.wwd.pick(this.wwd.canvasCoordinates(x, y));
      console.log(pickList);
      if (pickList) {
        for (let picked of pickList.objects) {
          if (picked.userObject.userProperties && picked.userObject.userProperties.zoneId) {
            this.getChildH3Zones(picked.userObject.userProperties.zoneId, picked.userObject.userProperties.resolution);
          }
        }
      }
    }
  }

  /**
   * Update date when time slider is moved
   */
  onTimeSliderChanged() {
    this.selectedTime = new Date(this.selectedTimeMs);

    this.getData();
  }

  /**
 * Start slider 'play' mode
 */
  playSlider() {
    this.playTimer = timer(0, 5000).subscribe(() => {
      this.selectedTimeMs += (this.maxTimeMs - this.minTimeMs) / 10;

      if (this.selectedTimeMs >= this.maxTimeMs) {
        this.selectedTimeMs = this.minTimeMs;
      }

      this.onTimeSliderChanged();
    });
  }


  /**
   * Stop slider 'play' mode
   */
  stopSlider() {
    if (this.playTimer) {
      this.playTimer.unsubscribe();
    }

    this.playTimer = null;
  }

  /**
   * Switch the server used for requesting data
   */
  updateServerConfiguration() {
    let config = new Configuration();
    config.credentials = {};
    config.basePath = this.selectedServer.url;

    switch (this.selectedServer.type) {
      case "features":
        this.featureCollectionsService.configuration = config;
        this.featuresService.configuration = config;
        this.mapsService.configuration = config;
        this.selectedFeatureCollection = null;
        this.getFeatureCollections();
        break;
      case "edr":
        this.edrCapabilitiesService.configuration = config;
        this.edrDataService.configuration = config;
        this.edrMetadataService.configuration = config;
        this.selectedParameter = null;
        this.selectedLocation = null;
        this.selectedEdrCollection = null;
        this.getEdrCollections();
        break;
      case "dggs":
        this.dggsAccessService.configuration = config;
        this.getH3Zones();
    }
  }

  getEdrCollections() {
    this.loading = true;
    this.edrCapabilitiesService.listCollections().subscribe(result => {
      this.loading = false;
      this.edrCollections = result.collections;
    });
  }

  getFeatureCollections() {
    this.stopSlider();
    this.loading = true;
    this.featureCollectionsService.collectionsGet().subscribe(result => {
      this.loading = false;
      this.featureCollections = result.collections;
    });
  }

  /**
   * Request H3 zones
   */
  getH3Zones() {
    this.loading = true;
    this.dggsAccessService.collectionsCollectionIdZonesGet("dggs:H3", 0, 200).subscribe(r => {
      this.loading = false;
      this.renderableLayer.removeAllRenderables();
      for (let zone of r.features) {
        this.renderH3Zone(zone);
      };
      this.wwd.redraw();
    });
  }

  /**
 * Request child H3 zones
 */
  getChildH3Zones(zoneId: string, resolution) {
    this.loading = true;
    this.dggsAccessService.collectionsCollectionIdChildrenGet("H3", zoneId, undefined, resolution + 1).subscribe(r => {
      this.loading = false;
      for (let zone of r.features) {
        this.renderH3Zone(zone);
      };
      this.wwd.redraw();
    });
  }

  /**
   * Renders a H3 Zone
   */
  renderH3Zone(zone) {
    let hexBoundary = h3ToGeoBoundary(zone["properties"]["zoneId"]);

    // Create a surface polygon.
    let boundary = [];

    for (let coords of hexBoundary) {
      boundary.push(new WorldWind.Location(coords[0], coords[1]))
    }

    let attributes = new WorldWind.ShapeAttributes(null);
    attributes.interiorColor = new WorldWind.Color(1.0, 0.5, 0.0, 0.1);
    attributes.outlineColor = new WorldWind.Color(1.0, 0.5, 0.0, 1)
    attributes.outlineWidth = 3.0;

    let hexagon = new WorldWind.SurfacePolygon(boundary, attributes);
    hexagon.userProperties = {zoneId: zone["properties"]["zoneId"], resolution: zone["properties"]["resolution"]}
    this.renderableLayer.addRenderable(hexagon);
  }

  /**
   * Locations need to be requested when EDR collection changes
   */
  onEdrCollectionChange() {

    this.minTimeMs = new Date(this.selectedEdrCollection.extent.temporal.interval[0][0]).getTime();
    this.maxTimeMs = new Date(this.selectedEdrCollection.extent.temporal.interval[0][1]).getTime();
    this.selectedTime = new Date(this.minTimeMs);
    this.selectedTimeMs = this.selectedTime.getTime();

    this.loading = true;
    this.edrMetadataService.listCollectionDataLocations(
      this.selectedEdrCollection.id, null, null).subscribe(result => {
        this.loading = false;

        this.renderableLayer.removeAllRenderables();

        // WorldWind expects CRS in different format
        if (result["crs"] && result["crs"].properties.name == "urn:ogc:def:crs:OGC::CRS84") {
          result["crs"].properties.name = "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
        let parser = new WorldWind.GeoJSONParser(result);
        parser.load(this.parserCompletionCallback.bind(this), this.shapeConfigurationCallback.bind(this), this.renderableLayer);
        this.locations = result.features;
      })
  }

  /**
   * Get features data and render it
   */
  getFeatures() {
    this.loading = true;

    // NOTE: The server can only return max. 1000 features in one request.
    // Results can be paginated with "offset" parameter but the generated API doesn't have this
    //NOTE: Order of coordinates in the bbox is inconsistent between collections
    this.featuresService.getFeatures(this.selectedFeatureCollection.id as any, "application/json", 1000,
      [this.bbox[1], this.bbox[0], this.bbox[3], this.bbox[2]]).subscribe(result => {
        console.log(result as any);

        this.loading = false;

        this.renderableLayer.removeAllRenderables();

        // WorldWind expects CRS in different format
        if (result["crs"] && result["crs"].properties.name == "urn:ogc:def:crs:OGC::CRS84") {
          result["crs"].properties.name = "urn:ogc:def:crs:OGC:1.3:CRS84"
        }

        let parser = new WorldWind.GeoJSONParser(result);
        parser.load(this.parserCompletionCallback.bind(this), this.shapeConfigurationCallback.bind(this), this.renderableLayer);

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
   * Parser completion callback for GeoJSONParser
   * Called after features have been added to the layer
   * Creates labels for features (placemarks already have them)
   */
  parserCompletionCallback(layer) {
    console.log(layer);
    for (let renderable of layer.renderables) {
      if (renderable instanceof WorldWind.Placemark) {
        continue;
      }
      if (renderable.userProperties._featureLabel) {

        // Show label at the center of the feature
        let centroid = new WorldWind.Location();
        renderable.computeSectors();
        renderable.boundingSector.centroid(centroid);

        this.createText(centroid.latitude, centroid.longitude, renderable.userProperties._featureLabel);
      }
    }
  }

  /**
   * Shape configuration callback for GeoJSONParser
   * Defines attributes to be used for visualizing features
   */
  shapeConfigurationCallback(geometry, properties) {
    let configuration = {
      name: "",
      attributes: null,
      userProperties: properties
    };

    // Value to be displayed in the feature label. Use either the selected parameter (for EDR)
    // or one of the possible fields with name or id information
    let label = properties[this.selectedParameter] ||
      properties.name ||
      properties.id ||
      properties.ogc_id ||
      properties.gml_id;

    if (label) {
      label = label.toString();
      configuration.name = label.toString();
      configuration.userProperties._featureLabel = label;
    }
    if (geometry.isPointType() || geometry.isMultiPointType()) {
      configuration.attributes = new WorldWind.PlacemarkAttributes(null);

      // Create the custom image for the placemark with a 2D canvas.
      let canvas = document.createElement("canvas")
      let ctx2d = canvas.getContext("2d");
      let size = 64;
      let c = size / 2 - 0.5;
      let outerRadius = 5;

      canvas.width = size;
      canvas.height = size;

      ctx2d.fillStyle = "red";
      ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
      ctx2d.fill();

      configuration.attributes.imageSource = new WorldWind.ImageSource(canvas);
    } else if (geometry.isLineStringType() || geometry.isMultiLineStringType()) {
      configuration.attributes = new WorldWind.ShapeAttributes(null);
    } else if (geometry.isPolygonType() || geometry.isMultiPolygonType()) {
      configuration.attributes = new WorldWind.ShapeAttributes(null);
    }
    return configuration;
  };

  /**
   * Creates a text object in the renderable layer
   */
  createText(latitude, longitude, text) {
    let geoText = new WorldWind.GeographicText(new WorldWind.Position(latitude, longitude), text);
    geoText.altitudeMode = WorldWind.CLAMP_TO_GROUND;
    geoText.depthTest = false;
    this.renderableLayer.addRenderable(geoText);
  }

  onFeatureCollectionSelected() {
    console.log(this.selectedFeatureCollection);
    let bboxData;
    if (this.selectedFeatureCollection.extent.spatial) {
      bboxData = this.selectedFeatureCollection.extent.spatial.bbox[0];
    } else if (this.selectedFeatureCollection.extent["bbox"]) {
      bboxData = this.selectedFeatureCollection.extent["bbox"];
    }

    // Bounding box might be defined in different ways
    if (bboxData.length == 2) {
      this.bbox = [...bboxData[0], ...bboxData[1]]
    } else if (bboxData.length == 1) {
      this.bbox = bboxData[0]
    }
    else if (bboxData.length == 4) {
      this.bbox = bboxData
    }

    this.getData();
  }

  /**
   * Get map data and render it
   */
  getMap() {
    this.loading = true;

    this.mapsService.mapGet([this.selectedFeatureCollection.id as any], undefined, "CRS84",
      this.bbox, undefined, undefined, undefined, undefined, undefined,
      undefined, "png", undefined, undefined, { httpHeaderAccept: "image/png" }).subscribe(result => {
        console.log(result);

        try {
          let imgUrl = window.URL.createObjectURL(new Blob([result], { type: "image/png" }));

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

  getData() {
    switch (this.selectedServer.type) {
      case "features":
        this.getFeatures();
        break;
      case "edr":
        this.getEdrData();
        break;
    }
  }

  getEdrData() {
    let timeStr = this.selectedTime.toISOString();

    let z = undefined;

    let minLon = -180.0;
    let minLat = -90.0;
    let maxLon = 180.0;
    let maxLat = 90.0;

    let area = `POLYGON((${minLon} ${maxLat},${maxLon} ${maxLat},${maxLon} ${minLat},${minLon} ${minLat},${minLon} ${maxLat}))`;

    this.loading = true;

    this.edrDataService.getCollectionDataForLocation(this.selectedEdrCollection.id, this.selectedLocation.id.toString(),
      timeStr, null, "application/geo+json").subscribe(r => {
        console.log(r);
        this.loading = false;

        this.renderableLayer.removeAllRenderables();

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
        } else if (result.features) {
          if (result.features.length > 0) {
            let feature = result.features[0];

            // TODO: Is there a way to get the properties with metadata?
            this.parameters = Object.keys(feature.properties);
            if (!this.selectedParameter) {
              this.selectedParameter = this.parameters[0];
            }

            this.currentEdrFeature = feature;

            this.onParameterSelected();

            goToLocation = new WorldWind.Location(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
          } else {
            return;
          }
        }

        console.log("go to location...", goToLocation);

        this.wwd.goTo(goToLocation);

        this.wwd.redraw();
      }, err => {
        this.loading = false;
      });
  }

  /**
   * Switch which parameter is being displayed
   */
  onParameterSelected() {
    this.renderableLayer.removeAllRenderables();

    let parser = new WorldWind.GeoJSONParser(this.currentEdrFeature);
    parser.load(this.parserCompletionCallback.bind(this), this.shapeConfigurationCallback.bind(this), this.renderableLayer);
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

    this.renderableLayer.addRenderable(placemark);
  }

}

interface Server {
  url: string;
  type: "features" | "edr" | "dggs";
}
