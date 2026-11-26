import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const COMMENTS_QUERY_KEY = ["comments"];

const INITIAL_COMMENTS = [
  { id: 1, name: "Alex", body: "Great work!" },
  { id: 2, name: "Sam", body: "Thanks for sharing." },
];

async function fetchComments() {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/comments?_limit=5",
  );

  if (!response.ok) {
    throw new Error("Failed to load comments");
  }

  return response.json();
}

async function submitComment(comment) {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/comments",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to submit comment");
  }

  return response.json();
}

function Comments() {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: COMMENTS_QUERY_KEY,
    queryFn: fetchComments,
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: submitComment,

    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: COMMENTS_QUERY_KEY,
      });

      const previousComments = queryClient.getQueryData(COMMENTS_QUERY_KEY);

      const optimisticComment = {
        id: `optimistic-${Date.now()}`,
        ...newComment,
        optimistic: true,
      };

      queryClient.setQueryData(COMMENTS_QUERY_KEY, (old = []) => [
        ...old,
        optimisticComment,
      ]);

      return {
        previousComments,
        optimisticId: optimisticComment.id,
      };
    },

    onSuccess: (serverComment, variables, context) => {
      queryClient.setQueryData(COMMENTS_QUERY_KEY, (old = []) =>
        old.map((item) =>
          item.id === context?.optimisticId
            ? { ...serverComment, optimistic: false }
            : item,
        ),
      );

      setComment("");
      setErrorMessage("");
    },

    onError: (_error, _variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(COMMENTS_QUERY_KEY, context.previousComments);
      }

      setErrorMessage("Unable to submit comment. Please try again.");
    },
  });

  function handleSubmit(event) {
    event.preventDefault();

    const body = comment.trim();
    if (!body || mutation.isPending) return;

    setErrorMessage("");
    mutation.mutate({
      name: "You",
      body,
    });
  }

  return (
    <main>
      <h1>Comments</h1>

      <form onSubmit={handleSubmit}>
        <input
          data-testid="comment-input"
          type="text"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Write a comment..."
          aria-label="Write a comment"
        />

        <button
          data-testid="comment-submit"
          type="submit"
          disabled={!comment.trim() || mutation.isPending}
        >
          {mutation.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>

      {errorMessage && <p role="alert">{errorMessage}</p>}

      {isLoading ? (
        <p>Loading comments...</p>
      ) : (
        <ul data-testid="comment-list">
          {comments.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong>
              <p>{item.body}</p>
              {item.optimistic && <span>Sending...</span>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Comments />
    </QueryClientProvider>
  );
}
