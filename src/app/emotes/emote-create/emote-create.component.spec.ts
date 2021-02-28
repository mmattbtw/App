import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmoteCreateComponent } from './emote-create.component';

describe('EmoteCreateComponent', () => {
	let component: EmoteCreateComponent;
	let fixture: ComponentFixture<EmoteCreateComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EmoteCreateComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(EmoteCreateComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
