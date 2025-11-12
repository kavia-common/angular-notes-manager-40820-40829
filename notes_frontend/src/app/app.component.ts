import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TopNavComponent } from './shared/top-nav/top-nav.component';
import { FabComponent } from './shared/fab/fab.component';
import { EventBusService } from './shared/event-bus.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopNavComponent, FabComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // PUBLIC_INTERFACE
  title = 'Notes';

  private readonly router = inject(Router);
  private readonly bus = inject(EventBusService);

  // PUBLIC_INTERFACE
  onSearch(term: string): void {
    /**
     * Handles search events from the top navigation.
     * - Updates the query param to allow deep link and back/forward support.
     * - Emits to a simple EventBus placeholder for components not using the router.
     */
    const q = (term || '').trim();
    void this.router.navigate([], {
      queryParams: { q: q || null },
      queryParamsHandling: 'merge',
    });
    this.bus.setSearch(q);
  }
}
