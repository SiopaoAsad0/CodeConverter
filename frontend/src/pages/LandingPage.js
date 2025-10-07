import React from "react";
import { Container, Button, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const LandingPage = () => {
    return (
        <>
            {/* Navigation Bar */}
            <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-info shadow-lg">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                        <img
                            src="/logo.png"
                            alt="CodeConverter Logo"
                            width="45"
                            height="45"
                            className="d-inline-block align-top me-2"
                            style={{
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid #00ffff",
                                boxShadow: "0 0 10px #00ffff",
                            }}
                        />
                        <span className="text-info fw-bold fs-4">CodeConverter</span>
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/converter">Converter</Nav.Link>
                        <Nav.Link as={Link} to="/Lessons">Lessons</Nav.Link>
                        <Nav.Link as={Link} to ="/login">Logout</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            {/* Landing Content */}
            <div
                className="text-white d-flex align-items-center justify-content-center"
                style={{
                    height: "90vh",
                    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
                    padding: "40px",
                }}
            >
                <Container
                    className="text-center p-5"
                    style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "20px",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        maxWidth: "700px",
                    }}
                >
                    <h1 className="fw-semibold mb-3 text-info" style={{ fontSize: "2.5rem" }}>
                        Convert Java & C# Code Effortlessly
                    </h1>
                    <p className="lead mb-5 text-light">
                        A modern and smart way to switch between Java and C# with syntax checking and file upload support.
                    </p>
                    <Button
                        as={Link}
                        to="/converter"
                        variant="outline-info"
                        size="lg"
                        className="px-4 py-2 fw-medium shadow-sm"
                    >
                        Start Converting
                    </Button>
                </Container>
            </div>
        </>
    );
};

export default LandingPage;
