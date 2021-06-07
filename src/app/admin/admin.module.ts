import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminAuditLogsComponent } from './admin-audit-logs/admin-audit-logs.component';
import { UtilModule } from 'src/app/util/util.module';
import { MaterialModule } from 'src/app/material.module';
import { AdminComponent } from 'src/app/admin/admin.component';
import { AdminModQueueComponent } from 'src/app/admin/mod-queue/admin-mod-queue.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
	declarations: [
		AdminComponent,
		AdminUsersComponent,
		AdminAuditLogsComponent,
		AdminModQueueComponent
	],
	imports: [
		CommonModule,
		UtilModule,
		ReactiveFormsModule,
		MaterialModule,
		AdminRoutingModule
	]
})
export class AdminModule { }
