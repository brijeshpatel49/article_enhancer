import { useState, useEffect } from "react";

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articles`);
      if (!res.ok) throw new Error("Failed to fetch articles");
      const data = await res.json();
      setArticles(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const deleteArticle = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/articles/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete article");
      await fetchArticles();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };

  return { articles, loading, error, refetch: fetchArticles, deleteArticle };
}
