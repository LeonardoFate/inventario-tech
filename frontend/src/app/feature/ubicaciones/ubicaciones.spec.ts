import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ubicaciones } from './ubicaciones';

describe('Ubicaciones', () => {
  let component: Ubicaciones;
  let fixture: ComponentFixture<Ubicaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ubicaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ubicaciones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
