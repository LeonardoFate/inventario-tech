import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Marcas } from './marcas';

describe('Marcas', () => {
  let component: Marcas;
  let fixture: ComponentFixture<Marcas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Marcas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Marcas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
