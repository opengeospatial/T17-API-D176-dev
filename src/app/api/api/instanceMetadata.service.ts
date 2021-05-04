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
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent, HttpParameterCodec }       from '@angular/common/http';
import { CustomHttpParameterCodec }                          from '../encoder';
import { Observable }                                        from 'rxjs';

import { EdrFeatureCollectionGeoJSON } from '../model/models';
import { Exception } from '../model/models';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';



@Injectable({
  providedIn: 'root'
})
export class InstanceMetadataService {

    protected basePath = 'http://www.example.org/edr';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();
    public encoder: HttpParameterCodec;

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }


    private addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        } else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }

    private addToHttpParamsRecursive(httpParams: HttpParams, value?: any, key?: string): HttpParams {
        if (value == null) {
            return httpParams;
        }

        if (typeof value === "object") {
            if (Array.isArray(value)) {
                (value as any[]).forEach( elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            } else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key,
                        (value as Date).toISOString().substr(0, 10));
                } else {
                   throw Error("key may not be null if value is Date");
                }
            } else {
                Object.keys(value).forEach( k => httpParams = this.addToHttpParamsRecursive(
                    httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        } else if (key != null) {
            httpParams = httpParams.append(key, value);
        } else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }

    /**
     * List available location identifers for the instance
     * List the locations available for the instance of the collection
     * @param collectionId Identifier (id) of a specific collection
     * @param instanceId Identifier (id) of a specific instance of a collection
     * @param bbox Only features that have a geometry that intersects the bounding box are selected. The bounding box is provided as four or six numbers, depending on whether the coordinate reference system includes a vertical axis (height or depth): * Lower left corner, coordinate axis 1 * Lower left corner, coordinate axis 2 * Minimum value, coordinate axis 3 (optional) * Upper right corner, coordinate axis 1 * Upper right corner, coordinate axis 2 * Maximum value, coordinate axis 3 (optional) The coordinate reference system of the values is WGS 84 longitude/latitude (http://www.opengis.net/def/crs/OGC/1.3/CRS84) unless a different coordinate reference system is specified in the parameter &#x60;bbox-crs&#x60;. For WGS 84 longitude/latitude the values are in most cases the sequence of minimum longitude, minimum latitude, maximum longitude and maximum latitude. However, in cases where the box spans the antimeridian the first value (west-most box edge) is larger than the third value (east-most box edge). If the vertical axis is included, the third and the sixth number are the bottom and the top of the 3-dimensional bounding box. If a feature has multiple spatial geometry properties, it is the decision of the server whether only a single spatial geometry property is used to determine the extent or all relevant geometries.
     * @param datetime Either a date-time or an interval, open or closed. Date and time expressions adhere to RFC 3339. Open intervals are expressed using double-dots. Examples: * A date-time: \&quot;2018-02-12T23:20:50Z\&quot; * A closed interval: \&quot;2018-02-12T00:00:00Z/2018-03-18T12:31:12Z\&quot; * Open intervals: \&quot;2018-02-12T00:00:00Z/..\&quot; or \&quot;../2018-03-18T12:31:12Z\&quot; Only features that have a temporal property that intersects the value of &#x60;datetime&#x60; are selected. If a feature has multiple temporal properties, it is the decision of the server whether only a single temporal property is used to determine the extent or all relevant temporal properties.
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public listDataInstanceLocations(collectionId: string, instanceId: string, bbox?: object, datetime?: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/geo+json' | 'text/xml' | 'application/json' | 'application/x-netcdf' | 'text/html'}): Observable<EdrFeatureCollectionGeoJSON>;
    public listDataInstanceLocations(collectionId: string, instanceId: string, bbox?: object, datetime?: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/geo+json' | 'text/xml' | 'application/json' | 'application/x-netcdf' | 'text/html'}): Observable<HttpResponse<EdrFeatureCollectionGeoJSON>>;
    public listDataInstanceLocations(collectionId: string, instanceId: string, bbox?: object, datetime?: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/geo+json' | 'text/xml' | 'application/json' | 'application/x-netcdf' | 'text/html'}): Observable<HttpEvent<EdrFeatureCollectionGeoJSON>>;
    public listDataInstanceLocations(collectionId: string, instanceId: string, bbox?: object, datetime?: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/geo+json' | 'text/xml' | 'application/json' | 'application/x-netcdf' | 'text/html'}): Observable<any> {
        if (collectionId === null || collectionId === undefined) {
            throw new Error('Required parameter collectionId was null or undefined when calling listDataInstanceLocations.');
        }
        if (instanceId === null || instanceId === undefined) {
            throw new Error('Required parameter instanceId was null or undefined when calling listDataInstanceLocations.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (bbox !== undefined && bbox !== null) {
          queryParameters = this.addToHttpParams(queryParameters,
            <any>bbox, 'bbox');
        }
        if (datetime !== undefined && datetime !== null) {
          queryParameters = this.addToHttpParams(queryParameters,
            <any>datetime, 'datetime');
        }

        let headers = this.defaultHeaders;

        let httpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (httpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/geo+json',
                'text/xml',
                'application/json',
                'application/x-netcdf',
                'text/html'
            ];
            httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        let responseType: 'text' | 'json' = 'json';
        if(httpHeaderAcceptSelected && httpHeaderAcceptSelected.startsWith('text')) {
            responseType = 'text';
        }

        return this.httpClient.get<EdrFeatureCollectionGeoJSON>(`${this.configuration.basePath}/collections/${encodeURIComponent(String(collectionId))}/instances/${encodeURIComponent(String(instanceId))}/locations`,
            {
                params: queryParameters,
                responseType: <any>responseType,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
