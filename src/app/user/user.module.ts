import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { MaterialModule } from 'src/app/material.module';
import { UtilModule } from 'src/app/util/util.module';




@NgModule({
	declarations: [
		UserComponent
	],
	imports: [
		CommonModule,
		UserRoutingModule,
		MaterialModule,
		UtilModule
	]
})
export class UserModule { }
