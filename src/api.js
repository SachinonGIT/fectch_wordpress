import axios from "axios";

const BASE_URL = "https://pharmarecruiter.in/wp-json/wp/v2";

// Function to decode HTML entities
const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export const fetchPosts = async (query = "", page = 1, perPage = 50) => {
  try {
    const today = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(today.getDate() - 15);

    const response = await axios.get(`${BASE_URL}/posts`, {
      params: {
        search: query,
        per_page: perPage,
        page: page,
        after: fifteenDaysAgo.toISOString(),
      },
    });

    // Fetch thumbnails and decode titles
    const postsWithThumbnails = await Promise.all(
      response.data.map(async (post) => {
        if (post.featured_media) {
          const media = await fetchMedia(post.featured_media);
          return { ...post, thumbnail: media.source_url, title: { rendered: decodeHtml(post.title.rendered) } };
        }
        return { ...post, thumbnail: null, title: { rendered: decodeHtml(post.title.rendered) } };
      })
    );

    return postsWithThumbnails;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const fetchMedia = async (mediaId) => {
  try {
    const response = await axios.get(`${BASE_URL}/media/${mediaId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching media:", error);
    return { source_url: null };
  }
};