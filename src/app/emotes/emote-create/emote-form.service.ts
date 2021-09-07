

import { HttpErrorResponse, HttpHeaderResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Constants } from '@typings/src/Constants';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';

@Injectable({ providedIn: 'root' })
export class EmoteFormService {
	form = new FormGroup({
		name: new FormControl('', [
			Validators.pattern(Constants.Emotes.NAME_REGEXP)
		]),
		tags: new FormControl([]),
		is_private: new FormControl(false),
		is_zerowidth: new FormControl(false),
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
		private router: Router
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
		let visibility = 0;
		if (this.form.get('is_private')?.value) {
			// tslint:disable-next-line:no-bitwise
			visibility |= DataStructure.Emote.Visibility.PRIVATE;
		}
		if (this.form.get('is_zerowidth')?.value) {
			// tslint:disable-next-line:no-bitwise
			visibility |= DataStructure.Emote.Visibility.ZERO_WIDTH;
		}
		if (visibility > 0) {
			formData.append('visibility', visibility.toString());
		}

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

			this.uploadStatus.next('Done!');
			this.uploadProgress.next(100);
			setTimeout(() => {
				this.reset();
				this.router.navigate(['/emotes', data?.id]);
			}, 500);
		};
	}

	reset(): void {
		this.form.reset();
		this.uploadedEmote.next(EmoteFormService.DefaultUploadImg);
		this.uploading.next(false);
		this.uploadStatus.next('');
		this.uploadProgress.next(null);
		this.processError.next('');
		this.uploadError.next('');
		this.emoteData.next(null);
		this.form.enable();
	}

}

export namespace EmoteFormService {
	export const DefaultUploadImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYGAAAAAFAAGKM+MAAAAAAElFTkSuQmCC';
}
