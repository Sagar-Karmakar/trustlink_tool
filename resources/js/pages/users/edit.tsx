import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/types';

export default function EditUser({ user }: { user: User }) {
    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl p-4 sm:p-6 bg-slate-950/5 text-slate-900 dark:text-zinc-100">
            {/* Ambient Background Glowing Blobs - Navy, Royal, and Sky Blue */}
            <div className="absolute -top-16 -left-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -right-16 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-sky-500/15 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-2xl space-y-6">
                {/* Back Button and Heading */}
                <div className="flex items-center gap-4">
                    <Link 
                        href="/users"
                        className="p-2 rounded-xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-sky-500 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent">
                            Edit User
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Update details for {user.name}
                        </p>
                    </div>
                </div>

                {/* Glassmorphic Form Container */}
                <div className="bg-white/45 dark:bg-zinc-950/45 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-4 sm:p-6 rounded-2xl shadow-lg">
                    <Form
                        {...UserController.update.form(user)}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-slate-700 dark:text-zinc-300">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        defaultValue={user.name}
                                        placeholder="Full Name"
                                        className="bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-slate-700 dark:text-zinc-300">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        defaultValue={user.email}
                                        placeholder="email@example.com"
                                        className="bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role" className="text-slate-700 dark:text-zinc-300">Role</Label>
                                    <select
                                        id="role"
                                        name="role"
                                        required
                                        defaultValue={user.role as string}
                                        className="w-full px-3 py-2 text-sm bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-900 dark:text-zinc-100"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-slate-700 dark:text-zinc-300">New Password (Optional)</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Leave blank to keep current password"
                                        className="bg-white/30 dark:bg-zinc-900/30 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/60 rounded-xl focus-visible:ring-sky-500/50"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <Link href="/users">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            className="rounded-xl border-zinc-200/60 dark:border-zinc-800/60"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 rounded-xl border-0 px-5"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
}

EditUser.layout = {
    breadcrumbs: [
        {
            title: 'User Management',
            href: '/users',
        },
        {
            title: 'Edit User',
            href: '/users/edit',
        },
    ],
};
