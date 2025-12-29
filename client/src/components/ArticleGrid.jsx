import ArticleCard from "./ArticleList";

export default function ArticleGrid({ 
  articles, 
  onArticleSelect, 
  loading, 
  error, 
  onRetry,
  filter,
  onFilterChange,
  totalCount 
}) {
  if (loading) {
    return (
      <div className="articles-section">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="articles-section">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load articles</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={onRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="articles-section">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No articles yet</h3>
          <p>Articles will appear here once they are scraped and processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="articles-section">
      <div className="section-header">
        <h2>Articles</h2>
        
        <div className="section-actions">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => onFilterChange('all')}
            >
              All
            </button>
            <button 
              className={`filter-tab ${filter === 'original' ? 'active' : ''}`}
              onClick={() => onFilterChange('original')}
            >
              Original
            </button>
            <button 
              className={`filter-tab ${filter === 'updated' ? 'active' : ''}`}
              onClick={() => onFilterChange('updated')}
            >
              Enhanced
            </button>
          </div>
          
          <span className="count">{articles.length} articles</span>
        </div>
      </div>
      
      {articles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No matching articles</h3>
          <p>Try changing your filter selection.</p>
        </div>
      ) : (
        <div className="grid">
          {articles.map(article => (
            <ArticleCard 
              key={article._id}
              article={article}
              onClick={() => onArticleSelect(article)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
