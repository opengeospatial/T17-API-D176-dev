import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';

import { CollectionsService } from './api/collections.service';
import { ConformanceClassesService } from './api/conformanceClasses.service';
import { CoveragesService } from './api/coverages.service';
import { DataTilesService } from './api/dataTiles.service';
import { LandingPageService } from './api/landingPage.service';
import { MapTilesService } from './api/mapTiles.service';
import { MapsService } from './api/maps.service';
import { SchemasService } from './api/schemas.service';
import { SourceImagesService } from './api/sourceImages.service';
import { TileMatrixSetsService } from './api/tileMatrixSets.service';
import { VectorFeaturesAndCatalogueRecordsService } from './api/vectorFeaturesAndCatalogueRecords.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
