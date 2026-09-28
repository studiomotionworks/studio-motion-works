import { getAllPosts } from "@/lib/queries";
import { BlogPageClient } from "./BlogPageClient";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return <BlogPageClient posts={posts} />;
}
