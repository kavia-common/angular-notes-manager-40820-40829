import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { NoteCardComponent } from '../../shared/note-card/note-card.component';
import { NotesStore } from '../../state/notes.store';
import { selectAllNotes } from '../../state/notes.selectors';
import { Note } from '../../core/models/note.model';
import { Subscription, combineLatest, map } from 'rxjs';
import { EventBusService } from '../../shared/event-bus.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, NoteCardComponent],
  template: `
    <section class="list">
      <header class="list__header">
        <h2 class="list__title">All Notes</h2>
        <a routerLink="/notes/new" class="list__cta" aria-label="Create new note">New</a>
      </header>

      <ng-container *ngIf="filteredNotes().length === 0; else listTpl">
        <div class="list__empty">
          <p *ngIf="query()">No results for "{{ query() }}".</p>
          <p *ngIf="!query()">No notes yet. Click the + button to create your first note.</p>
        </div>
      </ng-container>

      <ng-template #listTpl>
        <div class="grid">
          <app-note-card
            *ngFor="let n of filteredNotes()"
            [note]="n"
            (view)="onView($event)"
            (edit)="onEdit($event)"
            (delete)="onDelete($event)"
            (pin)="onPin($event)"
          ></app-note-card>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .list { display: block; }
    .list__header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px;
    }
    .list__title { font-size: 1.1rem; font-weight: 600; color: #111827; }
    .list__cta {
      text-decoration: none; padding: 8px 12px; border-radius: 10px;
      background: linear-gradient(135deg, #2563EB, #3b82f6); color: white;
      box-shadow: 0 6px 18px rgba(37,99,235,0.3);
    }
    .list__empty {
      padding: 24px; border: 1px dashed rgba(17,24,39,0.15);
      border-radius: 12px; color: #6b7280; background: #f9fafb;
    }
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

  private querySignal = signal<string>('');
  // Filtered notes computed from current notes and query
  readonly filteredNotes = computed<Note[]>(() => {
    const q = (this.querySignal() || '').toLowerCase();
    const items: Note[] = (this._latestNotes || []);
    if (!q) return items;
    return items.filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    );
  });

  private _latestNotes: Note[] = [];

  // PUBLIC_INTERFACE
  query = this.querySignal;

  ngOnInit(): void {
    // Load notes on init
    this.store.loadAll();

    // Sync notes and search query sources:
    // - Route query param 'q'
    // - EventBus search
    // - Notes stream
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
    this.store.remove(note.id);
  }

  // PUBLIC_INTERFACE
  onPin(_note: Note): void {
    // Placeholder for pin logic; could reorder in store in the future
    // Keeping it as a no-op for now
  }
}
