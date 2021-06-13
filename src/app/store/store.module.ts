import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { StoreRoutingModule } from 'src/app/store/store-routing.module';

import { StoreComponent } from './store.component';

@NgModule({
	imports: [
		CommonModule,
		StoreRoutingModule,
		MaterialModule
	],
	exports: [],
	declarations: [StoreComponent],
	providers: [],
})
export class StoreModule { }
