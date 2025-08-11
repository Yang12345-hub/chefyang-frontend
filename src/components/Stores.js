import { useMemo, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import "./Stores.css";

const Stores = () => {
  // Replace with your real locations
  const stores = useMemo(
    () => [
      { id: "sj", name: "Chef Yang – San Jose (Global HQ)", address: "8888888 Main St, San Jose, CA" },
      { id: "cu", name: "Chef Yang – Cupertino", address: "8888888 Main St, Cupertino, CA" },
      { id: "mtv", name: "Chef Yang – Mountain View", address: "8888888 Main St, Mountain View, CA" },
      { id: "pa", name: "Chef Yang – Palo Alto", address: "8888888 Main St, Palo Alto, CA" },
      { id: "sv", name: "Chef Yang – Sunnyvale", address: "8888888 Main St, Sunnyvale, CA" },
    ],
    []
  );

  const [activeId, setActiveId] = useState(stores[0]?.id);
  const activeStore = stores.find(s => s.id === activeId) || stores[0];
  const q = encodeURIComponent(`${activeStore?.name ?? ""} ${activeStore?.address ?? ""}`);

  return (
    <div className="StoresPage">
      <Container fluid className="py-4">
        <Row className="stores-row g-3 g-md-4">
          {/* LEFT: scrollable list */}
          <Col md={4} lg={3}>
            <div className="stores-list" role="listbox" aria-label="Store locations">
              {stores.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={activeId === s.id}
                  onClick={() => setActiveId(s.id)}
                  className={`store-item ${activeId === s.id ? "active" : ""}`}
                >
                  <div className="store-name">{s.name}</div>
                  <div className="store-addr">{s.address}</div>
                </button>
              ))}
            </div>
          </Col>

          {/* RIGHT: map */}
          <Col md={8} lg={9}>
            <div className="map-wrap">
              <iframe
                key={activeId}                  // refresh when store changes
                title={`map-${activeId}`}
                src={`https://www.google.com/maps?q=${q}&output=embed`}
                className="map-iframe"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Stores;
