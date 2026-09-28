import { getPayload } from "payload";
import config from "@/payload.config";

import { events as sourceEvents } from "@/data/events";
import { posts as sourcePosts, type Post as SourcePost } from "@/data/posts";
import { projects as sourceProjects } from "@/data/projects";
import {
  postContent,
  defaultContent,
  type ContentBlock,
} from "@/data/postContent";

import type { Post as PayloadPost } from "@/payload-types";

type PayloadBlocks = NonNullable<PayloadPost["content"]>;

function toPayloadBlocks(blocks: ContentBlock[]): PayloadBlocks {
  return blocks.map((block) => {
    switch (block.type) {
      case "paragraph":
        return {
          blockType: "paragraph" as const,
          text: block.text,
        };

      case "heading":
        return {
          blockType: "heading" as const,
          level: String(block.level),
          text: block.text,
          anchorId: block.id,
        };

      case "quote":
        return {
          blockType: "quote" as const,
          text: block.text,
          attribution: block.attribution,
        };

      case "image":
        return {
          blockType: "image" as const,
          src: block.src,
          alt: block.alt,
          caption: block.caption,
        };

      case "list":
        return {
          blockType: "list" as const,
          ordered: !!block.ordered,
          items: block.items,
        };

      case "divider":
        return {
          blockType: "divider" as const,
        };

      case "code":
        return {
          blockType: "code" as const,
          language: block.language,
          code: block.code,
        };

      case "callout":
        return {
          blockType: "callout" as const,
          title: block.title,
          text: block.text,
        };

      default:
        throw new Error(
          `Unknown block type: ${(block as { type: string }).type}`,
        );
    }
  }) as PayloadBlocks;
}

function contentForPost(post: SourcePost) {
  return postContent[post.slug] ?? defaultContent;
}

async function seed() {

  const payload = await getPayload({
    config,
  });


  
  // Test that Payload can actually query the database.
  const events = await payload.find({
    collection: "events",
    limit: 1,
  });

  console.log("Database query successful");
  console.log("Existing events:", events);

  console.log("Seeding events...");

  for (const event of sourceEvents) {
    console.log(`Creating event: ${event.slug}`);

    await payload.create({
      collection: "events",
      data: {
        title: event.title,
        slug: event.slug,
        subtitle: event.subtitle,
        category: event.category,
        status: event.status,
        date: event.date,
        endDate: event.endDate,
        time: event.time,
        venue: event.venue,
        city: event.city,
        country: event.country,
        description: event.description,
        longDescription: event.longDescription,
        accent: event.accent,
        image: event.image,
        rsvpUrl: event.rsvpUrl,
        capacity: event.capacity,
        artists: event.artists,
        tags: event.tags,
      },
    });

    console.log(`Created event: ${event.slug}`);
  }

  console.log("Seeding posts...");

  for (const post of sourcePosts) {
    console.log(`Creating post: ${post.slug}`);

    const body = contentForPost(post);

    await payload.create({
      collection: "posts",
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        category: post.category,
        accent: post.accent,
        readTime: post.readTime,
        featured: !!post.featured,
        publishedAt: post.date,
        author: post.author,
        authorRole: body.authorRole,
        authorBio: body.authorBio,
        content: toPayloadBlocks(body.blocks),
      },
    });

    console.log(`Created post: ${post.slug}`);
  }

  console.log("Seeding projects...");

  for (const project of sourceProjects) {
    console.log(`Creating project: ${project.slug}`);

    await payload.create({
      collection: "projects",
      data: {
        title: project.title,
        slug: project.slug,
        subtitle: project.subtitle,
        category: project.category,
        featured: !!project.featured,
        year: project.year,
        client: project.client,
        location: project.location,
        materials: project.materials,
        dimensions: project.dimensions,
        duration: project.duration,
        accent: project.accent,
        description: project.description,
        story: project.story,
        specs: project.specs,
        coverImage: project.images?.[0]?.src,
        images: project.images,
        video: project.video,
        modelUrl: project.modelUrl,
      },
    });

    console.log(`Created project: ${project.slug}`);
  }

  console.log("=================================");
  console.log("SEED COMPLETE");
  console.log("=================================");
}

console.log("=================================");
console.log("SEED COMPLETE");
console.log("=================================");

await seed();
