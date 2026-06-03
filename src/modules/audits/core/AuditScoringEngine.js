export const calculateAuditScore = (questions) => {
  const totalQuestions = questions.length;
  const naCount = questions.filter(q => q.status === 'N/A').length;
  const yesCount = questions.filter(q => q.status === 'YES').length;
  const totalEvaluated = totalQuestions - naCount;
  const score = totalEvaluated > 0 ? Math.round((yesCount / totalEvaluated) * 100) : 100;
  return {
    possibleScore: totalQuestions,
    naCount,
    evaluatedScore: totalEvaluated,
    actualScore: score
  };
};
