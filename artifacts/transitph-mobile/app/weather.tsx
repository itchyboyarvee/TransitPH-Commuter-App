import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useGetWeather } from '@workspace/api-client-react';
import { ErrorState, LoadingState, PrimaryButton, Screen, WeatherCard, mapStyles } from '@/components/transit-native';
import { useColors } from '@/hooks/useColors';

export default function WeatherScreen() {
  const colors = useColors();
  const styles = mapStyles(colors);
  const [location, setLocation] = useState<string>('CALABARZON');
  const [input, setInput] = useState<string>('CALABARZON');
  const query = useGetWeather({ location }, { request: { credentials: 'include' } });
  return <Screen eyebrow="Weather desk" title="Read the sky before you ride."><Text style={styles.heroBody}>Rain can change a short jeepney trip. Check local conditions first.</Text><View style={styles.lightField}><Feather name="search" size={16} color={colors.mutedForeground} /><TextInput value={input} onChangeText={setInput} placeholder="Enter a city or province" placeholderTextColor={colors.mutedForeground} onSubmitEditing={() => { if (input.trim()) setLocation(input.trim()); }} style={[styles.lightFieldInput, { flex: 1 }]} returnKeyType="search" testID="input-weather-location" /></View><PrimaryButton label="Check weather" icon="cloud-rain" onPress={() => { if (input.trim()) setLocation(input.trim()); }} />{query.isLoading ? <LoadingState /> : query.isError ? <ErrorState message="Weather is temporarily unavailable." onRetry={() => query.refetch()} /> : <WeatherCard weather={query.data} />}</Screen>;
}