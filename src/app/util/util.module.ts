
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { TwitchButtonComponent } from 'src/app/util/twitch-button/twitch-button.component';

@NgModule({
	imports: [
		MaterialModule
	],
	exports: [
		TwitchButtonComponent
	],
	declarations: [
		TwitchButtonComponent
	],
	providers: [],
})
export class UtilModule { }
