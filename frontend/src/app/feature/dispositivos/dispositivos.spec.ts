import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dispositivos } from './dispositivos';

describe('Dispositivos', () => {
  let component: Dispositivos;
  let fixture: ComponentFixture<Dispositivos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dispositivos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dispositivos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
