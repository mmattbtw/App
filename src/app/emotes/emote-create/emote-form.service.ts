

import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataStructure } from '@typings/DataStructure';
import { BehaviorSubject } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
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

	constructor(
		private restService: RestService
	) { }

	uploadEmote(): void {
		const formData = new FormData();
		formData.append('file', this.form.get('emote')?.value);

		this.restService.Emotes.Upload(formData, 0).pipe(
			tap(res => this.emoteData.next(res.body)),
			tap(() => this.form.enable()),
			tap(res => this.form.patchValue({
				name: res.body?.name
			}))
		).subscribe();
	}

}
