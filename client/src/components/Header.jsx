export default function Header({ onRefresh, lastUpdated, onMenuClick }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          ☰
        </button>
        <div>
          <h1>Article Dashboard</h1>
          <p>Monitor original and AI-enhanced articles</p>
        </div>
      </div>
      
      <div className="header-right">
        <div className="last-updated">
          <span>🕐</span>
          <span>Last sync:</span>
          <span className="time">{lastUpdated}</span>
        </div>
        <button className="primary-btn" onClick={onRefresh}>
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
