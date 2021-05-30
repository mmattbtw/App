import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { EmoteFormService } from 'src/app/emotes/emote-create/emote-form.service';
import { TOSDialogComponent } from 'src/app/emotes/emote-create/tos-dialog/tos-dialog.component';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LoggerService } from 'src/app/service/logger.service';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-emote-create',
	templateUrl: './emote-create.component.html',
	styleUrls: ['./emote-create.component.scss'],
	animations: [
		trigger('open', [
			transition(':enter', [
				animate(500, keyframes([
					style({ opacity: 0, offset: 0 }),
					style({ opacity: 0, offset: .75 }),
					style({ opacity: 1, offset: 1 })
				]))
			])
		])
	],
	changeDetection: ChangeDetectionStrategy.Default
})
export class EmoteCreateComponent implements OnInit {
	constructor(
		private loggerService: LoggerService,
		private dialog: MatDialog,
		private localStorageService: LocalStorageService,
		public themingService: ThemingService,
		public emoteFormService: EmoteFormService
	) { }

	get form(): FormGroup { return this.emoteFormService.form; }
	get emoteControl(): FormControl { return this.emoteFormService.form.get('emote') as FormControl; }

	isUploaded(): Observable<boolean> {
		return this.emoteFormService.emoteData.asObservable().pipe(
			map(data => data === null ? false : true)
		);
	}
	isUploading(): Observable<boolean> { return this.emoteFormService.uploading.asObservable(); }

	ngOnInit(): void {
		if (this.localStorageService.getItem('agree_tos') !== 'true') {
			const dialogRef = this.dialog.open(TOSDialogComponent, {
				disableClose: true
			});

			dialogRef.afterClosed().pipe(
				filter(agree => agree === true)
			).subscribe({
				next: () => {
					this.localStorageService.setItem('agree_tos', 'true');
				}
			});
		}
	}

	uploadEmote(target: EventTarget | null): void {
		const file = (target as any)?.files[0];

		if (!(file instanceof File)) return this.loggerService.debug(`Canceled emote upload`), undefined;
		const reader = new FileReader();
		const control = this.form.get('emote') as FormControl;

		reader.onload = (e: ProgressEvent) => {
			this.emoteFormService.uploadedEmote.next(String((e.target as { result?: string; }).result));

			// Verify the emote is not too large
			if (typeof reader.result === 'string' && reader.result.length > 5000000) {
				this.emoteFormService.uploadError.next('File must be under 5.0MB');

				if (control) {
					control.setErrors({ image_size_too_large: true });
				}
				return undefined;
			} else {

				if (control) {
					control.patchValue(file);
					control.setErrors(null);
					control.markAsDirty();
				}
			}

			return undefined;
		};

		reader.readAsDataURL(file);
		return undefined;
	}

}
