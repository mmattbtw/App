import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminAuditLogsComponent } from './admin-audit-logs/admin-audit-logs.component';


@NgModule({
	declarations: [AdminUsersComponent, AdminAuditLogsComponent],
	imports: [
		CommonModule,
		AdminRoutingModule
	]
})
export class AdminModule { }
