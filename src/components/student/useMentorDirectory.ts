"use client";

import { useEffect, useState } from "react";
import mentorService, { type MentorDirectoryEntry } from "@/services/mentor.service";
import {
  buildMentorDirectoryParams,
  type MentorDirectoryFilters,
} from "@/lib/mentor-directory";

interface DirectoryResponse {
  key: string;
  profiles: MentorDirectoryEntry[];
  moreRecords: boolean;
  error: string | null;
}

export default function useMentorDirectory(filters: MentorDirectoryFilters) {
  const filterKey = JSON.stringify(filters);
  const [navigation, setNavigation] = useState({ filterKey, page: 1 });
  const [revision, setRevision] = useState(0);
  const [response, setResponse] = useState<DirectoryResponse | null>(null);
  if (navigation.filterKey !== filterKey) {
    setNavigation({ filterKey, page: 1 });
  }
  // Every change starts on page one, without issuing a request for the old page.
  const page = navigation.filterKey === filterKey ? navigation.page : 1;
  const requestKey = JSON.stringify([filterKey, page, revision]);

  useEffect(() => {
    const controller = new AbortController();
    // Debounce typing and cancel requests superseded by newer filters.
    const timer = window.setTimeout(async () => {
      try {
        const params = buildMentorDirectoryParams(JSON.parse(filterKey), page);
        const result = await mentorService.getDirectoryPage(params, controller.signal);
        if (!controller.signal.aborted) {
          setResponse({ key: requestKey, profiles: result.profiles, moreRecords: result.moreRecords, error: null });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResponse({
            key: requestKey,
            profiles: [],
            moreRecords: false,
            error: error instanceof Error ? error.message : "Couldn't load tutors. Please try again.",
          });
        }
      }
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filterKey, page, requestKey]);

  const current = response?.key === requestKey ? response : null;
  return {
    profiles: current?.profiles ?? [],
    loading: current === null,
    error: current?.error ?? null,
    moreRecords: current?.moreRecords ?? false,
    page,
    setPage: (nextPage: number) => setNavigation({ filterKey, page: Math.max(1, nextPage) }),
    refresh: () => setRevision((value) => value + 1),
  };
}
