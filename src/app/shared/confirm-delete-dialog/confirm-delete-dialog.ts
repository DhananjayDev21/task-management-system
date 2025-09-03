import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';

export interface ConfirmDeleteData {
  itemName?: string; // Optional (so you can show which item is being deleted)
}

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.html',
  styleUrls: ['./confirm-delete-dialog.scss'],
  imports: [MatDialogModule, MatDialogActions, MatIconModule, MatDivider]
})
export class ConfirmDeleteDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteData
  ) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialogRef.close(true);
  }
}
