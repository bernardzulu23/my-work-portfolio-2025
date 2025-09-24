import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizeHtml',
  standalone: true
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    // First, sanitize the HTML to prevent XSS
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, value);

    // Return as SafeHtml to allow rendering
    return sanitized ? this.sanitizer.bypassSecurityTrustHtml(sanitized) : '';
  }
}
