"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useLocalStorage } from "usehooks-ts";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion } from "@/components/ui/accordion";
import { NavItem, Organization } from "./nav-item";

interface SidebarProps {
  storageKey?: string;
}

export const Sidebar = ({ storageKey = "t-sidebar-state" }: SidebarProps) => {
  const [expended, setExpended] = useLocalStorage<Record<string, any>>(
    storageKey,
    {}
  );

  const { organization: activeOrganization } =
    useOrganization();
  const { userMemberships, isLoaded: isLoadedOrgList } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const defaultAccordionValue: string[] = Object.keys(expended).reduce(
    (acc: string[], key: string) => {
      if (expended[key]) acc.push(key);
      return acc;
    },
    []
  );

  const handleExpand = (id: string) => {
    setExpended((curr) => ({ ...curr, [id]: !expended[id] }));
  };

  if (!isLoadedOrgList) {
    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="w-[50%] h-10" />
          <Skeleton className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <NavItem.Skeleton />
          <NavItem.Skeleton />
          <NavItem.Skeleton />
        </div>
      </>
    );
  }


  return (
    <>
      <div className="font-medium text-xs flex items-center mb-1">
        <span className="pl-4 text-lg">Workspaces</span>
        <Button
          asChild
          type="button"
          size="icon"
          variant="ghost"
          className="ml-auto"
        >
          <Link href="/select-org" className="w-8 h-8">
            <Plus className="h-4 w-4 p-0 text-xl font-extrabold" />
          </Link>
        </Button>
      </div>
      <Accordion
        type="multiple"
        defaultValue={defaultAccordionValue}
        className="space-y-2"
      >
        {userMemberships?.data.map(({ organization: org }) => (
          <NavItem
            key={org.id}
            isActive={activeOrganization?.id === org.id}
            isExpand={expended[org.id]}
            organization={org as Organization}
            handleExpand={handleExpand}
          />
        ))}
      </Accordion>
    </>
  );
};
