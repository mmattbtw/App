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
import { TagSystemComponent } from './util/tag-system/tag-system.component';
import { UserNameComponent } from './util/user-name/user-name.component';
import { AdminComponent } from './admin/admin.component';
import { UtilModule } from 'src/app/util/util.module';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		NavigationComponent,
		TagSystemComponent,
		UserNameComponent,
		AdminComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		HttpClientModule,
		MaterialModule,
		UtilModule,
		NgbModule
	],
	providers: [
		CallbackGuard
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
