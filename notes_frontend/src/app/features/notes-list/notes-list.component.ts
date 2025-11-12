import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="list">
      <header class="list__header">
        <h2 class="list__title">All Notes</h2>
        <a routerLink="/notes/new" class="list__cta" aria-label="Create new note">New</a>
      </header>
      <div class="list__empty">
        <p>No notes yet. Click the + button to create your first note.</p>
      </div>
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
  `]
})
export class NotesListComponent {}
