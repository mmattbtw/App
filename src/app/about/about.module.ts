import { NgModule } from '@angular/core';
import { AboutRouterModule } from 'src/app/about/about-routing.module';

import { AboutComponent } from 'src/app/about/about.component';

@NgModule({
	imports: [
		AboutRouterModule
	],
	exports: [],
	declarations: [AboutComponent],
	providers: [],
})
export class AboutModule { }
