

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, mapTo, tap } from 'rxjs/operators';

@Component({
	selector: 'app-changelog-dialog',
	templateUrl: 'changelog-dialog.component.html'
})

export class ChangelogDialogComponent implements OnInit {
	changelogMD = new BehaviorSubject<string>('');

	constructor(
		private httpClient: HttpClient
	) {}

	getChangelog(): Observable<string> {
		return this.httpClient.get('/assets/changelog.md', {
			responseType: 'arraybuffer'
		}).pipe(
			map((b: ArrayBuffer) => new TextDecoder().decode(b)),
			tap(s => console.log(s, 'changes')),
		);
	}

	dismiss(): void {
		if ('localStorage' in window) {
			localStorage.setItem('changelog_read', 'true');
		}
	}

	ngOnInit(): void {
		this.getChangelog().pipe(
			tap(changelogs => this.changelogMD.next(changelogs))
		).subscribe();
	}
}
