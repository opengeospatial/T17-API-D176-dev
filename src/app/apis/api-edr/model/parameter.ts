/**
 * Environmental Data Retrieval API\'s
 * Example of Candidate Environmental Data Retrieval API OpenAPI docs
 *
 * The version of the OpenAPI document: 0.0.10
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { ParameterMeasurementApproach } from './parameterMeasurementApproach';
import { Extent } from './extent';
import { ObservedProperty } from './observedProperty';
import { Units } from './units';


/**
 * Definition of data parameter
 */
export interface Parameter { 
    /**
     * type
     */
    type: Parameter.TypeEnum;
    description?: string;
    label?: string;
    /**
     * Data type of returned parameter
     */
    data_type?: Parameter.DataTypeEnum;
    unit?: Units;
    observedProperty: ObservedProperty;
    categoryEncoding?: { [key: string]: number | Array<number>; };
    extent?: Extent;
    /**
     * Unique ID of the parameter, this is the value used for querying the data
     */
    id?: string;
    measurementType?: ParameterMeasurementApproach;
}
export namespace Parameter {
    export type TypeEnum = 'Parameter';
    export const TypeEnum = {
        Parameter: 'Parameter' as TypeEnum
    };
    export type DataTypeEnum = 'integer' | 'float' | 'string';
    export const DataTypeEnum = {
        Integer: 'integer' as DataTypeEnum,
        Float: 'float' as DataTypeEnum,
        String: 'string' as DataTypeEnum
    };
}

