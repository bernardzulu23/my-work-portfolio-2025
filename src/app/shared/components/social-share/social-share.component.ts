import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ShareData {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  tags?: string[];
}

@Component({
  selector: 'app-social-share',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="social-share-container">
      <h4 class="share-title">Share this {{ contentType }}:</h4>

      <!-- Native Share API (Mobile) -->
      <button
        *ngIf="supportsNativeShare"
        class="share-button native-share"
        (click)="shareNative()"
        aria-label="Share via native sharing">
        <svg class="share-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
        </svg>
        Share
      </button>

      <!-- Social Media Buttons -->
      <div class="social-buttons">
        <!-- Twitter/X -->
        <button
          class="share-button twitter"
          (click)="shareOnTwitter()"
          aria-label="Share on Twitter">
          <svg class="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Twitter
        </button>

        <!-- LinkedIn -->
        <button
          class="share-button linkedin"
          (click)="shareOnLinkedIn()"
          aria-label="Share on LinkedIn">
          <svg class="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </button>

        <!-- Facebook -->
        <button
          class="share-button facebook"
          (click)="shareOnFacebook()"
          aria-label="Share on Facebook">
          <svg class="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </button>

        <!-- WhatsApp -->
        <button
          class="share-button whatsapp"
          (click)="shareOnWhatsApp()"
          aria-label="Share on WhatsApp">
          <svg class="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
          </svg>
          WhatsApp
        </button>

        <!-- Email -->
        <button
          class="share-button email"
          (click)="shareViaEmail()"
          aria-label="Share via email">
          <svg class="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          Email
        </button>

        <!-- Copy Link -->
        <button
          class="share-button copy-link"
          (click)="copyLink()"
          [class.copied]="linkCopied"
          aria-label="Copy link">
          <svg class="share-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          <span *ngIf="!linkCopied">Copy Link</span>
          <span *ngIf="linkCopied">Copied!</span>
        </button>
      </div>

      <!-- Share Stats -->
      <div class="share-stats" *ngIf="showStats">
        <span class="stat-item">
          <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
          </svg>
          {{ shareCount }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .social-share-container {
      padding: 1rem;
      border-radius: 0.5rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
    }

    .share-title {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .social-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .share-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }

    .share-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .share-button:active {
      transform: translateY(0);
    }

    .share-button.native-share {
      background: var(--primary-color);
      color: white;
    }

    .share-button.twitter {
      background: #1da1f2;
      color: white;
    }

    .share-button.linkedin {
      background: #0077b5;
      color: white;
    }

    .share-button.facebook {
      background: #1877f2;
      color: white;
    }

    .share-button.whatsapp {
      background: #25d366;
      color: white;
    }

    .share-button.email {
      background: #ea4335;
      color: white;
    }

    .share-button.copy-link {
      background: var(--success-color, #10b981);
      color: white;
      min-width: 100px;
      justify-content: center;
    }

    .share-button.copy-link.copied {
      background: var(--success-color, #10b981);
    }

    .share-icon {
      width: 1rem;
      height: 1rem;
    }

    .share-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .stat-icon {
      width: 1rem;
      height: 1rem;
    }

    @media (max-width: 768px) {
      .social-buttons {
        justify-content: center;
      }

      .share-button {
        flex: 1;
        min-width: calc(50% - 0.25rem);
        justify-content: center;
      }
    }
  `]
})
export class SocialShareComponent implements OnInit {
  @Input() shareData!: ShareData;
  @Input() contentType: string = 'content';
  @Input() showStats: boolean = false;
  @Input() shareCount: number = 0;

  supportsNativeShare = false;
  linkCopied = false;

  ngOnInit() {
    this.checkNativeShareSupport();
  }

  private checkNativeShareSupport() {
    this.supportsNativeShare = typeof navigator !== 'undefined' &&
                              'share' in navigator &&
                              'canShare' in navigator;
  }

  private getShareUrl(): string {
    return this.shareData.url || (typeof window !== 'undefined' ? window.location.href : '');
  }

  private getShareText(): string {
    return `${this.shareData.title}${this.shareData.description ? ' - ' + this.shareData.description : ''}`;
  }

  async shareNative() {
    if (!this.supportsNativeShare) return;

    const shareData = {
      title: this.shareData.title,
      text: this.getShareText(),
      url: this.getShareUrl()
    };

    // Add image if supported and available
    if (this.shareData.image && 'canShare' in navigator) {
      try {
        const response = await fetch(this.shareData.image);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });
        (shareData as any).files = [file];
      } catch (error) {
        console.warn('Could not share image:', error);
      }
    }

    try {
      await navigator.share(shareData);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback to copying link
        this.copyLink();
      }
    }
  }

  shareOnTwitter() {
    const url = encodeURIComponent(this.getShareUrl());
    const text = encodeURIComponent(this.getShareText());
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    this.openShareWindow(twitterUrl);
  }

  shareOnLinkedIn() {
    const url = encodeURIComponent(this.getShareUrl());
    const title = encodeURIComponent(this.shareData.title);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`;
    this.openShareWindow(linkedinUrl);
  }

  shareOnFacebook() {
    const url = encodeURIComponent(this.getShareUrl());
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    this.openShareWindow(facebookUrl);
  }

  shareOnWhatsApp() {
    const url = encodeURIComponent(this.getShareUrl());
    const text = encodeURIComponent(this.getShareText());
    const whatsappUrl = `https://wa.me/?text=${text}%20${url}`;
    window.location.href = whatsappUrl;
  }

  shareViaEmail() {
    const subject = encodeURIComponent(this.shareData.title);
    const body = encodeURIComponent(`${this.getShareText()}\n\n${this.getShareUrl()}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
  }

  async copyLink() {
    const url = this.getShareUrl();

    try {
      await navigator.clipboard.writeText(url);
      this.linkCopied = true;

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        this.linkCopied = false;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      this.fallbackCopyTextToClipboard(url);
    }
  }

  private fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.linkCopied = true;
      setTimeout(() => {
        this.linkCopied = false;
      }, 2000);
    } catch (error) {
      console.error('Fallback copy failed:', error);
    }

    document.body.removeChild(textArea);
  }

  private openShareWindow(url: string) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      url,
      'share-dialog',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  }
}
