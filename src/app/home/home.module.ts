import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from 'src/app/home/home.component';
import { MaterialModule } from 'src/app/material.module';
import { UtilModule } from 'src/app/util/util.module';


@NgModule({
	declarations: [
		HomeComponent
	],
	imports: [
		CommonModule,
		MaterialModule,
		UtilModule,
		HomeRoutingModule
	]
})
export class HomeModule { }
