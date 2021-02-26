import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmoteCardComponent } from './emote-card.component';

describe('EmoteCardComponent', () => {
	let component: EmoteCardComponent;
	let fixture: ComponentFixture<EmoteCardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EmoteCardComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EmoteCardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
