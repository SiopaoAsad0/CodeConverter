<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CodeConverterController;
use App\Http\Controllers\CodeExecutionController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Conversion endpoints
Route::post('/convert/java-to-csharp', [CodeConverterController::class, 'javaToCsharp']);
Route::post('/convert/csharp-to-java', [CodeConverterController::class, 'csharpToJava']);
Route::post('/convert/upload', [CodeConverterController::class, 'convertFromFile']);
Route::get('/convert/history', [CodeConverterController::class, 'history']);

// Execution endpoint (kept open for dev; protect in production)
Route::post('/run-java', [CodeExecutionController::class, 'runJava']);
Route::post('/run-csharp', [CodeExecutionController::class, 'runCSharp']);
