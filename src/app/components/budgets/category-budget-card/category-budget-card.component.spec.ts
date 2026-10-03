import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryBudgetCardComponent } from './category-budget-card.component';

describe('CategoryBudgetCardComponent', () => {
  let component: CategoryBudgetCardComponent;
  let fixture: ComponentFixture<CategoryBudgetCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryBudgetCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryBudgetCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
