import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAuditLogsComponent } from 'src/app/admin/admin-audit-logs/admin-audit-logs.component';
import { AdminUsersComponent } from 'src/app/admin/admin-users/admin-users.component';
import { AdminComponent } from 'src/app/admin/admin.component';

const routes: Routes = [
	{
		path: '',
		component: AdminComponent,
		children: [
			{
				path: '',
				redirectTo: 'users'
			},
			{
				path: 'users',
				component: AdminUsersComponent
			},
			{
				path: 'audit',
				component: AdminAuditLogsComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AdminRoutingModule { }
