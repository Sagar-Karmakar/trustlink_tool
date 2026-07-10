import { Link, router } from '@inertiajs/react';
import {
    Edit,
    Search,
    Trash2,
    UserPlus,
    Users,
    ShieldAlert,
    CheckCircle,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { User } from '@/types';

export default function UsersIndex({ users }: { users: User[] }) {
    const [search, setSearch] = useState('');
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredUsers = useMemo(() => {
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()),
        );
    }, [users, search]);

    const handleSuspend = (id: number) => {
        router.patch(
            `/users/${id}/suspend`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleDelete = () => {
        if (!deleteUser) {
return;
}

        setIsDeleting(true);
        router.delete(`/users/${deleteUser.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteUser(null);
                setIsDeleting(false);
            },
        });
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-slate-900 sm:p-6 dark:text-zinc-100">
            {/* Ambient Background Glowing Blobs - Navy, Royal, and Sky Blue */}
            <div
                className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 animate-pulse rounded-full bg-blue-600/15 blur-3xl sm:h-96 sm:w-96 dark:bg-blue-600/10"
                style={{ animationDuration: '8s' }}
            />
            <div
                className="pointer-events-none absolute top-1/2 -right-16 h-64 w-64 animate-pulse rounded-full bg-sky-500/15 blur-3xl sm:h-96 sm:w-96 dark:bg-sky-500/10"
                style={{ animationDuration: '6s' }}
            />
            <div
                className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 animate-pulse rounded-full bg-indigo-900/15 blur-3xl sm:h-80 sm:w-80 dark:bg-indigo-900/10"
                style={{ animationDuration: '10s' }}
            />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-600/10 p-2.5 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:via-blue-300 dark:to-sky-400">
                                    User Management
                                </h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                                    Manage your users, assign roles, and handle
                                    account suspension.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Link href="/users/create">
                            <Button className="w-full transform gap-2 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-500 hover:to-sky-400 hover:shadow-blue-500/40 active:scale-95 sm:w-auto">
                                <UserPlus className="h-4 w-4" />
                                Add New User
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter and Table Section */}
                <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/45 shadow-lg backdrop-blur-xl dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    {/* Search and Quick Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/50 p-4 sm:p-5 dark:border-zinc-800/40">
                        <div className="relative min-w-0 flex-1">
                            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                            <Input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="rounded-xl border border-zinc-200/50 bg-white/30 pl-10 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                            />
                        </div>
                        <div className="hidden shrink-0 text-xs font-medium text-slate-500 sm:block dark:text-zinc-400">
                            Showing {filteredUsers.length} of {users.length}{' '}
                            users
                        </div>
                    </div>

                    {/* Desktop/Tablet Table View */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[700px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-zinc-200/50 bg-zinc-50/50 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:border-zinc-800/40 dark:bg-zinc-900/30 dark:text-zinc-400">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/50 text-sm dark:divide-zinc-800/40">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-12 text-center text-slate-400 dark:text-zinc-500"
                                        >
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition-colors duration-200 hover:bg-blue-50/20 dark:hover:bg-blue-950/10"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white shadow-md shadow-blue-500/10">
                                                        {user.avatar ? (
                                                            <img
                                                                src={
                                                                    user.avatar
                                                                }
                                                                alt={user.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            user.name
                                                                .split(' ')
                                                                .map(
                                                                    (n) => n[0],
                                                                )
                                                                .join('')
                                                                .toUpperCase()
                                                                .slice(0, 2)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 dark:text-zinc-100">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-zinc-400">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.role === 'admin' ? (
                                                    <Badge className="rounded-lg border border-blue-600/25 bg-blue-600/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 hover:bg-blue-600/10 dark:text-blue-400">
                                                        Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge className="rounded-lg border border-sky-500/25 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-700 hover:bg-sky-500/10 dark:text-sky-400">
                                                        User
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.is_suspended ? (
                                                    <Badge className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-700 hover:bg-rose-500/10 dark:text-rose-400">
                                                        Suspended
                                                    </Badge>
                                                ) : (
                                                    <Badge className="rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-700 hover:bg-green-500/10 dark:text-green-400">
                                                        Active
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 dark:text-zinc-400">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    },
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/users/${user.id}/edit`}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-lg border-zinc-200/60 hover:border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-600 dark:border-zinc-800/60 dark:hover:text-blue-400"
                                                            title="Edit User"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleSuspend(
                                                                user.id,
                                                            )
                                                        }
                                                        className={`h-8 w-8 rounded-lg border-zinc-200/60 dark:border-zinc-800/60 ${user.is_suspended ? 'hover:border-green-500/20 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400' : 'hover:border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400'}`}
                                                        title={
                                                            user.is_suspended
                                                                ? 'Unsuspend User'
                                                                : 'Suspend User'
                                                        }
                                                    >
                                                        {user.is_suspended ? (
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <ShieldAlert className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            setDeleteUser(user)
                                                        }
                                                        className="h-8 w-8 rounded-lg border-zinc-200/60 hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-600 dark:border-zinc-800/60 dark:hover:text-rose-400"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                        {filteredUsers.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 dark:text-zinc-500">
                                No users found matching your search.
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="rounded-xl border border-zinc-200/50 bg-white/40 p-4 shadow-sm transition-all duration-300 hover:shadow dark:border-zinc-800/40 dark:bg-zinc-900/40"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white shadow-md shadow-blue-500/10">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                user.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                                {user.name}
                                            </div>
                                            <div className="truncate text-[10px] text-slate-500 dark:text-zinc-400">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                            {user.role === 'admin' ? (
                                                <Badge className="rounded-md border border-blue-600/25 bg-blue-600/10 px-2 py-0 text-[10px] font-semibold text-blue-700 dark:text-blue-400">
                                                    Admin
                                                </Badge>
                                            ) : (
                                                <Badge className="rounded-md border border-sky-500/25 bg-sky-500/10 px-2 py-0 text-[10px] font-semibold text-sky-700 dark:text-sky-400">
                                                    User
                                                </Badge>
                                            )}
                                            {user.is_suspended ? (
                                                <Badge className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0 text-[10px] font-semibold text-rose-700 dark:text-rose-400">
                                                    Suspended
                                                </Badge>
                                            ) : (
                                                <Badge className="rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0 text-[10px] font-semibold text-green-700 dark:text-green-400">
                                                    Active
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-200/50 pt-3 dark:border-zinc-800/30">
                                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                            Joined{' '}
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString()}
                                        </span>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/users/${user.id}/edit`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-xl border-zinc-200/60 text-slate-600 dark:border-zinc-800/60 dark:text-zinc-400"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    handleSuspend(user.id)
                                                }
                                                className={`h-8 w-8 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 ${user.is_suspended ? 'text-green-600' : 'text-amber-600'}`}
                                            >
                                                {user.is_suspended ? (
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                ) : (
                                                    <ShieldAlert className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleteUser(user)
                                                }
                                                className="h-8 w-8 rounded-xl border-zinc-200/60 text-rose-600 hover:text-rose-600 dark:border-zinc-800/60"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Glassmorphic Delete Confirmation Dialog */}
            <Dialog
                open={deleteUser !== null}
                onOpenChange={(open) => !open && setDeleteUser(null)}
            >
                <DialogContent className="w-[95vw] rounded-2xl border border-white/20 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:max-w-lg dark:border-zinc-800/40 dark:bg-zinc-950/90">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-zinc-100">
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                            Are you sure you want to delete user{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                {deleteUser?.name}
                            </span>
                            ? This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteUser(null)}
                            disabled={isDeleting}
                            className="w-full rounded-xl border-zinc-200/60 sm:w-auto dark:border-zinc-800/60"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full rounded-xl border-0 bg-gradient-to-r from-rose-600 to-red-500 font-semibold text-white shadow-lg shadow-rose-500/20 hover:from-rose-500 hover:to-red-400 hover:shadow-rose-500/45 sm:w-auto"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'User Management',
            href: '/users',
        },
    ],
};
