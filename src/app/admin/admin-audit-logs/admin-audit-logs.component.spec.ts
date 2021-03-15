import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAuditLogsComponent } from './admin-audit-logs.component';

describe('AdminAuditLogsComponent', () => {
	let component: AdminAuditLogsComponent;
	let fixture: ComponentFixture<AdminAuditLogsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AdminAuditLogsComponent]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AdminAuditLogsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
