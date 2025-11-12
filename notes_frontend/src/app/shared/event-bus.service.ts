import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * EventBusService
 * Minimal event bus for lightweight cross-component communication.
 * Currently provides a global search$ stream.
 */
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private readonly searchSubject = new BehaviorSubject<string>('');
  /** Stream of search terms from the TopNav (or other emitters). */
  // PUBLIC_INTERFACE
  get search$(): Observable<string> {
    /** This public observable emits the current search query. */
    return this.searchSubject.asObservable();
  }

  // PUBLIC_INTERFACE
  setSearch(query: string): void {
    /** Sets the current global search query. */
    this.searchSubject.next(query ?? '');
  }
}
