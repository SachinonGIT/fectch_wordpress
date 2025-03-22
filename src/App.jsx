import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchPosts } from "./api";

const App = () => {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [combinedPosts, setCombinedPosts] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const perPage = 10; // Reduced from 50

  // Throttle clock updates to every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch posts
  const loadPosts = useCallback(async (reset = false) => {
    setLoading(true);
    const newPosts = await fetchPosts(query, reset ? 1 : page, perPage);
    setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
    if (reset) setPage(2);
    else setPage(page + 1);
    setLoading(false);
  }, [query, page]);

  // Initial load and query change
  useEffect(() => {
    loadPosts(true);
  }, [query]);

  // Debounced search handler
  const handleSearch = debounce((value) => {
    setQuery(value);
  }, 500);

  // Handle post selection
  const togglePostSelection = (post) => {
    setSelectedPosts((prev) =>
      prev.includes(post)
        ? prev.filter((p) => p.id !== post.id)
        : [...prev, post]
    );
  };

  // Combine selected posts
  const handleCombine = () => {
    if (!selectedPosts.length) {
      setCombinedPosts("No posts selected!");
      return;
    }
    const combinedText = selectedPosts
      .map(
        (post) =>
          `🔹 **${post.title.rendered}**\n📄 **Short Description:** ${
            post.excerpt.rendered.replace(/<[^>]+>/g, "").slice(0, 100) || "No description"
          }...\n🔗 [Apply Here](${post.link})`
      )
      .join("\n\n");
    setCombinedPosts(combinedText);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(combinedPosts);
    alert("Copied to clipboard!");
  };

  // Memoized Post Card component
  const PostCard = React.memo(({ post, isSelected, onSelect }) => (
    <div
      onClick={() => onSelect(post)}
      className={`grid grid-cols-12 gap-4 p-4 bg-white rounded-lg shadow-md border hover:shadow-xl transition cursor-pointer ${
        isSelected ? "bg-blue-50 border-blue-500 border-2" : "border-gray-200"
      }`}
    >
      <div className="col-span-3 flex items-center">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title.rendered}
            className="w-24 h-24 object-cover rounded-md"
            loading="lazy" // Lazy load images
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded-md" />
        )}
      </div>
      <div className="col-span-4 flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">{post.title.rendered}</h2>
      </div>
      <div className="col-span-3 flex items-center text-gray-600 text-sm">
        {new Date(post.date).toLocaleString()}
      </div>
      <div className="col-span-2 flex items-center">
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          onClick={(e) => e.stopPropagation()}
        >
          {post.type === "post" ? "Blog Post" : "Job Listing"}
        </a>
      </div>
    </div>
  ));

  // Memoized posts list
  const memoizedPosts = useMemo(() => posts, [posts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6">
      <div className="text-center mb-4">
        <div className="text-2xl font-semibold text-gray-800">
          {currentTime.toLocaleTimeString()}
        </div>
        <div className="text-lg text-gray-600">
          {currentTime.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Shree Venkatesh International Limited – Walk-In Drive for Multiple Roles on March 22nd & 23rd, 2025
      </h1>

      <div className="max-w-5xl mx-auto mb-6 flex gap-4 flex-wrap justify-center">
        <input
          type="text"
          placeholder="Search job posts by title..."
          onChange={(e) => handleSearch(e.target.value)}
          className="p-2 w-full max-w-md border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        />
        <button
          onClick={handleCombine}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
        >
          Combine Selected
        </button>
        <button
          onClick={() => loadPosts(false)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
        >
          Load More
        </button>
      </div>

      {combinedPosts && (
        <div className="max-w-5xl mx-auto mb-6 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <textarea
            className="w-full h-40 p-2 border rounded-md bg-gray-50 resize-none"
            readOnly
            value={combinedPosts}
          />
          <button
            onClick={copyToClipboard}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800 text-white rounded-t-lg font-semibold text-sm">
          <div className="col-span-3">Thumbnail</div>
          <div className="col-span-4">Title</div>
          <div className="col-span-3">Posted Date & Time</div>
          <div className="col-span-2">Post Link Type</div>
        </div>

        <div className="grid gap-4">
          {memoizedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isSelected={selectedPosts.includes(post)}
              onSelect={togglePostSelection}
            />
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <button
            onClick={() => loadPosts(false)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
          >
            Load More
          </button>
        )}
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        Built with ❤️ by xAI | Updated as of March 22, 2025
      </footer>
    </div>
  );
};

export default App;