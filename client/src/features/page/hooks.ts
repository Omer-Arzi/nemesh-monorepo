import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getPageBySlug } from "@/lib/api/services/pageService";
import { getFooter } from "@/lib/api/services/footerService";

export function usePage(slug: string) {
  return useQuery({
    queryKey: queryKeys.pages.detail(slug),
    queryFn: () => getPageBySlug(slug),
    enabled: !!slug,
  });
}

export function useFooter() {
  return useQuery({
    queryKey: queryKeys.footer.detail(),
    queryFn: getFooter,
    staleTime: 10 * 60 * 1000,
  });
}
