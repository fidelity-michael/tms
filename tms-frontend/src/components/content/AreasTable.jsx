import React, { useState, useEffect, useRef } from 'react';
import { Table, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import ConfirmationModal from '../content/ConfirmationModal';
import './content.css';

export default function AreasTable() {

  const [areas, setAreas] = useState([]);
  const [areasPage, setAreasPage] = useState(1);
  const [areasLimit, setAreasLimit] = useState("10");
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [pagination, setPagination] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState("info");
  const [message, setMessage] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResponse, setShowResponse] = useState("");
  const [path, setPath] = useState("");

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "name",
    sort: "asc"
  });

  let updateArea = [];

  const componentIsMounted = useRef(true)
  useEffect(() => {
    return () => {
      componentIsMounted.current = true
      // componentIsMounted.current = false
    }
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoadingAreas(true);
        const pageFix = areasLimit === "50" ? 1 : areasPage;
        const areas_data = await axios.get('/api/data/areas', {
          params: {
            page: pageFix,
            limit: areasLimit
          }
        });

        //console.log(areas_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: areas_data.data.startIndex,
            endIndex: areas_data.data.endIndex,
            total: areas_data.data.total
          });

          if (areas_data.data.results.length > 0) {
            setAreas(areas_data.data.results);
          }
          setLoadingAreas(false);
        }
      }
      catch (err) {
        console.log("Server internal error occurred!");
      }
    }

    if (areasLimit === "50") {
      // console.log("Limit 50 !");
      setAreasPage(1);
    }

    fetchAreas();
  }, [areasPage, areasLimit]);

  useEffect(() => {
    if (showResponse === "deleted") {
      const fetchAreas = async () => {
        try {
          setLoadingAreas(true);
          const areas_data = await axios.get('/api/data/areas', {
            params: {
              page: areasPage,
              limit: areasLimit
            }
          });

          if (componentIsMounted.current) {
            if (areas_data.data.results.length > 0) setAreas(areas_data.data.results);
            setLoadingAreas(false);
          }
        }
        catch (err) {
          console.log("Server internal error occurred!");
        }
      }

      setVariant("success")
      setMessage("Area deleted successfully!");
      setShowAlert(true);

      fetchAreas();
      setShowResponse("");
    }
    else if (showResponse === "failed") {
      setVariant("danger")
      setMessage("Error! Area deletion failed.");
      setShowAlert(true);

      setShowResponse("");
    }
  }, [areasPage, areasLimit, showResponse]);

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

  function handleInputChange(target) {
    // console.log("Target: ", target.name, " value: ", target.value);
    // console.log("Data Key: ", target.getAttribute("data-key"));
    if (updateArea.length > 0) {
      const index = updateArea.findIndex(update => update.areaId === target.getAttribute("data-key"));
      if (index > -1) {
        updateArea[index][target.name] = target.value;
      }
      else {
        const newUpdate = {
          areaId: target.getAttribute("data-key")
        };

        newUpdate[target.name] = target.value
        updateArea.push(newUpdate);
      }
    }
    else {
      const newUpdate = {
        areaId: target.getAttribute("data-key")
      };

      newUpdate[target.name] = target.value
      updateArea.push(newUpdate);
    }
  }

  function handleCellUpdate(target) {
    // console.log("Update id: ", target.getAttribute("data-key"));
    const index = updateArea.findIndex(update => update.areaId === target.getAttribute("data-key"));
    // console.log("Found Index: ", index);
    if (index > -1) {
      const fetchAreas = async () => {
        try {
          setLoadingAreas(true);
          const areas_data = await axios.get('/api/data/areas', {
            params: {
              page: areasPage,
              limit: areasLimit
            }
          });

          if (componentIsMounted.current) {
            if (areas_data.data.results.length > 0) setAreas(areas_data.data.results);
            setLoadingAreas(false);
          }
        }
        catch (err) {
          console.log("Server internal error occurred!");
        }
      }

      try {
        // console.log("Areas Data: ", updateArea);
        const areaKeys = Object.keys(updateArea[index]);
        // console.log("Keys: ", areaKeys);

        areaKeys.map(key => {
          // console.log(key);
          axios.patch('/api/areas/' + target.getAttribute("data-key"), {
            attr: key,
            value: updateArea[index][key]
          })
            .then((data) => {
              fetchAreas();
            })
            .catch((err) => {
              console.log(err);
            });

          return key;
        });
      }
      catch (err) {
        console.log("Area failed to update!");
      }
    }
    else {
      // alert("Please fill desired cells before you proceed");
      setVariant("info")
      setMessage("Info! Please fill desired cells before you proceed.");
      setShowAlert(true);

      window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    }
  }

  function handleCellDelete(target) {
    const area = target.getAttribute("data-key");
    setPath("/api/areas/" + area);
    setShowConfirmation(true);
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
            <td className='table-data'>
              <input type="text" name="name" data-key={_id} className="editable-data" placeholder={name} size={name.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} />
            </td>
            <td className='table-data'>
              <input type="text" name="description" data-key={_id} className="editable-data" placeholder={description} size={description.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} />
            </td>
            <td className='table-data' align="center">
              <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                <button type="button" data-key={_id} className="btn btn-info accept-request" onClick={(e) => handleCellUpdate(e.target)} >Update</button>
                <button type="button" data-key={_id} className="btn btn-danger decline-request" onClick={(e) => handleCellDelete(e.target)} >Delete</button>
              </div>
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
    <div className='tables-data'>
      <h5>Areas Table</h5> <hr />
      <div className='areas-container'>
        <ConfirmationModal show={showConfirmation} setShow={(data) => setShowConfirmation(data)} path={path} setResponse={(res) => setShowResponse(res)} />
        <Alert
          key={"update_cellKey"}
          variant={variant}
          show={showAlert}
          onClose={(e) => setShowAlert(false)}
          transition={false}
          dismissible
        >
          {message}
        </Alert>
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
              <th className='table-header'><span id='name' onClick={(e) => toggleOrder(e.target.id)}>Area Name</span><i className="fa fa-edit edit-input-icon"></i></th>
              <th className='table-header'><span id='description' onClick={(e) => toggleOrder(e.target.id)}>Description</span><i className="fa fa-edit edit-input-icon"></i></th>
              <th className='table-header' style={{ textAlign: "center" }}><span>Action</span></th>
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
