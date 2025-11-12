import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-note-edit',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  template: `
    <section class="edit">
      <header class="edit__header">
        <a routerLink="/" class="edit__back" aria-label="Back to list">← Back</a>
        <div class="edit__hint">Editing: {{ (mode$ | async) }}</div>
      </header>

      <div class="edit__form">
        <!-- Placeholder form -->
        <label class="edit__field">
          <span>Title</span>
          <input type="text" placeholder="Note title" />
        </label>
        <label class="edit__field">
          <span>Content</span>
          <textarea rows="6" placeholder="Write your note..."></textarea>
        </label>

        <div class="edit__actions">
          <button class="btn btn--primary" aria-label="Save">Save</button>
          <a routerLink="/" class="btn btn--ghost" aria-label="Cancel">Cancel</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .edit__header { display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px; }
    .edit__back { text-decoration:none; color:#2563EB; background: rgba(37,99,235,0.08); padding:6px 10px; border-radius:8px; }
    .edit__hint { color:#6b7280; font-size: 0.95rem; }
    .edit__field { display:flex; flex-direction: column; gap:6px; margin-bottom: 12px; }
    .edit__field input, .edit__field textarea {
      border: 1px solid rgba(17,24,39,0.12); border-radius: 10px; padding: 10px;
      outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease;
      background: #fff;
    }
    .edit__field input:focus, .edit__field textarea:focus {
      border-color: rgba(37,99,235,0.45); box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
    }
    .edit__actions { display:flex; gap:10px; margin-top: 8px; }
    .btn { padding: 10px 14px; border-radius: 10px; text-decoration: none; cursor: pointer; border: none; }
    .btn--primary { color: #fff; background: linear-gradient(135deg, #2563EB, #3b82f6); box-shadow: 0 8px 24px rgba(37,99,235,0.35); }
    .btn--ghost { color: #111827; background: #fff; border: 1px solid rgba(17,24,39,0.12); }
  `]
})
export class NoteEditComponent {
  // PUBLIC_INTERFACE
  mode$: Observable<string>;

  constructor(private route: ActivatedRoute) {
    this.mode$ = this.route.paramMap.pipe(
      map((p) => (p.has('id') ? `Note ${p.get('id')} (edit)` : 'New note'))
    );
  }
}
