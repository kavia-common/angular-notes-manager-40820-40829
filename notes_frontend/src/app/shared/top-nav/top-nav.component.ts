import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

/**
 * TopNavComponent
 * Displays the app title and a search input, emitting search query changes.
 */
@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
    <header class="topnav" role="banner">
      <div class="topnav__brand">
        <span class="topnav__logo" aria-hidden="true">📝</span>
        <span class="topnav__title">{{ title }}</span>
      </div>

      <div class="topnav__actions">
        <label class="search" [attr.aria-label]="searchAriaLabel" *ngIf="showSearch !== false">
          <span class="search__icon" aria-hidden="true">🔎</span>
          <input
            class="search__input"
            type="search"
            [placeholder]="placeholder"
            [(ngModel)]="search"
            (ngModelChange)="onSearchChange($event)"
            (keyup.enter)="emitSearch()"
            aria-label="Search notes"
          />
          <button class="search__clear" *ngIf="search" (click)="clear()" aria-label="Clear search">✕</button>
        </label>

        <button class="topnav__action" title="Menu" aria-label="Menu">≡</button>
      </div>
    </header>
  `,
  styles: [`
:host { display:block; }
.topnav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: linear-gradient(180deg, rgba(37,99,235,0.08), rgba(255,255,255,0.9));
  -webkit-backdrop-filter: saturate(120%) blur(6px);
  backdrop-filter: saturate(120%) blur(6px);
  border-bottom: 1px solid rgba(37,99,235,0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
}
.topnav__brand { display:flex; align-items:center; gap:10px; min-width: 0; }
.topnav__logo {
  display:inline-flex; width:32px; height:32px; align-items:center; justify-content:center;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(37,99,235,0.2), rgba(249,250,251,1));
  color: var(--op-primary, #2563EB);
  box-shadow: inset 0 0 0 1px rgba(37,99,235,0.2);
}
.topnav__title { font-size: 1.1rem; font-weight: 600; color: var(--op-text, #111827); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.topnav__actions { display:flex; gap: 8px; align-items:center; }

.search {
  display:flex; align-items:center; gap:8px; padding: 6px 10px;
  border: 1px solid rgba(17,24,39,0.08); background: var(--op-surface, #fff);
  border-radius: 999px; box-shadow: var(--op-shadow, 0 4px 16px rgba(0,0,0,0.08));
  min-width: 200px;
}
.search__icon { opacity: 0.7; font-size: 14px; }
.search__input {
  border: none; outline: none; min-width: 140px; width: 22vw; max-width: 360px;
  background: transparent; color: var(--op-text, #111827);
}
.search__clear {
  border: none; background: transparent; cursor: pointer; color: #6b7280; font-size: 14px;
}
.topnav__action {
  appearance: none;
  border: 1px solid rgba(17,24,39,0.08);
  background: var(--op-surface, #fff);
  color: var(--op-text, #111827);
  padding: 8px 10px;
  border-radius: 10px;
  box-shadow: var(--op-shadow, 0 4px 16px rgba(0,0,0,0.08));
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.topnav__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37,99,235,0.15);
  border-color: rgba(37,99,235,0.25);
}

@media (max-width: 640px) {
  .search__input { width: 40vw; min-width: 110px; }
}
  `]
})
export class TopNavComponent {
  /**
   * Title to display next to the logo.
   */
  @Input() title = 'Notes';

  /**
   * Placeholder text for the search input.
   */
  @Input() placeholder = 'Search notes...';

  /**
   * Whether to show the search input.
   */
  @Input() showSearch: boolean | undefined = true;

  /**
   * Emits whenever the user changes the search query or presses Enter.
   */
  // PUBLIC_INTERFACE
  @Output() searchChange = new EventEmitter<string>();
  /** This is a public output emitting the latest search query. */

  search = '';

  get searchAriaLabel(): string {
    return `Search notes input`;
  }

  // PUBLIC_INTERFACE
  setSearchValue(value: string): void {
    /** Allows parent components to set the search input value programmatically. */
    this.search = value ?? '';
  }

  onSearchChange(value: string) {
    this.search = value ?? '';
    // Debounce can be added later if needed; emit immediately for now
    this.searchChange.emit(this.search);
  }

  emitSearch() {
    this.searchChange.emit(this.search);
  }

  clear() {
    this.search = '';
    this.searchChange.emit('');
  }
}
