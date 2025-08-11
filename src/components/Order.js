// src/components/Order.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Alert from "react-bootstrap/Alert";

import MenuDataService from "../services/menu";
import "./Order.css";

const TAX_RATE = 0.0925; // adjust as needed

const Order = ({ user, cartItems, setCartItems }) => {
  const navigate = useNavigate();
  // Enriched items for rendering: { dishId, qty, name, price, pic }
  const [items, setItems] = useState([]);

  // Join [{dishId, qty}] with menu data so we can render name/price/pic
  useEffect(() => {
    let mounted = true;

    const normalize = async () => {
      if (!Array.isArray(cartItems)) {
      if (mounted) setItems([]);
             return;
       }

      try {
        const res = await MenuDataService.getMenu();
        const all = res.data?.dishes || [];

        // 🧠 Normalize each line to { dishId, qty }
        const lines = cartItems
            .map((it) => {
            if (typeof it === "string") return { dishId: it, qty: 1 };     // handle old shape
            if (it && it.dishId) return { dishId: it.dishId, qty: it.qty ?? 1 };
            return null;
            })
            .filter(Boolean);

        // Join with menu
        const enriched = lines
            .map(({ dishId, qty }) => {
            const d = all.find((x) => x._id === dishId);
            if (!d) return null;
            return {
                dishId,
                qty: Math.max(Number(qty ?? 1), 0),
                name: d.name,
                price: Number(d.price ?? 0),
                pic: d.pic,
            };
            })
            .filter(Boolean);

        if (mounted) setItems(enriched);
        } catch (e) {
        console.error(e);
        if (mounted) setItems([]);
        }
    };

    normalize();
    return () => {
        mounted = false;
    };
  }, [cartItems]);

  const setBoth = (updaterFn) => {
    setItems(prevItems => {
        const next = updaterFn(prevItems);
        // keep parent in [{dishId, qty}] shape
        setCartItems(next.map(({ dishId, qty }) => ({ dishId, qty })));
        return next;
    });
  };

  const inc = (dishId) => {
    setBoth(prev =>
        prev.map(it => it.dishId === dishId ? { ...it, qty: Math.min((it.qty ?? 1)+1, 99) } : it)
    );
  };

  const dec = (dishId) => {
    setBoth(prev =>
        prev
        .map(it => it.dishId === dishId ? { ...it, qty: Math.max((it.qty ?? 1)-1, 0) } : it)
        .filter(it => (it.qty ?? 1) > 0)
    );
  };

  const removeItem = (dishId) => {
    setBoth(prev => prev.filter(it => it.dishId !== dishId));
  };

  // Tip state
  const [tipPct, setTipPct] = useState(0.15); // default 15%
  const [customTip, setCustomTip] = useState("");

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.price) || 0) * (it.qty ?? 1), 0),
    [items]
  );
  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const tipFromPct = useMemo(() => subtotal * tipPct, [subtotal, tipPct]);

  // If custom tip dollars entered, use it; else use percentage
  const tip = useMemo(() => {
    const dollars = parseFloat(customTip);
    return Number.isFinite(dollars) && dollars >= 0 ? dollars : tipFromPct;
  }, [customTip, tipFromPct]);

  const total = useMemo(() => subtotal + tax + tip, [subtotal, tax, tip]);

  const handleConfirm = () => {
    if (!items.length) return;
    setCartItems([]);
    alert("Order placed! (Cart is cleared!)");
    navigate("/menu");
  };

  return (
    <div className="OrderPage">
      <Container fluid className="px-0">
        <Row className="gx-4 gy-4 px-3 px-md-4">
          {/* LEFT: 67% width (md=8 ≈ 66.7%) scrollable */}
          <Col md={8} className="order-left">
            <Card className="order-left-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>Your Cart</strong>
                <Link to="/menu" className="small text-decoration-none">
                  Continue shopping
                </Link>
              </Card.Header>

              <Card.Body className="order-left-scroll">
                {items.length === 0 ? (
                  <Alert variant="light" className="mb-0">
                    Your cart is empty. <Link to="/menu">Add some dishes →</Link>
                  </Alert>
                ) : (
                  <ListGroup variant="flush">
                    {items.map((it) => (
                      <ListGroup.Item key={it.dishId} className="py-3">
                        <div className="d-flex gap-3 align-items-center">
                          <Image
                            src={`/images/${it.pic}`}
                            alt={it.name}
                            rounded
                            className="order-item-img"
                          />
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-semibold">{it.name}</div>
                                <div className="text-muted small">
                                  ${Number(it.price).toFixed(2)}
                                </div>
                              </div>
                              <Button
                                variant="link"
                                className="p-0 text-danger small"
                                onClick={() => removeItem(it.dishId)}
                              >
                                Remove
                              </Button>
                            </div>

                            <div className="d-flex align-items-center gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => dec(it.dishId)}
                              >
                                −
                              </Button>
                              <Form.Control
                                value={it.qty ?? 1}
                                readOnly
                                className="order-qty-display"
                              />
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => inc(it.dishId)}
                              >
                                +
                              </Button>
                              <div className="ms-auto fw-semibold">
                                ${(Number(it.price) * (it.qty ?? 1)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT: ~30% (md=4) sticky and shorter */}
          <Col md={4} className="order-right">
            <Card className="order-summary sticky-summary">
              <Card.Header>
                <strong>Order Summary</strong>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax ({(TAX_RATE * 100).toFixed(2)}%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                {/* Tip controls */}
                <div className="mt-3">
                  <div className="mb-2">Tip</div>
                  <div className="d-flex flex-wrap gap-2">
                    {[0, 0.1, 0.15, 0.18, 0.2].map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={tipPct === p && customTip === "" ? "dark" : "outline-dark"}
                        onClick={() => {
                          setCustomTip("");
                          setTipPct(p);
                        }}
                      >
                        {(p * 100).toFixed(0)}%
                      </Button>
                    ))}
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Custom $"
                      className="custom-tip"
                      value={customTip}
                      onChange={(e) => {
                        setCustomTip(e.target.value);
                      }}
                    />
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <span>Tip amount</span>
                    <span>${tip.toFixed(2)}</span>
                  </div>
                </div>

                <hr />
                <div className="d-flex justify-content-between fs-5 fw-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-100 mt-3"
                  size="lg"
                  variant="dark"
                  disabled={items.length === 0}
                  onClick={handleConfirm}
                >
                  Confirm & Pay
                </Button>

                {!user && (
                  <div className="text-muted small mt-2">
                    You’re checking out as guest. <Link to="/">Sign in</Link> for faster checkout.
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Order;
