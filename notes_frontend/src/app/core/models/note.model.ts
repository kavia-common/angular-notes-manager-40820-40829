export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

/**
 * DTO for creating a new note.
 * Title is required; content optional by backend discretion.
 */
export interface CreateNoteDto {
  title: string;
  content?: string;
}

/**
 * DTO for updating an existing note.
 * Partial to allow patch-style updates.
 */
export interface UpdateNoteDto {
  title?: string;
  content?: string;
}
