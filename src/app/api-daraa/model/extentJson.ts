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
import { ExtentJsonTemporal } from './extentJsonTemporal';
import { ExtentJsonSpatial } from './extentJsonSpatial';


/**
 * Schema for Extent data structures (JSON).
 */
export interface ExtentJson { 
    spatial?: ExtentJsonSpatial;
    temporal?: ExtentJsonTemporal;
}

