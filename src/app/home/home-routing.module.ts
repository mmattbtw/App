import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/home/home.component';
import { LegalPrivacyComponent } from 'src/app/home/legal/privacy.component';
import { LegalTOSComponent } from 'src/app/home/legal/tos.component';

const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'legal/privacy',
		component: LegalPrivacyComponent
	},
	{
		path: 'legal/tos',
		component: LegalTOSComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HomeRoutingModule { }
