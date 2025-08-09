import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import MenuDataService from "../services/menu";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

import "./Menu.css";

const Menu = ({ 
  user,
}) => {

    const [dishes, setDishes] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);

    const retrieveDishes = useCallback(() => {
        MenuDataService
        .getMenu()
        .then(response => {
            setDishes(response.data.dishes);
        })
        .catch(e => {
            console.log(e);
        });
    }, []);

    useEffect(() => {
        retrieveDishes();
    }, []);

  // Group dishes by category: { appetizers: [...], entrees:[...], ... }
  const grouped = useMemo(() => {
    const map = new Map();
    for (const d of dishes) {
      const cat = (d.category || 'Others').toLowerCase();
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(d);
    }
    // keep a stable order;
    const defaultOrder = ['appetizers','entrees','sides','drinks','desserts','others'];
    const keys = [...map.keys()].sort((a,b) => defaultOrder.indexOf(a) - defaultOrder.indexOf(b));
    return { keys, map };
  }, [dishes]);

  // refs for each category section in the right column
  const sectionRefs = useRef({}); // { [category]: HTMLElement }
  const setSectionRef = (cat) => (el) => {
    if (el) sectionRefs.current[cat] = el;
  };

  // click left nav -> smooth scroll to section
  const scrollToCategory = (cat) => {
    const el = sectionRefs.current[cat];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  // Observe sections to highlight the current category while scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // pick the one most in view / intersecting near top
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          const cat = visible[0].target.getAttribute('data-category');
          if (cat) setActiveCategory(cat);
        }
      },
      {
        // tune rootMargin so “active” switches a bit before the header hits the top
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // observe each section
    grouped.keys.forEach((cat) => {
      const el = sectionRefs.current[cat];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [grouped.keys]);

  


    return (
    <div className="App">
      <Container className="main-container">
        <Row>
           {/* LEFT: vertical nav */}
          <Col md={3}>
            <nav aria-label="Menu categories" className="category-panel">
              <ul className="category-list">
                {grouped.keys.map((cat) => {
                  const label = cat.charAt(0).toUpperCase() + cat.slice(1);
                  return (
                    <li key={cat}>
                      <a
                        href={`#section-${cat}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToCategory(cat);
                        }}
                        className={`category-link ${activeCategory === cat ? 'active' : ''}`}
                      >
                        <span className="category-label">{label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </Col>

         {/* RIGHT: dishes by categories */}
          <Col md={9} className="content-column">
            {grouped.keys.map((cat) => (
              <section
                key={cat}
                ref={setSectionRef(cat)}
                data-category={cat}
                id={`section-${cat}`}
                className="category-section"
              >
                <h2 className="category-title">{cat.toUpperCase()}</h2>
                <Row className="dishRow">
                  {grouped.map.get(cat).map((dish) => (
                    <Col key={dish._id} sm={6} lg={4} className="mb-4">
                      <Card className="dishesListCard">
                        <Card.Img className="smallPoster" src={"/images/" + dish.pic} />
                        <Card.Body>
                          <Card.Title>
                            <Link to={`/menu/${dish._id}`} className="dish-link">
                                {dish.name}
                            </Link>
                            </Card.Title>
                          <Card.Text>{dish.description}</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </section>
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Menu;