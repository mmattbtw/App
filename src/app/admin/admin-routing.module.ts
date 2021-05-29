import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAuditLogsComponent } from 'src/app/admin/admin-audit-logs/admin-audit-logs.component';
import { AdminUsersComponent } from 'src/app/admin/admin-users/admin-users.component';
import { AdminComponent } from 'src/app/admin/admin.component';
import { AdminModQueueComponent } from 'src/app/admin/mod-queue/admin-mod-queue.component';

const routes: Routes = [
	{
		path: '',
		data: { title: 'Admin' },
		component: AdminComponent,
		children: [
			{
				path: '',
				redirectTo: 'users'
			},
			{
				path: 'users',
				data: { title: 'Admin - Users', breadcrumb: 'Users' },
				component: AdminUsersComponent
			},
			{
				path: 'audit',
				data: { title: 'Admin - Audit Log', breadcrumb: 'Users' },
				component: AdminAuditLogsComponent
			},
			{
				path: 'modq',
				component: AdminModQueueComponent,
				data: { title: 'Admin - Mod Queue' }
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminRoutingModule { }
