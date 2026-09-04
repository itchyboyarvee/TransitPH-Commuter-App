import { Link } from 'expo-router';
import { View } from 'react-native';
import { getListSavedRoutesQueryKey, useListSavedRoutes, useDeleteSavedRoute } from '@workspace/api-client-react';
import { EmptyState, ErrorState, LoadingState, PrimaryButton, RouteCard, Screen } from '@/components/transit-native';
import { useAuth } from '@/context/auth';

export default function SavedScreen() {
  const { user } = useAuth();
  const query = useListSavedRoutes({ query: { enabled: Boolean(user), queryKey: getListSavedRoutesQueryKey() }, request: { credentials: 'include' } });
  const remove = useDeleteSavedRoute({ request: { credentials: 'include' } });
  if (!user) return <Screen eyebrow="Saved trips" title="Your usual rides, one tap away."><EmptyState title="Sign in to see saved trips" body="Your saved routes are private to your account." action={<Link href="/login" asChild><PrimaryButton label="Sign in" icon="log-in" onPress={() => {}} /></Link>} /></Screen>;
  return <Screen eyebrow="Saved trips" title="Your usual rides, one tap away." refreshing={query.isRefetching} onRefresh={() => query.refetch()}>{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState message="We could not load your saved routes." onRetry={() => query.refetch()} /> : !query.data?.length ? <EmptyState title="No saved trips yet" body="Save a route after searching and it will show up here." action={<Link href="/routes" asChild><PrimaryButton label="Find a route" icon="search" onPress={() => {}} /></Link>} /> : <View style={{ gap: 12 }}>{query.data.map((item) => <RouteCard key={item.id} route={item.route} from={item.from} to={item.to} saved onSave={() => remove.mutate({ id: item.id }, { onSuccess: () => query.refetch() })} />)}</View>}</Screen>;
}