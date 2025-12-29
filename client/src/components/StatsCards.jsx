export default function StatsCards({ articles, updatedCount, originalCount }) {
  const total = articles.length;
  const updateRate = total > 0 ? ((updatedCount / total) * 100).toFixed(1) : 0;
  const refsCount = articles.reduce((acc, a) => acc + (a.references?.length || 0), 0);

  return (
    <div className="stats-grid">
      <div className="stat-card primary">
        <div className="stat-icon">📄</div>
        <div className="stat-content">
          <h3>{originalCount}</h3>
          <p>Original Articles</p>
        </div>
      </div>
      
      <div className="stat-card secondary">
        <div className="stat-icon">✨</div>
        <div className="stat-content">
          <h3>{updatedCount}</h3>
          <p>AI Enhanced</p>
        </div>
      </div>
      
      <div className="stat-card neutral">
        <div className="stat-icon">📚</div>
        <div className="stat-content">
          <h3>{refsCount}</h3>
          <p>References</p>
        </div>
      </div>
      
      <div className="stat-card accent">
        <div className="stat-icon">📈</div>
        <div className="stat-content">
          <h3>{updateRate}%</h3>
          <p>Enhancement Rate</p>
        </div>
      </div>
    </div>
  );
}
