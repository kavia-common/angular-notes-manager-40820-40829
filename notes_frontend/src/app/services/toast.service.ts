import { Injectable, signal } from '@angular/core';
import { Subscription, timer } from 'rxjs';

/**
 * Toast message structure.
 */
export interface ToastMessage {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  text: string;
  timeoutMs?: number;
}

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class ToastService {
  /** This is a public service to publish toast messages globally. */
  readonly toasts = signal<ToastMessage[]>([]);
  private idCounter = 1;
  private autoCloseSubs = new Map<number, Subscription>();

  /**
   * Add a toast message to the stack.
   * @param text Human readable message
   * @param type Category of toast
   * @param timeoutMs Auto-dismiss timeout in ms (default 5000)
   */
  // PUBLIC_INTERFACE
  add(text: string, type: ToastMessage['type'] = 'info', timeoutMs = 5000): number {
    /** Adds a toast and returns its id. */
    const id = this.idCounter++;
    const toast: ToastMessage = { id, type, text, timeoutMs };
    this.toasts.update(list => [toast, ...list]);

    if (timeoutMs && timeoutMs > 0) {
      const sub = timer(timeoutMs).subscribe(() => {
        this.dismiss(id);
      });
      this.autoCloseSubs.set(id, sub);
    }
    return id;
  }

  /**
   * Convenience: show an error toast.
   */
  // PUBLIC_INTERFACE
  error(text: string, timeoutMs = 6000): number {
    /** Shows an error toast and returns its id. */
    return this.add(text, 'error', timeoutMs);
  }

  /**
   * Dismiss a toast by id.
   */
  // PUBLIC_INTERFACE
  dismiss(id: number): void {
    /** Removes the toast with matching id. */
    const sub = this.autoCloseSubs.get(id);
    if (sub) {
      sub.unsubscribe();
      this.autoCloseSubs.delete(id);
    }
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  /**
   * Clear all toasts.
   */
  // PUBLIC_INTERFACE
  clear(): void {
    /** Removes all toasts. */
    for (const sub of this.autoCloseSubs.values()) {
      sub.unsubscribe();
    }
    this.autoCloseSubs.clear();
    this.toasts.set([]);
  }
}
