import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/home/home.component';
import { LegalPrivacyComponent } from 'src/app/home/legal/privacy.component';

const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'legal/privacy',
		component: LegalPrivacyComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HomeRoutingModule { }
