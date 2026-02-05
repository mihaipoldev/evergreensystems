"use client";

import { Fragment } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faEllipsis } from "@fortawesome/free-solid-svg-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ActionMenu } from "@/components/shared/ActionMenu";
import type { ReactNode } from "react";

export interface BreadcrumbItemData {
  href?: string;
  label: string;
}

export interface PageHeaderData {
  breadcrumbItems: BreadcrumbItemData[];
  actions?: ReactNode | null;
}

const EMPTY_ACTIONS = (
  <ActionMenu
    trigger={
      <button
        onClick={(e) => e.stopPropagation()}
        className="h-9 w-9 rounded-full hover:text-primary flex items-center justify-center shrink-0 cursor-pointer transition-all"
      >
        <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
      </button>
    }
    items={[]}
    align="end"
  />
);

interface PageHeaderProps {
  data: PageHeaderData;
}

export function PageHeader({ data }: PageHeaderProps) {
  const { breadcrumbItems, actions } = data;
  if (!breadcrumbItems.length) return null;

  const rightContent = actions !== undefined ? actions : EMPTY_ACTIONS;

  return (
    <header className="flex items-center justify-between gap-4 min-w-0 py-1 md:py-2">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <BreadcrumbSeparator>
                  <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5 text-muted-foreground" />
                </BreadcrumbSeparator>
              )}
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-medium truncate max-w-[200px] sm:max-w-[320px]">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="shrink-0">{rightContent}</div>
    </header>
  );
}
