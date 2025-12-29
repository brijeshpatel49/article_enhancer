export default function ArticleModal({ article, onClose }) {
  if (!article) return null;

  const isUpdated = article.updated;
  const hasRefs = article.references?.length > 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatContent = (content) => {
    if (!content) return '';
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`status-badge ${isUpdated ? 'updated' : 'original'}`}>
                {isUpdated ? '✨ AI Enhanced' : '📄 Original'}
              </span>
              {hasRefs && (
                <span className="ref-badge">📎 {article.references.length} references</span>
              )}
            </div>
            <h2>{article.title}</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              📅 {formatDate(article.createdAt)}
              {article.sourceUrl && (
                <span style={{ marginLeft: '1rem' }}>
                  🔗 <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8' }}>
                    View Source
                  </a>
                </span>
              )}
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
          />
        </div>

        {hasRefs && (
          <div className="modal-references">
            <h4>📚 References</h4>
            <div className="refs-list">
              {article.references.map((ref, index) => (
                <a 
                  key={index} 
                  href={ref} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="ref-link"
                >
                  {index + 1}. {ref.replace(/^https?:\/\/(www\.)?/, '').slice(0, 60)}
                  {ref.length > 60 ? '...' : ''}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
