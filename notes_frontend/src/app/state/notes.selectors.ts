import { inject } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Note } from '../core/models/note.model';
import { NotesStore } from './notes.store';

/**
 * Notes selectors: Utility functions to derive data from NotesStore.
 * These selectors are optional convenience helpers for components.
 */

// PUBLIC_INTERFACE
export function selectAllNotes(): Observable<Note[]> {
  /** Returns observable of all notes. */
  const store = inject(NotesStore);
  return store.notes$;
}

// PUBLIC_INTERFACE
export function selectLoading(): Observable<boolean> {
  /** Returns observable loading state. */
  const store = inject(NotesStore);
  return store.loading$;
}

// PUBLIC_INTERFACE
export function selectError(): Observable<string | null> {
  /** Returns observable error state. */
  const store = inject(NotesStore);
  return store.error$;
}

// PUBLIC_INTERFACE
export function selectSelectedNote(): Observable<Note | null> {
  /** Returns observable of selected note (or null). */
  const store = inject(NotesStore);
  return store.selectedNote$;
}

// PUBLIC_INTERFACE
export function selectById(id: string): Observable<Note | undefined> {
  /** Returns observable of a specific note by id from the current store. */
  const store = inject(NotesStore);
  return store.notes$.pipe(map((list) => list.find((n) => n.id === id)));
}

// PUBLIC_INTERFACE
export function selectSearch(query: string): Observable<Note[]> {
  /**
   * Returns an observable of notes filtered by query.
   * Client-side filtering; for server search, call store.search() then use selectAllNotes().
   */
  const store = inject(NotesStore);
  const q = (query || '').toLowerCase();
  return store.notes$.pipe(
    map((list) =>
      q
        ? list.filter(
            (n) =>
              n.title?.toLowerCase().includes(q) ||
              n.content?.toLowerCase().includes(q)
          )
        : list
    )
  );
}
