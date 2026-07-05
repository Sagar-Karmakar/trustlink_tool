import { Head, Link, router } from '@inertiajs/react';
import { Edit, Search, Trash2, UserPlus, Users, ShieldAlert, CheckCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { User } from '@/types';

export default function UsersIndex({ users }: { users: User[] }) {
    const [search, setSearch] = useState('');
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    const handleSuspend = (id: number) => {
        router.patch(`/users/${id}/suspend`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!deleteUser) return;
        setIsDeleting(true);
        router.delete(`/users/${deleteUser.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleteUser(null);
                setIsDeleting(false);
            }
        });
    };

    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            {/* Ambient Background Glowing Blobs - Navy, Royal, and Sky Blue */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute -bottom-16 left-1/3 w-56 sm:w-80 h-56 sm:h-80 rounded-full bg-indigo-900/15 dark:bg-indigo-900/10 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />

            <div className="relative z-10 mx-auto max-w-7xl space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 dark:from-blue-400 dark:via-blue-300 dark:to-sky-400 bg-clip-text text-transparent">
                                    User Management
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                    Manage your users, assign roles, and handle account suspension.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Link href="/users/create">
                            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 rounded-xl px-5 py-2.5 transition-all duration-300 transform active:scale-95 gap-2 border-0">
                                <UserPlus className="h-4 w-4" />
                                Add New User
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter and Table Section */}
                <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-lg overflow-hidden">
                    {/* Search and Quick Filters */}
                    <div className="p-4 sm:p-5 border-b border-zinc-200/50 dark:border-zinc-800/40 flex flex-wrap items-center justify-between gap-3">
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                            <Input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                            />
                        </div>
                        <div className="hidden sm:block text-xs text-slate-500 dark:text-zinc-400 font-medium shrink-0">
                            Showing {filteredUsers.length} of {users.length} users
                        </div>
                    </div>

                    {/* Desktop/Tablet Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full min-w-[700px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                    <th className="py-4 px-6">User</th>
                                    <th className="py-4 px-6">Role</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6">Joined Date</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40 text-sm">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-950/10 transition-colors duration-200">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white font-bold text-sm shadow-md shadow-blue-500/10 overflow-hidden">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900 dark:text-zinc-100">{user.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-zinc-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {user.role === 'admin' ? (
                                                    <Badge className="bg-blue-600/10 hover:bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-600/25 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                                                        Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-sky-500/10 hover:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/25 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                                                        User
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {user.is_suspended ? (
                                                    <Badge className="bg-rose-500/10 hover:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                                                        Suspended
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-500/10 hover:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                                                        Active
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-slate-500 dark:text-zinc-400 text-xs">
                                                {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/users/${user.id}/edit`}>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-zinc-200/60 dark:border-zinc-800/60 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/20" title="Edit User">
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="outline" size="icon" onClick={() => handleSuspend(user.id)}
                                                        className={`h-8 w-8 rounded-lg border-zinc-200/60 dark:border-zinc-800/60 ${user.is_suspended ? 'hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 hover:border-green-500/20' : 'hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/20'}`}
                                                        title={user.is_suspended ? 'Unsuspend User' : 'Suspend User'}>
                                                        {user.is_suspended ? <CheckCircle className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                                                    </Button>
                                                    <Button variant="outline" size="icon" onClick={() => setDeleteUser(user)}
                                                        className="h-8 w-8 rounded-lg border-zinc-200/60 dark:border-zinc-800/60 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/20" title="Delete User">
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
                    <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                        {filteredUsers.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 dark:text-zinc-500">
                                No users found matching your search.
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div key={user.id} className="bg-white/40 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/40 p-4 rounded-xl shadow-sm hover:shadow transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white font-bold text-sm shadow-md shadow-blue-500/10 overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">{user.name}</div>
                                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{user.email}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {user.role === 'admin' ? (
                                                <Badge className="bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-600/25 px-2 py-0 rounded-md text-[10px] font-semibold">Admin</Badge>
                                            ) : (
                                                <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/25 px-2 py-0 rounded-md text-[10px] font-semibold">User</Badge>
                                            )}
                                            {user.is_suspended ? (
                                                <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2 py-0 rounded-md text-[10px] font-semibold">Suspended</Badge>
                                            ) : (
                                                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 px-2 py-0 rounded-md text-[10px] font-semibold">Active</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/30">
                                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                                            Joined {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                        <div className="flex gap-2">
                                            <Link href={`/users/${user.id}/edit`}>
                                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 text-slate-600 dark:text-zinc-400">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button variant="outline" size="icon" onClick={() => handleSuspend(user.id)}
                                                className={`h-8 w-8 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 ${user.is_suspended ? 'text-green-600' : 'text-amber-600'}`}>
                                                {user.is_suspended ? <CheckCircle className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => setDeleteUser(user)}
                                                className="h-8 w-8 rounded-xl border-zinc-200/60 dark:border-zinc-800/60 text-rose-600 hover:text-rose-600">
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
            <Dialog open={deleteUser !== null} onOpenChange={(open) => !open && setDeleteUser(null)}>
                <DialogContent className="w-[95vw] sm:max-w-lg bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-2xl shadow-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
                            Are you sure you want to delete user <span className="font-semibold text-slate-800 dark:text-zinc-200">{deleteUser?.name}</span>? This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setDeleteUser(null)}
                            disabled={isDeleting}
                            className="w-full sm:w-auto rounded-xl border-zinc-200/60 dark:border-zinc-800/60"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-semibold shadow-lg shadow-rose-500/20 hover:shadow-rose-500/45 rounded-xl border-0"
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
