import { Injectable } from '@angular/core';

class LocalStorage implements Storage {
	[x: string]: any;
	readonly length = 0;
	clear(): void {}
	getItem(key: string): string | null { return null; }
	key(index: number): string | null { return null;  }
	removeItem(key: string): void {}
	setItem(key: string, value: string): void {}
}

@Injectable({providedIn: 'root'})
export class LocalStorageService implements Storage {
	public storage: Storage;

	constructor() {
		this.storage = new LocalStorage();
	}

	[x: string]: any;
	length = 0;

	clear(): void {
		this.storage.clear();
	}

	getItem(key: string): string | null {
		return this.storage.getItem(key);
	}

	key(index: number): string | null {
		return this.storage.key(index);
	}

	removeItem(key: string): void {
		return this.storage.removeItem(key);
	}

	setItem(key: string, value: string): void {
		return this.storage.setItem(key, value);
	}
}
