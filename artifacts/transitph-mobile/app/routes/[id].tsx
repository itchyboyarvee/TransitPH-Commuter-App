import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGetRoute } from '@workspace/api-client-react';
import { ErrorState, LoadingState, Screen, mapStyles } from '@/components/transit-native';
import { useColors } from '@/hooks/useColors';

export default function RouteDetailScreen() {
  const colors = useColors();
  const styles = mapStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = Number(id);
  const query = useGetRoute(routeId, { request: { credentials: 'include' } });
  const route = query.data;
  if (query.isLoading) return <Screen><LoadingState /></Screen>;
  if (query.isError || !route) return <Screen><ErrorState message="This route is not available right now." onRetry={() => query.refetch()} /></Screen>;
  return (
    <Screen eyebrow="Route details" title={route.destination}>
      <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }} testID="button-back-route"><Feather name="arrow-left" size={17} color={colors.mutedForeground} /><Text style={styles.mutedText}>Back to route finder</Text></Pressable>
      <View style={styles.profileHero}><Text style={styles.kickerLight}>{route.routeName}</Text><Text style={styles.loginHeading}>{route.terminalName}</Text><Text style={styles.profileEmail}>{route.city}, {route.province}</Text><View style={styles.metrics}><View style={styles.metric}><Text style={styles.metricLabel}>Fare</Text><Text style={[styles.metricValue, { color: colors.brandGold }]}>₱{route.fare.toFixed(2)}</Text></View><View style={styles.metric}><Text style={styles.metricLabel}>Ride</Text><Text style={[styles.metricValue, { color: colors.brandGold }]}>{route.estimatedTravelTime}</Text></View><View style={styles.metric}><Text style={styles.metricLabel}>Walk</Text><Text style={[styles.metricValue, { color: colors.brandGold }]}>{route.walkingDistance}</Text></View></View></View>
      <View style={styles.infoPanel}><Text style={styles.infoTitle}>Ride instructions</Text><Text style={styles.infoText}>{route.description}</Text>{route.stops.map((stop, index) => <View key={`${stop}-${index}`} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 9 }}><View style={{ width: 25, height: 25, borderRadius: 13, backgroundColor: index === 0 ? colors.brandGold : colors.brandCream, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.brandDeep, fontWeight: '800', fontSize: 11 }}>{index + 1}</Text></View><Text style={styles.infoText}>{stop}</Text></View>)}</View>
      <View style={styles.mapSurface}><View style={styles.mapGrid} /><View style={styles.mapLine} /><View style={styles.mapPinOne} /><View style={styles.mapPinTwo} /><Text style={[styles.mutedText, { position: 'absolute', left: 14, bottom: 13 }]}>Approximate route line</Text></View>
      <View style={styles.notice}><Text style={styles.noticeText}>Before you board: keep small bills ready and confirm the destination sign with the driver.</Text></View>
    </Screen>
  );
}