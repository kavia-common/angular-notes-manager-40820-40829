import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

/**
 * FabComponent
 * Floating action button to navigate to a target route (default: /notes/new).
 */
@Component({
  selector: 'app-fab',
  standalone: true,
  template: `
    <button
      class="fab"
      [attr.title]="title"
      [attr.aria-label]="title"
      [attr.aria-describedby]="'fab-help'"
      (click)="navigate()"
    >
      +
    </button>
    <span id="fab-help" class="visually-hidden">Creates a new note</span>
  `,
  styles: [`
:host { display: contents; }
.visually-hidden { position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden; }
.fab {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--op-primary, #2563EB), #3b82f6);
  color: white;
  font-size: 28px;
  line-height: 1;
  box-shadow: 0 10px 30px rgba(37,99,235,0.35);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}
.fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 38px rgba(37,99,235,0.45);
}
  `]
})
export class FabComponent {
  /**
   * Route to navigate to when clicked.
   */
  @Input() to: string | any[] = '/notes/new';

  /**
   * Label and tooltip for the button.
   */
  @Input() title = 'Add note';

  constructor(private router: Router) {}

  // PUBLIC_INTERFACE
  navigate(): void {
    /** Navigates to the provided route when the FAB is clicked. */
    if (Array.isArray(this.to)) {
      void this.router.navigate(this.to);
    } else {
      void this.router.navigateByUrl(this.to);
    }
  }
}
