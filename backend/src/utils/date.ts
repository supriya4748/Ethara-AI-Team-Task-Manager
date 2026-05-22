/**
 * Checks if a task is overdue based on its due date and status
 * @param dueDate Date of the task deadline
 * @param status Active task status
 * @returns True if overdue, false otherwise
 */
export const isOverdue = (dueDate: Date | null, status: string): boolean => {
  if (!dueDate || status === 'DONE') {
    return false;
  }
  return new Date(dueDate) < new Date();
};
