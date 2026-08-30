<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Testing\TestResponse;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withCredentials();
    }

    public function call($method, $uri, $parameters = [], $cookies = [], $files = [], $server = [], $content = null)
    {
        $response = parent::call($method, $uri, $parameters, $cookies, $files, $server, $content);

        if ($response instanceof TestResponse) {
            foreach ($response->headers->getCookies() as $cookie) {
                if ($cookie->getName() === 'guest_token') {
                    $this->unencryptedCookies['guest_token'] = $cookie->getValue();
                }
            }
        }

        return $response;
    }
}
