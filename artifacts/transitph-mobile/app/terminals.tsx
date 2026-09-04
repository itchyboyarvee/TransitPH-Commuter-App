import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useListTerminals } from '@workspace/api-client-react';
import { Screen, TerminalCard, EmptyState, ErrorState, LoadingState, mapStyles } from '@/components/transit-native';
import { useColors } from '@/hooks/useColors';

export default function TerminalsScreen() {
  const colors = useColors();
  const styles = mapStyles(colors);
  const [filter, setFilter] = useState<string>('');
  const query = useListTerminals(undefined, { request: { credentials: 'include' } });
  const terminals = (query.data ?? []).filter((terminal) => `${terminal.name} ${terminal.city} ${terminal.province}`.toLowerCase().includes(filter.toLowerCase()));
  return (
    <Screen eyebrow="Terminal tracker" title="Know where the ride begins." refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Text style={styles.heroBody}>A living directory of jeepney terminals across the region.</Text>
      <View style={styles.lightField}><TextInput value={filter} onChangeText={setFilter} placeholder="Search terminal, city, or province" placeholderTextColor={colors.mutedForeground} style={styles.lightFieldInput} testID="input-terminal-filter" /></View>
      <View style={styles.mapSurface}><View style={styles.mapGrid} /><View style={styles.mapLine} /><View style={styles.mapPinOne} /><View style={styles.mapPinTwo} /><View style={styles.infoPanel}><Text style={styles.infoTitle}>CALABARZON marker view</Text><Text style={styles.infoText}>{terminals.length} terminals listed</Text></View></View>
      {query.isLoading ? <LoadingState /> : query.isError ? <ErrorState message="We could not load terminals." onRetry={() => query.refetch()} /> : terminals.length === 0 ? <EmptyState title="No matching terminals" body="Try a different city or province." /> : <View style={{ gap: 10 }}>{terminals.map((terminal) => <TerminalCard key={terminal.id} terminal={terminal} />)}</View>}
    </Screen>
  );
}