import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Note } from '../../core/models/note.model';

/**
 * NoteCardComponent
 * Displays a single note summary with actions: view, edit, delete, pin.
 */
@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [RouterLink, DatePipe, NgIf],
  template: `
    <article class="card">
      <header class="card__header">
        <h3 class="card__title" [title]="note.title">{{ note.title || 'Untitled' }}</h3>
        <div class="card__actions">
          <button class="btn btn--ghost" (click)="pin.emit(note)" title="Pin" aria-label="Pin note">📌</button>
          <a class="btn btn--ghost" [routerLink]="['/notes', note.id]" title="View" aria-label="View note">👁</a>
          <a class="btn btn--ghost" [routerLink]="['/notes', note.id, 'edit']" title="Edit" aria-label="Edit note">✏️</a>
          <button class="btn btn--danger" (click)="delete.emit(note)" title="Delete" aria-label="Delete note">🗑</button>
        </div>
      </header>
      <section class="card__body">
        <p class="card__content">
          {{ note.content || 'No content' }}
        </p>
      </section>
      <footer class="card__footer" *ngIf="note.updatedAt || note.createdAt">
        <span class="card__meta">
          Updated: {{ note.updatedAt | date:'short' }} • Created: {{ note.createdAt | date:'short' }}
        </span>
      </footer>
    </article>
  `,
  styles: [`
.card {
  background: var(--op-surface, #fff);
  border: 1px solid rgba(17,24,39,0.06);
  border-radius: var(--op-radius, 12px);
  box-shadow: var(--op-shadow, 0 4px 16px rgba(0,0,0,0.08));
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.12s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(37,99,235,0.18);
  border-color: rgba(37,99,235,0.15);
}
.card__header { display:flex; align-items: center; justify-content: space-between; gap: 10px; }
.card__title { font-size: 1rem; font-weight: 600; color: var(--op-text, #111827); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card__actions { display:flex; gap:6px; align-items:center; }
.btn { padding: 6px 8px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; background: #fff; }
.btn--ghost { border-color: rgba(17,24,39,0.08); }
.btn--danger { border-color: rgba(239,68,68,0.25); color: #EF4444; background: rgba(239,68,68,0.05); }
.card__body .card__content { color: #374151; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.card__footer { color: #6b7280; font-size: 0.85rem; }
  `]
})
export class NoteCardComponent {
  /**
   * Note to display.
   */
  @Input() note!: Note;

  /**
   * Emits when user wants to view the note.
   */
  // PUBLIC_INTERFACE
  @Output() view = new EventEmitter<Note>();

  /**
   * Emits when user wants to edit the note.
   */
  // PUBLIC_INTERFACE
  @Output() edit = new EventEmitter<Note>();

  /**
   * Emits when user wants to delete the note.
   */
  // PUBLIC_INTERFACE
  @Output() delete = new EventEmitter<Note>();

  /**
   * Emits when user pins the note.
   */
  // PUBLIC_INTERFACE
  @Output() pin = new EventEmitter<Note>();
}
