
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { UserNameComponent } from 'src/app/util/user-name/user-name.component';
import { ErrorDialogComponent } from './dialog/error-dialog/error-dialog.component';

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
		UserNameComponent,
		ErrorDialogComponent
	],
	providers: [],
})
export class UtilModule { }
