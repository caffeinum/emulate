import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("telegram");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
