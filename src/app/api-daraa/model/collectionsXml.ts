/**
 * Daraa
 * This data store is offered by CubeWerx Inc. as a demonstration of its in-progress OGC API implementation.
 *
 * The version of the OpenAPI document: 9.3.52
 * Contact: mgalluch@cubewerx.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { LinkXml } from './linkXml';
import { CollectionInfoXml } from './collectionInfoXml';


/**
 * This schema defines the JSON resource returned from the /collections endpoint.
 */
export interface CollectionsXml { 
    service: string;
    version: string;
    links: Array<LinkXml>;
    collections: Array<CollectionInfoXml>;
}
