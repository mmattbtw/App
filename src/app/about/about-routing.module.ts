
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		component: AboutComponent
	}
];

import { NgModule } from '@angular/core';
import { AboutComponent } from 'src/app/about/about.component';

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AboutRouterModule { }
