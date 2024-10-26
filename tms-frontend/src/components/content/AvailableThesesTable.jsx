import React, { useState, useEffect, useRef } from 'react';
import { Table, Form } from 'react-bootstrap';
import axios from 'axios';
import './content.css';
import ThesisInfoModal from './ThesisInfoModal';

export default function AvailableThesesTable({ userId, group, email, thesesApplied, thesisAssigned, setThesesApplied }) {
  const [theses, setTheses] = useState([]);
  const [thesesPage, setThesesPage] = useState(1);
  const [thesesLimit, setThesesLimit] = useState(10);
  const [thesisFiles, setThesisFiles] = useState([])

  const [loadingTheses, setLoadingTheses] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [pagination, setPagination] = useState({});
  const [showAlert, setAlert] = useState(false);

  const [showThesisInfoModal, setShowThesisInfoModal] = useState(false)
  const [chosenThesis, setChosenThesis] = useState('')
 

  const initialRequest = {
    thesis: "",
    professor: "",
    student: "",
    required_files: []
  };

  const [requestThesis, setRequestThesis] = useState(initialRequest);

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
    setRequestThesis((prevState) => ({
      ...prevState,
      "student": userId
    }));

    return () => {
      componentIsMounted.current = true
      // componentIsMounted.current = false
    }
  }, [userId]);

  useEffect(() => {
    const fetchTheses = async () => {
      try {
        // console.log("User Group: ", group);
        setLoadingTheses(true);
        
        //get the Ids of the assigned thesis
        const assignedThesesData = await axios.get('/api/assigned_theses');
        var assignedIds = assignedThesesData.data.map(thesis => thesis.thesis)

        //get all the thesis
        const theses_data = await axios.get('/api/data/theses/' + group, {
          params: {
            page: thesesPage,
            limit: thesesLimit,
            user: "group",
            attr: "status",
            filter: "active"
          }
        });

        if (componentIsMounted.current) {
          //console.log("Theses: ", theses_data.data);
          
          //filter only the non assigned thesis
          theses_data.data.results = theses_data.data.results.filter((thesis) => {
            if(!assignedIds.includes(thesis._id)){
              return thesis
            }
          })

          setPagination({
            startIndex: theses_data.data.startIndex,
            endIndex: theses_data.data.endIndex,
            total: theses_data.data.total
          });

          if (theses_data.data.results.length > 0) {
            setTheses(theses_data.data.results);
          }
          setLoadingTheses(false);
        }
      }
      catch (err) {
        console.log("Server internal error occurred!");
      }
    }

    fetchTheses();

  }, [thesesPage, thesesLimit, thesesApplied, group]);


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

  function sendNotification(target) {
    const professorId = target.getAttribute('data-key');
    const thesisTitle = target.name;
    var notification;

    if(thesisAssigned.thesis===""){
      notification = {
        title: "New Thesis request arrived!",
        message: "Thesis: " + thesisTitle + ". Student: " + email,
        receiver: professorId,
        type: "info"
      }
    } else {
      notification = {
        title: "New Thesis request arrived!",
        message: "Thesis: " + thesisTitle + ". Student: " + email +" (already has a thesis assigned).",
        receiver: professorId,
        type: "info"
      }
    }
    

    const notifyProfessor = async () => {
      await axios.post('/notifications', notification)
        .then(res => {
          console.log("Notification sent successfully!");
        })
        .catch(err => {
          console.log("Notification failed to send!");
        });
    }

    notifyProfessor();
  }

  //fetch user's theses requests
  async function fetchThesesApplied(){
    await axios.get('/api/theses_requests/student/'+userId)
    .then(res => setThesesApplied(res.data))
    .catch(err => console.log(err))
  }

  function uploadRequest(target) {
    const uploadData = async () => {
      await axios.post('/api/theses_requests', requestThesis)
        .then(res => {
          fetchThesesApplied()
          setThesisFiles([])
          sendNotification(target);
        })
        .catch(err => {
          console.log("Request failed to submit!");
        });
    }

    uploadData();
  }

  function uploadFiles(target) {
    if (thesisFiles.length > 0) {
      const index = thesisFiles.findIndex(files => files.id === target.id);
      const uploadData = async (filesData) => {
        await axios.post('/api/data/uploads/requests', filesData)
          .then(res => {
            // console.log("Response: ", res.data);
            requestThesis.required_files = res.data.files_list;
            uploadRequest(target);
          })
          .catch(err => {
            console.log("Files failed to upload!");
          });
      }

      if (index > -1) {
        let formData = new FormData();

        for (let i = 0; i < thesisFiles.length; i++) {
          for(let j = 0; j < thesisFiles[i].files.length; j++){
            if(thesisFiles[i].id===target.id){
              formData.append('files', thesisFiles[i].files[j]);
            }
          }
        }

        uploadData(formData);
      }
      else {
        uploadRequest(target);
      }
    }
    else {
      uploadRequest(target);
    }
  }

  
  async function editRequest(target, files){
    const edit = async (requestId) => {
      await axios.patch("/api/theses_requests/reapply/"+requestId, {
        files: files
      })
      .then((res) => {
        console.log("Request edited successfully.")
        reapplied(target.id) //feedback
        sendNotification(target);
        setThesisFiles([])
      })
      .catch(() => console.log("Server Internal error occurred!"))
    }

    var thesisRequest = await thesesApplied.filter((req) => {return req.thesis===target.id})
    console.log(thesisRequest)

    edit(thesisRequest[0]._id)
    
  }

  function reUploadFiles(target){
    if (thesisFiles.length > 0) {
      const index = thesisFiles.findIndex(files => files.id === target.id);
      const uploadData = async (target, filesData) => {
        console.log('aaaaaaaaaaaaaa', filesData)
        await axios.post('/api/data/uploads/requests', filesData)
          .then(res => {
            console.log("Response: ", res.data);
            requestThesis.required_files = res.data.files_list;
            editRequest(target, requestThesis.required_files);
          })
          .catch(err => {
            console.log("Files failed to upload!");
          });
      }

      if (index > -1) {
        let formData = new FormData();

        for (let i = 0; i < thesisFiles.length; i++) {
          for(let j = 0; j < thesisFiles[i].files.length; j++){
            if(thesisFiles[i].id===target.id){
              console.log('mphkeee')
              formData.append('files', thesisFiles[i].files[j]);
            }
          }
        }

        uploadData(target, formData); //upload files and edit thesis request
      }
      else {
        setAlert(true)
      }
    }
    else {
      setAlert(true)
    }
    
  }

  function reapply(target){
    
    // Files required!
    if (thesisFiles.length > 0) {
      const index = thesisFiles.findIndex(files => files.id === target.id);
      if (index > -1) {
        // console.log("Files found!");
        requestThesis.thesis = target.id;
        reUploadFiles(target);
        requestThesis.required_files = [""];
      }
      else {
        // console.log("Files not found!");
        setAlert(true);
      }
    }
    else {
      // console.log("Files not found!");
      setAlert(true);
    }
    
  }


  function handleApplyClicked(target, reqFiles) {
    // console.log("Files Upload: ", thesisFiles);

    // Files required!
    if (reqFiles.length > 0) {
      if (thesisFiles.length > 0) {
        const index = thesisFiles.findIndex(files => files.id === target.id);
        if (index > -1) {
          // console.log("Files found!");
          requestThesis.thesis = target.id;
          uploadFiles(target);
          requestThesis.required_files = [""];
        }
        else {
          // console.log("Files not found!");
          setAlert(true);
        }
      }
      else {
        // console.log("Files not found!");
        setAlert(true);
      }
    }
    // No files required!
    else {
      requestThesis.thesis = target.id;
      uploadFiles(target);
      requestThesis.required_files = [""];
    }
  }

  function handleFileChange(target) {
    
    console.log("Thesis Files: ", thesisFiles);

    if(target.files.length>0){ //if we actually chose a file
      setLoadingFiles(true)

      const newFiles = {
        id: target.id,
        files: target.files
      };

      setThesisFiles((prev) => [...prev, newFiles])
      setLoadingFiles(false)
    } 
    
  }

  function removeFile(id, fileName){
    console.log("File to remove: ", fileName, id)
    setLoadingFiles(true)
    setThesisFiles(thesisFiles.filter(file => ((file.files[0].name !== fileName) || (file.id !== id))));
    setLoadingFiles(false)
  }

  function renderChosenFiles(id){

    if (thesisFiles.length > 0) {
      const index = thesisFiles.findIndex(files => files.id === id);
      if (index > -1) {
        return (
          <ul>
            {
              thesisFiles.map((file, index) => {
                if(file.id===id){
                  return(
                  <li key={index+id+file.files[0].name}>
                    {file.files[0].name}
                    <i className='fa fa-trash-alt' type="button" style={{color: '#ec2020'}} 
                        onClick={(e) => removeFile(id, file.files[0].name)}>    
                    </i>
                  </li>
                )
                }
              })
            }
          </ul>
        )
      } else {
        return (<span></span>)
      }
    }
  }

  function reapplied(id){
    document.getElementById("reapplied"+id).style.display = "block"
    setTimeout(function(){
      if(document.getElementById("reapplied"+id)){
        document.getElementById("reapplied"+id).style.display = "none";
      } 
    }, 2500)
  }

  function downloadFile(file) {
        const saveData = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            return function (data, fileName) {
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
            };
        }());

        const fetchData = async () => {
            console.log("File to download: ", file)
            await axios.get('/api/data/downloads/theses/' + file,
                { responseType: 'blob' })
                .then(res => {
                    // console.log("Response: ", res.data);
                    // Redirect to file (open file in browser) : window.location.assign(res.data);  
                    saveData(res.data, file);
                })
                .then(blob => {
                    console.log("File downloaded successfully!");
                })
                .catch(err => {
                    console.log(err)
                    console.log("File failed to download!");
                });
        }

        fetchData();
    }

  

  function renderRequestsData() {

    const filtered_requests = theses.filter(thesis =>
      thesis.title.toLowerCase().includes(query.toLowerCase()) ||
      thesis.topic.toLowerCase().includes(query.toLowerCase()) ||
      thesis.area.toLowerCase().includes(query.toLowerCase()) ||
      thesis.prerequisites.toLowerCase().includes(query.toLowerCase()) ||
      thesis.description.toLowerCase().includes(query.toLowerCase()) ||
      thesis.professor_email.toLowerCase().includes(query.toLowerCase()) 
    );

    if (filtered_requests.length) {
      orderThesesData();
      return filtered_requests.map((thesis) => {
        
        const { _id, date, title, topic, area, prerequisites, description, professor_id, professor_email, professor_name, required_files, thesis_files } = thesis;
        
        const index = thesesApplied.findIndex(thesis => thesis.thesis === _id)
        return (
          <tr key={_id}>
            <td className='table-data-thesis'>{title}</td>
            <td className='table-data-thesis'>{area}</td>
            <td className='table-data-thesis' data-toggle="tooltip" data-placement="right" title={professor_name}>{professor_email}</td>
            
            <td>
              <p type="button" className="showDetails" onClick={() => {setChosenThesis(thesis); setShowThesisInfoModal(true)}}>
                <b>Show Details  </b>
                <i className="fas fa-info-circle"></i>
              </p>
            </td>
            

            <td className='table-data-thesis'>
              {
                required_files[0].length > 0 ?
                  required_files.map((file, index) => {
                    return <span key={index}>{index + 1 + ". " + file}<br /></span>;
                  })
                  : "No files required"
              }
            </td>

            <td className='table-data-thesis'>
              <input type="file"
                name="thesis_files"
                className='file-input'
                onChange={(e) => handleFileChange(e.target)}
                accept=".zip,.pdf,.doc,.docx,.txt"
                id={_id}
                multiple
              />
              {loadingFiles ? <span></span> : renderChosenFiles(_id)}
            </td>
            
            <td className='table-data-thesis' align="center">
              { 
                thesisAssigned.thesis==="" ? //if student doesn't already have a thesis assigned
                  (index > -1) ? //if student has previously applied fot this thesis
                      thesesApplied[index].status==="declined" ? //if thesis request was declined
                        <p>Declined</p>
                      : //if thesis request is active
                      <div className="btn-group" style={{display: "block"}} role="group" aria-label="Button group with nested dropdown">
                        <button type="button" data-key={professor_id} id={_id} name={title} className="btn btn-info apply-thesis" onClick={(e) => reapply(e.target)}>Reapply</button>
                        <p className="reapplyFeedback" id={"reapplied"+_id}><b>Reapplied Successfully</b></p>
                      </div> 
                    : //if student hasn't previously applied fot this thesis
                    <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                      <button type="button" data-key={professor_id} id={_id} name={title} className="btn btn-success apply-thesis" onClick={(e) => handleApplyClicked(e.target, required_files[0])}>Apply</button>
                    </div>
                : //if student already has a thesis assigned
                  thesisAssigned.thesis._id===_id ? 
                    <p style={{fontSize: "1.5vw"}}><b style={{color: "green"}}>My Thesis</b></p>
                  : 
                    (index > -1) ? //if student has previously applied fot this thesis
                      thesesApplied[index].status==="declined" ? //if thesis request was declined
                        <p>Declined</p>
                      : //if thesis request is active
                      <div className="btn-group" style={{display: "block"}} role="group" aria-label="Button group with nested dropdown">
                        <button type="button" data-key={professor_id} id={_id} name={title} className="btn btn-info apply-thesis" onClick={(e) => reapply(e.target)}>Reapply</button>
                        <p className="reapplyFeedback" id={"reapplied"+_id}><b>Reapplied Successfully</b></p>
                      </div> 
                    : //if student hasn't previously applied fot this thesis
                    <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                      <button type="button" data-key={professor_id} id={_id} name={title} className="btn btn-success apply-thesis" onClick={(e) => handleApplyClicked(e.target, required_files[0])}>Apply</button>
                    </div>

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
      <ThesisInfoModal 
        thesis={chosenThesis} 
        show={showThesisInfoModal}
        onShow={(data) => setShowThesisInfoModal(data)} 
        
      />

      <div className="alert" hidden={!showAlert}>
        <span className="closebtn" onClick={(e) => setAlert(false)}>&times;</span>
        <strong>Warning!</strong> You have to submit required files to apply for thesis.
      </div>

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
              <th className='table-header-thesis'><span id='title' onClick={(e) => toggleOrder(e.target.id)}>Thesis Title</span></th>
              <th className='table-header-thesis'><span id='area' onClick={(e) => toggleOrder(e.target.id)}>Thesis Area</span></th>
              <th className='table-header-thesis'><span id='professor_email' onClick={(e) => toggleOrder(e.target.id)}>Professor</span></th>
              <th className='table-header-thesis'><span id='upload'>Details</span></th>
              <th className='table-header-thesis'><span id='required_files'>Required Files</span></th>
              <th className='table-header-thesis'><span id='upload'>Upload Files</span></th>
              <th className='table-header-thesis'><span id='action'>Action</span></th>
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
