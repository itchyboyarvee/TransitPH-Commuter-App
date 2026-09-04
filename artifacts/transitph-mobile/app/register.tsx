import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { useRegister } from '@workspace/api-client-react';
import { Field, PrimaryButton, Screen, mapStyles } from '@/components/transit-native';
import { useAuth } from '@/context/auth';
import { useColors } from '@/hooks/useColors';

export default function RegisterScreen() {
  const colors = useColors();
  const styles = mapStyles(colors);
  const { setSession } = useAuth();
  const register = useRegister({ request: { credentials: 'include' } });
  const [form, setForm] = useState<{ name: string; email: string; password: string; confirmPassword: string }>({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState<string>('');
  const submit = () => {
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    register.mutate({ data: form }, { onSuccess: async (response) => { await setSession(response); router.replace('/'); }, onError: (err) => setError(err instanceof Error ? err.message : 'We could not create your account.') });
  };
  return <Screen><View style={styles.loginPanel}><Text style={styles.kickerLight}>Create account</Text><Text style={styles.loginHeading}>Let’s get you moving.</Text><Text style={styles.loginBody}>Save your usual routes and make every ride easier to repeat.</Text><Field label="NAME" placeholder="Full name" value={form.name} onChangeText={(name) => setForm({ ...form, name })} icon="user" /><Field label="EMAIL" placeholder="Email address" value={form.email} onChangeText={(email) => setForm({ ...form, email })} icon="mail" /><Field label="PASSWORD" placeholder="At least 8 characters" value={form.password} onChangeText={(password) => setForm({ ...form, password })} icon="lock" secureTextEntry /><Field label="CONFIRM" placeholder="Repeat password" value={form.confirmPassword} onChangeText={(confirmPassword) => setForm({ ...form, confirmPassword })} icon="check" secureTextEntry />{error ? <View style={styles.notice}><Text style={styles.noticeText}>{error}</Text></View> : null}<PrimaryButton label={register.isPending ? 'Creating…' : 'Create account'} icon="arrow-right" onPress={submit} disabled={register.isPending || !form.name || !form.email || form.password.length < 8 || form.password !== form.confirmPassword} /></View><View style={{ alignItems: 'center', gap: 9 }}><Link href="/login" asChild><Pressable testID="link-login"><Text style={styles.sectionAction}>Already have an account? Sign in</Text></Pressable></Link></View></Screen>;
}