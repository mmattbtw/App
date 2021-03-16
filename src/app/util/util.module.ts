
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { UserNameComponent } from 'src/app/util/user-name/user-name.component';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		RouterModule
	],
	exports: [
		UserNameComponent
	],
	declarations: [
		UserNameComponent
	],
	providers: [],
})
export class UtilModule { }
