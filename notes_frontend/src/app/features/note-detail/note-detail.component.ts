import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  template: `
    <article class="detail">
      <header class="detail__header">
        <a routerLink="/" class="detail__back" aria-label="Back to list">← Back</a>
        <a [routerLink]="(id$ | async) ? ['/notes', (id$ | async), 'edit'] : '/notes/new'"
           class="detail__edit" aria-label="Edit">Edit</a>
      </header>

      <section class="detail__content">
        <h2 class="detail__title">Note {{ id$ | async }}</h2>
        <p class="detail__body">This is a placeholder for the note detail view.</p>
      </section>
    </article>
  `,
  styles: [`
    .detail__header { display:flex; justify-content: space-between; align-items:center; margin-bottom: 12px; }
    .detail__back, .detail__edit {
      text-decoration: none; color: #2563EB;
      padding: 6px 10px; border-radius: 8px; background: rgba(37,99,235,0.08);
    }
    .detail__title { font-size: 1.25rem; font-weight: 600; margin-bottom: 10px; color: #111827; }
    .detail__body { color: #374151; }
  `]
})
export class NoteDetailComponent {
  // PUBLIC_INTERFACE
  id$: Observable<string>;

  constructor(private route: ActivatedRoute) {
    // Initialize after dependency is available to satisfy strict property initialization
    this.id$ = this.route.paramMap.pipe(map(p => p.get('id') ?? 'new'));
  }
}
