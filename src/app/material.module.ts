import { NgModule } from '@angular/core';

// Import angular material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ColorDirective } from 'src/app/directive/highlight.directive';

const modules = [
	MatToolbarModule,
	MatRippleModule,
	MatIconModule,
	MatTooltipModule,
	MatButtonModule,
	MatDividerModule,
	MatFormFieldModule,
	MatInputModule,
	MatProgressSpinnerModule,
	MatProgressBarModule,
	MatPaginatorModule
];

@NgModule({
	declarations: [
		ColorDirective
	],
	imports: [...modules],
	exports: [
		...modules,
		ColorDirective
	]
})

export class MaterialModule { }
