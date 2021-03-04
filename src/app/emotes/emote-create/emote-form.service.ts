

import { HttpErrorResponse, HttpHeaderResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/service/logger.service';
import { RestService } from 'src/app/service/rest.service';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class EmoteFormService {
	form = new FormGroup({
		name: new FormControl(''),
		emote: new FormControl('')
	});
	uploadedEmote = new BehaviorSubject('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYGAAAAAFAAGKM+MAAAAAAElFTkSuQmCC');
	uploadError = new BehaviorSubject('');
	emoteData = new BehaviorSubject<DataStructure.Emote | null>(null);

	uploading = new BehaviorSubject(false);
	uploadStatus = new BehaviorSubject('');
	uploadProgress = new BehaviorSubject<number | null>(null);

	constructor(
		private restService: RestService,
		private router: Router,
		private logger: LoggerService
	) { }

	/**
	 * Upload the emote file to the server and wait for emote data to be returned
	 */
	uploadEmote(): void {
		let returnedData: DataStructure.Emote | null = null;
		const formData = new FormData(); // Append file to form data
		formData.append('file', this.form.get('emote')?.value);
		formData.append('data', new Blob([JSON.stringify({ // Append metadata to form data
			name: this.form.get('name')?.value
		})], {
			type: 'application/json'
		}), 'FORM_CONTENT');

		this.form.get('name')?.disable();
		this.uploading.next(true); // Set uploading state as true
		this.restService.Emotes.Upload(formData, 0).pipe( // Begin upload
			tap(progress => {
				if (progress instanceof HttpResponse || progress instanceof HttpHeaderResponse) return undefined; // Send progress updates
				switch (progress.loaded >= (progress.total ?? 1)) {
					case true:
						this.uploadStatus.next('Processing...');
						break;
					case false:
						const perc = (progress.loaded) / (progress.total ?? 1) || 100;
						this.uploadStatus.next(`${(perc * 100).toFixed(1)}% uploaded`);
						this.uploadProgress.next(perc * 100);
						break;
				}

				return undefined;
			}),

			RestService.onlyResponse(),
			tap(res => this.emoteData.next(returnedData = res.body)),
			tap(() => this.form.enable()),
			tap(res => this.form.patchValue({
				name: res.body?.name
			}))
		).subscribe({
			complete(): void { done(); },
			error(err: HttpErrorResponse): void { done(err); }
		});

		const done = (err?: HttpErrorResponse) => {
			if (err) this.uploadError.next(err.error?.error ?? err.error);

			// Connect to WebSocket
			// Request the server for processing status
			const ws = new WebSocket(environment.wsUrl);
			ws.onopen = () => {
				this.logger.info(`<WS> Connected to ${environment.wsUrl}`);

				ws.onmessage = (ev) => {
					const data = JSON.parse(ev.data);
					this.logger.info(`<WS> Message Received: ${ev.data}`);
					this.uploadStatus.next(data.payload.message);
				};
				ws.onclose = (ev) => {
					this.logger.info(`<WS> Connection Closed (${ev.code})`);
					this.uploading.next(false);
					this.uploadedEmote.next(this.restService.CDN.Emote(String(returnedData?._id), 4));
					setTimeout(() => {
						this.form.reset();
						this.router.navigate(['/emotes', returnedData?._id]);
					}, 500);
				};

				// Send the message, requesting the server to start sending processing events
				ws.send(JSON.stringify({ type: 'CreateEmote:Status', payload: { emoteId: returnedData?._id } }));
			};
		};
	}

}
