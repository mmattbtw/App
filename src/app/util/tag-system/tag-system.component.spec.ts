import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagSystemComponent } from './tag-system.component';

describe('TagSystemComponent', () => {
  let component: TagSystemComponent;
  let fixture: ComponentFixture<TagSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagSystemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
