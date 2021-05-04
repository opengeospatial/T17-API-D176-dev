import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router'

import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CollectionsComponent } from './collections/collections.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LocationsComponent } from './locations/locations.component';
import { DataComponent } from './data/data.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: 'collections', component: CollectionsComponent },
  { path: 'locations', component: LocationsComponent },
  { path: 'data', component: DataComponent },
  { path: '', redirectTo: 'data', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    CollectionsComponent,
    LocationsComponent,
    DataComponent
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
    NgxChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
