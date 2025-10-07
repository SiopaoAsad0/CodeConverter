import React, { useState, useEffect } from "react";
import {
    Container,
    Alert,
    ToggleButton,
    ButtonGroup,
    Navbar,
    Nav,
    Tabs,
    Tab,
    ListGroup,
    Button
} from "react-bootstrap";
import CodeMirror from "@uiw/react-codemirror";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { Link } from "react-router-dom";
import { autocompletion } from "@codemirror/autocomplete";

const javaCompletions = [
    { label: "for", type: "keyword" },
    { label: "if", type: "keyword" },
    { label: "public", type: "keyword" },
    { label: "class", type: "keyword" },
    { label: "static", type: "keyword" },
    { label: "void", type: "keyword" },
    { label: "main", type: "function" },
    { label: "System.out.println(\"\");", type: "function" },
    { label: "int", type: "keyword" },
    { label: "String", type: "keyword" },
    { label: "Boolean", type: "keyword" },
];

const csharpCompletions = [
    { label: "public", type: "keyword" },
    { label: "class", type: "keyword" },
    { label: "static", type: "keyword" },
    { label: "void", type: "keyword" },
    { label: "Console.WriteLine", type: "function" },
    { label: "int", type: "keyword" },
    { label: "string", type: "keyword" },
];

function customCompletionSource(language) {
    return (context) => {
        let word = context.matchBefore(/\w*/);
        if (!word || word.from === word.to) return null;
        const options = language === "java" ? javaCompletions : csharpCompletions;
        return { from: word.from, options, validFor: /^\w*$/ };
    };
}

const JavaTutorial = [
    { title: "Java Home", description: "Java is used to develop mobile apps, web apps, desktop apps, games and much more." },
    { title: "Java For Loop", description: "The for loop in Java is used to iterate over a range of values. Syntax: for(initialization; condition; update) { // code }" },
    { title: "Java While Loop", description: "The while loop continues as long as the condition is true. Syntax: while(condition) { // code }" },
    { title: "Java If...Else", description: "Used for decision making. Syntax: if (condition) { } else { }" },
    { title: "Java Arrays", description: "Used to store multiple values in a single variable. Syntax: int[] arr = {1, 2, 3};" },
    { title: "Java Methods", description: "A method is a block of code which only runs when it is called. Syntax: returnType methodName() { }" },
    { title: "Java OOP", description: "Java supports Object-Oriented Programming concepts like inheritance, encapsulation, and polymorphism." },
];

const CodeConverterPage = () => {
    const [files, setFiles] = useState([{
        name: "Untitled.java",
        content: "",
        converted: ""
    }]);
    const [activeTab, setActiveTab] = useState("Untitled.java");
    const [conversionType, setConversionType] = useState("java-to-csharp");
    const [error, setError] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [inputRunOutput, setInputRunOutput] = useState("");
    const [convertedRunOutput, setConvertedRunOutput] = useState("");
    const [history, setHistory] = useState([]);



    const language = conversionType === "java-to-csharp" ? "java" : "csharp";

    const handleFolderUpload = (event) => {
        const fileList = event.target.files;
        const newFiles = [];
        const validExtension = conversionType === "java-to-csharp" ? ".java" : ".cs";

        const readers = Array.from(fileList)
            .filter(file => file.name.endsWith(validExtension))
            .map(file => {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        newFiles.push({
                            name: file.name,
                            content: e.target.result,
                            converted: "",
                        });
                        resolve();
                    };
                    reader.readAsText(file);
                });
            });

        Promise.all(readers).then(() => {
            const filesToSet = newFiles.length > 0 ? newFiles : files;
            setFiles(filesToSet);
            setActiveTab(filesToSet[0]?.name);
            setError(newFiles.length === 0 ? "No valid .java or .cs files found." : null);
        });
    };

   const runCode = async (code, language, setOutput) => {
    if (!code.trim()) {
        setOutput("⚠️ No code to run.");
        return;
    }

    // Match Laravel routes
    const endpoint = language === "java" ? "/run-java" : "/run-csharp";

    try {
        setOutput("⏳ Running code...");
        const response = await fetch(`http://127.0.0.1:8000/api${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });

        const data = await response.json();
        if (response.ok) {
            setOutput(data.output || "No output");
        } else {
            setOutput(`X ${data.error || "Unknown error"}`);
        }
    } catch (err) {
        console.error("Execution failed:", err);
    }
};

    useEffect(() => {
        // Fetch recent history
        (async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/convert/history");
                if (res.ok) {
                    const data = await res.json();
                    setHistory(Array.isArray(data) ? data : []);
                }
            } catch {}
        })();
    }, []);


    const convertFileContent = async (name, code) => {
        const apiEndpoint = conversionType === "java-to-csharp"
            ? "http://localhost:8000/api/convert/java-to-csharp"
            : "http://localhost:8000/api/convert/csharp-to-java";

        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            });

            const data = await response.json();
            if (data.error) {
                setError(data.error);
            } else {
                setFiles(prev =>
                    prev.map(f => f.name === name ? { ...f, converted: data.convertedCode } : f)
                );
                setError(null);
            }
        } catch {
            setError("Failed to connect to the server.");
        }
    };

    const updateFileContent = (name, content) => {
        setFiles(prev =>
            prev.map(f =>
                f.name === name
                    ? {
                        ...f,
                        content,
                        converted: content.trim() === "" ? "" : f.converted,
                    }
                    : f
            )
        );

        if (content.trim() !== "") {
            convertFileContent(name, content);
        }
    };

    useEffect(() => {
        const file = files.find(f => f.name === activeTab);
        if (file && file.content.trim()) {
            convertFileContent(file.name, file.content);
        }
    }, [conversionType]);

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-info">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <img src="/logo.png" alt="logo" width="40" height="40"
                            className="me-2 rounded-circle border border-info shadow" />
                        <span className="text-info fw-bold">CodeConverter</span>
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/converter">Converter</Nav.Link>
                        <Nav.Link as={Link} to="/Lessons">Lessons</Nav.Link>
                        <Nav.Link as={Link} to ="/login">Logout</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            <div style={{ background: "#0d1117", minHeight: "100vh", padding: "50px 0", color: "#c9d1d9" }}>
                <Container fluid>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {/* Sidebar */}
                        <div style={{ width: "100%", maxWidth: 320, flex: "1 1 300px", background: "#161b22", padding: "20px", borderRight: "1px solid #30363d", marginBottom: 20 }}>
                            <h5 className="text-info">Java Intro</h5>
                            <ListGroup variant="flush">
                                {JavaTutorial.map((topic, index) => (
                                    <ListGroup.Item
                                        key={index}
                                        action
                                        onClick={() => setSelectedTopic(topic)}
                                        style={{
                                            background: "transparent",
                                            color: "#c9d1d9",
                                            cursor: "pointer",
                                            border: "none",
                                            paddingLeft: 0
                                        }}
                                    >
                                        {topic.title}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>

                        {/* Main Content */}
                        <div style={{ width: "100%", flex: "3 1 600px", padding: "20px" }}>
                            <Container style={{
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: "15px",
                                padding: "30px",
                                border: "1px solid rgba(255,255,255,0.18)"
                            }}>
                                <h1 className="text-center mb-4 text-info">Code Converter</h1>

                                <ButtonGroup className="mb-4 d-flex justify-content-center">
                                    <ToggleButton id="java-to-csharp" type="radio" variant="outline-info"
                                        name="conversionType" value="java-to-csharp"
                                        checked={conversionType === "java-to-csharp"}
                                        onChange={() => {
                                            setConversionType("java-to-csharp");
                                            setFiles([{ name: "Untitled.java", content: "", converted: "" }]);
                                            setActiveTab("Untitled.java");
                                            setError(null);
                                        }}>
                                        Java to C#
                                    </ToggleButton>
                                    <ToggleButton id="csharp-to-java" type="radio" variant="outline-info"
                                        name="conversionType" value="csharp-to-java"
                                        checked={conversionType === "csharp-to-java"}
                                        onChange={() => {
                                            setConversionType("csharp-to-java");
                                            setFiles([{ name: "Untitled.cs", content: "", converted: "" }]);
                                            setActiveTab("Untitled.cs");
                                            setError(null);
                                        }}>
                                        C# to Java
                                    </ToggleButton>
                                </ButtonGroup>

                                <div className="mb-3 text-center">
                                    <input type="file" accept=".java,.cs" webkitdirectory="true" directory="true" multiple
                                        onChange={handleFolderUpload} className="form-control" />
                                </div>

                                {files.length > 0 && (
                                    <Tabs
                                        activeKey={activeTab}
                                        onSelect={k => setActiveTab(k)}
                                        className="mb-3"
                                        variant="pills"
                                    >
                                        {files.map(file => (
                                            <Tab eventKey={file.name} title={file.name} key={file.name}>
                                                <div style={{ display: "flex", gap: "20px" }}>
                                                    {/* Input code on left */}
                                                    {/* Input code on left */}
                                            <div style={{ flex: 1 }}>
                                                <h5 className="text-info">Input Code:</h5>
                                                <CodeMirror
                                                    value={file.content}
                                                    height="300px"
                                                    extensions={[
                                                        conversionType === "java-to-csharp" ? java() : cpp(),
                                                        autocompletion({ override: [customCompletionSource(language)] })
                                                    ]}
                                                    theme={dracula}
                                                    onChange={value => updateFileContent(file.name, value)}
                                                    className="border mb-3"
                                                />

                                                {/* ✅ Run button for input code */}
                                                <div className="text-center mt-2">
                                                    <Button
                                                        variant="success"
                                                        onClick={() => runCode(
                                                            file.content,
                                                            conversionType === "java-to-csharp" ? "java" : "csharp",
                                                            setInputRunOutput
                                                        )}
                                                    >
                                                        Run Input Code
                                                    </Button>
                                                </div>
                                                    {inputRunOutput && (
                                                    <Alert variant="dark">
                                                        <strong>Input Code Output:</strong>
                                                        <pre>{inputRunOutput}</pre>
                                                    </Alert>
                                                    )}
                                                </div>

                                                    

                                                    {/* Converted code on right */}
                                                    <div style={{ flex: 1 }}>
                                                        <h5 className="text-info">Converted Code:</h5>
                                                        <CodeMirror
                                                            value={file.converted}
                                                            height="300px"
                                                            extensions={[conversionType === "java-to-csharp" ? cpp() : java()]}
                                                            theme={dracula}
                                                            readOnly
                                                            className="border"
                                                        />
                                                        {conversionType === "java-to-csharp" ? (
                                                            <>
                                                                <div className="text-center mt-2">
                                                                    <Button variant="primary" onClick={() => runCode(file.converted, "csharp", setConvertedRunOutput)}>
                                                                        Run Converted Code
                                                                    </Button>
                                                                </div>
                                                                {convertedRunOutput && (
                                                                <Alert variant="dark">
                                                                    <strong>Converted Code Output:</strong>
                                                                    <pre>{convertedRunOutput}</pre>
                                                                </Alert>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-center mt-2">
                                                                    <Button variant="primary" onClick={() => runCode(file.converted, "java", setConvertedRunOutput)}>
                                                                        Run Converted Code
                                                                    </Button>
                                                                </div>
                                                                {convertedRunOutput && (
                                                                <Alert variant="dark">
                                                                    <strong>Converted Code Output:</strong>
                                                                    <pre>{convertedRunOutput}</pre>
                                                                </Alert>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                </div>
                                            </Tab>
                                        ))}
                                    </Tabs>
                                )}
                                <div className="mt-4">
  <h4>🕑 Conversion History</h4>
  <ul>
    {history.map((item, index) => (
      <li key={index}>
        <strong>{item.direction}</strong><br/>
        <code>Input: {item.input_code.substring(0,80)}...</code><br/>
        <code>Output: {item.converted_code.substring(0,80)}...</code>
      </li>
    ))}
  </ul>
</div>

                                {error && <Alert variant="danger" className="text-center">{error}</Alert>}
                            </Container>
                        </div>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default CodeConverterPage;
