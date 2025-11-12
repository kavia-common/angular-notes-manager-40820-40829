import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/notes-list/notes-list.component').then(
        (m) => m.NotesListComponent
      ),
  },
  {
    path: 'notes',
    children: [
      {
        path: 'new',
        loadComponent: () =>
          import('./features/note-edit/note-edit.component').then(
            (m) => m.NoteEditComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/note-detail/note-detail.component').then(
            (m) => m.NoteDetailComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./features/note-edit/note-edit.component').then(
            (m) => m.NoteEditComponent
          ),
      },
    ],
  },
  // Fallback to root
  { path: '**', redirectTo: '' },
];
