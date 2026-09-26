import ExpenseCard from "./ExpenseCard";
import EmptyState from "./EmptyState";

export default function ExpenseList({ expenses, onEdit, onDelete, onAddExpense }) {
  // The page handles its own loading/error states; this component only
  // shows the empty state when the list is genuinely empty.
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        description="Start tracking your spending by adding your first expense."
        actionLabel="Add Expense"
        onAction={onAddExpense}
      />
    );
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <ExpenseCard key={expense._id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
