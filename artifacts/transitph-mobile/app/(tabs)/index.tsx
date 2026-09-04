import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useListTerminals, useGetWeather } from '@workspace/api-client-react';
import { Screen, SearchPanel, SectionHeader, TerminalCard, WeatherCard, LoadingState, ErrorState, mapStyles } from '@/components/transit-native';
import { useColors } from '@/hooks/useColors';

export default function HomeScreen() {
  const colors = useColors();
  const styles = mapStyles(colors);
  const terminals = useListTerminals(undefined, { request: { credentials: 'include' } });
  const weather = useGetWeather({ location: 'CALABARZON' }, { request: { credentials: 'include' } });
  return (
    <Screen refreshing={terminals.isRefetching} onRefresh={() => { terminals.refetch(); weather.refetch(); }}>
      <View style={{ gap: 13 }}>
        <Text style={styles.heroKicker}>Morning route brief</Text>
        <Text style={styles.heroTitle}>Go places.{'\n'}<Text style={styles.heroAccent}>Know the way.</Text></Text>
        <Text style={styles.heroBody}>A clearer way to ride across Cavite, Laguna, Batangas, Rizal, and Quezon.</Text>
      </View>
      <SearchPanel />
      <View>
        <SectionHeader title="Nearby terminals" action="View all" onPress={() => router.push('/terminals')} />
        {terminals.isLoading ? <LoadingState /> : terminals.isError ? <ErrorState message="We could not load the terminal directory." onRetry={() => terminals.refetch()} /> : <View style={{ gap: 10 }}>{(terminals.data ?? []).slice(0, 3).map((terminal) => <TerminalCard key={terminal.id} terminal={terminal} />)}</View>}
      </View>
      {weather.isLoading ? <LoadingState /> : weather.isError ? <ErrorState message="Weather is temporarily unavailable." onRetry={() => weather.refetch()} /> : <WeatherCard weather={weather.data} />}
    </Screen>
  );
}
