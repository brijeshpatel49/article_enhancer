export default function ArticleCard({ article, onClick, onDelete }) {
  const isUpdated = article.updated;
  const hasRefs = article.references?.length > 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getExcerpt = (content, maxLength = 120) => {
    if (!content) return "";
    const text = content.replace(/<[^>]*>/g, "");
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div
      className={`article-card ${isUpdated ? "updated" : ""}`}
      onClick={onClick}
    >
      <div className="card-header">
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div className={`status-badge ${isUpdated ? "updated" : "original"}`}>
            {isUpdated ? "✨ AI Enhanced" : "📄 Original"}
          </div>
          {hasRefs && (
            <div className="ref-badge">📎 {article.references.length} refs</div>
          )}
        </div>
        <button
          className="delete-icon-btn"
          onClick={onDelete}
          title="Delete article"
        >
          🗑️
        </button>
      </div>

      <h3 className="card-title">{article.title}</h3>

      <p className="card-excerpt">{getExcerpt(article.content)}</p>

      <div className="card-meta">
        <span className="date">📅 {formatDate(article.createdAt)}</span>
        <span className="source">
          {article.sourceUrl ? "🔗 BeyondChats" : "🤖 Generated"}
        </span>
      </div>
    </div>
  );
}
