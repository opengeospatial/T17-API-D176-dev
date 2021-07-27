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
import { Extent } from './extent';
import { Link } from './link';


export interface Collection { 
    /**
     * identifier of the collection used, for example, in URIs
     */
    id: string;
    /**
     * human readable title of the collection
     */
    title?: string;
    /**
     * a description of the features in the collection
     */
    description?: string;
    links: Array<Link>;
    extent?: Extent;
    /**
     * indicator about the type of the items in the collection (the default value is \'feature\').
     */
    itemType?: string;
    /**
     * the list of coordinate reference systems supported by the service
     */
    crs?: Array<string>;
}
