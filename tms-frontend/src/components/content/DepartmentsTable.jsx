import React, { useState, useEffect, useRef } from 'react';
import { Table, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import ConfirmationModal from '../content/ConfirmationModal';
import './content.css';

export default function DepartmentsArchive() {

    const [departments, setDepartments] = useState([]);
    const [departmentsPage, setDepartmentsPage] = useState(1);
    const [departmentsLimit, setDepartmentsLimit] = useState(10);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

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
            componentIsMounted.current = true
            // componentIsMounted.current = false
        }
    }, []);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoadingDepartments(true);
                const departments_data = await axios.get('/api/data/departments', {
                    params: {
                        page: departmentsPage,
                        limit: departmentsLimit
                    }
                });

                //console.log(departments_data.data);
                if (componentIsMounted.current) {
                    setPagination({
                        startIndex: departments_data.data.startIndex,
                        endIndex: departments_data.data.endIndex,
                        total: departments_data.data.total
                      });
                      
                    if (departments_data.data.results.length > 0) {
                        setDepartments(departments_data.data.results);
                    }
                    setLoadingDepartments(false);
                }
            }
            catch (err) {
                console.log("Server internal error occurred!");
            }
        }

        fetchDepartments();
    }, [departmentsPage, departmentsLimit]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoadingDepartments(true);
                const departments_data = await axios.get('/api/data/departments', {
                    params: {
                        page: departmentsPage,
                        limit: departmentsLimit
                    }
                });

                //console.log(departments_data.data);
                if (componentIsMounted.current) {
                    setPagination({
                        startIndex: departments_data.data.startIndex,
                        endIndex: departments_data.data.endIndex,
                        total: departments_data.data.total
                      });
                      
                    if (departments_data.data.results.length > 0) {
                        setDepartments(departments_data.data.results);
                    }
                    setLoadingDepartments(false);
                }
            }
            catch (err) {
                console.log("Server internal error occurred!");
            }
        }
        if(showResponse === "deleted"){
          setVariant("success")
          setMessage("Department deleted successfully!");
          setShowAlert(true);
    
          setTimeout(() => { 
            setVariant("")
            setMessage("");
            setShowAlert(false);
          }, 2500)
    
          window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    
          fetchDepartments()
          setShowResponse("")
        } else if(showResponse === "failed"){
          setVariant("danger")
          setMessage("Error! Department deletion failed.");
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

    function orderDepartmentsData() {
        if (order.sort === "asc") {
            departments.sort((a, b) => {
                const result = a[order.attr].localeCompare(b[order.attr], 'en', { sensitivity: 'base' });
                return result;
            });
        }
        else {
            departments.sort((a, b) => {
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

    async function updateDepartment(id){
        
        var newName = document.getElementById(id+"name").value
        var newUniversity = document.getElementById(id+"university").value
        var newEmail = document.getElementById(id+"email").value
        var newPhone = document.getElementById(id+"phone").value

        var index = departments.findIndex(department => department._id === id)

        if(index > -1){
            if( departments[index].name===newName               && 
                departments[index].university===newUniversity   &&
                departments[index].email===newEmail             &&
                departments[index].phone===newPhone
            ){
                showFeedback(id, "blue", "Nothing to update.")
            } else if (newName === '' && newUniversity === '' && newEmail === '' && newPhone === ''){
                showFeedback(id, "blue", "Please fill in the desired fields.")
            } else {

                if(newName === '')
                    newName = document.getElementById(id+"name").placeholder
                
                if(newUniversity === '')
                    newUniversity= document.getElementById(id+"university").placeholder
                
                if(newEmail === '')
                    newEmail = document.getElementById(id+"email").placeholder
                
                if(newPhone === '')
                    newPhone = document.getElementById(id+"phone").placeholder
            

                //update
                await axios.patch('/api/departments/'+id, {
                    name: newName,
                    university: newUniversity,
                    email: newEmail,
                    phone: newPhone
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

    async function deleteDepartment(departmentId){
        const index = departments.findIndex((department) => department._id===departmentId)
        setPath('/api/departments/'+departmentId)
        setConfirmationMessage("Do you want to delete "+departments[index].name+" ?")
        setShowConfirmation(true)
    }

    function renderDepartmentsData() {
        const filtered_departments = departments.filter(department =>
            department.name.toLowerCase().includes(query.toLowerCase()) ||
            department.university.toLowerCase().includes(query.toLowerCase()) ||
            department.email.toLowerCase().includes(query.toLowerCase()) ||
            department.phone.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered_departments.length) {
            orderDepartmentsData();
            return filtered_departments.map((department, index) => {
                const { _id, name, university, email, phone } = department;
                return (
                    <tr key={_id}>
                        <td className='table-data'>{pagination.startIndex + index + 1}</td>
                        <td className='table-data'>
                            <input type="text" id={_id+"name"} data-key={_id} className="editable-data" placeholder={name} size={40} autoComplete="off" />
                        </td>
                        <td className='table-data'>
                            <input type="text" id={_id+"university"} data-key={_id} className="editable-data" placeholder={university} size={30} autoComplete="off" />
                        </td>
                        <td className='table-data'>
                            <input type="text" id={_id+"email"} data-key={_id} className="editable-data" placeholder={email} size={30} autoComplete="off" />
                        </td>
                        <td className='table-data'>
                            <input type="text" id={_id+"phone"} data-key={_id} className="editable-data" placeholder={phone} size={20} autoComplete="off" />
                        </td>
                        <td className='table-data' style={{width: "4vw"}}>
                            <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                                <button type="button" data-key={_id} className="btn btn-info accept-request" onClick={() => updateDepartment(_id)}>Update</button>
                                <button type="button" data-key={_id} className="btn btn-danger decline-request" onClick={() => deleteDepartment(_id)}  >Delete</button>
                                
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
        if (name === "prev_department") {
            setDepartmentsPage(departmentsPage - 1);
            //console.log("Department: Previous Page!");
        }
        else {
            console.log("Server internal error occurred. Server failed to load page.")
        }
    }

    function handleNextPage(name) {
        if (name === "next_department") {
            setDepartmentsPage(departmentsPage + 1);
            //console.log("Department: Next Page!");
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
            <div className='departments-container'>
                <div className='filter-content'>
                    <div className="md-form md-outline input-with-pre-icon">
                        <i className="fa fa-search input-prefix" style={{ color: "#31b1e4" }}></i>
                        <input type="text"
                            id="search-departments"
                            className="form-control"
                            placeholder='Search'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Table className='departments-table' striped bordered hover size="md" responsive>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th className='table-header'><span id='name' onClick={(e) => toggleOrder(e.target.id)}>Department Name</span></th>
                            <th className='table-header'><span id='university' onClick={(e) => toggleOrder(e.target.id)}>University</span></th>
                            <th className='table-header'><span id='email' onClick={(e) => toggleOrder(e.target.id)}>Email</span></th>
                            <th className='table-header'><span id='phone' onClick={(e) => toggleOrder(e.target.id)}>Phone</span></th>
                            <th className='table-header' style={{ textAlign: "center" }}><span>Action</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            loadingDepartments ? loadingTable() : (departments.length ? renderDepartmentsData() : emptyTable())
                        }
                    </tbody>
                </Table>
                {
                    renderPageButtons("department")
                }
                <div className='dropdown-limit'>
                    <Form.Group controlId="selectControl">
                        <Form.Label className='page-limit-lbl'>Departments per page</Form.Label>
                        <Form.Control className='page-limit' as="select" onChange={(e) => { setDepartmentsLimit(e.target.value); }}>
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
