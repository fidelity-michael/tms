import React, { useState, useEffect, useRef } from 'react';
import { Table, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import ConfirmationModal from '../content/ConfirmationModal';
import './content.css';

export default function ThesesTable({ userId, userGroup }) {

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
      componentIsMounted.current = false
    }
  }, []);

  useEffect(() => {
    const fetchTheses = async () => {
      let theses_data = null;
      try {
        setLoadingTheses(true);
        if (userGroup === "Administrator") {
          theses_data = await axios.get('/api/theses/', {
            params: {
              page: thesesPage,
              limit: thesesLimit
            }
          });
        }
        else {
          theses_data = await axios.get('/api/theses/' + userId, {
            params: {
              page: thesesPage,
              limit: thesesLimit,
              user: "professor"
            }
          });
        }

        //console.log(theses_data.data);
        if (componentIsMounted.current) {
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
  }, [thesesPage, thesesLimit, userId, userGroup]);

  useEffect(() => {
    if (showResponse === "deleted") {
      const fetchTheses = async () => {
        let theses_data = null;
        try {
          setLoadingTheses(true);
          if (userGroup === "Administrator") {
            theses_data = await axios.get('/api/theses/', {
              params: {
                page: thesesPage,
                limit: thesesLimit
              }
            });
          }
          else {
            theses_data = await axios.get('/api/theses/' + userId, {
              params: {
                page: thesesPage,
                limit: thesesLimit,
                user: "professor"
              }
            });
          }

          //console.log(theses_data.data);
          if (componentIsMounted.current) {
            if (theses_data.data.results.length > 0) setTheses(theses_data.data.results);
            setLoadingTheses(false);
          }
        }
        catch (err) {
          console.log("Server internal error occurred!");
        }
      }

      setVariant("success")
      setMessage("Thesis deleted successfully!");
      setShowAlert(true);

      setTimeout(() => { 
        setMessage("")
        setVariant("")
        setShowAlert(false);
      }, 3000)

      fetchTheses();
      setShowResponse("");
    }
    else if (showResponse === "failed") {
      setVariant("danger")
      setMessage("Error! Thesis deletion failed.");
      setShowAlert(true);

      setTimeout(() => { 
        setMessage("")
        setVariant("")
        setShowAlert(false);
      }, 3000)
      
      setShowResponse("");
    }
  }, [thesesPage, thesesLimit, showResponse, userId, userGroup]);


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
          thesisId: target.getAttribute("data-key")
        };

        newUpdate[target.name] = target.value
        updateThesis.push(newUpdate);
      }
    }
    else {
      const newUpdate = {
        thesisId: target.getAttribute("data-key")
      };

      newUpdate[target.name] = target.value
      updateThesis.push(newUpdate);
    }
  }

  function handleCellUpdate(target, id) {
    // console.log("Update id: ", target.getAttribute("data-key"));
    const index = updateThesis.findIndex(update => update.thesisId === target.getAttribute("data-key"));
    // console.log("Found Index: ", index);
    if (index > -1) {
      const fetchTheses = async () => {
        let theses_data = null;
        try {
          setLoadingTheses(true);
          if (userGroup === "Administrator") {
            theses_data = await axios.get('/api/theses/', {
              params: {
                page: thesesPage,
                limit: thesesLimit
              }
            });
          }
          else {
            theses_data = await axios.get('/api/theses/' + userId, {
              params: {
                page: thesesPage,
                limit: thesesLimit,
                user: "professor"
              }
            });
          }

          //console.log(theses_data.data);
          if (componentIsMounted.current) {
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
        const thesisKeys = Object.keys(updateThesis[index]);
        // console.log("Keys: ", thesisKeys);
        thesisKeys.map(key => {
          axios.patch('/theses/' + target.getAttribute("data-key"), {
            attr: key,
            value: updateThesis[index][key]
          })
            .then((data) => {

              setVariant("success")
              setMessage("Successfull Update");
              setShowAlert(true);
        
              setTimeout(() => { 
                setMessage("")
                setVariant("")
                setShowAlert(false);
              }, 3000)
        
              window.scroll({ top: 0, left: 0, behavior: 'smooth' });

              fetchTheses();
            })
            .catch((err) => {
              console.log(err);
            });

          return key;
        });
      }
      catch (err) {
        console.log("Thesis failed to update!");
      }
    }
    else {
      /*
      // alert("Please fill desired cells before you proceed");
      setVariant("info")
      setMessage("Info! Please fill desired cells before you proceed.");
      setShowAlert(true);

      setTimeout(() => { 
        setMessage("")
        setVariant("")
        setShowAlert(false);
      }, 3000)

      window.scroll({ top: 0, left: 0, behavior: 'smooth' });*/
      
      
      document.getElementById(id+"info").innerHTML="Please fill in desired cells."
        document.getElementById(id+"info").style.color = "blue"
        setTimeout(() => { 
            document.getElementById(id+"info").innerHTML="" 
        }, 2000);
    }
  }

  function handleCellDelete(target) {
    const thesis = target.getAttribute("data-key");
    setPath("/theses/" + thesis);
    setShowConfirmation(true);
  }

  function renderThesesData() {
    const filtered_theses = theses.filter(thesis =>
      thesis.title.toLowerCase().includes(query.toLowerCase()) ||
      thesis.topic.toLowerCase().includes(query.toLowerCase()) ||
      thesis.area.toLowerCase().includes(query.toLowerCase()) ||
      thesis.prerequisites.toLowerCase().includes(query.toLowerCase()) ||
      thesis.professor_email.toLowerCase().includes(query.toLowerCase()) ||
      thesis.group.toLowerCase().includes(query.toLowerCase()) ||
      thesis.status.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered_theses.length) {
      orderThesesData();
      return filtered_theses.map((thesis) => {
        const { _id, date, title, topic, area, professor_email, professor_name, prerequisites, group, status } = thesis;
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
            <td className='table-data'>
              <input type="text" name="title" data-key={_id} className="editable-data" placeholder={title} size={title.length + 2} autoComplete="off" onChange={(e) => handleInputChange(e.target)} />
            </td>
            <td className='table-data'>
              <input type="text" name="topic" data-key={_id} className="editable-data" placeholder={topic} size={topic.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} />
            </td>
            <td className='table-data'>
              <input type="text" name="area" data-key={_id} className="editable-data" placeholder={area} size={area.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} />
            </td>
            {
              userGroup === "Administrator" ?
                <td className='table-data' data-toggle="tooltip" data-placement="right" title={professor_name}>{professor_email}</td>
                : null
            }
            <td className='table-data'>
              <input type="text" name="prerequisites" data-key={_id} className="editable-data" placeholder={prerequisites.length > 0 ? prerequisites : "No Prerequisites"} size={prerequisites.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} />
            </td>
            <td className='table-data'>
              {/* <input type="text" name="group" data-key={_id} className="editable-data" placeholder={group} size={group.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} /> */}
              <select className="editable-data" name="group" data-key={_id} defaultValue={group} onChange={(e) => handleInputChange(e.target)} >
                <option value="BSc">BSc</option> 
                <option value="MSc">MSc</option>
                <option value="PhD">PhD</option>
              </select>
            </td>
            <td className='table-data'>
              {/* <input type="text" name="status" data-key={_id} className="editable-data" placeholder={status} size={status.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} /> */}
              <select className="editable-data" name="status" data-key={_id} defaultValue={status} onChange={(e) => handleInputChange(e.target)} >
                <option value="active">active</option> 
                <option value="inactive">inactive</option>
              </select>
            </td>
            <td className='table-data' align="center">
              <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                <button type="button" data-key={_id} className="btn btn-info accept-request" onClick={(e) => handleCellUpdate(e.target, _id)} >Update</button>
                <button type="button" data-key={_id} className="btn btn-danger decline-request" onClick={(e) => handleCellDelete(e.target)} >Delete</button>
              </div>
              <div>
                <b><small className="infoUpdateUser" id={_id+"info"} style={{marginTop: "1.3vh", float: "left"}}></small></b>
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
              <th className='table-header'><span id='title' onClick={(e) => toggleOrder(e.target.id)}>Thesis Title</span><i className="fa fa-edit edit-input-icon"></i></th>
              <th className='table-header'><span id='topic' onClick={(e) => toggleOrder(e.target.id)}>Thesis Topic</span><i className="fa fa-edit edit-input-icon"></i></th>
              <th className='table-header'><span id='area' onClick={(e) => toggleOrder(e.target.id)}>Thesis Area</span><i className="fa fa-edit edit-input-icon"></i></th>
              {
                userGroup === "Administrator" && <th className='table-header'><span id='professor_email' onClick={(e) => toggleOrder(e.target.id)}>Professor</span></th>
              }
              <th className='table-header'><span id='prerequisites' onClick={(e) => toggleOrder(e.target.id)}>Prerequisites</span><i className="fa fa-edit edit-input-icon"></i></th>
              <th className='table-header'><span id='group' onClick={(e) => toggleOrder(e.target.id)}>Group</span><i className="fa fa-edit edit-input-icon"></i></th>
              <th className='table-header'><span id='status' onClick={(e) => toggleOrder(e.target.id)}>Status</span><i className="fa fa-edit edit-input-icon"></i></th>
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
