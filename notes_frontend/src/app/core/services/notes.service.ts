import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../../config/app-config';
import { CreateNoteDto, Note, UpdateNoteDto } from '../models/note.model';

/**
 * Service responsible for performing CRUD operations on notes via HTTP.
 * It uses the injected application configuration to determine the API base URL.
 */
@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject<AppConfig>(APP_CONFIG);

  private get baseUrl(): string {
    // Prefer NG_APP_API_BASE else NG_APP_BACKEND_URL via APP_CONFIG.apiBase fallback logic
    const apiBase = this.config.apiBase || this.config.backendUrl || '/api';
    return `${apiBase.replace(/\/$/, '')}/notes`;
  }

  /**
   * Retrieve the full list of notes.
   */
  // PUBLIC_INTERFACE
  list(): Observable<Note[]> {
    /** Returns an observable list of all notes. */
    return this.http.get<Note[]>(this.baseUrl);
  }

  /**
   * Retrieve a single note by id.
   * @param id Note identifier
   */
  // PUBLIC_INTERFACE
  get(id: string): Observable<Note> {
    /** Fetches a single note by its id. */
    return this.http.get<Note>(`${this.baseUrl}/${encodeURIComponent(id)}`);
  }

  /**
   * Create a new note.
   * @param payload Data to create note
   */
  // PUBLIC_INTERFACE
  create(payload: CreateNoteDto): Observable<Note> {
    /** Creates a new note and returns the created entity. */
    return this.http.post<Note>(this.baseUrl, payload);
  }

  /**
   * Update an existing note by id.
   * @param id Note identifier
   * @param payload Partial update payload
   */
  // PUBLIC_INTERFACE
  update(id: string, payload: UpdateNoteDto): Observable<Note> {
    /** Updates a note and returns the updated entity. */
    return this.http.patch<Note>(`${this.baseUrl}/${encodeURIComponent(id)}`, payload);
  }

  /**
   * Remove a note by id.
   * @param id Note identifier
   */
  // PUBLIC_INTERFACE
  remove(id: string): Observable<void> {
    /** Deletes a note by id. */
    return this.http
      .delete(`${this.baseUrl}/${encodeURIComponent(id)}`, { responseType: 'text' as any })
      .pipe(map(() => void 0));
  }
}
