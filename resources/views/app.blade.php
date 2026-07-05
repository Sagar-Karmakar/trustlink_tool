<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline style to set the HTML background color --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @if(isset($ogTitle))
            <!-- Open Graph / Facebook / WhatsApp Metadata -->
            <meta property="og:type" content="website" />
            <meta property="og:title" content="{{ $ogTitle }}" />
            <meta property="og:description" content="{{ $ogDescription ?? '' }}" />
            <meta property="og:url" content="{{ $ogUrl ?? url()->current() }}" />
            @if(isset($ogImage))
                <meta property="og:image" content="{{ $ogImage }}" />
                <meta name="twitter:image" content="{{ $ogImage }}" />
            @endif

            <!-- Twitter Metadata -->
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="{{ $ogTitle }}" />
            <meta name="twitter:description" content="{{ $ogDescription ?? '' }}" />
            <meta name="twitter:url" content="{{ $ogUrl ?? url()->current() }}" />
        @endif

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
