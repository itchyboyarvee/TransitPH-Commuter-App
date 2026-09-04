import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useGetTerminal } from '@workspace/api-client-react';
import { ErrorState, LoadingState, RouteCard, Screen, mapStyles } from '@/components/transit-native';
import { useColors } from '@/hooks/useColors';

export default function TerminalDetailScreen() {
  const colors = useColors();
  const styles = mapStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const terminalId = Number(id);
  const query = useGetTerminal(terminalId, { request: { credentials: 'include' } });
  const terminal = query.data;
  if (query.isLoading) return <Screen><LoadingState /></Screen>;
  if (query.isError || !terminal) return <Screen><ErrorState message="This terminal is not available right now." onRetry={() => query.refetch()} /></Screen>;
  return (
    <Screen eyebrow="Terminal details" title={terminal.name}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }} testID="button-back-terminal"><Feather name="arrow-left" size={17} color={colors.mutedForeground} /><Text style={styles.mutedText}>Back to terminals</Text></Pressable>
      <View style={styles.infoPanel}><Ionicons name="location-outline" size={22} color={colors.brandCoral} /><Text style={styles.infoTitle}>{terminal.city}, {terminal.province}</Text><Text style={styles.infoText}>{terminal.description}</Text><View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 4 }}><Text style={styles.mutedText}>Operating hours</Text><Text style={styles.infoTitle}>{terminal.operatingHours}</Text></View></View>
      <View style={styles.mapSurface}><View style={styles.mapGrid} /><View style={styles.mapLine} /><View style={styles.mapPinOne} /><View style={styles.mapPinTwo} /><Text style={[styles.mutedText, { position: 'absolute', left: 14, bottom: 13 }]}>Terminal area · {terminal.latitude.toFixed(4)}, {terminal.longitude.toFixed(4)}</Text></View>
      <View><Text style={styles.sectionTitle}>{terminal.routes?.length ?? 0} routes from this terminal</Text><View style={{ gap: 10, marginTop: 12 }}>{terminal.routes?.map((route) => <RouteCard key={route.id} route={route} onPress={() => router.push({ pathname: '/routes/[id]', params: { id: String(route.id) } })} />)}</View></View>
    </Screen>
  );
}