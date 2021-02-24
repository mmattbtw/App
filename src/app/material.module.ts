import { NgModule } from '@angular/core';

// Import angular material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

const modules = [
	MatToolbarModule,
	MatRippleModule,
	MatIconModule,
	MatTooltipModule,
	MatButtonModule,
	MatDividerModule
];

@NgModule({
	declarations: [],
	imports: [...modules],
	exports: [
		...modules
	]
})

export class MaterialModule { }
