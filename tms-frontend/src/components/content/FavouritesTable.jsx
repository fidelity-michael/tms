import React, { useState, useEffect, useRef } from 'react';
import { Table, Form } from 'react-bootstrap';
import axios from 'axios';
import './content.css';

export default function FavouritesTable({ userId, studentFavourites }) {

    const [areas, setAreas] = useState([]);
    const [areasPage, setAreasPage] = useState(1);
    const [areasLimit, setAreasLimit] = useState("10");
    const [loadingAreas, setLoadingAreas] = useState(false);

    const [pagination, setPagination] = useState({});

    const [query, setQuery] = useState("");
    const [order, setOrder] = useState({
        attr: "name",
        sort: "asc"
    });

    const [favouriteAreas, setFavouriteAreas] = useState([]);

    const componentIsMounted = useRef(true)
    useEffect(() => {
        return () => {
            componentIsMounted.current = false
        }
    }, []);

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const favourites_data = await axios.get('/api/favourites/' + userId);
                // console.log("Favourites: ", favourites_data.data);
                const areas = (array, column) => array.map(obj => obj[column]);
                if (componentIsMounted.current) {
                    setFavouriteAreas(areas(favourites_data.data, "area_id"));
                }
            }
            catch (err) {
                console.log("Server internal error occurred!");
            }
        }

        fetchFavourites();
    }, [userId]);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                setLoadingAreas(true);
                const pageFix = areasLimit === "50" ? 1 : areasPage;
                const areas_data = await axios.get('/api/areas', {
                    params: {
                        page: pageFix,
                        limit: areasLimit
                    }
                });

                console.log("Areas Received: ", areas_data.data);
                if (componentIsMounted.current) {
                    setPagination({
                        startIndex: areas_data.data.startIndex,
                        endIndex: areas_data.data.endIndex,
                        total: areas_data.data.total
                    });

                    if (areas_data.data.results.length > 0) setAreas(areas_data.data.results);
                    setLoadingAreas(false);
                }
            }
            catch (err) {
                console.log("Server internal error occurred!");
            }
        }
        
        if(areasLimit === "50") {
            // console.log("Limit 50 !");
            setAreasPage(1);
        }

        fetchAreas();
    }, [areasPage, areasLimit]);

    function toggleOrder(attr) {
        //console.log(order);
        if (order.attr === attr) {
            if (order.sort === "desc") {
                setOrder({
                    attr: attr,
                    sort: "asc"
                });
            }
            else {
                setOrder({
                    attr: attr,
                    sort: "desc"
                });
            }
        }
        else {
            setOrder({
                attr: attr,
                sort: "asc"
            });
        }
    }

    function orderAreasData() {
        if (order.sort === "asc") {
            areas.sort((a, b) => {
                const result = a[order.attr].localeCompare(b[order.attr], 'en', { sensitivity: 'base' });
                return result;
            });
        }
        else {
            areas.sort((a, b) => {
                const result = b[order.attr].localeCompare(a[order.attr], 'en', { sensitivity: 'base' });
                return result;
            });
        }
    }

    function handleAddFavourite(target) {
        // console.log("Add Favourite Area: ", target.getAttribute("data-key"));
        setFavouriteAreas(previousData => [...previousData, target.id]);

        const newFavourite = {
            student: userId,
            area_id: target.id,
            area_name: target.getAttribute("data-key")
        };

        axios.post('/favourites', newFavourite)
            .then(res => {
                //   console.log("Area added to favourites successfully!");
                axios.get('/api/favourites/' + userId)
                    .then(favourites => {
                        // console.log("Add Favourite: ", favourites.data);
                        studentFavourites(favourites.data);
                    })
                    .catch(err => {
                        console.log("An error occurred: Couldn't update favourites!", err);
                    })
            })
            .catch(err => {
                console.log("An error occurred: Couldn't add favourite!", err);
            });
    }

    function handleRemoveFavourite(target) {
        // console.log("Remove Favourite Area: ", target.getAttribute("data-key"));
        const tempData = favouriteAreas.filter(id => { return id !== target.id });
        setFavouriteAreas(tempData);

        axios.delete('/favourites/', {
            params: {
                student: userId,
                area_id: target.id
            }
        })
            .then((data) => {
                //   console.log("Area deleted from favourites successfully!");
                axios.get('/api/favourites/' + userId)
                    .then(favourites => {
                        // console.log("Remove Favourite: ", favourites.data);
                        studentFavourites(favourites.data);
                    })
                    .catch(err => {
                        console.log("An error occurred: Couldn't update favourites!", err);
                    })
            })
            .catch((err) => {
                console.log("An error occurred: Couldn't remove favourite!", err);
            });
    }

    function renderAreasData() {
        const filtered_areas = areas.filter(area =>
            area.name.toLowerCase().includes(query.toLowerCase()) ||
            area.description.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered_areas.length) {
            orderAreasData();
            return filtered_areas.map((area, index) => {
                const { _id, name, description } = area;
                return (
                    <tr key={_id}>
                        <td className='table-data'>{pagination.startIndex + index + 1}</td>
                        <td className='table-data'>{name}</td>
                        <td className='table-data'>{description}</td>
                        <td className='table-data' align="center">
                            {
                                favouriteAreas.indexOf(_id) > -1 ?
                                    <button type="button" data-key={name} id={_id} className="btn btn-info accept-request" onClick={(e) => handleRemoveFavourite(e.target)} ><i className="fa fa-heart" data-key={name} id={_id}></i></button>
                                    : <button type="button" data-key={name} id={_id} className="btn btn-info accept-request" onClick={(e) => handleAddFavourite(e.target)} ><i className="far fa-heart" data-key={name} id={_id}></i></button>
                            }
                        </td>
                    </tr>
                )
            })
        }
        else {
            return emptyTable();
        }
    }

    function renderPageButtons(name) {
        const prev = "prev_" + name;
        const next = "next_" + name;

        return (
            <div className='page-select'>
                {pagination.startIndex > 0 && <span className={prev} onClick={(e) => { handlePrevPage(e.target.className) }}>Previous Page</span>}
                {pagination.endIndex < pagination.total && <span className={next} onClick={(e) => { handleNextPage(e.target.className) }}>Next Page</span>}
                <span className="page-number">Results {pagination.endIndex > pagination.total ? pagination.total : pagination.endIndex} out of {pagination.total}</span>
            </div>
        );
    }

    function handlePrevPage(name) {
        if (name === "prev_area") {
            setAreasPage(areasPage - 1);
            //console.log("Area: Previous Page!");
        }
        else {
            console.log("Server internal error occurred. Server failed to load page.")
        }
    }

    function handleNextPage(name) {
        if (name === "next_area") {
            setAreasPage(areasPage + 1);
            //console.log("Area: Next Page!");
        }
        else {
            console.log("Server internal error occurred. Server failed to load page.")
        }
    }

    function loadingTable(e) {
        return (
            <tr>
                <td className='loading-data' colSpan="100%"><p className='animated headShake infinite' style={{ marginBottom: '-0.1rem' }}>Loading Data...</p></td>
            </tr>
        );
    }

    function emptyTable(e) {
        return (
            <tr>
                <td className='empty-data' colSpan="100%">No Data Found</td>
            </tr>
        );
    }


    return (
        <div className='tables-data' style={{ marginTop: "1rem" }}>
            <h5>Available Areas</h5> <hr />
            <div className='areas-container'>
                <div className='filter-content'>
                    <div className="md-form md-outline input-with-pre-icon">
                        <i className="fa fa-search input-prefix" style={{ color: "#31b1e4" }}></i>
                        <input type="text"
                            id="search-areas"
                            className="form-control"
                            placeholder='Search'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Table className='areas-table' striped bordered hover size="md" responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th className='table-header'><span id='name' onClick={(e) => toggleOrder(e.target.id)}>Area Name</span></th>
                            <th className='table-header'><span id='description' onClick={(e) => toggleOrder(e.target.id)}>Description</span></th>
                            <th className='table-header' style={{ textAlign: "center" }}><span>Favourite</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            loadingAreas ? loadingTable() : (areas.length ? renderAreasData() : emptyTable())
                        }
                    </tbody>
                </Table>
                {
                    renderPageButtons("area")
                }
                <div className='dropdown-limit'>
                    <Form.Group controlId="selectControl">
                        <Form.Label className='page-limit-lbl'>Areas per page</Form.Label>
                        <Form.Control className='page-limit' as="select" onChange={(e) => { setAreasLimit(e.target.value); }}>
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </Form.Control>
                    </Form.Group>
                </div>
            </div>
        </div>
    )
}
