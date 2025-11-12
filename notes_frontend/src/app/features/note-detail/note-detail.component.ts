import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { map, Observable, Subscription, filter } from 'rxjs';
import { NotesStore } from '../../state/notes.store';
import { Note } from '../../core/models/note.model';
import { selectAllNotes } from '../../state/notes.selectors';
import { ToastService } from '../../services/toast.service';

/**
 * NoteDetailComponent
 * Displays a single note in full view with actions: back, edit, delete.
 * Fetches the note by id from route params via NotesStore.
 * Ocean Professional styling applied.
 */
@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgIf, DatePipe],
  template: `
    <article class="detail" role="article" aria-label="Note detail">
      <header class="detail__header">
        <a routerLink="/" class="btn btn--ghost" aria-label="Back to list">← Back</a>

        <div class="detail__actions">
          <a
            *ngIf="noteId(); else newNoteActions"
            class="btn btn--primary"
            [routerLink]="['/notes', noteId(), 'edit']"
            aria-label="Edit note"
            >✏️ Edit</a
          >
          <ng-template #newNoteActions>
            <a class="btn btn--primary" routerLink="/notes/new" aria-label="Create note">＋ New</a>
          </ng-template>

          <button
            *ngIf="noteId()"
            class="btn btn--danger"
            (click)="onDelete()"
            aria-label="Delete note"
          >
            🗑 Delete
          </button>
        </div>
      </header>

      <section class="detail__content" *ngIf="note$ | async as note; else loadingTpl">
        <h2 class="detail__title" [title]="note.title">
          {{ note.title || 'Untitled' }}
        </h2>
        <div class="detail__meta" *ngIf="note.createdAt || note.updatedAt">
          <span *ngIf="note.updatedAt">Updated: {{ note.updatedAt | date:'short' }}</span>
          <span *ngIf="note.createdAt">• Created: {{ note.createdAt | date:'short' }}</span>
        </div>
        <article class="detail__body">
          <pre class="detail__contentText">{{ note.content || 'No content' }}</pre>
        </article>
      </section>

      <ng-template #loadingTpl>
        <section class="detail__loading">
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--line"></div>
          <div class="skeleton skeleton--line"></div>
          <div class="skeleton skeleton--line short"></div>
        </section>
      </ng-template>
    </article>
  `,
  styles: [`
    :host { display:block; }
    .detail { display:block; }
    .detail__header {
      display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;
    }
    .detail__actions { display:flex; gap:8px; align-items:center; }
    .btn {
      padding: 8px 12px; border-radius: 10px; text-decoration: none; cursor: pointer; border: 1px solid transparent;
      transition: transform 0.1s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      background: #fff;
    }
    .btn--ghost { border-color: rgba(17,24,39,0.12); }
    .btn--primary {
      color: #fff;
      background: linear-gradient(135deg, var(--op-primary, #2563EB), #3b82f6);
      box-shadow: 0 8px 24px rgba(37,99,235,0.35);
      border: none;
    }
    .btn--danger {
      border-color: rgba(239,68,68,0.25);
      color: var(--op-error, #EF4444);
      background: rgba(239,68,68,0.05);
    }

    .detail__title {
      font-size: 1.3rem; font-weight: 700; color: var(--op-text, #111827);
      margin: 6px 0 6px;
    }
    .detail__meta { color: #6b7280; font-size: 0.9rem; margin-bottom: 10px; }
    .detail__body {
      background: var(--op-surface, #fff);
      border: 1px solid rgba(17,24,39,0.06);
      border-radius: var(--op-radius, 12px);
      box-shadow: var(--op-shadow, 0 4px 16px rgba(0,0,0,0.08));
      padding: 14px;
      color: #374151;
      white-space: pre-wrap;
    }
    .detail__contentText {
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      white-space: pre-wrap;
    }

    .detail__loading .skeleton {
      height: 12px;
      background: linear-gradient(90deg, rgba(37,99,235,0.08), rgba(255,255,255,0.9));
      border-radius: 8px;
      margin: 8px 0;
    }
    .skeleton--title { height: 22px; width: 60%; }
    .skeleton--line { width: 100%; }
    .skeleton--line.short { width: 70%; }
  `]
})
export class NoteDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(NotesStore);
  private readonly toaster = inject(ToastService);

  // Keep current id for actions
  private readonly idSig = signal<string | null>(null);

  // PUBLIC_INTERFACE
  id$: Observable<string>;
  /** This public observable exposes the current route id as a string. */

  // Public note stream: derive from store list and current id
  // Use selectAllNotes() and map by id for consistency with the rest of the app
  // PUBLIC_INTERFACE
  note$: Observable<Note | undefined>;

  private sub?: Subscription;

  constructor() {
    // Setup id$ based on route params
    this.id$ = this.route.paramMap.pipe(map(p => p.get('id') ?? ''));
    this.note$ = selectAllNotes().pipe(
      map(list => {
        const id = this.idSig();
        return id ? list.find(n => n.id === id) : undefined;
      })
    );
  }

  ngOnInit(): void {
    // Listen to route param changes and load the note
    this.sub = this.route.paramMap
      .pipe(
        map(p => p.get('id')),
        filter((id): id is string => !!id)
      )
      .subscribe((id) => {
        this.idSig.set(id);
        // Ensure store has this note loaded
        this.store.getById(id);
        this.store.select(id);
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    // Clear selection on destroy to avoid stale state when navigating away
    this.store.select(null);
  }

  // PUBLIC_INTERFACE
  noteId(): string | null {
    /** Returns the current note id or null. */
    return this.idSig();
  }

  // PUBLIC_INTERFACE
  onDelete(): void {
    /** Deletes the current note, shows a toast, and navigates back to the list. */
    const id = this.idSig();
    if (!id) {
      this.toaster.error('Cannot delete: missing note id');
      return;
    }
    this.store.remove(id);
    this.toaster.add('Note removed', 'success', 2200);
    // Navigate back to list
    void this.router.navigateByUrl('/');
  }
}
