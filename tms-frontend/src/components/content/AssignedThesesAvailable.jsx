import React, { useState, useEffect, useRef } from 'react';
import { Table, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import ConfirmationModal from '../content/ConfirmationModal';
import './content.css';

export default function AssignedThesesAvailable({ userId }) {

  const [theses, setTheses] = useState([]);
  const [thesesPage, setThesesPage] = useState(1);
  const [thesesLimit, setThesesLimit] = useState(10);
  const [loadingTheses, setLoadingTheses] = useState(false);

  const [pagination, setPagination] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState("info");
  const [message, setMessage] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResponse, setShowResponse] = useState("");
  const [path, setPath] = useState("");

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "title",
    sort: "asc"
  });

  let updateThesis = [];

  const componentIsMounted = useRef(true)
  useEffect(() => {

    return () => {
      componentIsMounted.current = true
      // componentIsMounted.current = false
    }
  }, []);

  useEffect(() => {
    const fetchTheses = async () => {
      try {
        setLoadingTheses(true);
        const theses_data = await axios.get('/api/data/assigned_theses', {
          params: {
            page: thesesPage,
            limit: thesesLimit
          }
        });

        // console.log("Assigned Theses: ",theses_data.data.results);
        if (componentIsMounted.current) {
          // console.log(theses_data.data);
          setPagination({
            startIndex: theses_data.data.startIndex,
            endIndex: theses_data.data.endIndex,
            total: theses_data.data.total
          });

          if (theses_data.data.results.length > 0) setTheses(theses_data.data.results);
          setLoadingTheses(false);
        }
      }
      catch (err) {
        console.log("Server internal error occurred!");
      }
    }

    fetchTheses();
  }, [thesesPage, thesesLimit, userId]);

  useEffect(() => {
    if (showResponse === "deleted") {
      const fetchTheses = async () => {
        try {
          setLoadingTheses(true);
          const theses_data = await axios.get('/api/data/assigned_theses', {
            params: {
              page: thesesPage,
              limit: thesesLimit
            }
          });

          // console.log("Assigned Theses: ",theses_data.data.results);
          if (componentIsMounted.current) {
            // console.log(theses_data.data);
            if (theses_data.data.results.length > 0) setTheses(theses_data.data.results);
            setLoadingTheses(false);
          }
        }
        catch (err) {
          console.log("Server internal error occurred!");
        }
      }

      setVariant("success")
      setMessage("Assigned Thesis deleted successfully!");
      setShowAlert(true);

      fetchTheses();
      setShowResponse("");
    }
    else if (showResponse === "failed") {
      setVariant("danger")
      setMessage("Error! Assigned Thesis deletion failed.");
      setShowAlert(true);

      setShowResponse("");
    }
  }, [thesesPage, thesesLimit, showResponse]);

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

  function orderThesesData() {
    if (order.sort === "asc") {
      theses.sort((a, b) => {
        let result = null;
        if (a[order.attr] && b[order.attr]) result = a[order.attr].localeCompare(b[order.attr], 'en', { sensitivity: 'base' });
        return result;
      });
    }
    else {
      theses.sort((a, b) => {
        let result = null;
        if (a[order.attr] && b[order.attr]) result = b[order.attr].localeCompare(a[order.attr], 'en', { sensitivity: 'base' });
        return result;
      });
    }
  }

  function handleInputChange(target) {
    // console.log("Target: ", target.name, " value: ", target.value);
    // console.log("Data Key: ", target.getAttribute("data-key"));
    if (updateThesis.length > 0) {
      const index = updateThesis.findIndex(update => update.thesisId === target.getAttribute("data-key"));
      if (index > -1) {
        updateThesis[index][target.name] = target.value;
      }
      else {
        const newUpdate = {
          thesisId: target.getAttribute("data-key"),
          studentId: target.id
        };

        newUpdate[target.name] = target.value
        updateThesis.push(newUpdate);
      }
    }
    else {
      const newUpdate = {
        thesisId: target.getAttribute("data-key"),
        studentId: target.id
      };

      newUpdate[target.name] = target.value
      updateThesis.push(newUpdate);
    }
  }

  function handleCellUpdate(target) {
    // console.log("Update id: ", target.getAttribute("data-key"));
    const index = updateThesis.findIndex(update => update.thesisId === target.getAttribute("data-key"));
    // console.log("Found Index: ", index);
    if (index > -1) {
      const fetchTheses = async () => {
        try {
          setLoadingTheses(true);
          const theses_data = await axios.get('/api/data/assigned_theses', {
            params: {
              page: thesesPage,
              limit: thesesLimit
            }
          });

          // console.log("Assigned Theses: ",theses_data.data.results);
          if (componentIsMounted.current) {
            // console.log(theses_data.data);
            if (theses_data.data.results.length > 0) setTheses(theses_data.data.results);
            setLoadingTheses(false);
          }
        }
        catch (err) {
          console.log("Server internal error occurred!");
        }
      }

      try {
        // console.log("Theses Data: ", updateThesis);
        axios.patch('/api/assigned_theses/' + updateThesis[index].studentId,
          {
            attr: "status",
            value: updateThesis[index].thesis_status
          })
          .then((data) => {
            fetchTheses();
          })
          .catch((err) => {
            console.log(err);
          });
      }
      catch (err) {
        console.log("Thesis failed to update!");
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
    const thesis = target.getAttribute("data-key");
    setPath("/api/assigned_theses/" + thesis);
    setShowConfirmation(true);
  }

  function renderThesesData() {
    
    const filtered_theses = theses.filter(thesis =>
      thesis.thesis_title.toLowerCase().includes(query.toLowerCase()) ||
      thesis.thesis_topic.toLowerCase().includes(query.toLowerCase()) ||
      thesis.thesis_area.toLowerCase().includes(query.toLowerCase()) ||
      thesis.thesis_group.toLowerCase().includes(query.toLowerCase()) ||
      thesis.student_email.toLowerCase().includes(query.toLowerCase()) ||
      thesis.professor_email.toLowerCase().includes(query.toLowerCase()) ||
      thesis.thesis_status.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered_theses.length) {
      orderThesesData();
      return filtered_theses.map((find_thesis, index) => {
        const { _id, date, thesis_title, thesis_topic, thesis_area, thesis_group, student_id, student_email, student_name, professor_email, professor_name, supervisor_email, supervisor_name, thesis_status } = find_thesis;
        
        return (
          <tr key={_id}>
            <td className='table-data'>
              <span style={{ fontSize: "0.85rem" }}>
                {new Intl.DateTimeFormat("en-GB", {
                  year: "numeric",
                  month: "numeric",
                  day: "2-digit"
                  // hour: 'numeric', minute: 'numeric', second: 'numeric',
                  // hour12: false
                }).format(new Date(date))}
              </span>
            </td>
            <td className='table-data'>{thesis_title}</td>
            <td className='table-data'>{thesis_topic}</td>
            <td className='table-data'>{thesis_area}</td>
            <td className='table-data'>{thesis_group}</td>
            <td className='table-data' data-toggle="tooltip" data-placement="right" title={student_name}>{student_email}</td>
            <td className='table-data' data-toggle="tooltip" data-placement="right" title={professor_name}>{professor_email}</td>
            <td className='table-data' data-toggle="tooltip" data-placement="right" title={supervisor_name}>
              <ul>
                {supervisor_email.map((supervisor) => {
                  return(
                    <li key={supervisor}>
                      {supervisor}
                    </li>
                  )
                })}
              </ul>
            </td>
            <td>
              {/* <input type="text" name="thesis_status" id={student_id} data-key={_id} className="editable-data" placeholder={thesis_status} size={thesis_status.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} /> */}
              <select className="editable-data" name="thesis_status" id={student_id} data-key={_id} defaultValue={thesis_status} onChange={(e) => handleInputChange(e.target)} >
                <option value="active">active</option> 
                <option value="inactive">inactive</option>
                <option value="completed">completed</option>
                <option value="graded">graded</option>
                <option value="archived">archived</option>
              </select>
            </td>
            <td className='table-data' align="center">
              <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                <button type="button" data-key={_id} className="btn btn-info accept-request" onClick={(e) => handleCellUpdate(e.target)} >Update</button>
                <button type="button" data-key={_id} className="btn btn-danger decline-request" onClick={(e) => handleCellDelete(e.target)} >Delete</button>
              </div>
            </td>
          </tr>
        )
      });
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
    if (name === "prev_thesis") {
      setThesesPage(thesesPage - 1);
      //console.log("Thesis: Previous Page!");
    }
    else {
      console.log("Server internal error occurred. Server failed to load page.")
    }
  }

  function handleNextPage(name) {
    if (name === "next_thesis") {
      setThesesPage(thesesPage + 1);
      //console.log("Thesis: Next Page!");
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
      <div className='theses-container'>
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
              id="search-theses"
              className="form-control"
              placeholder='Search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <Table className='theses-table' striped bordered hover size="md" responsive>
          <thead>
            <tr>
              <th className='table-header'><span id='date' onClick={(e) => toggleOrder(e.target.id)}>Date</span></th>
              <th className='table-header'><span id='thesis_title' onClick={(e) => toggleOrder(e.target.id)}>Thesis Title</span></th>
              <th className='table-header'><span id='thesis_topic' onClick={(e) => toggleOrder(e.target.id)}>Thesis Topic</span></th>
              <th className='table-header'><span id='thesis_area' onClick={(e) => toggleOrder(e.target.id)}>Thesis Area</span></th>
              <th className='table-header'><span id='thesis_group' onClick={(e) => toggleOrder(e.target.id)}>Group</span></th>
              <th className='table-header'><span id='student_email' onClick={(e) => toggleOrder(e.target.id)}>Student</span></th>
              <th className='table-header'><span id='professor_email' onClick={(e) => toggleOrder(e.target.id)}>Professor</span></th>
              <th className='table-header'><span id='supervisor_email' onClick={(e) => toggleOrder(e.target.id)}>Supervisors</span></th>
              <th className='table-header'><span id='thesis_status' onClick={(e) => toggleOrder(e.target.id)}>Status</span><i className="fa fa-edit edit-input-icon"></i></th>
              <th className='table-header' style={{ textAlign: "center" }}><span>Action</span></th>
            </tr>
          </thead>
          <tbody>
            {
              loadingTheses ? loadingTable() : (theses.length ? renderThesesData() : emptyTable())
            }
          </tbody>
        </Table>
        {
          renderPageButtons("thesis")
        }
        <div className='dropdown-limit'>
          <Form.Group controlId="selectControl">
            <Form.Label className='page-limit-lbl'>Theses per page</Form.Label>
            <Form.Control className='page-limit' as="select" onChange={(e) => { setThesesLimit(e.target.value); }}>
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
