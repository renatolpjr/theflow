
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Mic,
  Headphones,
  PlayCircle,
  User,
  Shield,
  Languages,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';

const getNavItems = (t: (key: string) => string, isAdmin: boolean = false) => {
  const items = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: Home },
    { name: t('nav.lessons'), href: '/lessons', icon: BookOpen },
    { name: t('nav.challenges'), href: '/challenges', icon: Trophy },
    { name: t('nav.videos'), href: '/videos', icon: PlayCircle },
    { name: t('nav.speaking'), href: '/speaking', icon: Mic },
    { name: t('nav.listening'), href: '/listening', icon: Headphones },
    { name: t('nav.progress'), href: '/progress', icon: BarChart3 },
    { name: t('nav.achievements'), href: '/achievements', icon: Trophy },
  ];
  
  if (isAdmin) {
    items.push({ name: 'Admin', href: '/admin', icon: Shield });
  }
  
  return items;
};

export function DashboardNav() {
  const { data: session } = useSession() || {};
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const navItems = getNavItems(t, isAdmin);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 h-18 bg-white border-b-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-6 py-2">
          {/* Logo with Clean Professional Design */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative w-14 h-14 rounded-full ring-2 ring-[#DC2626] group-hover:ring-[#1e3a5f] transition-all shadow-md">
              <Image
                src="/logo-new.jpeg"
                alt="The Flow English Trainer"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1e3a5f]">
                The FLOW
              </h1>
              <p className="text-xs text-slate-600 font-semibold tracking-wide">American English</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "h-10 px-4 font-medium transition-all duration-200",
                      isActive 
                        ? "bg-[#DC2626] text-white hover:bg-[#b91c1c] shadow-sm" 
                        : "text-slate-700 hover:text-[#DC2626] hover:bg-red-50"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-12 w-12 rounded-full hover:bg-slate-100 transition-all">
                <Avatar className="h-10 w-10 ring-2 ring-[#1e3a5f]">
                  <AvatarFallback className="bg-[#1e3a5f] text-white text-sm font-bold">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-slate-500">{session?.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2" />
                  {t('nav.profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
                <Languages className="w-3 h-3 inline mr-1" />
                Language / Idioma
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                {language === 'en' && <Check className="w-4 h-4 mr-2" />}
                {language !== 'en' && <span className="w-4 h-4 mr-2" />}
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('pt')} className="cursor-pointer">
                {language === 'pt' && <Check className="w-4 h-4 mr-2" />}
                {language !== 'pt' && <span className="w-4 h-4 mr-2" />}
                Português
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between w-full px-4 h-full">
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="relative w-11 h-11 rounded-full ring-2 ring-[#DC2626] group-hover:ring-[#1e3a5f] transition-all shadow-md">
              <Image
                src="/logo-new.jpeg"
                alt="The Flow English Trainer"
                fill
                className="object-cover rounded-full"
                priority
              />
            </div>
            <span className="font-bold text-[#1e3a5f] text-lg">
              The FLOW
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-slate-100 transition-all">
                  <Avatar className="h-8 w-8 ring-2 ring-[#1e3a5f]">
                    <AvatarFallback className="bg-[#1e3a5f] text-white text-xs font-bold">
                      {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-2" />
                    {t('nav.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
                  <Languages className="w-3 h-3 inline mr-1" />
                  Language / Idioma
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                  {language === 'en' && <Check className="w-4 h-4 mr-2" />}
                  {language !== 'en' && <span className="w-4 h-4 mr-2" />}
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('pt')} className="cursor-pointer">
                  {language === 'pt' && <Check className="w-4 h-4 mr-2" />}
                  {language !== 'pt' && <span className="w-4 h-4 mr-2" />}
                  Português
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b-2 border-slate-200 shadow-lg animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-3 space-y-1 max-w-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                      isActive 
                        ? "bg-[#DC2626] text-white shadow-sm" 
                        : "text-slate-700 hover:bg-red-50 hover:text-[#DC2626]"
                    )}>
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
