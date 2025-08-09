import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import MenuDataService from "../services/menu";
import "./Dish.css";

const Dish = ({ user }) => {
  const { id } = useParams();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);

  // very-basic comment box (local state; wire to backend later)
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let mounted = true;

    // Prefer a dedicated API endpoint. Fallback to getMenu() + find.
    const fetchDish = async () => {
      setLoading(true);
      try {
        const res = await MenuDataService.getMenu();
        const found = (res.data?.dishes || []).find(d => d._id === id);
        if (mounted) setDish(found || null);
      } catch (e) {
        console.error(e);
        if (mounted) setDish(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDish();
    return () => (mounted = false);
  }, [id]);

  const sections = useMemo(() => {
    // If you later add dish.gallery, map those; for now repeat the main pic 3x
    const pic = dish?.pic ? `/images/${dish.pic}` : "/images/placeholder.jpg";
    const desc =
      dish?.description ||
      "This is a delicious dish prepared with fresh ingredients and a balanced flavor profile.";
    const name = dish?.name || "Chef’s Special";
    return [
      { img: pic, title: name, text: desc },
      { img: pic, title: `${name} — Ingredients`, text: desc },
      { img: pic, title: `${name} — Chef’s Notes`, text: desc },
    ];
  }, [dish]);

  const handleAddComment = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const newComment = {
      id: Date.now(),
      author: user?.name || "Guest",
      text,
      ts: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
    setDraft("");
    // TODO: call backend to persist
  };

  if (loading) {
    return (
      <div className="DishLoading">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="DishFallback">
        <h2>Dish not found</h2>
        <p>Try going back to the menu.</p>
      </div>
    );
  }

  return (
    <div className="DishPage">
      <Container fluid className="px-0">
        {sections.map((s, idx) => {
          const imageFirst = idx % 2 === 0; // alternate sides
          return (
            <Row key={idx} className="g-0 heroRow">
              {imageFirst && (
                <Col md={6} className="heroImgCol">
                  <img src={s.img} alt={s.title} className="heroImg" />
                </Col>
              )}
              <Col
                md={6}
                className={`heroTextCol d-flex align-items-center ${
                  imageFirst ? "ps-md-5" : "pe-md-5"
                }`}
              >
                <div className="heroTextWrap">
                  <h1 className="heroTitle">{s.title}</h1>
                  <p className="heroText">{s.text}</p>
                </div>
              </Col>
              {!imageFirst && (
                <Col md={6} className="heroImgCol">
                  <img src={s.img} alt={s.title} className="heroImg" />
                </Col>
              )}
            </Row>
          );
        })}

        {/* Comments */}
        <Row className="g-0 commentsRow">
          <Col md={{ span: 8, offset: 2 }} className="py-5 px-3 px-md-0">
            <h2 className="commentsTitle">Comments</h2>
            <Form onSubmit={handleAddComment} className="mb-4">
              <Form.Group controlId="commentBox">
                <Form.Label className="visually-hidden">Add a comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder={
                    user ? "Share your thoughts…" : "Sign in to personalize your comment (optional)"
                  }
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex justify-content-end mt-2">
                <Button type="submit" variant="dark">
                  Post
                </Button>
              </div>
            </Form>

            <div className="commentList">
              {comments.length === 0 ? (
                <p className="text-muted">No comments yet. Be the first!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="commentItem">
                    <div className="commentHeader">
                      <strong>{c.author}</strong>
                      <span className="commentTime">
                        {new Date(c.ts).toLocaleString()}
                      </span>
                    </div>
                    <p className="commentBody">{c.text}</p>
                  </div>
                ))
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dish;
