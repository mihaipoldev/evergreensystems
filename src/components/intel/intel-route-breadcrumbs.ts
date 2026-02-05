import type { PageHeaderData } from "./PageHeader";

/**
 * Route patterns to breadcrumb config.
 * Order matters: more specific paths first.
 */
const ROUTE_BREADCRUMBS: Array<{
  pattern: RegExp;
  getBreadcrumb: (pathname: string) => PageHeaderData;
}> = [
  {
    pattern: /^\/intel\/projects\/new$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [
        { href: "/intel/projects", label: "Projects" },
        { label: "New Project" },
      ],
    }),
  },
  {
    pattern: /^\/intel\/projects\/[^/]+$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [
        { href: "/intel/projects", label: "Projects" },
        { label: "Project" },
      ],
    }),
  },
  {
    pattern: /^\/intel\/projects$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [{ label: "Projects" }],
    }),
  },
  {
    pattern: /^\/intel\/knowledge-bases\/[^/]+$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [
        { href: "/intel/knowledge-bases", label: "Knowledge Bases" },
        { label: "Knowledge Base" },
      ],
    }),
  },
  {
    pattern: /^\/intel\/knowledge-bases$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [{ label: "Knowledge Bases" }],
    }),
  },
  {
    pattern: /^\/intel\/workflows\/[^/]+$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [
        { href: "/intel/workflows", label: "Workflows" },
        { label: "Workflow" },
      ],
    }),
  },
  {
    pattern: /^\/intel\/workflows$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [{ label: "Workflows" }],
    }),
  },
  {
    pattern: /^\/intel\/research\/[^/]+\/result$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [
        { href: "/intel/research", label: "Research" },
        { label: "Result" },
      ],
    }),
  },
  {
    pattern: /^\/intel\/research\/[^/]+$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [
        { href: "/intel/research", label: "Research" },
        { label: "Run" },
      ],
    }),
  },
  {
    pattern: /^\/intel\/research$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [{ label: "Research" }],
    }),
  },
  {
    pattern: /^\/intel\/dashboard$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [{ label: "Dashboard" }],
    }),
  },
  {
    pattern: /^\/intel\/documents$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [{ label: "Documents" }],
    }),
  },
  {
    pattern: /^\/intel\/project-types$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [{ label: "Project Types" }],
    }),
  },
  {
    pattern: /^\/intel\/settings$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [{ label: "Settings" }],
    }),
  },
  {
    pattern: /^\/intel\/?$/,
    getBreadcrumb: () => ({
      breadcrumbItems: [{ label: "Intelligence" }],
    }),
  },
];

export function getDefaultPageHeader(pathname: string): PageHeaderData | null {
  if (!pathname.startsWith("/intel")) return null;
  const match = ROUTE_BREADCRUMBS.find(({ pattern }) => pattern.test(pathname));
  return match ? match.getBreadcrumb(pathname) : null;
}
