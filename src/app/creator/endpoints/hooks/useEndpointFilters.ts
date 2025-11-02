"use client";
import { useMemo, useState } from "react";
import type { EndpointRow, GroupRow, ProductRow } from "../types";

export const UNGROUPED = "__ungrouped__";

export function useEndpointFilters(endpoints: EndpointRow[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return endpoints.filter((e) => {
      const displayName = (e.endpoint_name ?? e.name ?? "").toLowerCase();
      const path = (e.path ?? "").toLowerCase();
      const matchesSearch = displayName.includes(q) || path.includes(q);
      const matchesMethod = !methodFilter || e.method === methodFilter;
      const matchesStatus = !statusFilter || e.status === statusFilter;
      const matchesGroup = !groupFilter || (groupFilter === UNGROUPED ? !e.group_id : e.group_id === groupFilter);
      return matchesSearch && matchesMethod && matchesStatus && matchesGroup;
    });
  }, [endpoints, searchTerm, methodFilter, statusFilter, groupFilter]);

  return {
    state: { searchTerm, methodFilter, statusFilter, groupFilter },
    set: { setSearchTerm, setMethodFilter, setStatusFilter, setGroupFilter },
    filtered,
  };
}

export const productName = (e: EndpointRow, groups: GroupRow[], products: ProductRow[]) => {
  const g = e.group_id ? groups.find((gg) => gg.id === e.group_id) : undefined;
  if (g) return products.find((p) => p.id === g.product_id)?.name || "Unknown";
  if (e.product_id) return products.find((p) => p.id === e.product_id)?.name || "Unknown";
  return "Unassigned";
};

export const groupName = (groupId: string | null | undefined, groups: GroupRow[]) =>
  groupId ? (groups.find((g) => g.id === groupId)?.name || "Unassigned") : "Unassigned";
