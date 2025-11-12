import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { catchError, finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { CreateNoteDto, Note, UpdateNoteDto } from '../core/models/note.model';
import { NotesService } from '../core/services/notes.service';
import { ToastService } from '../services/toast.service';

/**
 * NotesStore: Lightweight state management for notes using RxJS BehaviorSubjects.
 * Exposes observable state and action methods that delegate CRUD to NotesService,
 * performs optimistic updates where practical, and shows toast notifications
 * for success/failure.
 */
@Injectable({ providedIn: 'root' })
export class NotesStore {
  private readonly api = inject(NotesService);
  private readonly toaster = inject(ToastService);

  // Core state
  private readonly notesSubject = new BehaviorSubject<Note[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);

  // Derived streams
  readonly notes$ = this.notesSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  // PUBLIC_INTERFACE
  readonly selectedNote$: Observable<Note | null> = combineLatest([
    this.notes$,
    this.selectedIdSubject.asObservable(),
  ]).pipe(
    /** Returns currently selected note or null. */
    map(([notes, id]) => (id ? notes.find((n) => n.id === id) ?? null : null))
  );

  /**
   * INTERNAL: Helper to set error uniformly and toast it.
   */
  private setError(err: unknown, fallback = 'Operation failed'): void {
    let msg: string;
    try {
      msg =
        (err as any)?.message ||
        (typeof err === 'string' ? (err as string) : '') ||
        fallback;
    } catch {
      msg = fallback;
    }
    this.errorSubject.next(msg);
    this.toaster.error(msg);
  }

  /**
   * INTERNAL: Immutable helpers
   */
  private upsertNote(list: Note[], note: Note): Note[] {
    const idx = list.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      const copy = list.slice();
      copy[idx] = note;
      return copy;
    }
    return [note, ...list];
  }

  private removeNote(list: Note[], id: string): Note[] {
    return list.filter((n) => n.id !== id);
  }

  // PUBLIC_INTERFACE
  loadAll(): void {
    /** Loads all notes, updating loading and error states. */
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.api
      .list()
      .pipe(
        tap((notes) => {
          this.notesSubject.next(notes ?? []);
          this.toaster.add('Notes loaded', 'success', 2500);
        }),
        catchError((err) => {
          this.setError(err, 'Failed to load notes');
          return of([] as Note[]);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  // PUBLIC_INTERFACE
  search(query: string): void {
    /**
     * Naive client-side search that filters the in-memory list of notes.
     * This can be replaced with server-side search by calling a backend endpoint.
     */
    // If query is empty, reload full list to reset filters
    if (!query?.trim()) {
      this.loadAll();
      return;
    }
    const q = query.toLowerCase();
    this.notes$.pipe(take(1)).subscribe((list) => {
      const filtered = list.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q)
      );
      this.notesSubject.next(filtered);
    });
  }

  // PUBLIC_INTERFACE
  getById(id: string): void {
    /**
     * Fetch a single note and put it into the store (upsert). Also sets selectedId.
     */
    if (!id) return;
    this.selectedIdSubject.next(id);
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.api
      .get(id)
      .pipe(
        tap((note) => {
          this.notes$.pipe(take(1)).subscribe((list) => {
            this.notesSubject.next(this.upsertNote(list, note));
          });
          this.toaster.add('Note loaded', 'success', 2000);
        }),
        catchError((err) => {
          this.setError(err, 'Failed to load note');
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  // PUBLIC_INTERFACE
  create(payload: CreateNoteDto): void {
    /**
     * Create a new note with optimistic update:
     * - Adds a temporary item until the response arrives
     * - Replaces temporary with server version on success
     * - Rolls back on failure
     */
    const tempId = `temp-${Date.now()}`;
    const tempNote: Note = {
      id: tempId,
      title: payload.title,
      content: payload.content ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notes$.pipe(take(1)).subscribe((list) => {
      this.notesSubject.next([tempNote, ...list]);
    });
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.api
      .create(payload)
      .pipe(
        tap((created) => {
          this.notes$.pipe(take(1)).subscribe((list) => {
            // Replace temp note with server version
            const withoutTemp = this.removeNote(list, tempId);
            this.notesSubject.next([created, ...withoutTemp]);
          });
          this.toaster.add('Note created', 'success', 2500);
        }),
        catchError((err) => {
          // Roll back temp note
          this.notes$.pipe(take(1)).subscribe((list) => {
            this.notesSubject.next(this.removeNote(list, tempId));
          });
          this.setError(err, 'Failed to create note');
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  // PUBLIC_INTERFACE
  update(id: string, payload: UpdateNoteDto): void {
    /**
     * Update a note with optimistic update:
     * - Apply the patch locally
     * - Revert on error
     */
    if (!id) return;
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let prev: Note | undefined;
    this.notes$.pipe(take(1)).subscribe((list) => {
      prev = list.find((n) => n.id === id);
      if (!prev) return;

      const patched: Note = {
        ...prev,
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      this.notesSubject.next(this.upsertNote(list, patched));
    });

    this.api
      .update(id, payload)
      .pipe(
        tap((updated) => {
          this.notes$.pipe(take(1)).subscribe((list) => {
            this.notesSubject.next(this.upsertNote(list, updated));
          });
          this.toaster.add('Note updated', 'success', 2500);
        }),
        catchError((err) => {
          // rollback to prev
          if (prev) {
            this.notes$.pipe(take(1)).subscribe((list) => {
              this.notesSubject.next(this.upsertNote(list, prev!));
            });
          }
          this.setError(err, 'Failed to update note');
          return of(null);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  // PUBLIC_INTERFACE
  remove(id: string): void {
    /**
     * Remove a note with optimistic update:
     * - Remove locally
     * - Re-add on error
     */
    if (!id) return;
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let removed: Note | undefined;
    this.notes$.pipe(take(1)).subscribe((list) => {
      removed = list.find((n) => n.id === id);
      this.notesSubject.next(this.removeNote(list, id));
    });

    this.api
      .remove(id)
      .pipe(
        tap(() => {
          this.toaster.add('Note removed', 'success', 2500);
          // If currently selected was removed, clear it
          if (this.selectedIdSubject.value === id) {
            this.selectedIdSubject.next(null);
          }
        }),
        catchError((err) => {
          // Restore removed item
          if (removed) {
            this.notes$.pipe(take(1)).subscribe((list) => {
              this.notesSubject.next([removed!, ...list]);
            });
          }
          this.setError(err, 'Failed to remove note');
          return of(void 0);
        }),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe();
  }

  // PUBLIC_INTERFACE
  select(id: string | null): void {
    /** Selects a note id for detailed view. */
    this.selectedIdSubject.next(id);
  }
}
