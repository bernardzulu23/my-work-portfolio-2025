import { Injectable } from '@angular/core';

export interface ReadingTimeResult {
  minutes: number;
  words: number;
  timeFormatted: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReadingTimeService {
  private readonly WORDS_PER_MINUTE = 200;
  private readonly CHINESE_WORDS_PER_MINUTE = 300;
  private readonly IMAGE_TIME_SECONDS = 12; // Time to view an image
  private readonly CODE_BLOCK_TIME_SECONDS = 10; // Time to read a code block

  /**
   * Calculate reading time for text content
   */
  calculateReadingTime(text: string): ReadingTimeResult {
    if (!text || typeof text !== 'string') {
      return { minutes: 0, words: 0, timeFormatted: '0 min read' };
    }

    const words = this.countWords(text);
    const minutes = Math.ceil(words / this.WORDS_PER_MINUTE);

    return {
      minutes,
      words,
      timeFormatted: this.formatReadingTime(minutes)
    };
  }

  /**
   * Calculate reading time for HTML content including images and code blocks
   */
  calculateHtmlReadingTime(html: string): ReadingTimeResult {
    if (!html || typeof html !== 'string') {
      return { minutes: 0, words: 0, timeFormatted: '0 min read' };
    }

    // Parse HTML to extract text and count special elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Count words in text content
    const textContent = doc.body.textContent || '';
    const words = this.countWords(textContent);

    // Count images (add extra time)
    const images = doc.querySelectorAll('img');
    const imageTime = images.length * this.IMAGE_TIME_SECONDS;

    // Count code blocks (add extra time)
    const codeBlocks = doc.querySelectorAll('pre, code');
    const codeTime = codeBlocks.length * this.CODE_BLOCK_TIME_SECONDS;

    // Calculate total time in minutes
    const totalSeconds = (words / this.WORDS_PER_MINUTE) * 60 + imageTime + codeTime;
    const minutes = Math.ceil(totalSeconds / 60);

    return {
      minutes,
      words,
      timeFormatted: this.formatReadingTime(minutes)
    };
  }

  /**
   * Calculate reading time for blog post with metadata
   */
  calculateBlogPostReadingTime(content: string, includeImages: boolean = true): ReadingTimeResult {
    if (includeImages) {
      return this.calculateHtmlReadingTime(content);
    } else {
      return this.calculateReadingTime(content);
    }
  }

  /**
   * Get estimated reading time for different complexity levels
   */
  getReadingTimeByComplexity(text: string, complexity: 'easy' | 'medium' | 'hard' = 'medium'): ReadingTimeResult {
    const baseResult = this.calculateReadingTime(text);

    // Adjust words per minute based on complexity
    let adjustedWPM = this.WORDS_PER_MINUTE;
    switch (complexity) {
      case 'easy':
        adjustedWPM = this.WORDS_PER_MINUTE * 1.2; // Faster reading for easy content
        break;
      case 'hard':
        adjustedWPM = this.WORDS_PER_MINUTE * 0.7; // Slower reading for complex content
        break;
      case 'medium':
      default:
        adjustedWPM = this.WORDS_PER_MINUTE;
        break;
    }

    const adjustedMinutes = Math.ceil(baseResult.words / adjustedWPM);

    return {
      minutes: adjustedMinutes,
      words: baseResult.words,
      timeFormatted: this.formatReadingTime(adjustedMinutes)
    };
  }

  /**
   * Get reading progress percentage
   */
  getReadingProgress(currentPosition: number, totalLength: number): number {
    if (totalLength === 0) return 0;
    return Math.min(100, Math.max(0, (currentPosition / totalLength) * 100));
  }

  /**
   * Estimate time remaining to finish reading
   */
  estimateTimeRemaining(currentPosition: number, totalLength: number, readingSpeed: number = this.WORDS_PER_MINUTE): string {
    const remainingWords = totalLength - currentPosition;
    if (remainingWords <= 0) return '0 min';

    const remainingMinutes = Math.ceil(remainingWords / readingSpeed);
    return this.formatReadingTime(remainingMinutes);
  }

  /**
   * Get reading statistics
   */
  getReadingStats(text: string): {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    sentences: number;
    paragraphs: number;
    averageWordsPerSentence: number;
    averageSentenceLength: number;
  } {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = this.countWords(text);
    const sentences = this.countSentences(text);
    const paragraphs = this.countParagraphs(text);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      averageWordsPerSentence: sentences > 0 ? Math.round(words / sentences) : 0,
      averageSentenceLength: sentences > 0 ? Math.round(characters / sentences) : 0
    };
  }

  private countWords(text: string): number {
    // Remove HTML tags and count words
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!cleanText) return 0;

    // Handle different languages
    const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g);
    const chineseCount = chineseChars ? chineseChars.length : 0;

    const nonChineseText = cleanText.replace(/[\u4e00-\u9fff]/g, '');
    const englishWords = nonChineseText.split(/\s+/).filter(word => word.length > 0).length;

    // Estimate word count for Chinese (roughly 1 character = 0.5 words)
    const chineseWords = Math.ceil(chineseCount * 0.5);

    return englishWords + chineseWords;
  }

  private countSentences(text: string): number {
    // Simple sentence counting - split by common sentence endings
    const sentences = text.split(/[.!?]+/).filter(sentence =>
      sentence.trim().length > 0
    );
    return sentences.length;
  }

  private countParagraphs(text: string): number {
    // Count paragraphs by splitting on double newlines or paragraph tags
    const paragraphs = text.split(/\n\s*\n/).filter(para =>
      para.trim().length > 0
    );
    return paragraphs.length;
  }

  private formatReadingTime(minutes: number): string {
    if (minutes === 0) return '0 min read';
    if (minutes === 1) return '1 min read';
    if (minutes < 60) return `${minutes} min read`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h read`;
    } else {
      return `${hours}h ${remainingMinutes}min read`;
    }
  }

  /**
   * Get reading speed recommendations based on content type
   */
  getRecommendedReadingSpeed(contentType: 'article' | 'tutorial' | 'documentation' | 'story' | 'research'): number {
    switch (contentType) {
      case 'tutorial':
      case 'documentation':
        return this.WORDS_PER_MINUTE * 0.6; // Slower for technical content
      case 'research':
        return this.WORDS_PER_MINUTE * 0.5; // Very slow for research papers
      case 'story':
        return this.WORDS_PER_MINUTE * 1.1; // Faster for stories
      case 'article':
      default:
        return this.WORDS_PER_MINUTE;
    }
  }

  /**
   * Calculate optimal reading session length
   */
  getOptimalReadingSession(minutes: number): {
    recommended: number;
    short: number;
    long: number;
    breaks: number[];
  } {
    // Research shows optimal reading sessions are 25-50 minutes
    const recommended = Math.min(50, Math.max(25, minutes));
    const short = Math.max(15, recommended * 0.6);
    const long = Math.min(90, recommended * 1.5);

    // Calculate break points
    const breaks: number[] = [];
    for (let i = short; i < minutes; i += short) {
      breaks.push(i);
    }

    return { recommended, short, long, breaks };
  }
}
