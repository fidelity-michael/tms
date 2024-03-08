import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';
import Carousel from 'react-elastic-carousel';
// import axios from 'axios';
import './content.css';

export default function FavouritesCarousel({ userId, studentFavourites }) {
    const [items, setItems] = useState(3);
    const [favourites, setFavourites] = useState([]);
    // const [loadingFavourites, setLoadingFavourites] = useState(false);
    const loadingFavourites = false;

    const componentIsMounted = useRef(true)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 600) {
                if (componentIsMounted.current) setItems(1);
            }
            else if (window.innerWidth < 900) {
                if (componentIsMounted.current) setItems(2);
            }
            else {
                if (componentIsMounted.current) setItems(3);
            }
        }

        // const fetchFavourites = async () => {
        //     try {
        //         if (componentIsMounted.current) setLoadingFavourites(true);
        //         const favourites_data = await axios.get('/api/favourites/' + userId);
        //         // console.log(favourites_data.data);
        //         if (favourites_data.data.length > 0) {
        //             if (componentIsMounted.current) {
        //                 setFavourites(favourites_data.data);
        //                 setLoadingFavourites(false);
        //             }
        //         }
        //     }
        //     catch (err) {
        //         console.log("Server internal error occurred!", err);
        //     }
        // }

        window.addEventListener("resize", handleResize);
        handleResize();
        // fetchFavourites();

        return () => {
            componentIsMounted.current = false
        }
    }, [userId]);

    useEffect(() => {
        setFavourites(studentFavourites);
    }, [studentFavourites]);

    // function toggleFavourite(e) {
    //     console.log('Added to favourites!');
    // }

    function renderCarousel() {
        return (
            <Carousel className='fav-carousel'
                pagination={false}
                enableSwipe={false}
                itemPadding={[10, 10]}
                // enableAutoPlay
                // autoPlaySpeed={7500}
                itemsToShow={items}
            >
                {
                    renderFavourites()
                }
            </Carousel>
        );
    }

    function renderFavourites() {
        return favourites.map((favourite) => {
            const { area_id, area_name } = favourite;
            return (
                <div key={area_id}>
                    <Card className='card'>
                        {/* <span className="badge heart"><i id={_id} className="fas fa-heart" onClick={(e) => toggleFavourite(e.target)}></i></span> */}
                        <Card.Img variant="top" src={require("../images/computer_science_" + Math.floor(Math.random() * 7).toString() + ".jpg")} />
                        <Card.Body>
                            <Card.Title>{area_name}</Card.Title>
                            {/* <Card.Text>
                                {area_name}
                            </Card.Text> */}
                        </Card.Body>
                    </Card>
                </div>
            )
        });
    }

    function loadingData() {
        return (
            <div className="d-flex justify-content-center text-primary fav-loading">
                <div className="spinner-border spinner-border-lg" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='fav-favourites'>
            {
                loadingFavourites ? loadingData() : (favourites.length ? renderCarousel() : null)
            }
        </div>
    );
}
