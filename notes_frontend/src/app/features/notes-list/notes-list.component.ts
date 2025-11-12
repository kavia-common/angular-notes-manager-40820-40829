import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { NoteCardComponent } from '../../shared/note-card/note-card.component';
import { NotesStore } from '../../state/notes.store';
import { selectAllNotes } from '../../state/notes.selectors';
import { Note } from '../../core/models/note.model';
import { Subscription, combineLatest, map } from 'rxjs';
import { EventBusService } from '../../shared/event-bus.service';
import { FabComponent } from '../../shared/fab/fab.component';

/**
 * NotesListComponent
 * Displays notes with client-side search, a pinned section, actions, and empty state.
 * Ocean Professional styling is applied using subtle shadows, rounded corners, and blue accents.
 */
@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, AsyncPipe, NoteCardComponent, FabComponent],
  template: `
    <section class="list" role="region" aria-label="Notes list">
      <header class="list__header">
        <h2 class="list__title">Notes</h2>
        <a routerLink="/notes/new" class="list__cta" aria-label="Create new note">New</a>
      </header>

      <!-- Empty state -->
      <ng-container *ngIf="filteredNotes().length === 0; else listTpl">
        <div class="list__empty" role="status" aria-live="polite">
          <p *ngIf="query()">No results for "<strong>{{ query() }}</strong>".</p>
          <p *ngIf="!query()">No notes yet. Click the + button to create your first note.</p>
        </div>
        <!-- Ensure FAB exists to add new notes on empty state as well -->
        <app-fab></app-fab>
      </ng-container>

      <!-- Pinned + All sections -->
      <ng-template #listTpl>
        <div class="section" *ngIf="pinned().length > 0">
          <div class="section__header">
            <h3 class="section__title">Pinned</h3>
          </div>
          <div class="grid">
            <app-note-card
              *ngFor="let n of pinned()"
              [note]="n"
              (view)="onView($event)"
              (edit)="onEdit($event)"
              (delete)="onDelete($event)"
              (pin)="onPin($event)"
            ></app-note-card>
          </div>
        </div>

        <div class="section">
          <div class="section__header">
            <h3 class="section__title" [class.section__title--muted]="pinned().length === 0">All</h3>
            <div class="section__meta" *ngIf="query()">Filtered by: "{{ query() }}"</div>
          </div>
          <div class="grid">
            <app-note-card
              *ngFor="let n of unpinned()"
              [note]="n"
              (view)="onView($event)"
              (edit)="onEdit($event)"
              (delete)="onDelete($event)"
              (pin)="onPin($event)"
            ></app-note-card>
          </div>
        </div>
      </ng-template>
    </section>

    <!-- Global FAB to add notes -->
    <app-fab></app-fab>
  `,
  styles: [`
    :host { display: block; }
    .list { display: block; }
    .list__header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px;
    }
    .list__title { font-size: 1.15rem; font-weight: 600; color: var(--op-text, #111827); }
    .list__cta {
      text-decoration: none; padding: 8px 12px; border-radius: 10px;
      background: linear-gradient(135deg, var(--op-primary, #2563EB), #3b82f6); color: white;
      box-shadow: 0 6px 18px rgba(37,99,235,0.3);
      transition: transform 0.1s ease, box-shadow 0.2s ease;
    }
    .list__cta:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(37,99,235,0.36); }

    .list__empty {
      padding: 28px; border: 1px dashed rgba(17,24,39,0.15);
      border-radius: 12px; color: var(--op-muted, #6b7280); background: var(--op-bg, #f9fafb);
    }

    .section { margin-bottom: 16px; }
    .section__header { display:flex; align-items:center; justify-content: space-between; margin: 8px 2px; }
    .section__title { font-size: 1rem; font-weight: 600; color: var(--op-text, #111827); }
    .section__title--muted { color: #374151; font-weight: 600; }
    .section__meta { color: #6b7280; font-size: 0.9rem; }

    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 12px;
    }
    @media (max-width: 640px) {
      .grid { grid-template-columns: repeat(1, 1fr); }
    }
    @media (min-width: 641px) and (max-width: 1024px) {
      .grid { grid-template-columns: repeat(6, 1fr); }
    }
    @media (min-width: 1025px) {
      .grid { grid-template-columns: repeat(12, 1fr); }
    }
    app-note-card {
      grid-column: span 12;
    }
    @media (min-width: 641px) and (max-width: 1024px) {
      app-note-card { grid-column: span 3; }
    }
    @media (min-width: 1025px) {
      app-note-card { grid-column: span 4; }
    }
  `]
})
export class NotesListComponent implements OnInit, OnDestroy {
  private readonly store = inject(NotesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bus = inject(EventBusService);
  private sub?: Subscription;

  readonly notes$ = selectAllNotes();

  // Query from URL/event bus
  private querySignal = signal<string>('');
  // Keep a local copy of the latest notes to use in computed filters
  private _latestNotes: Note[] = [];

  /**
   * Client-side filtered notes derived from notes and query.
   * Also respects a client-only "pinned" set by storing pinned ids locally.
   */
  private readonly pinnedIds = new Set<string>();

  readonly filteredNotes = computed<Note[]>(() => {
    const q = (this.querySignal() || '').toLowerCase();
    const items: Note[] = this._latestNotes || [];
    if (!q) return items;
    return items.filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    );
  });

  // Split filtered results into pinned/unpinned lists
  readonly pinned = computed<Note[]>(() => this.filteredNotes().filter(n => this.pinnedIds.has(n.id)));
  readonly unpinned = computed<Note[]>(() => this.filteredNotes().filter(n => !this.pinnedIds.has(n.id)));

  // PUBLIC_INTERFACE
  query = this.querySignal;

  ngOnInit(): void {
    // Initial load of notes
    this.store.loadAll();

    // Sync notes and search query from router and event bus
    this.sub = combineLatest([
      this.notes$,
      this.route.queryParams.pipe(map((p: Params) => (p['q'] as string) ?? '')),
      this.bus.search$,
    ]).subscribe(([notes, qParam, qBus]) => {
      this._latestNotes = notes || [];
      const q = (qParam || qBus || '').trim();
      this.querySignal.set(q);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // PUBLIC_INTERFACE
  onView(note: Note): void {
    /** Navigates to the note detail view. */
    void this.router.navigate(['/notes', note.id]);
  }

  // PUBLIC_INTERFACE
  onEdit(note: Note): void {
    /** Navigates to the note edit view. */
    void this.router.navigate(['/notes', note.id, 'edit']);
  }

  // PUBLIC_INTERFACE
  onDelete(note: Note): void {
    /** Deletes the given note via store and updates local sets if needed. */
    this.store.remove(note.id);
    if (this.pinnedIds.has(note.id)) this.pinnedIds.delete(note.id);
  }

  // PUBLIC_INTERFACE
  onPin(note: Note): void {
    /** Toggles local pin state for the given note id (client-only). */
    if (!note?.id) return;
    if (this.pinnedIds.has(note.id)) {
      this.pinnedIds.delete(note.id);
    } else {
      this.pinnedIds.add(note.id);
    }
    // Trigger recomputation by updating query to same value (signals need a mutation),
    // or optionally use a separate signal; here we simply "poke" the query signal.
    this.querySignal.set(this.querySignal());
  }
}
