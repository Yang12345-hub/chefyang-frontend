import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Routes, Route, Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

import Container from 'react-bootstrap/Container';
import { Navbar, Nav } from 'react-bootstrap';


import Dish from "./components/Dish";
import HomePage from "./components/HomePage";
import Menu from "./components/Menu";
import Login from "./components/Login";
import Logout from "./components/Logout";

import './App.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let loginData = JSON.parse(localStorage.getItem("login"));
    if (loginData) {
      let loginExp = loginData.exp;
      let now = Date.now() / 1000;
      if (now < loginExp) {
        setUser(loginData);
      } else {
        localStorage.setItem("login", null);
      }
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="App">
        <Navbar bg="dark" expand="lg" sticky="top" variant="dark">
          <Container className="container-fluid">
            <Navbar.Brand href="/">
              <img src="images/bistro-logo.png" alt="bistro logo" className="appLogo"/>
              CHEF YANG
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="ml-auto">
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                <Nav.Link as={Link} to="/menu">Order Now</Nav.Link>
              </Nav>
            </Navbar.Collapse>
            { user ? (
                <Logout setUser={setUser} clientId={clientId}/>
              ) : (
                <Login setUser={setUser}/>
              )}
          </Container>
        </Navbar>

        <Routes>
          <Route exact path="/" element={
            <HomePage
              user={user}
            />}
          />
          <Route exact path="/menu" element={
            <Menu
              user={user}
            />}
          />
          <Route path="/menu/:id" element={<Dish user={user} />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;