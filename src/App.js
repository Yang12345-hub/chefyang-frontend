import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Routes, Route, Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";

import Container from 'react-bootstrap/Container';
import { Badge, Button, Navbar, Nav } from 'react-bootstrap';
import { BsCart, BsCartFill } from 'react-icons/bs';

import MenuDataService from "./services/menu";
import Dish from "./components/Dish";
import HomePage from "./components/HomePage";
import Menu from "./components/Menu";
import Login from "./components/Login";
import Logout from "./components/Logout";

import './App.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (!user) {
      return
    }
    let data = {
      userId: user.googleId,
      itemIds: cartItems.filter(Boolean),
    };
    MenuDataService.upsertCart(data);
  }, [cartItems])

  useEffect(() => {
    let loginData = JSON.parse(localStorage.getItem("login"));
    if (loginData) {
      let loginExp = loginData.exp;
      let now = Date.now() / 1000;
      if (now < loginExp) {
        setUser(loginData);
        MenuDataService.getCart(loginData.googleId)
        .then(response => {
          setCartItems(response.data.itemIds);
        })
        .catch(e => {
          console.log(e);
        });
      } else {
        localStorage.setItem("login", null);
      }
    }
  }, []);

  const cartCount = (cartItems?.filter(Boolean)?.length) || 0;

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

            <Button
              as={Link}
              to="/menu"
              variant="outline-light"
              className="cart-btn me-2 position-relative"
              aria-label={cartCount > 0 ? `Cart with ${cartCount} items` : 'Cart empty'}
            >
              {cartCount > 0 ? <BsCartFill size={20} /> : <BsCart size={20} />}

              {cartCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle cart-badge"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                  <span className="visually-hidden">items in cart</span>
                </Badge>
              )}
            </Button>

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
              cartItems={cartItems}
              setCartItems={setCartItems}
            />}
          />
          <Route path="/menu/:id" element={<Dish user={user} />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;