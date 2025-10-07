<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class CodeExecutionController extends Controller
{
    public function runJava(Request $request)
{
    $code = $request->input('code');

    $folder = storage_path('app/java');
    if (!File::exists($folder)) {
        File::makeDirectory($folder, 0755, true);
    }

    // Extract the class name from the Java code
    preg_match('/public\s+class\s+([A-Za-z_]\w*)/', $code, $matches);
    $className = $matches[1] ?? 'Main';

    $filePath = $folder . DIRECTORY_SEPARATOR . $className . '.java';
    File::put($filePath, $code);

    [$javacBin, $javaBin, $errorMsg] = $this->resolveJavaBins();
    if ($errorMsg !== null) {
        return response()->json(['error' => $errorMsg], 500);
    }

    $quotedFile = $this->quoteForShell($filePath);
    $quotedFolder = $this->quoteForShell($folder);
    $compileCmd = $this->wrapCmd("$javacBin $quotedFile 2>&1");
    $compile = shell_exec($compileCmd);
    if (!empty($compile)) {
        // If 'not recognized' or similar, surface a friendly hint
        if (stripos($compile, 'not recognized') !== false || stripos($compile, 'command not found') !== false) {
            return response()->json([
                'error' => "Java compiler not found. Set JAVA_HOME or define JAVA_BIN in .env, and ensure JDK is installed.",
                'details' => $compile,
            ], 500);
        }
        return response()->json(['error' => $compile], 400);
    }

    $runCmd = $this->wrapCmd("$javaBin -cp $quotedFolder $className 2>&1");
    $output = shell_exec($runCmd);

    return response()->json(['output' => $output]);
}

    public function runCSharp(Request $request)
{
    $code = $request->input('code');

    if (empty($code)) {
        return response()->json(['error' => 'No C# code received'], 400);
    }

    // Use the existing template console project to ensure dotnet run works
    $projectDir = base_path('cs_temp_project');
    if (!File::exists($projectDir)) {
        return response()->json(['error' => 'C# template project not found at cs_temp_project.'], 500);
    }

    $programPath = $projectDir . DIRECTORY_SEPARATOR . 'Program.cs';
    File::put($programPath, $code);

    $dotnetBin = $this->resolveDotnetBin();
    if ($dotnetBin === null) {
        return response()->json([
            'error' => "'.NET SDK' not found. Set DOTNET_BIN in .env or install .NET SDK and add it to PATH.",
        ], 500);
    }

    $quotedProjectDir = $this->quoteForShell($projectDir);
    $csproj = $this->quoteForShell($projectDir . DIRECTORY_SEPARATOR . 'cs_temp_project.csproj');
    $cmd = $this->wrapCmd("cd $quotedProjectDir && $dotnetBin run --project $csproj 2>&1");
    $output = shell_exec($cmd);

    if (stripos((string)$output, 'not recognized') !== false || stripos((string)$output, 'command not found') !== false) {
        return response()->json([
            'error' => "'.NET SDK' command failed. Ensure DOTNET_BIN is correct and .NET is installed.",
            'details' => $output,
        ], 500);
    }

    return response()->json(['output' => $output]);
}

    private function resolveJavaBins(): array
    {
        // Allow explicit override via .env
        $customJavac = env('JAVA_BIN'); // full path to javac.exe or just 'javac'
        $customJava = env('JAVA_CMD');  // full path to java.exe or just 'java'

        $javaHome = env('JAVA_HOME');
        if (empty($javaHome)) {
            // Try reading from system environment on Windows
            $javaHome = getenv('JAVA_HOME') ?: null;
        }

        $javacBin = $customJavac ?: 'javac';
        $javaBin = $customJava ?: 'java';

        if (!empty($javaHome)) {
            $binDir = rtrim($javaHome, "\\/ ") . DIRECTORY_SEPARATOR . 'bin';
            $javacCandidate = $binDir . DIRECTORY_SEPARATOR . (str_starts_with(PHP_OS_FAMILY, 'Windows') ? 'javac.exe' : 'javac');
            $javaCandidate = $binDir . DIRECTORY_SEPARATOR . (str_starts_with(PHP_OS_FAMILY, 'Windows') ? 'java.exe' : 'java');
            if (file_exists($javacCandidate)) {
                $javacBin = $this->quoteForShell($javacCandidate);
            }
            if (file_exists($javaCandidate)) {
                $javaBin = $this->quoteForShell($javaCandidate);
            }
        }

        // Basic presence hint; we still attempt execution and capture stderr
        $errorMsg = null;
        return [$javacBin, $javaBin, $errorMsg];
    }

    private function quoteForShell(string $path): string
    {
        // Quote paths with spaces for cross-platform use
        if ($path === '') {
            return $path;
        }
        // Already quoted
        if ($path[0] === '"' && substr($path, -1) === '"') {
            return $path;
        }
        return '"' . $path . '"';
    }

    private function wrapCmd(string $cmd): string
    {
        // On Windows, use cmd /C to run combined commands like cd && dotnet run
        if (str_starts_with(PHP_OS_FAMILY, 'Windows')) {
            return 'cmd /C ' . $cmd;
        }
        return $cmd;
    }

    private function resolveDotnetBin(): ?string
    {
        // Allow explicit override via .env
        $custom = env('DOTNET_BIN'); // full path to dotnet.exe or just 'dotnet'
        if (!empty($custom)) {
            return $this->quoteForShell($custom);
        }

        // Common Windows install paths
        if (str_starts_with(PHP_OS_FAMILY, 'Windows')) {
            $candidates = [
                'C:\\Program Files\\dotnet\\dotnet.exe',
                'C:\\Program Files (x86)\\dotnet\\dotnet.exe',
            ];
            foreach ($candidates as $path) {
                if (file_exists($path)) {
                    return $this->quoteForShell($path);
                }
            }
        }

        // Fallback to PATH resolution
        return 'dotnet';
    }

}
