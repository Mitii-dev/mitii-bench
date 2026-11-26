import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const fetchPosts = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return response.json();
};

function PostsList() {
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return (
    <main>
      <h1>Posts</h1>

      {isLoading && <p data-testid="rq-loading">Loading posts...</p>}

      {isError && <p role="alert">{error.message}</p>}

      {posts && (
        <ul data-testid="rq-data">
          {posts.map((post) => (
            <li key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        data-testid="rq-refetch-btn"
        onClick={() => refetch()}
        disabled={isFetching}
      >
        {isFetching ? "Refreshing..." : "Refetch Posts"}
      </button>
    </main>
  );
}

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PostsList />
    </QueryClientProvider>
  );
}
