import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { MaterialModule } from 'src/app/material.module';




@NgModule({
	declarations: [
		UserComponent
	],
	imports: [
		CommonModule,
		UserRoutingModule,
		MaterialModule
	]
})
export class UserModule { }
