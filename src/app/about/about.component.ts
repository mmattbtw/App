import { Component, OnInit } from '@angular/core';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-about',
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

	constructor(
		public themingService: ThemingService
	) { }

	ngOnInit(): void {
	}

}
