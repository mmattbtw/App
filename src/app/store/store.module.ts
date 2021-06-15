import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { StoreRoutingModule } from 'src/app/store/store-routing.module';
import { StoreSubscribeComponent } from 'src/app/store/store-subscribe/store-subscribe.component';

import { StoreComponent } from './store.component';

@NgModule({
	imports: [
		CommonModule,
		StoreRoutingModule,
		MaterialModule
	],
	exports: [],
	declarations: [
		StoreComponent,
		StoreSubscribeComponent
	],
	providers: [],
})
export class StoreModule { }
