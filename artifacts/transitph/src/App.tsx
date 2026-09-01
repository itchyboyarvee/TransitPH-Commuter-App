import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { useGetCurrentUser } from '@workspace/api-client-react';
import { AdminPage, HomePage, LoginPage, ProfilePage, RegisterPage, RouteDetailPage, RoutesPage, SavedPage, TerminalDetailPage, TerminalsPage, WeatherPage } from '@/pages/transit-pages';

const queryClient = new QueryClient();

function Router() {
  const currentUser = useGetCurrentUser({ request: { credentials: 'include' } });
  const user = currentUser.data;
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/routes/:id">{() => <RouteDetailPage user={user} />}</Route>
        <Route path="/routes">{() => <RoutesPage user={user} />}</Route>
        <Route path="/terminals/:id">{() => <TerminalDetailPage user={user} />}</Route>
        <Route path="/terminals">{() => <TerminalsPage user={user} />}</Route>
        <Route path="/weather">{() => <WeatherPage user={user} />}</Route>
        <Route path="/saved">{() => <SavedPage user={user} />}</Route>
        <Route path="/profile">{() => <ProfilePage user={user} />}</Route>
        <Route path="/admin">{() => <AdminPage user={user} />}</Route>
        <Route path="/">{() => <HomePage user={user} />}</Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
