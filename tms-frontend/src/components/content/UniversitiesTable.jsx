import React, { useState, useEffect, useRef } from 'react';
import { Table, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import ConfirmationModal from '../content/ConfirmationModal';
import './content.css';

export default function UniversitiesArchive() {

  const [universities, setUniversities] = useState([]);
  const [universitiesPage, setUniversitiesPage] = useState(1);
  const [universitiesLimit, setUniversitiesLimit] = useState(10);
  const [loadingUniversities, setLoadingUniversities] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState("");
  const [message, setMessage] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showResponse, setShowResponse] = useState(true)
  const [path, setPath] = useState('')
  const [confirmationMessage, setConfirmationMessage] = useState('')

  const [pagination, setPagination] = useState({});

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "name",
    sort: "asc"
  });

  const componentIsMounted = useRef(true)
  useEffect(() => {
    return () => {
      componentIsMounted.current = false
    }
  }, []);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoadingUniversities(true);
        const universities_data = await axios.get('/api/universities', {
          params: {
            page: universitiesPage,
            limit: universitiesLimit
          }
        });

        //console.log(universities_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: universities_data.data.startIndex,
            endIndex: universities_data.data.endIndex,
            total: universities_data.data.total
          });

          if (universities_data.data.results.length > 0) setUniversities(universities_data.data.results);
          setLoadingUniversities(false);
        }
      }
      catch (err) {
        console.log("Server internal error occurred!");
      }
    }


    fetchUniversities();
  }, [universitiesPage, universitiesLimit, showResponse]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoadingUniversities(true);
        const universities_data = await axios.get('/api/universities', {
          params: {
            page: universitiesPage,
            limit: universitiesLimit
          }
        });

        //console.log(universities_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: universities_data.data.startIndex,
            endIndex: universities_data.data.endIndex,
            total: universities_data.data.total
          });

          if (universities_data.data.results.length > 0) setUniversities(universities_data.data.results);
          setLoadingUniversities(false);
        }
      }
      catch (err) {
        console.log("Server internal error occurred!");
      }
    }

    if(showResponse === "deleted"){
      setVariant("success")
      setMessage("University deleted successfully!");
      setShowAlert(true);

      setTimeout(() => { 
        setVariant("")
        setMessage("");
        setShowAlert(false);
      }, 2500)

      window.scroll({ top: 0, left: 0, behavior: 'smooth' });

      fetchUniversities()
      setShowResponse("")
    } else if(showResponse === "failed"){
      setVariant("danger")
      setMessage("Error! University deletion failed.");
      setShowAlert(true);

      setTimeout(() => { 
          setVariant("")
          setMessage("");
          setShowAlert(false);
      }, 2500)

      window.scroll({ top: 0, left: 0, behavior: 'smooth' });

      setShowResponse("");
    }
  }, [showResponse])

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

  function orderUniversitiesData() {
    if (order.sort === "asc") {
      universities.sort((a, b) => {
        const result = a[order.attr].localeCompare(b[order.attr], 'en', { sensitivity: 'base' });
        return result;
      });
    }
    else {
      universities.sort((a, b) => {
        const result = b[order.attr].localeCompare(a[order.attr], 'en', { sensitivity: 'base' });
        return result;
      });
    }
  }

  function showFeedback(id, color, message){
    document.getElementById(id+"info").style.display = "block";
    document.getElementById(id+"info").style.color = color;
    document.getElementById(id+"info").innerHTML = message
    setTimeout(() => {
      if(document.getElementById(id+"info"))
        document.getElementById(id+"info").style.display = "none";
    },2500)
  }

  async function updateUniversity(id){
    var newName = document.getElementById(id+"name").value
    var newCountry = document.getElementById(id+"country").value
    var index = universities.findIndex(university => university._id === id)

    if(index > -1){

      if(universities[index].name===newName && universities[index].country===newCountry){
        showFeedback(id, "blue", "Nothing to update.")
      } else if (newName === '' && newCountry === ''){
        showFeedback(id, "blue", "Please fill in the desired fields.")
      } else {

        if(newName === '')
          newName = document.getElementById(id+"name").placeholder
        
        if(newCountry === '')
          newCountry = document.getElementById(id+"country").placeholder

        //update
        await axios.patch('/universities/'+id, {
          name: newName,
          country: newCountry
        })
        .then((res) => {
          console.log("University updated successfully.")
          showFeedback(id, "green", "Successful update!")
        })
        .catch(() => {
          console.log("Failed to update.")
          showFeedback(id, "red", "Failed to update!")
        })
      }
    } else {
      console.log("something went wrong")
      return;
    }
  }

  async function deleteUniversity(universityId){
    const index = universities.findIndex((university) => university._id===universityId)
    setPath('/universities/'+universityId)
    setConfirmationMessage("Do you want to delete "+universities[index].name+" ?")
    setShowConfirmation(true)
  }

  function renderUniversitiesData() {
    const filtered_universities = universities.filter(university =>
      university.name.toLowerCase().includes(query.toLowerCase()) ||
      university.country.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered_universities.length) {
      orderUniversitiesData();
      return filtered_universities.map((university, index) => {
        const { _id, name, country } = university;
        return (
          <tr key={_id}>
            <td className='table-data'>{pagination.startIndex + index + 1}</td>
            <td className='table-data'>
              <input type="text" id={_id+"name"} data-key={_id} className="editable-data" placeholder={name} size={30} autoComplete="off" />
            </td>
            <td className='table-data'>
              <input type="text" id={_id+"country"} data-key={_id} className="editable-data" placeholder={country} size={15} autoComplete="off" />
            </td>
            <td className='table-data' style={{width: "4vw"}}>
              <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                  <button type="button" data-key={_id} className="btn btn-info accept-request" onClick={() => updateUniversity(_id)} >Update</button>
                  <button type="button" data-key={_id} className="btn btn-danger decline-request" onClick={() => deleteUniversity(_id)} >Delete</button>
                  
              </div>
              <div style={{display: "block"}}>
                <b><small className="infoUpdateUser" id={_id+"info"} style={{display: "none"}}></small></b>
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
    if (name === "prev_university") {
      setUniversitiesPage(universitiesPage - 1);
      //console.log("University: Previous Page!");
    }
    else {
      console.log("Server internal error occurred. Server failed to load page.")
    }
  }

  function handleNextPage(name) {
    if (name === "next_university") {
      setUniversitiesPage(universitiesPage + 1);
      //console.log("University: Next Page!");
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
      <ConfirmationModal 
        show={showConfirmation} 
        setShow={(data) => setShowConfirmation(data)} 
        path={path} 
        setResponse={(res) => setShowResponse(res)} 
        message={confirmationMessage}
      />
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
      <div className='universities-container'>
        <div className='filter-content'>
          <div className="md-form md-outline input-with-pre-icon">
            <i className="fa fa-search input-prefix" style={{ color: "#31b1e4" }}></i>
            <input type="text"
              id="search-universities"
              className="form-control"
              placeholder='Search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <Table className='universities-table' striped bordered hover size="md" responsive>
          <thead>
            <tr>
              <th>#</th>
              <th className='table-header'><span id='name' onClick={(e) => toggleOrder(e.target.id)}>University Name</span></th>
              <th className='table-header'><span id='country' onClick={(e) => toggleOrder(e.target.id)}>Country</span></th>
              <th className='table-header' style={{ textAlign: "center" }}><span>Action</span></th>
            </tr>
          </thead>
          <tbody>
            {
              loadingUniversities ? loadingTable() : (universities.length ? renderUniversitiesData() : emptyTable())
            }
          </tbody>
        </Table>
        {
          renderPageButtons("university")
        }
        <div className='dropdown-limit'>
          <Form.Group controlId="selectControl">
            <Form.Label className='page-limit-lbl'>Universities per page</Form.Label>
            <Form.Control className='page-limit' as="select" onChange={(e) => { setUniversitiesLimit(e.target.value); }}>
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
