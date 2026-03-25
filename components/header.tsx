"use client";

import {Link} from "@/i18n/navigation";
import { useSelector, useDispatch } from "react-redux";
import {logout, selectUser} from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, User, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from "@/components/language-switcher";

export function Header() {
    const user = useSelector(selectUser);
    const dispatch = useDispatch();
    const t = useTranslations('header');

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">

                {/* LOGO */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <Briefcase className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold">khdimti.com</span>
                </Link>

                {/* DESKTOP MENU */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/search" className="nav-link">{t('jobs')}</Link>
                    <Link href="/employers" className="nav-link">{t('companies')}</Link>
                    <Link href="/about" className="nav-link">{t('about')}</Link>
                </nav>

                {/* DESKTOP ACTIONS */}
                <div className="hidden md:flex items-center gap-3">
                    <LanguageSwitcher />
                    {!user ? (
                        <>
                            <Button variant="ghost" asChild><Link href="/login">{t('login')}</Link></Button>
                            <Button asChild><Link href="/employers/post-job">{t('postJob')}</Link></Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href={user.role === 'EMPLOYER' ?'/employers/dashboard' : '/profile'} className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {user.name ?? t('myProfile')}
                            </Link>
                            <Button variant="destructive" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* MOBILE DRAWER */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent className="p-6 flex flex-col gap-6" side="right">

                        {/* MENU LINKS */}
                        <nav className="flex flex-col gap-4 text-lg">
                            <SheetClose asChild><Link href="/jobs">{t('jobs')}</Link></SheetClose>
                            <SheetClose asChild><Link href="/companies">{t('companies')}</Link></SheetClose>
                            <SheetClose asChild><Link href="/about">{t('about')}</Link></SheetClose>
                        </nav>

                        <div className="mt-4 border-t pt-4 flex flex-col gap-4">
                            <LanguageSwitcher />
                            {!user ? (
                                <>
                                    <SheetClose asChild>
                                        <Button variant="outline" asChild>
                                            <Link href="/login">{t('mobileLogin')}</Link>
                                        </Button>
                                    </SheetClose>

                                    <SheetClose asChild>
                                        <Button asChild>
                                            <Link href="/employers/post-job">{t('postJob')}</Link>
                                        </Button>
                                    </SheetClose>
                                </>
                            ) : (
                                <>
                                    <SheetClose asChild>
                                        <Link href={user.role === 'EMPLOYER' ?'/employers/dashboard' : '/profile'} className="flex items-center gap-2 text-lg">
                                            <User className="h-5 w-5" />
                                            {user.name ?? t('myProfile')}
                                        </Link>
                                    </SheetClose>

                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            handleLogout();
                                        }}
                                    >
                                        <LogOut className="h-5 w-5 mr-2" /> {t('logout')}
                                    </Button>
                                </>
                            )}
                        </div>

                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
