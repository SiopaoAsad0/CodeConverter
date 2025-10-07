<?php
namespace App\Http\Middleware;

use Illuminate\Http\Middleware\HandleCors as Middleware;

class HandleCors extends Middleware
{
    protected $allowedOrigins = ['http://localhost:3000'];
    protected $allowedMethods = ['*'];
    protected $allowedHeaders = ['*'];
}
