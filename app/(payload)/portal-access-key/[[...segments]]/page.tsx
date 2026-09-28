// app/(payload)/portal-access-key/[[...segments]]/page.tsx
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import configPromise from "@/payload.config";
import { importMap } from "@/app/(payload)/portal-access-key/importMap";

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({
    config: configPromise,
    params,
    searchParams,
  });

const Page = ({ params, searchParams }: Args) =>
  RootPage({
    config: configPromise,
    importMap,
    params,
    searchParams,
  });

export default Page;
