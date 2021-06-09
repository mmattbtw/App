import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from 'src/app/home/home.component';
import { MaterialModule } from 'src/app/material.module';
import { UtilModule } from 'src/app/util/util.module';
import { ChatterinoDialogComponent } from 'src/app/home/chatterino-dialog/chatterino-dialog.component';
import { LegalTOSComponent } from 'src/app/home/legal/tos.component';
import { HomeFeaturedStreamComponent } from 'src/app/home/featured-stream/featured-stream.component';


@NgModule({
	declarations: [
		HomeComponent,
		ChatterinoDialogComponent,
		LegalTOSComponent,
		HomeFeaturedStreamComponent
	],
	imports: [
		CommonModule,
		MaterialModule,
		UtilModule,
		HomeRoutingModule
	]
})
export class HomeModule { }
