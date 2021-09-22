import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-youtube-link',
	templateUrl: 'youtube.component.html',
	styleUrls: ['youtube.component.scss']
})
export class YouTubeLinkComponent implements OnInit {
	started = new BehaviorSubject<boolean>(false);
	channelRequestForm = new FormGroup({
		channel_id: new FormControl('', [Validators.required])
	});

	constructor(
		public themingService: ThemingService
	) {}

	start(): void {
		this.started.next(true);
	}

	ngOnInit(): void {}
}
