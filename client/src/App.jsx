import { useState } from "react";
import ArticleCard from "./components/ArticleList";
import ArticleModal from "./components/ArticleModal";
import { useArticles } from "./hooks/useArticles";
import "./App.css";

export default function App() {
  const { articles, loading, error, refetch, deleteArticle } = useArticles();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [processing, setProcessing] = useState(false);

  const originalArticles = articles.filter((a) => !a.updated);
  const enhancedArticles = articles.filter((a) => a.updated);

  const handleAction = async (action) => {
    setProcessing(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/scripts/${action}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      await refetch();
    } catch (err) {
      console.error(err);
      alert("Failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this article?")) {
      await deleteArticle(id);
    }
  };

  if (loading) {
    return (
      <div className="app-container loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container error">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={refetch} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Article Dashboard</h1>
        <p>View and compare original vs enhanced content</p>
        <div className="header-actions">
          <button
            onClick={() => handleAction("scrape")}
            disabled={processing}
            className="action-btn"
          >
            {processing ? "..." : " Fetch Article"}
          </button>
          <button
            onClick={() => handleAction("enhance")}
            disabled={processing}
            className="action-btn enhance"
          >
            {processing ? "..." : "Enhance Article"}
          </button>
        </div>
      </header>

      <main className="content-grid">
        <section className="column original-column">
          <div className="column-header">
            <h2>Original Articles</h2>
            <span className="count-badge">{originalArticles.length}</span>
          </div>
          <div className="articles-list">
            {originalArticles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                onClick={() => setSelectedArticle(article)}
                onDelete={(e) => handleDelete(e, article._id)}
              />
            ))}
            {originalArticles.length === 0 && (
              <div className="empty-message">No original articles found.</div>
            )}
          </div>
        </section>

        <section className="column enhanced-column">
          <div className="column-header">
            <h2>Enhanced Articles</h2>
            <span className="count-badge">{enhancedArticles.length}</span>
          </div>
          <div className="articles-list">
            {enhancedArticles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                onClick={() => setSelectedArticle(article)}
                onDelete={(e) => handleDelete(e, article._id)}
              />
            ))}
            {enhancedArticles.length === 0 && (
              <div className="empty-message">No enhanced articles found.</div>
            )}
          </div>
        </section>
      </main>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}
