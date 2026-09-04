import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useLogout } from '@workspace/api-client-react';
import { EmptyState, PrimaryButton, Screen, mapStyles } from '@/components/transit-native';
import { useAuth } from '@/context/auth';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const styles = mapStyles(colors);
  const { user, clearSession } = useAuth();
  const logout = useLogout({ request: { credentials: 'include' } });
  if (!user) return <Screen eyebrow="Account" title="Your commuter profile."><EmptyState title="Sign in to view your profile" body="Your saved trips and commuter details live here." action={<PrimaryButton label="Sign in" icon="log-in" onPress={() => router.push('/login')} />} /></Screen>;
  return <Screen eyebrow="Account" title="Your commuter profile."><View style={styles.profileHero}><View style={styles.avatar}><Text style={styles.avatarText}>{user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</Text></View><Text style={styles.profileName}>{user.name}</Text><Text style={styles.profileEmail}>{user.email}</Text><View style={styles.rolePill}><Text style={styles.roleText}>{user.role === 'ADMIN' ? 'Administrator' : 'Commuter'}</Text></View></View><View style={styles.infoPanel}><Text style={styles.infoTitle}>Signed in and ready to ride</Text><Text style={styles.infoText}>Keep your usual routes saved so they are close when you need them.</Text></View><PrimaryButton label={logout.isPending ? 'Signing out…' : 'Sign out'} icon="log-out" secondary disabled={logout.isPending} onPress={() => logout.mutate(undefined, { onSuccess: async () => { await clearSession(); router.replace('/'); } })} /></Screen>;
}