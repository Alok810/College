export const calculateDynamicGrade = (fin, int, blueprint) => {
  const finScore = parseFloat(fin) || 0;
  const intScore = parseFloat(int) || 0;
  const total = finScore + intScore;
  const percentage = blueprint.totalMax > 0 ? (total / blueprint.totalMax) * 100 : 0;

  let grade = 'F'; let point = 0;
  const failedExternal = blueprint.passExt && finScore < blueprint.passExt;
  const failedTotal = total < blueprint.passTotal;

  if (failedExternal || failedTotal) { grade = 'F'; point = 0; }
  else if (percentage >= 90) { grade = 'A+'; point = 10; }
  else if (percentage >= 80) { grade = 'A'; point = 9; }
  else if (percentage >= 70) { grade = 'B+'; point = 8; }
  else if (percentage >= 60) { grade = 'B'; point = 7; }
  else if (percentage >= 50) { grade = 'C+'; point = 6; }
  else if (percentage >= 35) { grade = 'C'; point = 5; }

  return { total, grade, point };
};