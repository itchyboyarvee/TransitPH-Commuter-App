import { useState } from 'react';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { View, Text } from 'react-native';
import { getSearchRoutesQueryKey, useSearchRoutes } from '@workspace/api-client-react';
import { EmptyState, ErrorState, LoadingState, PrimaryButton, RouteCard, Screen, SearchPanel, mapStyles } from '@/components/transit-native';
import { useAuth } from '@/context/auth';
import { useColors } from '@/hooks/useColors';

export default function RoutesScreen() {
  const colors = useColors();
  const styles = mapStyles(colors);
  const params = useLocalSearchParams<{ from?: string; to?: string }>();
  const [from, setFrom] = useState<string>(params.from ?? '');
  const [to, setTo] = useState<string>(params.to ?? '');
  const { user } = useAuth();
  const hasSearch = Boolean(from && to);
  const query = useSearchRoutes({ from: from || ' ', to: to || ' ' }, { query: { enabled: hasSearch && Boolean(user), queryKey: getSearchRoutesQueryKey({ from: from || ' ', to: to || ' ' }) }, request: { credentials: 'include' } });
  return (
    <Screen eyebrow="Route finder" title="A better ride starts with the right route.">
      {!hasSearch ? <SearchPanel initialFrom={from} initialTo={to} /> : !user ? <EmptyState title="Sign in to find a route" body="Searches stay tied to your commuter account." action={<Link href="/login" asChild><PrimaryButton label="Sign in" onPress={() => {}} icon="log-in" /></Link>} /> : query.isLoading ? <LoadingState /> : query.isError ? <ErrorState message={query.error instanceof Error ? query.error.message : 'We could not find routes right now.'} onRetry={() => query.refetch()} /> : !query.data?.length ? <EmptyState title="No routes found yet" body="Try a nearby landmark or a shorter place name." action={<PrimaryButton label="Start over" icon="rotate-ccw" onPress={() => { setFrom(''); setTo(''); }} secondary />} /> : <View style={{ gap: 12 }}><View style={styles.infoPanel}><Text style={styles.infoTitle}>{query.data.length} routes from {from} to {to}</Text><Text style={styles.infoText}>Best matches first, with fare and walking details before you leave.</Text></View>{query.data.map((route) => <RouteCard key={route.id} route={route} from={from} to={to} onPress={() => router.push({ pathname: '/routes/[id]', params: { id: String(route.id) } })} />)}</View>}
    </Screen>
  );
}