import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router'
import { FormsModule } from '@angular/forms';

import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { FlexLayoutModule } from '@angular/flex-layout';

import { NgxChartsModule } from '@swimlane/ngx-charts';

import { EarthComponent } from './earth/earth.component';
import { CollectionsService, MapsService, VectorFeaturesAndCatalogueRecordsService } from 'api-daraa';
import { CapabilitiesService, CollectionDataQueriesService, CollectionMetadataService } from 'api-edr';
import { DGGSAccessService } from 'api-dggs-old';



const routes: Routes = [
  { path: 'earth', component: EarthComponent },
  { path: '', redirectTo: 'earth', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    EarthComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { useHash: true }),
    MatTableModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatIconModule,
    MatSliderModule,
    NgxChartsModule,
    FlexLayoutModule
  ],
  providers: [CollectionsService,
              MapsService,
              VectorFeaturesAndCatalogueRecordsService,
              CapabilitiesService,
              CollectionDataQueriesService,
              CollectionMetadataService,
              DGGSAccessService],
  bootstrap: [AppComponent]
})
export class AppModule { }
