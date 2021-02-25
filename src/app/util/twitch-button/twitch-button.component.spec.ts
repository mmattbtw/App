import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitchButtonComponent } from './twitch-button.component';

describe('TwitchButtonComponent', () => {
	let component: TwitchButtonComponent;
	let fixture: ComponentFixture<TwitchButtonComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [TwitchButtonComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TwitchButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
