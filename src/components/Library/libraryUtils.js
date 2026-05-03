export const CATEGORIES = [
  'All', 
  'Computer', 
  'Science', 
  'Mechanical', 
  'Electrical', 
  'Fiction', 
  'Reference', 
  'Other'
];

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  return now > due;
};