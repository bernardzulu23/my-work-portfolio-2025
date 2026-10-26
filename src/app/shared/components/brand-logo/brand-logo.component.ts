import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BRAND } from '../../../core/branding';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="inline-flex items-center shrink-0 overflow-hidden rounded-md" [attr.aria-label]="brand.legalName" [class]="frameClass">
      <img
        [src]="brand.logoSrc"
        [alt]="brand.logoAlt"
        class="w-full h-full object-cover object-center scale-150"
        width="280"
        height="210" />
    </a>
  `
})
export class BrandLogoComponent {
  readonly brand = BRAND;

  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get frameClass(): string {
    const sizes = {
      sm: 'h-9 w-[6.75rem] sm:h-10 sm:w-[7.5rem]',
      md: 'h-11 w-[8.25rem] sm:h-14 sm:w-[10.5rem] md:h-16 md:w-[12rem]',
      lg: 'h-28 w-full max-w-[16rem] sm:h-40 sm:max-w-[22rem] md:h-48 md:max-w-[28rem]'
    };
    return sizes[this.size];
  }
}
