import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsletterCta } from './newsletter-cta';

describe('NewsletterCta', () => {
  let component: NewsletterCta;
  let fixture: ComponentFixture<NewsletterCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterCta],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsletterCta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
