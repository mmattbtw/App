import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from 'src/app/admin/admin.guard';
import { HomeComponent } from 'src/app/home/home.component';
import { CallbackGuard } from './navigation/callback.guard';


const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Home %cock'
		},
		component: HomeComponent
	},
	{
		path: 'about',
		loadChildren: () => import('src/app/about/about.module').then(m => m.AboutModule)
	},
	{
		path: 'emotes',
		loadChildren: () => import('src/app/emotes/emotes.module').then(m => m.EmotesModule)
	},
	{
		path: 'admin',
		canLoad: [AdminGuard],
		loadChildren: () => import('src/app/admin/admin.module').then(m => m.AdminModule)
	},
	{
		path: 'users',
		loadChildren: () => import('src/app/user/user.module').then(m => m.UserModule)
	},
	{ path: 'user', redirectTo: 'users' },

	{
		path: 'callback',
		data: {
			layoutDisabled: true
		},
		canActivate: [CallbackGuard],
		component: HomeComponent
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {
		initialNavigation: 'enabled'
	})],
	providers: [AdminGuard],
	exports: [RouterModule]
})
export class AppRoutingModule { }
