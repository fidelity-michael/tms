import React, { useState, useEffect, useRef } from 'react';
import { Table, Form } from 'react-bootstrap';
import axios from 'axios';
import './content.css';

export default function ActiveThesesTable({ userId, group, thesesApplied, applyThesis }) {
  const [theses, setTheses] = useState([]);
  const [thesesPage, setThesesPage] = useState(1);
  const [thesesLimit, setRequestsLimit] = useState(10);
  const [loadingTheses, setLoadingTheses] = useState(false);

  const [pagination, setPagination] = useState({});

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "thesis",
    sort: "asc"
  });

  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = true
      // componentIsMounted.current = false
    }
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // console.log("User Group: ", group);
        setLoadingTheses(true);
        const theses_data = await axios.get('/api/data/theses', {
          params: {
            page: thesesPage,
            limit: thesesLimit,
            attr: "status",
            filter: "active"
          }
        });

        if (componentIsMounted.current) {
          // console.log("Theses: ", theses_data.data);
          setPagination({
            startIndex: theses_data.data.startIndex,
            endIndex: theses_data.data.endIndex,
            total: theses_data.data.total
          });

          if (theses_data.data.results.length > 0) {
            // console.log(theses_data.data.results)
            setTheses(theses_data.data.results);
          }
          setLoadingTheses(false);
        }
      }
      catch (err) {
        console.log("Server internal error occurred!");
      }
    }

    fetchRequests();
  }, [thesesPage, thesesLimit, group]);

  function toggleOrder(attr) {
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

  function orderRequestsData() {
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

  function renderRequestsData() {
    const filtered_requests = theses.filter(thesis =>
      thesis.title.toLowerCase().includes(query.toLowerCase()) ||
      thesis.topic.toLowerCase().includes(query.toLowerCase()) ||
      thesis.group.toLowerCase().includes(query.toLowerCase()) ||
      thesis.prerequisites.toLowerCase().includes(query.toLowerCase()) ||
      thesis.description.toLowerCase().includes(query.toLowerCase()) ||
      thesis.professor_email.toLowerCase().includes(query.toLowerCase())
      // thesis.status.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered_requests.length) {
      orderRequestsData();
      return filtered_requests.map((thesis) => {
        const { _id, date, title, topic, group, prerequisites, description, professor_email, professor_name } = thesis;
        return (
          <tr key={_id}>
            <td className='table-data-thesis'>
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
            <td className='table-data-thesis'>{title}</td>
            <td className='table-data-thesis'>{topic}</td>
            <td className='table-data-thesis'>{prerequisites.length > 0 ? prerequisites : "No Prerequisites"}</td>
            <td className='table-data-thesis'>
              {
                description.length > 0 ? description : "No Description"
              }
            </td>
            <td className='table-data-thesis' data-toggle="tooltip" data-placement="right" title={professor_name}>{professor_email}</td>
            <td className='table-data-thesis'>{group}</td>
            {/* <td className='table-data'>{status}</td> */}
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
        <Table className='table-thesis' striped bordered hover size="md" responsive>
          <thead>
            <tr>
              <th className='table-header-thesis'><span id='date' onClick={(e) => toggleOrder(e.target.id)}>Date</span></th>
              <th className='table-header-thesis'><span id='title' onClick={(e) => toggleOrder(e.target.id)}>Thesis Title</span></th>
              <th className='table-header-thesis'><span id='topic' onClick={(e) => toggleOrder(e.target.id)}>Thesis Topic</span></th>
              <th className='table-header-thesis'><span id='prerequisites' onClick={(e) => toggleOrder(e.target.id)}>Prerequisites</span></th>
              <th className='table-header-thesis'><span id='description'>Description</span></th>
              <th className='table-header-thesis'><span id='professor_email' onClick={(e) => toggleOrder(e.target.id)}>Professor</span></th>
              <th className='table-header-thesis'><span id='group' onClick={(e) => toggleOrder(e.target.id)}>Group</span></th>
              {/* <th className='table-header'><span id='status' onClick={(e) => toggleOrder(e.target.id)}>Status</span></th> */}
            </tr>
          </thead>
          <tbody>
            {
              loadingTheses ? loadingTable() : (theses.length ? renderRequestsData() : emptyTable())
            }
          </tbody>
        </Table>
        {
          renderPageButtons("thesis")
        }
        <div className='dropdown-limit'>
          <Form.Group controlId="selectControl">
            <Form.Label className='page-limit-lbl'>Theses per page</Form.Label>
            <Form.Control className='page-limit' as="select" onChange={(e) => { setRequestsLimit(e.target.value); }}>
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
