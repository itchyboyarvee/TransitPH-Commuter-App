import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useLogin } from '@workspace/api-client-react';
import { Field, PrimaryButton, Screen, mapStyles } from '@/components/transit-native';
import { useAuth } from '@/context/auth';
import { useColors } from '@/hooks/useColors';

export default function LoginScreen() {
  const colors = useColors();
  const styles = mapStyles(colors);
  const { setSession } = useAuth();
  const login = useLogin({ request: { credentials: 'include' } });
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const submit = () => {
    setError('');
    login.mutate({ data: { email, password } }, { onSuccess: async (response) => { await setSession(response); router.replace('/'); }, onError: (err) => setError(err instanceof Error ? err.message : 'We could not sign you in.') });
  };
  return <Screen><View style={styles.loginPanel}><Text style={styles.kickerLight}>Welcome back</Text><Text style={styles.loginHeading}>Pick up where you left off.</Text><Text style={styles.loginBody}>Sign in to see saved trips and find routes across CALABARZON.</Text><Field label="EMAIL" placeholder="Email address" value={email} onChangeText={setEmail} icon="mail" /><Field label="PASSWORD" placeholder="Password" value={password} onChangeText={setPassword} icon="lock" secureTextEntry /><>{error ? <View style={styles.notice}><Text style={styles.noticeText}>{error}</Text></View> : null}</><PrimaryButton label={login.isPending ? 'Signing in…' : 'Sign in'} icon="arrow-right" onPress={submit} disabled={login.isPending || !email || !password} /></View><View style={{ alignItems: 'center', gap: 9 }}><Text style={styles.mutedText}>Demo account: user@transitph.test</Text><Link href="/register" asChild><Pressable testID="link-register"><Text style={styles.sectionAction}>Create an account</Text></Pressable></Link><Link href="/" asChild><Pressable testID="link-login-home"><Text style={styles.mutedText}>Back to TransitPH</Text></Pressable></Link></View></Screen>;
}