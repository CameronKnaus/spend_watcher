import { orpc } from 'apiClient/orpc';

// Single definition of the auth-verify query so the router's beforeLoad guards (ensureQueryData)
// and useSessionStatus (useQuery) share one cache entry and one freshness policy.
export function sessionQueryOptions() {
  return orpc.auth.verify.queryOptions({
    staleTime: 1000 * 60 * 30,
    retry: 0,
  });
}
