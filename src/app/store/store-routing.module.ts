import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreCallbackComponent } from 'src/app/store/callback/store-callback.component';
import { StoreComponent } from 'src/app/store/store.component';

const routes: Routes = [
	{
		path: '',
		component: StoreComponent,
		data: { title: 'Subscribe' }
	},
	{
		path: 'complete',
		component: StoreCallbackComponent,
		data: { title: 'Purchase Complete' }
	},
	{
		path: 'cancel',
		redirectTo: '/subscribe'
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class StoreRoutingModule { }
