import { Form, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateUser() {
    return (
        <div className="relative min-h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-slate-900 sm:p-6 dark:text-zinc-100">
            {/* Ambient Background Glowing Blobs - Navy, Royal, and Sky Blue */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl sm:h-96 sm:w-96 dark:bg-blue-600/10" />
            <div className="pointer-events-none absolute top-1/2 -right-16 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl sm:h-96 sm:w-96 dark:bg-sky-500/10" />

            <div className="relative z-10 mx-auto max-w-2xl space-y-6">
                {/* Back Button and Heading */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/users"
                        className="rounded-xl border border-white/20 bg-white/40 p-2 text-slate-700 backdrop-blur-xl transition-all duration-200 hover:text-blue-600 dark:border-zinc-800/40 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:text-blue-400"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="bg-gradient-to-r from-blue-700 to-sky-500 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-sky-400">
                            Create User
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Add a new user to the system.
                        </p>
                    </div>
                </div>

                {/* Glassmorphic Form Container */}
                <div className="rounded-2xl border border-white/20 bg-white/45 p-4 shadow-lg backdrop-blur-xl sm:p-6 dark:border-zinc-800/40 dark:bg-zinc-950/45">
                    <Form
                        {...UserController.store.form()}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="name"
                                        className="text-slate-700 dark:text-zinc-300"
                                    >
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        autoFocus
                                        placeholder="Full Name"
                                        className="rounded-xl border-zinc-200/50 bg-white/30 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-slate-700 dark:text-zinc-300"
                                    >
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="email@example.com"
                                        className="rounded-xl border-zinc-200/50 bg-white/30 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="role"
                                        className="text-slate-700 dark:text-zinc-300"
                                    >
                                        Role
                                    </Label>
                                    <select
                                        id="role"
                                        name="role"
                                        required
                                        defaultValue="user"
                                        className="w-full rounded-xl border border-zinc-200/50 bg-white/30 px-3 py-2 text-sm text-slate-900 backdrop-blur-md focus:ring-2 focus:ring-sky-500/50 focus:outline-none dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-slate-700 dark:text-zinc-300"
                                    >
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="Min 8 characters"
                                        className="rounded-xl border-zinc-200/50 bg-white/30 backdrop-blur-md focus-visible:ring-sky-500/50 dark:border-zinc-800/60 dark:bg-zinc-900/30"
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
                                        className="rounded-xl border-0 bg-gradient-to-r from-blue-600 to-sky-500 px-5 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-sky-400 hover:shadow-blue-500/40"
                                    >
                                        {processing
                                            ? 'Creating...'
                                            : 'Create User'}
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

CreateUser.layout = {
    breadcrumbs: [
        {
            title: 'User Management',
            href: '/users',
        },
        {
            title: 'Create User',
            href: '/users/create',
        },
    ],
};
