import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminAuditLogsComponent } from './admin-audit-logs/admin-audit-logs.component';
import { UtilModule } from 'src/app/util/util.module';
import { MaterialModule } from 'src/app/material.module';
import { AdminComponent } from 'src/app/admin/admin.component';


@NgModule({
	declarations: [
		AdminComponent,
		AdminUsersComponent,
		AdminAuditLogsComponent
	],
	imports: [
		CommonModule,
		UtilModule,
		MaterialModule,
		AdminRoutingModule
	]
})
export class AdminModule { }
