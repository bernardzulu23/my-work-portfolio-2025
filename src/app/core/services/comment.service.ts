import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Comment } from './portfolio.service';

export interface CommentForm {
  author: string;
  email: string;
  content: string;
  postId: string;
}

export interface CommentStats {
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
  averageCommentsPerPost: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private comments = signal<Comment[]>([]);
  private commentsSubject = new BehaviorSubject<Comment[]>([]);

  // Observable for components to subscribe to
  comments$ = this.commentsSubject.asObservable();

  constructor() {
    this.loadComments();
  }

  // Get all comments
  getAllComments(): Comment[] {
    return this.comments();
  }

  // Get comments for a specific post
  getCommentsForPost(postId: string): Comment[] {
    return this.comments().filter(comment => comment.id === postId);
  }

  // Get pending comments (for admin)
  getPendingComments(): Comment[] {
    return this.comments().filter(comment => !comment.approved);
  }

  // Get approved comments
  getApprovedComments(): Comment[] {
    return this.comments().filter(comment => comment.approved);
  }

  // Add a new comment
  addComment(commentForm: CommentForm): Comment {
    const newComment: Comment = {
      id: this.generateCommentId(),
      author: commentForm.author,
      email: commentForm.email,
      content: commentForm.content,
      createdAt: new Date(),
      approved: false // Comments need approval by default
    };

    const updatedComments = [...this.comments(), newComment];
    this.comments.set(updatedComments);
    this.commentsSubject.next(updatedComments);
    this.saveComments();

    return newComment;
  }

  // Approve a comment
  approveComment(commentId: string): void {
    const updatedComments = this.comments().map(comment =>
      comment.id === commentId ? { ...comment, approved: true } : comment
    );
    this.comments.set(updatedComments);
    this.commentsSubject.next(updatedComments);
    this.saveComments();
  }

  // Delete a comment
  deleteComment(commentId: string): void {
    const updatedComments = this.comments().filter(comment => comment.id !== commentId);
    this.comments.set(updatedComments);
    this.commentsSubject.next(updatedComments);
    this.saveComments();
  }

  // Update a comment
  updateComment(commentId: string, updates: Partial<Comment>): void {
    const updatedComments = this.comments().map(comment =>
      comment.id === commentId ? { ...comment, ...updates } : comment
    );
    this.comments.set(updatedComments);
    this.commentsSubject.next(updatedComments);
    this.saveComments();
  }

  // Bulk approve comments
  bulkApproveComments(commentIds: string[]): void {
    const updatedComments = this.comments().map(comment =>
      commentIds.includes(comment.id) ? { ...comment, approved: true } : comment
    );
    this.comments.set(updatedComments);
    this.commentsSubject.next(updatedComments);
    this.saveComments();
  }

  // Bulk delete comments
  bulkDeleteComments(commentIds: string[]): void {
    const updatedComments = this.comments().filter(comment => !commentIds.includes(comment.id));
    this.comments.set(updatedComments);
    this.commentsSubject.next(updatedComments);
    this.saveComments();
  }

  // Get comment statistics
  getCommentStats(): CommentStats {
    const allComments = this.comments();
    const approvedComments = allComments.filter(c => c.approved);
    const pendingComments = allComments.filter(c => !c.approved);

    return {
      totalComments: allComments.length,
      approvedComments: approvedComments.length,
      pendingComments: pendingComments.length,
      averageCommentsPerPost: this.calculateAverageCommentsPerPost(allComments)
    };
  }

  private calculateAverageCommentsPerPost(comments: Comment[]): number {
    const postIds = [...new Set(comments.map(c => c.id))];
    return postIds.length > 0 ? comments.length / postIds.length : 0;
  }

  // Comment moderation
  isCommentSpam(comment: Comment): boolean {
    const spamKeywords = ['viagra', 'casino', 'lottery', 'free money', 'click here'];
    const content = comment.content.toLowerCase();

    return spamKeywords.some(keyword => content.includes(keyword));
  }

  // Auto-moderate comments
  autoModerateComment(comment: Comment): { approved: boolean; reason?: string } {
    // Check for spam
    if (this.isCommentSpam(comment)) {
      return { approved: false, reason: 'Comment flagged as spam' };
    }

    // Check for minimum length
    if (comment.content.length < 10) {
      return { approved: false, reason: 'Comment too short' };
    }

    // Check for excessive links
    const linkCount = (comment.content.match(/https?:\/\//g) || []).length;
    if (linkCount > 2) {
      return { approved: false, reason: 'Too many links in comment' };
    }

    // Auto-approve if it passes all checks
    return { approved: true };
  }

  // Comment search and filtering
  searchComments(query: string): Comment[] {
    const allComments = this.comments();
    const queryLower = query.toLowerCase();

    return allComments.filter(comment =>
      comment.author.toLowerCase().includes(queryLower) ||
      comment.content.toLowerCase().includes(queryLower) ||
      comment.email.toLowerCase().includes(queryLower)
    );
  }

  // Filter comments by status
  filterComments(status: 'all' | 'approved' | 'pending' | 'spam'): Comment[] {
    const allComments = this.comments();

    switch (status) {
      case 'approved':
        return allComments.filter(c => c.approved);
      case 'pending':
        return allComments.filter(c => !c.approved);
      case 'spam':
        return allComments.filter(c => this.isCommentSpam(c));
      default:
        return allComments;
    }
  }

  // Export comments
  exportComments(format: 'json' | 'csv' = 'json'): string {
    const comments = this.comments();

    if (format === 'csv') {
      const headers = ['ID', 'Author', 'Email', 'Content', 'Created At', 'Approved'];
      const rows = comments.map(comment => [
        comment.id,
        comment.author,
        comment.email,
        comment.content,
        comment.createdAt.toISOString(),
        comment.approved.toString()
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(comments, null, 2);
  }

  // Import comments
  importComments(jsonData: string): { success: number; errors: string[] } {
    try {
      const importedComments: Comment[] = JSON.parse(jsonData);
      const errors: string[] = [];
      let success = 0;

      importedComments.forEach((comment, index) => {
        try {
          // Validate comment structure
          if (!comment.id || !comment.author || !comment.content) {
            errors.push(`Comment ${index + 1}: Missing required fields`);
            return;
          }

          // Add the comment
          const updatedComments = [...this.comments(), comment];
          this.comments.set(updatedComments);
          success++;
        } catch (error) {
          errors.push(`Comment ${index + 1}: ${error}`);
        }
      });

      this.commentsSubject.next(this.comments());
      this.saveComments();

      return { success, errors };
    } catch (error) {
      return { success: 0, errors: [`Failed to parse JSON: ${error}`] };
    }
  }

  private generateCommentId(): string {
    return 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private loadComments(): void {
    try {
      const stored = localStorage.getItem('portfolio_comments');
      if (stored) {
        const comments = JSON.parse(stored);
        this.comments.set(comments);
        this.commentsSubject.next(comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }

  private saveComments(): void {
    try {
      localStorage.setItem('portfolio_comments', JSON.stringify(this.comments()));
    } catch (error) {
      console.error('Failed to save comments:', error);
    }
  }

  // Clear all comments (admin function)
  clearAllComments(): void {
    this.comments.set([]);
    this.commentsSubject.next([]);
    localStorage.removeItem('portfolio_comments');
  }
}
