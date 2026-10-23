import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { BarChart3, Bell, BookOpen, FolderKanban, Home, LayoutDashboard, LockKeyhole, LogOut, Mail, PanelLeft, RotateCcw, Tags, UserRound, UsersRound } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ACCESS_PIN, PIN_SESSION_KEY } from "@/lib/accessPin";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d’ensemble", path: "/admin" },
  { icon: BookOpen, label: "Livres", path: "/admin/livres" },
  { icon: Tags, label: "Catégories", path: "/admin/categories" },
  { icon: UserRound, label: "Auteurs", path: "/admin/auteurs" },
  { icon: UsersRound, label: "Adhérents", path: "/admin/adherents" },
  { icon: FolderKanban, label: "Emprunts", path: "/admin/emprunts" },
  { icon: RotateCcw, label: "Retours", path: "/admin/retours" },
  { icon: Bell, label: "Demandes", path: "/admin/demandes" },
  { icon: Mail, label: "Messages", path: "/admin/messages" },
  { icon: BarChart3, label: "Rapports", path: "/admin/rapports" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 272;
const MIN_WIDTH = 220;
const MAX_WIDTH = 420;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user, refresh } = useAuth();
  const [pinUnlocked, setPinUnlocked] = useState(() => typeof window !== "undefined" && sessionStorage.getItem(PIN_SESSION_KEY) === "1");
  useEffect(() => { localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString()); }, [sidebarWidth]);
  if (loading) return <DashboardLayoutSkeleton />;
  if (!pinUnlocked) return <TeamPinGate onUnlock={() => { sessionStorage.setItem(PIN_SESSION_KEY, "1"); setPinUnlocked(true); void refresh(); }} />;
  if (!user) return <div className="min-h-screen grid place-items-center bg-background"><div className="max-w-sm px-6 text-center"><div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="h-7 w-7" /></div><h1 className="font-display text-3xl">Espace équipe</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Le code PIN est accepté. Configurez un compte équipe local dans la base WAMP pour afficher le dashboard.</p></div></div>;
  return <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}><DashboardLayoutContent setSidebarWidth={setSidebarWidth}>{children}</DashboardLayoutContent></SidebarProvider>;
}

function TeamPinGate({ onUnlock }: { onUnlock: () => void }) { const [email, setEmail] = useState(""); const [pin, setPin] = useState(""); const login = trpc.auth.staffPinLogin.useMutation({ onSuccess: onUnlock }); const submit = (event: React.FormEvent) => { event.preventDefault(); login.mutate({ email, pin }); }; return <div className="min-h-screen grid place-items-center bg-background px-6"><form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-8 text-center shadow-[0_16px_45px_rgba(57,40,32,.08)]"><Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"><span aria-hidden="true">←</span> Retour à l’accueil</Link><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary"><LockKeyhole className="h-7 w-7" /></div><p className="eyebrow mt-6 text-primary">Espace équipe</p><h1 className="mt-2 font-display text-3xl">Accès sécurisé.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Identifiez-vous pour ouvrir votre espace de travail.</p><input value={email} onChange={event => { setEmail(event.target.value); login.reset(); }} type="email" autoComplete="email" placeholder="Adresse e-mail" className="mt-6 h-12 w-full rounded-xl border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" aria-label="Adresse e-mail professionnelle" required /><input value={pin} onChange={event => { setPin(event.target.value.replace(/\D/g, "").slice(0, 8)); login.reset(); }} inputMode="numeric" type="password" autoComplete="current-password" placeholder="Code PIN" className="mt-3 h-12 w-full rounded-xl border border-input bg-background px-3 text-center text-lg tracking-[.35em] outline-none focus:ring-2 focus:ring-ring" aria-label="Code PIN équipe" required />{login.error && <p className="mt-3 text-sm text-destructive">Adresse e-mail ou code PIN incorrect.</p>}<button type="submit" disabled={login.isPending} className="mt-5 h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{login.isPending ? "Vérification…" : "Ouvrir l’espace équipe"}</button></form></div>; }

type DashboardLayoutContentProps = { children: React.ReactNode; setSidebarWidth: (width: number) => void };
function DashboardLayoutContent({ children, setSidebarWidth }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const visibleMenuItems = user?.role === "librarian" ? menuItems.filter(item => item.path === "/admin/livres") : menuItems;
  const activeMenuItem = visibleMenuItems.find(item => item.path === location) ?? visibleMenuItems.find(item => location.startsWith(item.path + "/"));
  const isMobile = useIsMobile();

  useEffect(() => { if (user?.role === "librarian" && location !== "/admin/livres") setLocation("/admin/livres"); }, [location, setLocation, user?.role]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (!isResizing) return; const left = sidebarRef.current?.getBoundingClientRect().left ?? 0; const width = e.clientX - left; if (width >= MIN_WIDTH && width <= MAX_WIDTH) setSidebarWidth(width); };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) { document.addEventListener("mousemove", handleMouseMove); document.addEventListener("mouseup", handleMouseUp); document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }
    return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); document.body.style.cursor = ""; document.body.style.userSelect = ""; };
  }, [isResizing, setSidebarWidth]);

  return <>
    <div className="relative" ref={sidebarRef}>
      <Sidebar collapsible="icon" className="border-r-0 bg-sidebar" disableTransition={isResizing}>
        <SidebarHeader className="h-20 justify-center border-b border-sidebar-border/60 px-3">
          <div className="flex items-center gap-3 w-full"><button onClick={toggleSidebar} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground" aria-label="Ouvrir ou fermer le menu"><BookOpen className="h-4 w-4" /></button>{!isCollapsed && <div className="min-w-0 flex-1"><p className="font-display text-xl leading-none text-sidebar-foreground">Biblio Corner</p><p className="mt-1 text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/55">Espace équipe</p></div>}<NotificationMenu compact={isCollapsed} /></div>
        </SidebarHeader>
        <SidebarContent className="gap-0 px-2 py-5"><p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/40 group-data-[collapsible=icon]:hidden">Navigation</p><SidebarMenu><SidebarMenuItem><SidebarMenuButton onClick={() => setLocation("/")} tooltip="Retour à l’accueil" className="h-11 rounded-xl font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-primary"><Home className="h-[18px] w-[18px]" /><span>Retour à l’accueil</span></SidebarMenuButton></SidebarMenuItem>{visibleMenuItems.map(item => { const active = location === item.path || (item.path !== "/admin" && location.startsWith(item.path)); return <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={active} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-11 rounded-xl font-medium text-sidebar-foreground/70 data-[active=true]:bg-sidebar-primary/15 data-[active=true]:text-sidebar-primary"><item.icon className="h-[18px] w-[18px]" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>; })}</SidebarMenu></SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border/60 p-3"><DropdownMenu><DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:justify-center"><Avatar className="h-9 w-9 border border-sidebar-primary/30"><AvatarFallback className="bg-sidebar-primary/15 text-sidebar-primary text-xs font-bold">{user?.name?.charAt(0).toUpperCase() ?? "A"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || "Administrateur"}</p><p className="truncate text-xs text-sidebar-foreground/50">{user?.email || "Compte équipe"}</p></div></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuItem onClick={() => { sessionStorage.removeItem(PIN_SESSION_KEY); void logout(); }} className="cursor-pointer text-destructive"><LogOut className="mr-2 h-4 w-4" />Se déconnecter</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarFooter>
      </Sidebar><div className={`absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-sidebar-primary/40 ${isCollapsed ? "hidden" : ""}`} onMouseDown={() => setIsResizing(true)} />
    </div>
    <SidebarInset className="bg-[#f8f4ec]">{isMobile && <div className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur"><SidebarTrigger className="h-9 w-9 rounded-lg" /><span className="font-display text-lg">{activeMenuItem?.label ?? "Administration"}</span><span className="ml-auto"><NotificationMenu /></span></div>}<main className="min-h-screen flex-1 p-4 sm:p-6 lg:p-8">{children}</main></SidebarInset>
  </>;
}

function NotificationMenu({ compact }: { compact?: boolean }) { const query = trpc.dashboard.notifications.useQuery(undefined, { retry: false }); const markRead = trpc.dashboard.markNotificationRead.useMutation({ onSuccess: () => void query.refetch() }); const items = query.data ?? []; const unread = items.filter(item => !item.readAt).length; return <DropdownMenu><DropdownMenuTrigger asChild><button className={`relative grid h-9 w-9 place-items-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-primary ${compact ? "" : ""}`} aria-label="Notifications"><Bell className="h-4 w-4" />{unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#efb08d]" />}</button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-80 p-2">{items.length ? items.map(item => <DropdownMenuItem key={item.id} onClick={() => item.readAt || markRead.mutate({ id: item.id })} className="cursor-pointer items-start gap-3 rounded-lg p-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.readAt ? "bg-muted" : "bg-[#efb08d]"}`} /><span><strong className="block text-sm">{item.title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.message}</span></span></DropdownMenuItem>) : <p className="p-4 text-center text-sm text-muted-foreground">Aucune notification.</p>}</DropdownMenuContent></DropdownMenu>; }
