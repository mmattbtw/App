import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreComponent } from 'src/app/store/store.component';

const routes: Routes = [
	{
		path: '',
		component: StoreComponent,
		data: { title: 'Store' },

		children: [
			{
				path: '',
				data: { title: 'Subscribe' }
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class StoreRoutingModule { }
