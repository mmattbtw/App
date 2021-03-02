

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';

@Injectable({providedIn: 'root'})
export class EmoteFormService {
	form = new FormGroup({
		name: new FormControl({ value: '', disabled: true }),
		emote: new FormControl('')
	});
	uploadedEmote = new BehaviorSubject('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYGAAAAAFAAGKM+MAAAAAAElFTkSuQmCC');
	uploadError = new BehaviorSubject('');
	emoteData = new BehaviorSubject<DataStructure.Emote | null>(null);

	uploading = new BehaviorSubject(false);
	uploadStatus = new BehaviorSubject('');
	uploadProgress = new BehaviorSubject<number | null>(null);

	constructor(
		private restService: RestService
	) { }

	/**
	 * Upload the emote file to the server and wait for emote data to be returned
	 */
	uploadEmote(): void {
		const formData = new FormData(); // Append file to form data
		formData.append('file', this.form.get('emote')?.value);

		this.uploading.next(true); // Set uploading state as true
		this.restService.Emotes.Upload(formData, 0).pipe( // Begin upload
			tap(progress => {
				if (progress instanceof HttpResponse) return undefined; // Send progress updates
				switch (progress.loaded >= (progress.total ?? 1)) {
					case true:
						this.uploadStatus.next('Waiting for server...');
						break;
					case false:
						const perc = (progress.total ?? 1) / progress.loaded || 100;
						this.uploadStatus.next(`${perc}% uploaded`);
						this.uploadProgress.next(perc);
						break;
				}

				return undefined;
			}),

			RestService.onlyResponse(),
			tap(res => this.emoteData.next(res.body)),
			tap(res => this.uploadedEmote.next(this.restService.CDN.Emote(String(res.body?._id), 4))),
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
			this.uploading.next(false);
			this.uploadStatus.next('');
		};
	}

}
