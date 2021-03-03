import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/home/home.component';
import { CallbackGuard } from './navigation/callback.guard';

const routes: Routes = [
	{
		path: '',
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
		loadChildren: () => import('src/app/admin/admin.module').then(m => m.AdminModule)
	},

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
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
