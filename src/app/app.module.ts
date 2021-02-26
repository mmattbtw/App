import 'zone.js';
import 'zone.js/dist/long-stack-trace-zone.js';
import {} from 'rxjs';
import {} from 'rxjs/operators';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationComponent } from './navigation/navigation.component';
import { MaterialModule } from 'src/app/material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { TwitchButtonComponent } from './util/twitch-button/twitch-button.component';
import { CallbackGuard } from './navigation/callback.guard';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		NavigationComponent,
		TwitchButtonComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		HttpClientModule,
		MaterialModule,
		NgbModule
	],
	providers: [
		CallbackGuard
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
