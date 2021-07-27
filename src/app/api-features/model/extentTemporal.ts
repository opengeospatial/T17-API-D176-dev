/**
 * A sample API conforming to the draft standard OGC API - Features - Part 1: Core
 * This is a sample OpenAPI definition that conforms to the conformance classes \"Core\", \"GeoJSON\", \"HTML\" and \"OpenAPI 3.0\" of the draft standard \"OGC API - Features - Part 1: Core\".  This example is a generic OGC API Features definition that uses path parameters to describe all feature collections and all features. The generic OpenAPI definition does not provide any details on the collections or the feature content. This information is only available from accessing the feature collection resources.  There is [another example](ogcapi-features-1-example2.yaml) that specifies each collection explicitly.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: info@example.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 * The temporal extent of the features in the collection.
 */
export interface ExtentTemporal { 
    /**
     * One or more time intervals that describe the temporal extent of the dataset. The value `null` is supported and indicates an open time interval. In the Core only a single time interval is supported. Extensions may support multiple intervals. If multiple intervals are provided, the union of the intervals describes the temporal extent.
     */
    interval?: Array<Array<string>>;
    /**
     * Coordinate reference system of the coordinates in the temporal extent (property `interval`). The default reference system is the Gregorian calendar. In the Core this is the only supported temporal coordinate reference system. Extensions may support additional temporal coordinate reference systems and add additional enum values.
     */
    trs?: ExtentTemporal.TrsEnum;
}
export namespace ExtentTemporal {
    export type TrsEnum = 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian';
    export const TrsEnum = {
        HttpWwwOpengisNetDefUomIso86010Gregorian: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian' as TrsEnum
    };
}

