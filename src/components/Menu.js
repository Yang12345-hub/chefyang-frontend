import { useState, useEffect, useCallback } from 'react';
import MenuDataService from "../services/menu";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';

import "./Menu.css";

const Menu = ({ 
  user,
}) => {

    const [dishes, setDishes] = useState([]);

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


    return (
    <div className="App">
        <Container className="main-container">
            <Row className="dishRow">
                {dishes.map((dish) => {
                    return (
                    <Col key={dish._id}>
                        <Card className="dishesListCard">
                        <Card.Img
                            className="smallPoster"
                            src={"/images/" + dish.pic}
                            // onError={(e) => {
                            // e.target.onerror = null;
                            // e.target.src = "/images/NoPosterAvailable-crop.jpg";
                            // }}
                        />
                        <Card.Body>
                            <Card.Title>{dish.name}</Card.Title>
                            <Card.Text>
                            {dish.description}
                            </Card.Text>
                        </Card.Body>
                        </Card>
                    </Col>
                    )
                })}
                </Row>

        </Container>
    </div>
    )
}

export default Menu;