import { Link, useLocation } from 'wouter';
import { MapPin, Search, CloudRain, Navigation, Bookmark, BookmarkCheck, Clock3, ChevronRight, Menu, X, AlertTriangle, ArrowUpRight, BusFront, LogOut, UserRound, ShieldCheck, RefreshCw, LocateFixed, CircleHelp } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { Route as TransitRoute, Terminal, Weather, User } from '@workspace/api-client-react';

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-3 no-underline" data-testid="link-home-logo">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8bf32] text-[#17383d] shadow-[3px_3px_0_#17383d]">
      <BusFront size={22} strokeWidth={2.6} />
    </span>
    {!compact && <span className="display-font text-[20px] font-extrabold tracking-tight text-[#f8f5ed]">Transit<span className="text-[#e8bf32]">PH</span></span>}
  </Link>;
}

const navItems = [
  { href: '/', label: 'Home', icon: Navigation },
  { href: '/routes', label: 'Find a route', icon: Search },
  { href: '/terminals', label: 'Terminals', icon: MapPin },
  { href: '/saved', label: 'Saved trips', icon: Bookmark },
  { href: '/weather', label: 'Weather', icon: CloudRain },
];

export function AppShell({ children, user }: { children: ReactNode; user?: User | null }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="transit-shell flex">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] flex-col bg-[#17383d] px-5 py-6 text-[#f8f5ed] md:flex">
      <Logo />
      <div className="mt-12 px-2 text-[10px] font-medium uppercase tracking-[.2em] text-[#9fb6b0]">Your commute, clear</div>
      <nav className="mt-4 flex flex-1 flex-col gap-1" aria-label="Main navigation">
        {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold transition-colors ${location === href ? 'bg-[#e8bf32] text-[#17383d]' : 'text-[#d7e4dc] hover:bg-[#275158]'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
          <Icon size={18} strokeWidth={location === href ? 2.5 : 1.8} /><span>{label}</span>
        </Link>)}
        {user?.role === 'ADMIN' && <Link href="/admin" className={`mt-5 flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-semibold ${location === '/admin' ? 'bg-[#e8bf32] text-[#17383d]' : 'text-[#d7e4dc] hover:bg-[#275158]'}`} data-testid="link-nav-admin"><ShieldCheck size={18} /><span>Admin desk</span></Link>}
      </nav>
      <div className="border-t border-[#31585d] pt-5">
        {user ? <Link href="/profile" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#275158]" data-testid="link-profile-sidebar">
          <Avatar name={user.name} /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{user.name}</span><span className="block truncate text-xs text-[#9fb6b0]">{user.email}</span></span>
        </Link> : <Link href="/login" className="flex items-center justify-center gap-2 rounded-xl bg-[#e8bf32] px-3 py-3 text-sm font-bold text-[#17383d]" data-testid="link-sign-in-sidebar"><UserRound size={17} /> Sign in</Link>}
      </div>
    </aside>
    {menuOpen && <div className="fixed inset-0 z-50 bg-[#17383d] p-5 md:hidden">
      <div className="flex items-center justify-between"><Logo /><button onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-[#f8f5ed]" aria-label="Close menu" data-testid="button-close-menu"><X /></button></div>
      <nav className="mt-12 flex flex-col gap-2">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="flex items-center gap-4 rounded-xl px-4 py-4 text-lg font-semibold text-[#f8f5ed]" data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={21} />{label}</Link>)}</nav>
    </div>}
    <main className="min-h-[100dvh] w-full md:ml-[244px]">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#ded9c9] bg-[#f8f5ed]/95 px-5 backdrop-blur md:px-10">
        <button className="rounded-lg p-2 text-[#17383d] md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" data-testid="button-open-menu"><Menu size={22} /></button>
        <div className="hidden items-center gap-2 text-xs font-medium text-[#6d8580] md:flex"><span className="h-2 w-2 rounded-full bg-[#3c8b78]" /> CALABARZON commuter network</div>
        <div className="ml-auto flex items-center gap-3">
          {user && <span className="hidden text-xs font-semibold text-[#6d8580] sm:inline">Signed in for faster route planning</span>}
          {user ? <Link href="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-[#275158] text-sm font-bold text-[#f8f5ed]" data-testid="link-profile-header">{user.name.slice(0, 1).toUpperCase()}</Link> : <Link href="/login" className="rounded-lg border border-[#17383d] px-3 py-2 text-xs font-bold text-[#17383d]" data-testid="link-sign-in-header">Sign in</Link>}
        </div>
      </header>
      {children}
      <div className="h-20 md:hidden" />
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[68px] items-center justify-around border-t border-[#ded9c9] bg-[#f8f5ed]/95 px-1 backdrop-blur md:hidden" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => <Link href={href} key={href} className={`flex w-1/4 flex-col items-center gap-1 py-2 text-[10px] font-semibold ${location === href ? 'text-[#b18410]' : 'text-[#6d8580]'}`} data-testid={`link-bottom-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={19} />{label === 'Find a route' ? 'Routes' : label.split(' ')[0]}</Link>)}
      </nav>
    </main>
  </div>;
}

export function Avatar({ name }: { name: string }) {
  return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8bf32] text-sm font-extrabold text-[#17383d]" data-testid="img-avatar">{name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>;
}

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
    <div><div className="mono-font mb-2 text-[11px] font-medium uppercase tracking-[.16em] text-[#b18410]">{eyebrow}</div><h1 className="display-font max-w-2xl text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[.98] text-[#17383d]" data-testid="text-page-title">{title}</h1>{description && <p className="mt-3 max-w-xl text-[15px] leading-6 text-[#6d8580]">{description}</p>}</div>
    {action}
  </div>;
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="mb-4 flex items-center justify-between"><h2 className="display-font text-lg font-bold text-[#17383d]">{children}</h2>{action}</div>;
}

export function LoadingRows({ count = 3 }: { count?: number }) {
  return <div className="space-y-3" aria-label="Loading"><div className="h-3 w-24 animate-pulse rounded bg-[#ded9c9]" />{Array.from({ length: count }).map((_, i) => <div key={i} className="h-[86px] animate-pulse rounded-2xl bg-[#ece8dc]" />)}</div>;
}

export function QueryMessage({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  return <div className="rounded-2xl border border-[#e7b1a5] bg-[#fff1ed] p-6 text-[#93412c]" data-testid="status-error"><div className="flex items-start gap-3"><AlertTriangle size={20} className="mt-0.5 shrink-0" /><div><p className="font-bold">We could not load that just now.</p><p className="mt-1 text-sm opacity-80">{error instanceof Error ? error.message : 'Check your connection and try again.'}</p>{onRetry && <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#93412c] px-3 py-2 text-xs font-bold text-white" data-testid="button-retry"><RefreshCw size={14} /> Try again</button>}</div></div></div>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-[#c9c5b8] bg-[#fbf9f3] px-6 py-12 text-center" data-testid="status-empty"><CircleHelp className="mx-auto text-[#b18410]" size={28} /><h3 className="mt-3 font-bold text-[#17383d]">{title}</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#6d8580]">{body}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export function SearchPanel({ initialFrom = '', initialTo = '', compact = false, onSearch }: { initialFrom?: string; initialTo?: string; compact?: boolean; onSearch?: (from: string, to: string) => void }) {
  const [, setLocation] = useLocation();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const submit = (e: FormEvent) => { e.preventDefault(); if (from.trim() && to.trim()) { onSearch?.(from.trim(), to.trim()); setLocation(`/routes?from=${encodeURIComponent(from.trim())}&to=${encodeURIComponent(to.trim())}`); } };
  return <form onSubmit={submit} className={`relative z-10 ${compact ? '' : 'rounded-2xl bg-[#17383d] p-4 shadow-[8px_8px_0_#d8bd52] sm:p-5'}`} data-testid="form-route-search">
    {!compact && <div className="mb-4 flex items-center justify-between text-[#f8f5ed]"><span className="font-bold">Where are you headed?</span><span className="mono-font text-[10px] uppercase tracking-[.15em] text-[#9fb6b0]">step 01 / 01</span></div>}
    <div className={compact ? 'grid gap-3 sm:grid-cols-[1fr_1fr_auto]' : 'grid gap-3 sm:grid-cols-[1fr_1fr_auto]'}>
      <label className="flex items-center gap-3 rounded-xl bg-[#f8f5ed] px-3 py-2.5"><MapPin size={17} className="text-[#ec633c]" /><span className="flex-1"><span className="block text-[10px] font-bold uppercase tracking-wide text-[#6d8580]">From</span><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. Dasmariñas" className="w-full bg-transparent text-sm font-semibold text-[#17383d] outline-none placeholder:text-[#9aaca7]" data-testid="input-route-from" /></span></label>
      <label className="flex items-center gap-3 rounded-xl bg-[#f8f5ed] px-3 py-2.5"><Navigation size={17} className="text-[#3c8b78]" /><span className="flex-1"><span className="block text-[10px] font-bold uppercase tracking-wide text-[#6d8580]">To</span><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. Nuvali" className="w-full bg-transparent text-sm font-semibold text-[#17383d] outline-none placeholder:text-[#9aaca7]" data-testid="input-route-to" /></span></label>
      <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-[#e8bf32] px-5 py-3 text-sm font-extrabold text-[#17383d] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50" disabled={!from.trim() || !to.trim()} data-testid="button-search-routes"><Search size={17} /> Find route</button>
    </div>
  </form>;
}

export function WeatherCard({ weather, compact = false }: { weather?: Weather; compact?: boolean }) {
  if (!weather) return <div className="h-[152px] animate-pulse rounded-2xl bg-[#ece8dc]" />;
  return <div className={`overflow-hidden rounded-2xl ${compact ? 'border border-[#ded9c9] bg-[#fbf9f3]' : 'bg-[#275158] text-[#f8f5ed]'}`} data-testid="card-weather">
    <div className="flex items-start justify-between p-5"><div><div className={`mono-font text-[10px] uppercase tracking-[.16em] ${compact ? 'text-[#b18410]' : 'text-[#e8bf32]'}`}>Weather check</div><div className="mt-2 flex items-end gap-2"><span className="display-font text-5xl font-extrabold leading-none">{Math.round(weather.temperature)}°</span><span className={`mb-1 text-sm ${compact ? 'text-[#6d8580]' : 'text-[#c4d4cd]'}`}>{weather.condition}</span></div><p className={`mt-2 text-xs ${compact ? 'text-[#6d8580]' : 'text-[#c4d4cd]'}`} data-testid="text-weather-location">{weather.location}</p></div><span className="grid h-11 w-11 place-items-center rounded-full bg-[#e8bf32] text-[#17383d]"><CloudRain size={23} /></span></div>
    <div className={`flex items-center justify-between border-t px-5 py-3 text-xs ${compact ? 'border-[#ded9c9] text-[#6d8580]' : 'border-[#467077] text-[#c4d4cd]'}`}><span>Rain chance <b className={compact ? 'text-[#17383d]' : 'text-[#f8f5ed]'}>{weather.chanceOfRain}%</b></span><span className="font-semibold">{weather.rainfallStatus}</span></div>
  </div>;
}

export function TerminalCard({ terminal }: { terminal: Terminal }) {
  return <Link href={`/terminals/${terminal.id}`} className="group block rounded-2xl border border-[#ded9c9] bg-[#fbf9f3] p-5 transition-transform hover:-translate-y-1" data-testid={`card-terminal-${terminal.id}`}>
    <div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#dbe9df] text-[#275158]"><MapPin size={19} /></span><ArrowUpRight size={18} className="text-[#9aaca7] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
    <h3 className="mt-4 font-bold text-[#17383d]">{terminal.name}</h3><p className="mt-1 text-xs text-[#6d8580]">{terminal.city}, {terminal.province}</p>
    <div className="mt-5 flex items-center justify-between border-t border-[#ebe6da] pt-3 text-xs text-[#6d8580]"><span>{terminal.routes?.length ?? 0} routes</span><span className="font-semibold text-[#3c8b78]">Open details</span></div>
  </Link>;
}

export function RouteCard({ route, from, to, saved, onSave, onRemove }: { route: TransitRoute; from?: string; to?: string; saved?: boolean; onSave?: () => void; onRemove?: () => void }) {
  return <div className="rounded-2xl border border-[#ded9c9] bg-[#fbf9f3] p-5" data-testid={`card-route-${route.id}`}>
    <div className="flex items-start justify-between gap-3"><div><div className="mono-font text-[10px] uppercase tracking-[.14em] text-[#b18410]">{route.routeName}</div><Link href={`/routes/${route.id}`} className="mt-1 block text-lg font-bold text-[#17383d] hover:text-[#b18410]">{route.destination}</Link><p className="mt-1 text-xs text-[#6d8580]">{route.terminalName} · {route.city}</p></div><button onClick={saved ? onRemove : onSave} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${saved ? 'border-[#e8bf32] bg-[#e8bf32] text-[#17383d]' : 'border-[#ded9c9] text-[#6d8580] hover:border-[#b18410]'}`} aria-label={saved ? 'Remove saved route' : 'Save route'} data-testid={`${saved ? 'button-remove' : 'button-save'}-route-${route.id}`}>{saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}</button></div>
    <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#ebe6da] py-3"><Metric label="Fare" value={`₱${route.fare.toFixed(2)}`} /><Metric label="Ride" value={route.estimatedTravelTime} /><Metric label="Walk" value={route.walkingDistance} /></div>
    <div className="mt-4 flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-semibold text-[#6d8580]"><Clock3 size={14} /> {route.transfers === 0 ? 'Direct ride' : `${route.transfers} transfer${route.transfers > 1 ? 's' : ''}`}</span><Link href={`/routes/${route.id}${from ? `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to ?? '')}` : ''}`} className="flex items-center gap-1 text-xs font-bold text-[#3c8b78]" data-testid={`link-route-details-${route.id}`}>View route <ChevronRight size={14} /></Link></div>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><div className="text-[10px] font-bold uppercase tracking-wide text-[#9aaca7]">{label}</div><div className="mt-1 text-sm font-bold text-[#17383d]">{value}</div></div>;
}