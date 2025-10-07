public class SimpleCalculator {
    public static void Main(String[] args) {
        // Scanner removed in C#

        Console.WriteLine("=== Simple Calculator ===");
        Console.Write("Enter first number: ");
        double num1 = input.nextDouble();

        Console.Write("Enter an operator (+, -, *, /): ");
        char operator = input.next().charAt(0);

        Console.Write("Enter second number: ");
        double num2 = input.nextDouble();

        double result;

        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 == 0) {
                    Console.WriteLine("Error: Cannot divide by zero!");
                    input.close();
                    return;
                }
                result = num1 / num2;
                break;
            default:
                Console.WriteLine("Invalid operator!");
                input.close();
                return;
        }

        Console.WriteLine("Result: " + result);
        input.close();
    }
}