"use client";
import { Search } from "lucide-react";
import { UNGROUPED } from "../hooks/useEndpointFilters";
import type { GroupRow } from "../types";

type Props = {
  searchId: string;
  groupFilterId: string;
  methodFilterId: string;
  statusFilterId: string;
  groups: GroupRow[];
  values: { searchTerm: string; method: string; status: string; group: string };
  onChange: {
    search: (v: string) => void;
    method: (v: string) => void;
    status: (v: string) => void;
    group: (v: string) => void;
  };
};

export default function EndpointsFilters({
  searchId, groupFilterId, methodFilterId, statusFilterId,
  groups, values, onChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <label htmlFor={searchId} className="sr-only">Search endpoints</label>
          <input
            id={searchId}
            type="text"
            placeholder="Search endpoints..."
            value={values.searchTerm}
            onChange={(e) => onChange.search(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <label htmlFor={groupFilterId} className="sr-only">Filter by group</label>
          <select
            id={groupFilterId}
            value={values.group}
            onChange={(e) => onChange.group(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Groups</option>
            <option value={UNGROUPED}>Unassigned</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <label htmlFor={methodFilterId} className="sr-only">Filter by method</label>
          <select
            id={methodFilterId}
            value={values.method}
            onChange={(e) => onChange.method(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Methods</option>
            {["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <label htmlFor={statusFilterId} className="sr-only">Filter by status</label>
          <select
            id={statusFilterId}
            value={values.status}
            onChange={(e) => onChange.status(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {["draft","preview","public","deprecated","disabled"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
