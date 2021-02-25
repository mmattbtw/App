import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { iconList } from 'src/app/icons-register';
import { ViewportService } from 'src/app/service/viewport.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
	title = 'seventv-app';
	layoutDisabled = false;

	constructor(
		iconRegistry: MatIconRegistry,
		sanitizer: DomSanitizer,
		route: ActivatedRoute,
		public viewportService: ViewportService
	) {
		for (const iconRef of iconList) {
			iconRegistry.addSvgIcon(
				iconRef[0],
				sanitizer.bypassSecurityTrustResourceUrl(`assets/${iconRef[1]}`)
			);
		}
	}
}
