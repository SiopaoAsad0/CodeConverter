import React from "react";
import { Container, Row, Col, Table, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const equivalents = [
  { java: "System.out.println(\"Hello\")", csharp: "Console.WriteLine(\"Hello\");" },
  { java: "int x = 5;", csharp: "int x = 5;" },
  { java: "String s = \"text\";", csharp: "string s = \"text\";" },
  { java: "for (int i=0; i<10; i++)", csharp: "for (int i = 0; i < 10; i++)" },
  { java: "public static void main(String[] args)", csharp: "public static void Main(string[] args)" },
];

const limitations = [
  "Advanced generics with wildcards vs constraints may not convert 1:1",
  "Checked exceptions in Java have no direct C# equivalent",
  "Java Streams vs C# LINQ conversions are non-trivial",
  "UI frameworks (Swing/WinForms) map only for simple widgets",
  "Reflection and annotations/attributes differ significantly",
];

const Lessons = () => {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-info">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src="/logo.png" alt="logo" width="40" height="40" className="me-2 rounded-circle border border-info shadow" />
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

      <div style={{ background: "#0d1117", minHeight: "100vh", padding: "40px 0", color: "#c9d1d9" }}>
        <Container>
          <Row className="gy-4">
            <Col xs={12}>
              <h2 className="text-info">Java ↔ C# Equivalents</h2>
              <Table responsive striped bordered variant="dark">
                <thead>
                  <tr>
                    <th>Java</th>
                    <th>C#</th>
                  </tr>
                </thead>
                <tbody>
                  {equivalents.map((e, idx) => (
                    <tr key={idx}>
                      <td><code>{e.java}</code></td>
                      <td><code>{e.csharp}</code></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>

            <Col xs={12}>
              <h2 className="text-info">Conversion Limitations</h2>
              <ul>
                {limitations.map((l, idx) => (
                  <li key={idx}>{l}</li>
                ))}
              </ul>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Lessons;


