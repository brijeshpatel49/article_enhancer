export default function Sidebar({ articlesCount, updatedCount, originalCount, onRefresh, isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">📰</div>
        <h2>BeyondChats</h2>
        <p>Content Manager</p>
      </div>
      
      <nav className="sidebar-nav">
        <button className="nav-item active">
          <span className="icon">📊</span>
          Dashboard
        </button>
        <button className="nav-item">
          <span className="icon">📄</span>
          All Articles
        </button>
        <button className="nav-item">
          <span className="icon">✨</span>
          AI Enhanced
        </button>
        <button className="nav-item" onClick={onRefresh}>
          <span className="icon">🔄</span>
          Sync Data
        </button>
      </nav>

      <div className="sidebar-stats">
        <div className="sidebar-stats-title">Quick Stats</div>
        <div className="stat">
          <span className="stat-label">Total Articles</span>
          <span className="stat-value">{articlesCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Original</span>
          <span className="stat-value original">{originalCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">AI Updated</span>
          <span className="stat-value updated">{updatedCount}</span>
        </div>
      </div>
    </aside>
  );
}
