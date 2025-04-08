import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('dovrebbe creare il componente', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe mostrare il logo con il path corretto', () => {
    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('assets/logo.png');
    expect(img.alt).toBe('logo');
  });

  it('dovrebbe mostrare l\'email di contatto', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a[href^="mailto:"]');
    expect(link).toBeTruthy();
    expect(link.textContent?.trim()).toContain('infostanalytics@gmail.com');
  });

  it('dovrebbe contenere la partita IVA nel testo', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('P.IVA 02206740769');
  });

  it('dovrebbe contenere il link alla privacy policy', () => {
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('a');
    const privacyLink = Array.from(links).find(a => a.textContent?.includes('Privacy Policy'));
    const cookieLink = Array.from(links).find(a => a.textContent?.includes('Cookie Policy'));

    expect(privacyLink).toBeTruthy();
    expect(privacyLink?.href).toContain('privacy-policy');

    expect(cookieLink).toBeTruthy();
    expect(cookieLink?.href).toContain('cookie-policy');
  });

})