import { NgModule } from '@angular/core';
import { AboutRouterModule } from 'src/app/about/about-routing.module';

import { AboutComponent } from 'src/app/about/about.component';
import { MaterialModule } from 'src/app/material.module';
import { UtilModule } from 'src/app/util/util.module';

@NgModule({
	imports: [
		AboutRouterModule,
		MaterialModule,
		UtilModule
	],
	exports: [],
	declarations: [AboutComponent],
	providers: [],
})
export class AboutModule { }
