
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ContextMenuComponent } from 'src/app/util/ctx-menu/ctx-menu.component';
import { BanDialogComponent } from 'src/app/util/dialog/error-dialog/ban-dialog/ban-dialog.component';
import { UserNameComponent } from 'src/app/util/user-name/user-name.component';
import { ErrorDialogComponent } from './dialog/error-dialog/error-dialog.component';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		RouterModule,
		ReactiveFormsModule
	],
	exports: [
		UserNameComponent,
		ContextMenuComponent
	],
	declarations: [
		UserNameComponent,
		ContextMenuComponent,
		ErrorDialogComponent,
		BanDialogComponent
	],
	providers: [],
})
export class UtilModule { }
