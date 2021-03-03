import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmoteSearchComponent } from './emote-search.component';

describe('EmoteSearchComponent', () => {
	let component: EmoteSearchComponent;
	let fixture: ComponentFixture<EmoteSearchComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EmoteSearchComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EmoteSearchComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
