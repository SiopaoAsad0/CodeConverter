<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ConversionHistory;

class CodeConverterController extends Controller
{
    public function history()
{
    $history = ConversionHistory::latest()->take(10)->get();
    return response()->json($history);
}

    public function convertFromFile(Request $request)
    {
        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No file uploaded.'], 400);
        }

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        $code = file_get_contents($file->getRealPath());

        if ($extension === 'java') {
            $converted = $this->convertJavaToCSharp($code);
        } elseif ($extension === 'cs') {
            $converted = $this->convertCSharpToJava($code);
        } else {
            return response()->json(['error' => 'Unsupported file type.'], 400);
        }

        return response()->json(['convertedCode' => $converted]);
    }

public function javaToCsharp(Request $request)
    {
        $javaCode = $request->input('code');
        if (!$javaCode) {
            return response()->json(['error' => 'No Java code provided.'], 400);
        }

        // --- Fix class name & Main conflicts
        $javaCode = preg_replace_callback('/public\s+class\s+([a-zA-Z_]\w*)/', function ($matches) use (&$className) {
            $className = $matches[1];
            return "public class " . ucfirst($className);
        }, $javaCode);

        // --- Fix main method
        $javaCode = preg_replace('/public\s+static\s+void\s+main\s*\(/i', 'public static void Main(', $javaCode);

        // --- If class name == Main method name, lowercase class name
        if (isset($className) && strtolower($className) === "main") {
            $javaCode = preg_replace('/public\s+class\s+Main\b/', 'public class MainClass', $javaCode);
        }

        $convertedCode = $this->convertJavaToCSharp($javaCode);
        ConversionHistory::create([
            'user_id' => null, // null if no login system
            'input_code' => $javaCode,
            'converted_code' => $convertedCode,
            'direction' => 'java-to-csharp',
        ]);

        return response()->json(['convertedCode' => $convertedCode]);
    }


    public function csharpToJava(Request $request)
    {
        $csharpCode = $request->input('code');

        if (!$csharpCode) {
            return response()->json(['error' => 'No C# code provided.'], 400);
        }
        // --- Auto-correct class name (force uppercase first letter)
        $csharpCode = preg_replace_callback('/public\s+class\s+([a-zA-Z_]\w*)/', function ($matches) {
            $className = ucfirst($matches[1]); // ensure uppercase
            return "public class " . $className;
        }, $csharpCode);

        // --- Auto-correct Main method (uppercase → lowercase main)
        $csharpCode = preg_replace('/public\s+static\s+void\s+Main\s*\(/', 'public static void main(', $csharpCode);

        $convertedCode = $this->convertCSharpToJava($csharpCode);

        ConversionHistory::create([
            'user_id' => null, // null if no login system
            'input_code' => $csharpCode,
            'converted_code' => $convertedCode,
            'direction' => 'java-to-csharp',
        ]);

        return response()->json(['convertedCode' => $convertedCode]);
    }


    private function convertJavaToCSharp($javaCode)
{
    
    $guiPatterns = [
        '/import javax\.swing\.\*/' => 'using System.Windows.Forms',
        '/JFrame (\w+) = new JFrame\("?(.*?)"?\);/' => '$1 = new Form(); $1.Text = "$2";',
        '/JButton (\w+) = new JButton\("?(.*?)"?\);/' => '$1 = new Button(); $1.Text = "$2";',
        '/JLabel (\w+) = new JLabel\("?(.*?)"?\);/' => '$1 = new Label(); $1.Text = "$2";',
        '/JTextField (\w+) = new JTextField\((\d+)\);/' => '$1 = new TextBox();',
        '/(\w+)\.setBounds\((\d+), (\d+), (\d+), (\d+)\);/' => '$1.SetBounds($2, $3, $4, $5);',
        '/(\w+)\.add\((\w+)\);/' => '$1.Controls.Add($2);',
        '/(\w+)\.setSize\((\d+), (\d+)\);/' => '$1.Size = new System.Drawing.Size($2, $3);',
        '/(\w+)\.setVisible\(true\);/' => 'Application.Run($1);',
    ];

    foreach ($guiPatterns as $pattern => $replacement) {
        $javaCode = preg_replace($pattern, $replacement, $javaCode);
    }

    
    $javaCode = preg_replace('/System\.out\.format\((.*?)\);/', 'Console.WriteLine($1);', $javaCode);
    $javaCode = preg_replace('/import java.util.Scanner;/', '', $javaCode);
    $javaCode = preg_replace('/Scanner\s+(\w+)\s*=\s*new\s*Scanner\(System\.in\);/', '// Scanner removed in C#', $javaCode);
    $javaCode = preg_replace('/import/', 'using', $javaCode);
    $javaCode = preg_replace('/(\w+)\.nextInt\(\);/', 'int.Parse(Console.ReadLine())', $javaCode);

    $patterns = [
        '/public class (\w+)/' => 'public class $1',
        '/extends JFrame/' => ": Forms",
        '/System.out.println\((.*?)\)/' => 'Console.WriteLine($1)', 
        '/System.out.print\((.*?)\);/' => 'Console.Write($1);',
        '/int (\w+) = (\d+);/' => 'int $1 = $2;', 
        '/for\s*\((int \w+ = \d+); (\w+ < .*?); (\w+\+\+)\)/' => 'for ($1; $2; $3)',
    ];

    $convertedCode = preg_replace(array_keys($patterns), array_values($patterns), $javaCode);

    return $convertedCode;
}



private function convertCSharpToJava($csharpCode)
{
    $guiPatterns = [
        '/using System\.Windows\.Forms;/' => 'import javax.swing.*;',
        '/Form (\w+) = new Form\(\);/' => 'JFrame $1 = new JFrame();',
        '/Button (\w+) = new Button\(\);/' => 'JButton $1 = new JButton();',
        '/Label (\w+) = new Label\(\);/' => 'JLabel $1 = new JLabel();',
        '/TextBox (\w+) = new TextBox\(\);/' => 'JTextField $1 = new JTextField();',
        '/(\w+)\.Text = "?(.*?)"?;/' => '$1.setText("$2");',
        '/(\w+)\.SetBounds\((\d+), (\d+), (\d+), (\d+)\);/' => '$1.setBounds($2, $3, $4, $5);',
        '/(\w+)\.Controls\.Add\((\w+)\);/' => '$1.add($2);',
        '/(\w+)\.Size = new System\.Drawing\.Size\((\d+), (\d+)\);/' => '$1.setSize($2, $3);',
        '/Application\.Run\((\w+)\);/' => '$1.setVisible(true);',
    ];

    foreach ($guiPatterns as $pattern => $replacement) {
        $csharpCode = preg_replace($pattern, $replacement, $csharpCode);
    }

    // Existing conversion logic...
    $patterns = [
        '/using System;/' => '',
        '/public class (\w+)/' => 'public class $1',
        '/public static void Main\(string\[\] args\)/' => 'public static void main(String[] args)',
        '/Console.WriteLine\((.*?)\);/' => 'System.out.println($1);',
        '/Console.Write\((.*?)\);/' => 'System.out.print($1);',
        '/int (\w+) = (\d+);/' => 'int $1 = $2;',
        '/for\s*\((int \w+ = \d+); (\w+ < .*?); (\w+\+\+)\)/' => 'for ($1; $2; $3)',
        '/\bstring\b/' => 'String',
        '/\bbool\b/' => 'boolean',
        '/\btrue\b/' => 'true',
        '/\bfalse\b/' => 'false',
    ];

    $convertedCode = preg_replace(array_keys($patterns), array_values($patterns), $csharpCode);

    // Handle List<T> to ArrayList<T>
    $convertedCode = preg_replace(
        '/List<(\w+)>\s+(\w+)\s*=\s*new\s*List<\w+>\s*\(\);/',
        'ArrayList<$1> $2 = new ArrayList<$1>();',
        $convertedCode
    );

    // Handle foreach
    $convertedCode = preg_replace(
        '/foreach\s*\((\w+)\s+(\w+)\s+in\s+(\w+)\)/',
        'for ($1 $2 : $3)',
        $convertedCode
    );

    // Add Java imports
    $convertedCode = "import java.util.*;\nimport javax.swing.*;\n" . $convertedCode;

    return $convertedCode;
}


}
