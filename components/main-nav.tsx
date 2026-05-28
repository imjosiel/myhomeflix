// Navigation component
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, Upload, LayoutDashboard, LogOut, User } from 'lucide-react';
import { canUploadVideos, isAdmin } from '@/lib/auth-utils';

export function MainNav() {
  const { data: session, status } = useSession();
  const roles = session?.user?.roles ?? [];

  const canUpload = canUploadVideos(roles);
  const isAdminUser = isAdmin(roles);

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Video className="h-6 w-6" />
            <span>StreamPlatform</span>
          </Link>

          {status === 'authenticated' && (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 inline mr-1" />
                Dashboard
              </Link>

              {canUpload && (
                <Link
                  href="/upload"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  <Upload className="h-4 w-4 inline mr-1" />
                  Upload
                </Link>
              )}

              {isAdminUser && (
                <Link
                  href="/admin"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          )}
        </div>

        <div>
          {status === 'loading' && (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          )}

          {status === 'unauthenticated' && (
            <Link href="/login">
              <Button size="sm">Entrar</Button>
            </Link>
          )}

          {status === 'authenticated' && session.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? 'User'} />
                    <AvatarFallback>{session.user.name?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {roles.join(', ')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
