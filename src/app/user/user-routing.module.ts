import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserHomeComponent } from 'src/app/user/user-home/user-home.component';
import { UserComponent } from 'src/app/user/user.component';

const routes: Routes = [
  {
		path: ':user',
		data: {
			title: 'User - %User'
		},
		component: UserComponent,

		children: [
			{
				path: '',
				component: UserHomeComponent
			}
		]
	}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
