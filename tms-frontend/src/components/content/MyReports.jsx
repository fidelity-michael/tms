import React, { useState, useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import './content.css';

export default function ReportsArchive({ userId, email, user }) {

    const [reports, setReports] = useState([]);
    const [reportsPage, setReportsPage] = useState(1);
    const [reportsLimit, setReportsLimit] = useState(2);
    const [loadingReports, setLoadingReports] = useState(false);

    const [pagination, setPagination] = useState({});

    const componentIsMounted = useRef(true)

    useEffect(() => {
        return () => {
            componentIsMounted.current = false
        }
    }, []);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoadingReports(true);
                const reports_data = await axios.get('/api/reports/' + userId, {
                    params: {
                        page: reportsPage,
                        limit: reportsLimit,
                        attr: "reports",
                        filter: "none",
                        user: "student",
                    }
                });

                if (componentIsMounted.current) {
                    setPagination({
                        startIndex: reports_data.data.startIndex,
                        endIndex: reports_data.data.endIndex,
                        total: reports_data.data.total
                    });

                    if (reports_data.data.results.length > 0) {
                        // console.log("Reports: ", reports_data.data.results);
                        setReports(reports_data.data.results);
                    }
                    setLoadingReports(false);
                }
            }
            catch (err) {
                console.log("Server internal error occurred!");
            }
        }

        fetchReports();
    }, [reportsPage, reportsLimit, userId]);



    function downloadFile(target) {
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
            console.log("File to download: ", target.name)
            await axios.get('/api/downloads/reports/' + target.name,
                { responseType: 'blob' })
                .then(res => {
                    // console.log("Response: ", res.data);
                    // Redirect to file (open file in browser) : window.location.assign(res.data);  
                    saveData(res.data, target.name);
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

    function renderDownloads(report_files) {
        // console.log("Thesis Assigned: ", thesisAssigned);
        return report_files.map((filename, index) => {
            return (
                <li key={index+filename}>
                    <a
                    key={index}
                    name={filename}
                    href={"#" + filename}
                    onClick={(e) => downloadFile(e.target)}
                    style={{ fontSize: "0.95rem", marginRight: "0.5rem" }}
                    >
                        {filename}
                    </a>
                </li>
                
            );
        })
    }

    //comment for a report and notify student
    function sendComment(index, reportTitle, reportId){
        const studentId = userId;

        const notifyStudent = async () => {
            await axios.post('/notifications', {
                title: email + " commented your report: "+ reportTitle ,
                message: email+": "+document.getElementById('comment_'+index).value,
                receiver: studentId,
                type: "info"
            })
            .then(res => {
                console.log("Notification sent successfully!");
                document.getElementById('comment_'+index).value = '';
                document.getElementById('send_'+index).style.display = "none";
                document.getElementById('info_'+index).innerHTML='Comment sent succesfully'
                setTimeout(
                    function(){
                        if(document.getElementById('info_'+index)) document.getElementById('info_'+index).innerHTML = ''  
                    }
                , 2000);
            })
            .catch(err => {
                console.log("Notification failed to send!");
            });
        }

        const addCommenttoDB = async () => {
            await axios.patch('/theses_reports/addComment/' + reportId, {
                attr: "comments",
                value: email+": "+document.getElementById('comment_'+index).value,
              })
                .then((data) => {
                    console.log("Comment added successfully!");
                    notifyStudent();
                })
                .catch((err) => {
                  console.log(err);
                });
        }
    
        addCommenttoDB();
    }

    //show/hide send button
    function showHideButton(index){
        if(document.getElementById('comment_'+index).value){
            document.getElementById('send_'+index).style.display = "block"
        } else {
            document.getElementById('send_'+index).style.display = "none"
        }
    }

    //show more / show less
    function toggleMoreLess(id){
        const button = document.getElementById(id+"_showMore");
        const down = document.getElementById(id+"_down");
        const up = document.getElementById(id+"_up");

        if(button.innerHTML === "Show More"){
            button.innerHTML = "Show Less"
            down.style.display = "none"
            up.style.display = "block"
        } else {
            button.innerHTML = "Show More"
            down.style.display = "block"
            up.style.display = "none"
        }
    }

    function renderReports() {
        return reports.map((report, index) => {
            const { _id, title, description, report_files, date , comments} = report;
            
            if(user==='professor'){  //render for professor
                return (
                    <div key={_id} className="report-post col-md-12">
                        <i className="far fa-clipboard"></i>
                        <h5><b>{title}</b></h5>
                        <div className="post-description">
                            <span>{description}</span>
                        </div>

                        <div className="detailsToggle" type="button"  data-toggle="collapse"  data-target={"#collapse" + index} 
                            aria-expanded="false" aria-controls="collapseExample" onClick={() => toggleMoreLess(_id)}>
                            <p  style={{fontWeight: "bold"}} id={_id+"_showMore"} >
                                    Show More
                            </p>
                            <i className="fas fa-caret-down" id={_id+"_down"}></i>
                            <i className="fas fa-caret-up" id={_id+"_up"} style={{display: "none"}}></i>
                        </div> 

                        <div className="collapseWrap">
                            <div className="collapse" id={"collapse"+index}>
                                
                                {report_files.length>0 &&
                                    <div className="download-files-list">
                                        <p style={{ marginTop: "0.5rem", marginBottom: "-0.1rem", fontWeight: "500" }}>Report Files : </p>
                                        {
                                            renderDownloads(report_files)
                                        }
                                    </div>
                                }

                                <div className="date-posted">
                                    <span>Date of submission: </span>
                                    <br></br>
                                    <span style={{ fontSize: "0.85rem" }}>
                                        {new Intl.DateTimeFormat("en-GB", {
                                            year: "numeric",
                                            month: "numeric",
                                            day: "2-digit",
                                            hour: 'numeric', minute: 'numeric', second: 'numeric',
                                            hour12: false
                                        }).format(new Date(date))}
                                    </span>
                                </div>

                                Leave a comment
                                <br></br>
                                <textarea id={'comment_'+index} rows={4} style={{width: '70%'}} onChange={() => {showHideButton(index)}}></textarea>
                                <br></br>
                                <p id={"info_"+index} style={{color: "green"}}></p>
                                <button type="button" id={'send_'+index} className="btn btn-info propose-btn" style={{display: "none"}} onClick={()=> sendComment(index, title, _id)}>Send</button>
                                
                            </div>
                        </div>
                        <hr />
                    </div>
                )
            }
            return ( //render for student
                <div key={_id} className="report-post col-md-12">
                    <i className="far fa-clipboard"></i>
                    <h5><b> {title}</b></h5>
                    <div className="post-description">
                        <span>{description}</span>
                    </div>
                    
                    
                    <div className="detailsToggle" type="button"  data-toggle="collapse"  data-target={"#collapse" + index} 
                            aria-expanded="false" aria-controls="collapseExample" onClick={() => toggleMoreLess(_id)}>
                        <p  style={{fontWeight: "bold"}} id={_id+"_showMore"} >
                                Show More
                        </p>
                        <i className="fas fa-caret-down" id={_id+"_down"}></i>
                        <i className="fas fa-caret-up" id={_id+"_up"} style={{display: "none"}}></i>
                   </div> 
                    
                    <div className="collapseWrap">
                        <div className="collapse" id={"collapse"+index}>
                            {
                                report_files[0] &&
                                <div className="download-files-list">
                                    <p style={{ marginTop: "0.5rem", marginBottom: "-0.1rem", fontWeight: "500" }}>Report Files : </p>
                                    
                                    <ul>
                                        {
                                            renderDownloads(report_files)
                                        }
                                    </ul>
                                    
                                </div>
                            }
                            <div className="date-posted">
                                <span>Date of submission: </span>
                                <br></br>
                                <span style={{ fontSize: "0.85rem" }}>
                                    {new Intl.DateTimeFormat("en-GB", {
                                        year: "numeric",
                                        month: "numeric",
                                        day: "2-digit",
                                        hour: 'numeric', minute: 'numeric', second: 'numeric',
                                        hour12: false
                                    }).format(new Date(date))}
                                </span>
                            </div>
                            
                            <p><b>Supervisors' Comments:</b></p>
                            <ul>
                                {comments.map((comment, index) => <li key={comment+index}>-{comment}</li>)}
                            </ul>
                        </div>
                    </div>
                    

                    <hr />
                </div>
            )
            
        })
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
        if (name === "prev_report") {
            setReportsPage(reportsPage - 1);
            //console.log("Department: Previous Page!");
        }
        else {
            console.log("Server internal error occurred. Server failed to load page.")
        }
    }

    function handleNextPage(name) {
        if (name === "next_report") {
            setReportsPage(reportsPage + 1);
            //console.log("Department: Next Page!");
        }
        else {
            console.log("Server internal error occurred. Server failed to load page.")
        }
    }

    function loadingData() {
        return (
            <div className="d-flex justify-content-center" style={{ marginBottom: "1rem" }}>
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    function emptyData(e) {
        return (
            <h5 className='empty-data' colSpan="100%">There are no reports uploaded yet</h5>
        );
    }

    return (
        <div className='thesis-reports' style={{ marginTop: "2rem" }}>
            <h5 style={{color: "#4e73df"}}>Thesis Reports</h5>
            <hr />
            <div className="reports-wrapper">
                {
                    loadingReports ? loadingData() : (reports.length ? renderReports() : emptyData())
                }
            </div>
            {
                renderPageButtons("report")
            }
            <div className='dropdown-limit'>
                <Form.Group controlId="selectControl">
                    <Form.Label className='page-limit-lbl'>Reports per page</Form.Label>
                    <Form.Control className='page-limit' as="select" onChange={(e) => { setReportsLimit(e.target.value); }}>
                        <option>2</option>
                        <option>5</option>
                        <option>10</option>
                    </Form.Control>
                </Form.Group>
            </div>
        </div>
    )
}
