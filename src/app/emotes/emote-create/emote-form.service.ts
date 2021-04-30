

import { HttpErrorResponse, HttpHeaderResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/service/logger.service';
import { RestService } from 'src/app/service/rest.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EmoteFormService {
	form = new FormGroup({
		name: new FormControl('', [
			Validators.pattern(Constants.Emotes.NAME_REGEXP)
		]),
		tags: new FormControl([]),
		emote: new FormControl('')
	});
	uploadedEmote = new BehaviorSubject(EmoteFormService.DefaultUploadImg);
	uploadError = new BehaviorSubject('');
	processError = new BehaviorSubject('');
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
	uploadEmote(isV2 = true): void {
		// Validate form
		if (!this.form.valid) {
			return this.processError.next(Object.keys(this.form.errors ?? {}).map(k => (this.form.errors ?? {})[k]).join(' '));
		}
		this.processError.next('');

		let returnedData: DataStructure.Emote | null = null;
		const formData = new FormData(); // Append file to form data

		if (this.form.get('name')?.value?.length > 0) {
			formData.append('name', this.form.get('name')?.value);
		}
		formData.append('tags', this.form.get('tags')?.value ?? '');
		formData.append('emote', this.form.get('emote')?.value);

		this.form.get('name')?.disable(); // Disable the form as the emote uploads
		this.uploading.next(true); // Set uploading state as true

		const o = isV2 ? this.restService.v2.CreateEmote(formData) : this.restService.v1.Emotes.Upload(formData);
		o.pipe( // Begin upload
			tap(progress => {
				// Only accept progress emissions
				if (progress instanceof HttpResponse || progress instanceof HttpHeaderResponse) return undefined; // Send progress updates
				switch (progress.loaded >= (progress.total ?? 1)) {
					case true: // Upload complete: processing will begin shortly
						this.uploadStatus.next(isV2
							? 'Upload complete, creating emote...'
							: 'Upload complete, waiting for server to begin processing...');
						this.uploadProgress.next(0);
						break;
					case false: // File is being uploaded to the server
						const perc = (progress.loaded) / (progress.total ?? 1) || 100;
						this.uploadStatus.next(`${(perc * 100).toFixed(1)}% uploaded`);
						this.uploadProgress.next(perc * 100);
						break;
				}

				return undefined;
			}),

			RestService.onlyResponse(), // Only accept the HTTP response signaling the emote was created in the backend
			tap(res => this.emoteData.next(returnedData = res.body)),
			tap(res => this.form.patchValue({ // Patch the form with data the server returned
				name: res.body?.name
			}))
		).subscribe({
			next(res): void { done(undefined, res.body ?? undefined); },
			error(err: HttpErrorResponse): void { done(err); }
		});

		const done = (err?: HttpErrorResponse, data?: DataStructure.Emote): void => {
			if (err) {
				this.reset();
				this.uploadProgress.next(100);
				this.processError.next(this.restService.formatError(err));
				return;
			}

			if (isV2) {
				this.uploadStatus.next('Done!');
				this.uploadProgress.next(100);
				setTimeout(() => {
					this.form.reset();
					this.router.navigate(['/emotes', data?.id]);
				}, 500);
			} else {
				// Connect to WebSocket
				// Request the server for processing status
				const ws = new WebSocket(environment.wsUrl);
				ws.onopen = () => {
					this.logger.info(`<WS> Connected to ${environment.wsUrl}`);

					ws.onmessage = (ev) => { // Receive messages from the websocket
						const { tasks, message } = JSON.parse(ev.data)?.payload;
						let status = message;
						this.logger.info(`<WS> Message Received: ${ev.data}`);

						if (Array.isArray(tasks)) {
							const progress = Number((tasks[0] / tasks[1] * 100).toFixed(1));
							this.logger.info(`Processing Progress: ${progress}%`);
							this.uploadProgress.next(progress);

							status = `${progress}% ${status}`; // Update progress
						}
						this.uploadStatus.next(status);
					};
					ws.onclose = (ev) => { // Listen for closure
						this.logger.info(`<WS> Connection Closed (${ev.code} ${ev.reason})`);

						if (ev.code === 1000) { // Normal Closure: upload was successful!
							this.uploading.next(false);
							this.uploadedEmote.next(this.restService.CDN.Emote(String(returnedData?.id), 4));
							setTimeout(() => {
								this.form.reset();
								this.router.navigate(['/emotes', returnedData?.id]);
							}, 200);
						} else { // Abnormal Closure (likely 1011): display error
							this.processError.next(`Error: ${ev.reason ?? 'Unknown'}`);
						}

						this.reset(); // Done: reset the form.
					};

					// Send the message, requesting the server to start sending processing events
					ws.send(JSON.stringify({ type: 'CreateEmote:Status', payload: { emoteId: returnedData?.id } }));
				};
			}
		};
	}

	reset(): void {
		this.form.reset();
		this.uploadedEmote.next(EmoteFormService.DefaultUploadImg);
		this.uploading.next(false);
		this.uploadStatus.next('');
		this.emoteData.next(null);
		this.form.enable();
	}

}

export namespace EmoteFormService {
	export const DefaultUploadImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYGAAAAAFAAGKM+MAAAAAAElFTkSuQmCC';
}
