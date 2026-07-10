<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        $users = User::latest()->get();

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('users/create', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'role' => ['required', 'string', Rule::in(['admin', 'user'])],
            'password' => ['required', 'string', Password::defaults()],
        ]);

        $validated['password'] = bcrypt($validated['password']);

        User::create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User created successfully.'),
        ]);

        return to_route('users.index');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'user' => $user,
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'string', Rule::in(['admin', 'user'])],
            'password' => ['nullable', 'string', Password::defaults()],
        ]);

        if (filled($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User updated successfully.'),
        ]);

        return to_route('users.index');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('You cannot delete your own account.'),
            ]);

            return back();
        }

        $user->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User deleted successfully.'),
        ]);

        return to_route('users.index');
    }

    /**
     * Toggle suspension status of the user.
     */
    public function suspend(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('You cannot suspend your own account.'),
            ]);

            return back();
        }

        $user->is_suspended = ! $user->is_suspended;
        $user->save();

        $statusMessage = $user->is_suspended ? __('User suspended successfully.') : __('User unsuspended successfully.');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $statusMessage,
        ]);

        return to_route('users.index');
    }
}
