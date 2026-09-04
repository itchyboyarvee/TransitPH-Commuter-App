import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Link, router } from 'expo-router';
import type { Route, SearchResult, Terminal, Weather } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export const sessionRequest = { credentials: 'include' as const };

function useTransitStyles() {
  const colors = useColors();
  return { colors, styles: makeStyles(colors) };
}

export function Screen({ title, eyebrow, children, refreshing = false, onRefresh }: { title?: string; eyebrow?: string; children: ReactNode; refreshing?: boolean; onRefresh?: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors, styles } = useTransitStyles();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Link href="/" asChild>
          <Pressable testID="button-logo" style={styles.logoButton}>
            <View style={styles.logoMark}><Text style={styles.logoMarkText}>TP</Text></View>
            <Text style={styles.logoText}>Transit<Text style={styles.logoAccent}>PH</Text></Text>
          </Pressable>
        </Link>
        <Pressable onPress={() => router.push('/profile')} style={styles.iconButton} accessibilityLabel="Open profile" testID="button-profile">
          <Feather name="user" size={19} color={colors.brandDeep} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandTeal} /> : undefined}
        keyboardShouldPersistTaps="handled"
      >
        {(eyebrow || title) && <View style={styles.headingBlock}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}{title && <Text style={styles.title}>{title}</Text>}</View>}
        {children}
      </ScrollView>
    </View>
  );
}

export function SearchPanel({ initialFrom = '', initialTo = '' }: { initialFrom?: string; initialTo?: string }) {
  const { colors, styles } = useTransitStyles();
  const [from, setFrom] = useState<string>(initialFrom);
  const [to, setTo] = useState<string>(initialTo);
  const submit = () => {
    if (!from.trim() || !to.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/routes', params: { from: from.trim(), to: to.trim() } });
  };
  return (
    <View style={styles.searchPanel}>
      <View style={styles.searchHeader}><Text style={styles.searchTitle}>Where are you headed?</Text><Text style={styles.stepText}>STEP 01 / 01</Text></View>
      <Field label="FROM" placeholder="e.g. Dasmariñas" value={from} onChangeText={setFrom} icon="location-outline" />
      <Field label="TO" placeholder="e.g. Nuvali" value={to} onChangeText={setTo} icon="navigate-outline" />
      <PrimaryButton label="Find route" icon="search" onPress={submit} disabled={!from.trim() || !to.trim()} />
      <Text style={styles.searchHint}>Search by barangay, landmark, terminal, or city.</Text>
    </View>
  );
}

export function Field({ label, placeholder, value, onChangeText, icon = 'edit-3', secureTextEntry = false }: { label: string; placeholder: string; value: string; onChangeText: (value: string) => void; icon?: keyof typeof Ionicons.glyphMap | keyof typeof Feather.glyphMap; secureTextEntry?: boolean }) {
  const { colors, styles } = useTransitStyles();
  const isIonicon = icon === 'location-outline' || icon === 'navigate-outline';
  return (
    <View style={styles.fieldWrap}>
      {isIonicon ? <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.brandCoral} /> : <Feather name={icon as keyof typeof Feather.glyphMap} size={16} color={colors.mutedForeground} />}
      <View style={styles.fieldTextWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} secureTextEntry={secureTextEntry} autoCapitalize="none" style={styles.fieldInput} testID={`input-${label.toLowerCase()}`} /></View>
    </View>
  );
}

export function PrimaryButton({ label, onPress, icon = 'arrow-right', disabled = false, secondary = false }: { label: string; onPress: () => void; icon?: keyof typeof Feather.glyphMap; disabled?: boolean; secondary?: boolean }) {
  const { colors, styles } = useTransitStyles();
  return (
    <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }} disabled={disabled} style={({ pressed }) => [secondary ? styles.secondaryButton : styles.primaryButton, pressed && styles.pressed, disabled && styles.disabled]} testID={`button-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <Text style={secondary ? styles.secondaryButtonText : styles.primaryButtonText}>{label}</Text>
      <Feather name={icon} size={17} color={secondary ? colors.brandDeep : colors.brandCream} />
    </Pressable>
  );
}

export function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  const { colors, styles } = useTransitStyles();
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action && <Pressable onPress={onPress} hitSlop={8}><Text style={styles.sectionAction}>{action} <Text style={{ color: colors.brandGold }}>›</Text></Text></Pressable>}</View>;
}

export function RouteCard({ route, from, to, onPress, saved = false, onSave }: { route: Route | SearchResult; from?: string; to?: string; onPress?: () => void; saved?: boolean; onSave?: () => void }) {
  const { colors, styles } = useTransitStyles();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]} testID={`card-route-${route.id}`}>
      <View style={styles.cardTop}><View style={styles.routeBadge}><Feather name="navigation" size={13} color={colors.brandDeep} /></View><View style={styles.cardMeta}><Text style={styles.kicker}>{route.routeName}</Text><Text style={styles.cardTitle}>To {route.destination}</Text><Text style={styles.mutedText}>{route.terminalName} · {route.city}</Text></View>{onSave && <Pressable onPress={onSave} hitSlop={10} style={styles.saveButton} accessibilityLabel={saved ? 'Remove saved route' : 'Save route'}><Feather name="bookmark" size={19} color={saved ? colors.brandGold : colors.brandTeal} fill={saved ? colors.brandGold : 'transparent'} /></Pressable>}</View>
      <View style={styles.metrics}><Metric label="Fare" value={`₱${route.fare.toFixed(2)}`} /><Metric label="Ride" value={route.estimatedTravelTime} /><Metric label="Walk" value={route.walkingDistance} /></View>
      {from && to && <Text style={styles.tripLine}>{from} <Text style={styles.arrowText}>→</Text> {to}</Text>}
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { styles } = useTransitStyles();
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

export function TerminalCard({ terminal, onPress }: { terminal: Terminal; onPress?: () => void }) {
  const { colors, styles } = useTransitStyles();
  return <Pressable onPress={onPress ?? (() => router.push({ pathname: '/terminals/[id]', params: { id: String(terminal.id) } }))} style={({ pressed }) => [styles.card, pressed && styles.pressed]} testID={`card-terminal-${terminal.id}`}><View style={styles.cardTop}><View style={[styles.routeBadge, { backgroundColor: colors.brandSage }]}><Ionicons name="location-outline" size={16} color={colors.brandCoral} /></View><View style={styles.cardMeta}><Text style={styles.cardTitle}>{terminal.name}</Text><Text style={styles.mutedText}>{terminal.city}, {terminal.province}</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></View><View style={styles.terminalFoot}><Text style={styles.mutedText}>{terminal.operatingHours}</Text><Text style={styles.terminalRoutes}>{terminal.routes?.length ?? 0} routes</Text></View></Pressable>;
}

export function WeatherCard({ weather }: { weather?: Weather }) {
  const { colors, styles } = useTransitStyles();
  if (!weather) return <LoadingState />;
  return <View style={styles.weatherCard}><View style={styles.weatherHeader}><Text style={styles.kickerLight}>{weather.location}</Text><Ionicons name="rainy-outline" size={23} color={colors.brandGold} /></View><View style={styles.weatherRow}><Text style={styles.temperature}>{Math.round(weather.temperature)}°</Text><View><Text style={styles.weatherCondition}>{weather.condition}</Text><Text style={styles.weatherUpdated}>{weather.updatedAt}</Text></View></View><View style={styles.rainBar}><View style={[styles.rainFill, { width: `${Math.min(100, weather.chanceOfRain)}%` }]} /></View><Text style={styles.weatherNote}>{weather.warning || weather.rainfallStatus}</Text></View>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  const { colors, styles } = useTransitStyles();
  return <View style={styles.empty}><View style={styles.emptyIcon}><Feather name="compass" size={22} color={colors.brandTeal} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text>{action}</View>;
}

export function LoadingState() {
  const { colors, styles } = useTransitStyles();
  return <View style={styles.loading}><ActivityIndicator color={colors.brandTeal} /><Text style={styles.mutedText}>Loading local data…</Text></View>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { styles } = useTransitStyles();
  return <View style={styles.errorBox}><Text style={styles.errorText}>{message}</Text><PrimaryButton label="Try again" icon="rotate-cw" onPress={onRetry} secondary /></View>;
}

export function AuthGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: { minHeight: 66, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  logoButton: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMark: { width: 35, height: 35, borderRadius: 11, backgroundColor: colors.brandGold, alignItems: 'center', justifyContent: 'center' },
  logoMarkText: { color: colors.brandDeep, fontSize: 14, fontWeight: '800' },
  logoText: { color: colors.brandDeep, fontSize: 19, fontWeight: '800', letterSpacing: -0.7 },
  logoAccent: { color: colors.brandGold },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandSage },
  content: { paddingHorizontal: 20, paddingTop: 26, gap: 26 },
  headingBlock: { gap: 8 },
  eyebrow: { color: colors.brandGold, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
  title: { color: colors.brandDeep, fontSize: 32, lineHeight: 36, fontWeight: '800', letterSpacing: -1.2 },
  heroKicker: { color: colors.brandGold, fontSize: 11, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
  heroTitle: { color: colors.brandDeep, fontSize: 50, lineHeight: 47, fontWeight: '800', letterSpacing: -2.8 },
  heroAccent: { color: colors.brandTeal },
  heroBody: { color: colors.mutedForeground, fontSize: 15, lineHeight: 23 },
  searchPanel: { backgroundColor: colors.brandDeep, borderRadius: 20, padding: 16, gap: 11, borderRightWidth: 7, borderRightColor: colors.brandGold, borderBottomWidth: 7, borderBottomColor: colors.brandGold },
  searchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  searchTitle: { color: colors.brandCream, fontWeight: '800', fontSize: 16 },
  stepText: { color: colors.brandMist, fontSize: 9, letterSpacing: 1.3 },
  fieldWrap: { minHeight: 57, borderRadius: 16, backgroundColor: colors.brandCream, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11 },
  fieldTextWrap: { flex: 1 },
  fieldLabel: { color: colors.mutedForeground, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  fieldInput: { color: colors.brandDeep, fontSize: 14, paddingVertical: 2, minHeight: 26 },
  primaryButton: { minHeight: 48, borderRadius: 14, backgroundColor: colors.brandGold, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonText: { color: colors.brandDeep, fontSize: 14, fontWeight: '800' },
  secondaryButton: { minHeight: 44, borderRadius: 13, borderWidth: 1, borderColor: colors.brandDeep, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  secondaryButtonText: { color: colors.brandDeep, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.48 },
  searchHint: { color: colors.brandMist, textAlign: 'center', fontSize: 11, marginTop: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  sectionTitle: { color: colors.brandDeep, fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  sectionAction: { color: colors.brandTeal, fontSize: 12, fontWeight: '800' },
  card: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 15, shadowColor: colors.brandDeep, shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  routeBadge: { width: 35, height: 35, borderRadius: 12, backgroundColor: colors.brandGold, alignItems: 'center', justifyContent: 'center' },
  cardMeta: { flex: 1, gap: 3 },
  kicker: { color: colors.brandTeal, fontSize: 10, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase' },
  kickerLight: { color: colors.brandGold, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  cardTitle: { color: colors.brandDeep, fontSize: 16, fontWeight: '800' },
  mutedText: { color: colors.mutedForeground, fontSize: 12, lineHeight: 18 },
  saveButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  metrics: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 9 },
  metric: { flex: 1, gap: 3 },
  metricLabel: { color: colors.mutedForeground, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  metricValue: { color: colors.brandDeep, fontSize: 13, fontWeight: '800' },
  tripLine: { color: colors.brandInk, fontSize: 12, fontWeight: '700' },
  arrowText: { color: colors.brandCoral },
  terminalFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 11 },
  terminalRoutes: { color: colors.brandTeal, fontSize: 11, fontWeight: '800' },
  weatherCard: { backgroundColor: colors.brandInk, borderRadius: 20, padding: 19, gap: 15 },
  weatherHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weatherRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  temperature: { color: colors.brandCream, fontSize: 55, lineHeight: 58, fontWeight: '800', letterSpacing: -2 },
  weatherCondition: { color: colors.brandCream, fontSize: 15, fontWeight: '700', marginBottom: 3 },
  weatherUpdated: { color: colors.brandMist, fontSize: 10 },
  rainBar: { height: 5, borderRadius: 3, backgroundColor: colors.brandDeep, overflow: 'hidden' },
  rainFill: { height: 5, borderRadius: 3, backgroundColor: colors.brandGold },
  weatherNote: { color: colors.brandMist, fontSize: 12, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: 42, paddingHorizontal: 28, gap: 9 },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brandSage, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { color: colors.brandDeep, fontWeight: '800', fontSize: 17, textAlign: 'center' },
  emptyBody: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 8 },
  loading: { paddingVertical: 35, alignItems: 'center', gap: 10 },
  errorBox: { backgroundColor: colors.brandWarning, borderRadius: 16, padding: 15, gap: 13 },
  errorText: { color: colors.brandCoral, fontSize: 13, lineHeight: 19 },
  mapSurface: { height: 170, borderRadius: 20, backgroundColor: colors.brandSage, overflow: 'hidden', position: 'relative' },
  mapGrid: { position: 'absolute', inset: 0, opacity: 0.26, borderWidth: 1, borderColor: colors.brandTeal },
  mapPinOne: { position: 'absolute', left: '24%', top: '28%', width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brandCoral },
  mapPinTwo: { position: 'absolute', right: '24%', bottom: '25%', width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brandTeal },
  mapLine: { position: 'absolute', left: '27%', top: '46%', width: '52%', height: 3, backgroundColor: colors.brandGold, transform: [{ rotate: '18deg' }] },
  infoPanel: { backgroundColor: colors.brandSage, borderRadius: 18, padding: 17, gap: 8 },
  infoTitle: { color: colors.brandDeep, fontWeight: '800', fontSize: 16 },
  infoText: { color: colors.brandInk, fontSize: 13, lineHeight: 20 },
  loginPanel: { backgroundColor: colors.brandDeep, borderRadius: 22, padding: 20, gap: 18 },
  loginHeading: { color: colors.brandCream, fontSize: 30, lineHeight: 31, fontWeight: '800', letterSpacing: -1 },
  loginBody: { color: colors.brandMist, fontSize: 13, lineHeight: 19 },
  lightField: { backgroundColor: colors.brandCream, borderRadius: 14, paddingHorizontal: 13, minHeight: 54 },
  lightFieldInput: { color: colors.brandDeep, fontSize: 14, minHeight: 52 },
  notice: { backgroundColor: colors.brandWarning, borderRadius: 12, padding: 12 },
  noticeText: { color: colors.brandCoral, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  profileHero: { backgroundColor: colors.brandDeep, borderRadius: 22, padding: 22, gap: 11 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.brandGold, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarText: { color: colors.brandDeep, fontWeight: '800', fontSize: 19 },
  profileName: { color: colors.brandCream, fontSize: 27, fontWeight: '800' },
  profileEmail: { color: colors.brandMist, fontSize: 13 },
  rolePill: { alignSelf: 'flex-start', backgroundColor: colors.brandGold, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, marginTop: 6 },
  roleText: { color: colors.brandDeep, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
});

export function mapStyles(colors: ReturnType<typeof useColors>) {
  return makeStyles(colors);
}