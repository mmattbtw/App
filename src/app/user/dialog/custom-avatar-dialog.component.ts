

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { LoggerService } from 'src/app/service/logger.service';
import { RestService } from 'src/app/service/rest.service';

@Component({
	selector: 'app-editor-dialog',
	template: `
		<h3 mat-dialog-title> Upload Profile Picture</h3>

		<div mat-dialog-content class="py-3">
			<p>Accepted format: GIF</p>
			<div class="text-danger"> {{error | async}} </div>
			<input type="file" accept="image/png, image/jpeg, image/gif, image/webp" name="edit-emote" id="edit-emote" (change)="upload(getEventTargetFile($event.target))" [formControl]="control" />
		</div>

		<div mat-dialog-actions>
			<button mat-raised-button (click)="submit()">SUBMIT</button>
		</div>
	`
})

export class CustomAvatarDialogComponent implements OnInit {
	error = new BehaviorSubject('');
	data = '';
	control = new FormControl('');


	constructor(
		public clientService: ClientService,
		public dialogRef: MatDialogRef<CustomAvatarDialogComponent, {}>,
		private restService: RestService,
		private loggerService: LoggerService
	) { }

	getEventTargetFile(target: EventTarget | null): File | null {
		return (target as any)?.files[0] ?? null;
	}

	upload(file: File | null): void {
		if (!(file instanceof File)) return this.loggerService.debug(`Canceled emote upload`), undefined;
		const reader = new FileReader();

		if (file.size > 5000000) {
			this.error.next('File must be under 5.0MB');
			return undefined;
		} else {
			this.error.next('');
		}

		reader.onload = (e: ProgressEvent) => {
			this.data = (e.target as { result?: string; }).result ?? '';
			if (this.control) {
				this.control.patchValue(file);
				this.control.setErrors(null);
				this.control.markAsDirty();
			}
			return undefined;
		};

		reader.readAsDataURL(file);
		return undefined;
	}

	submit(): void {
		if (this.data === '') {
			return undefined;
		}

		const form = new FormData();
		form.append('file', this.control.value);

		this.restService.createRequest<{
			id: string;
			url: string;
		}>('post', '/users/profile-picture', {
			body: form,
			auth: true,
			headers: {
				'ngsw-bypass': ''
			}
		}, 'v2').pipe(
			RestService.onlyResponse(),
			map(res => res.body)
		).subscribe({
			next: () => {
				document.location.reload(); // do a scuffed full page reload for now to reflect changes
			},
			error: (err: HttpErrorResponse) => this.error.next(err.error.reason)
		});
	}

	ngOnInit(): void { }
}

export namespace EditorDialogComponent {

}
