<?php

test('returns a redirect response for unauthenticated users', function () {
    $response = $this->get(route('home'));

    $response->assertRedirect('/dashboard');
});