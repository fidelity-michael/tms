import React, { useState, useEffect } from 'react';
import axios from'axios';
import { Modal } from 'react-bootstrap';

function ThesisInfoModal({thesis, show,  onShow}) {

    const [loading, setLoading] = useState(true)
    
   useEffect(() => {
        if(thesis)
            setLoading(false)

       console.log("aaaaaaa", thesis)
   }, [thesis])
    
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
            await axios.get('/api/downloads/theses/' + file,
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

    function render(){
        return (
            <Modal show={show} thesis={thesis} onHide={(e) => onShow(false) } animation={false}>
                <Modal.Header closeButton>
                    <Modal.Title style={{overflowWrap: "anywhere"}}>
                        {thesis.title}
                    </Modal.Title>
                </Modal.Header>
    
                <Modal.Body>

                    <div>
                        <h5><b>Date:</b></h5>
                        {
                            <span style={{ fontSize: "0.85rem" }}>
                                {new Intl.DateTimeFormat("en-GB", {
                                year: "numeric",
                                month: "numeric",
                                day: "2-digit"
                                // hour: 'numeric', minute: 'numeric', second: 'numeric',
                                // hour12: false
                                }).format(new Date(thesis.date))}
                            </span>
                        }
                    </div>

                    <hr></hr>

                    <div>
                        <h5><b>Topic:</b></h5>
                        <div style={{overflowWrap: "break-word"}}>
                            <p>{thesis.topic}</p>
                        </div>
                    </div>                
    
                    <hr></hr>
    
                    <div>
                        <h5><b>Title:</b></h5>
                        <p style={{overflowWrap: "break-word"}}>{thesis.title}</p>
                    </div>
    
                    <hr></hr>
    
                    <div>
                        <h5><b>Area:</b></h5>
                        <p style={{overflowWrap: "break-word"}}>{thesis.area}</p>
                    </div>
    
                    <hr></hr>
    
                    <div>
                        <h5><b>Prerequisites:</b></h5>
                        <p style={{overflowWrap: "break-word"}}>{thesis.prerequisites!=="" ? thesis.prerequisites : "No Prerequisites"}</p>
                    </div>
    
                    <hr></hr>
    
                    <div>
                        <h5><b>Description:</b></h5>
                        <p style={{overflowWrap: "break-word"}}>{thesis.description!=="" ? thesis.description : "No Description"}</p>
                    </div>
    
                    <hr></hr>
    
                    <div>
                        <h5><b>Professor:</b></h5>
                        <p style={{overflowWrap: "break-word"}}>{thesis.professor_email}</p>
                    </div>
    
                    <hr></hr>
    
                    <div>
                        <h5><b>Required Files:</b></h5>
                            
                            {
                                thesis.required_files[0].length ?
                                thesis.required_files.map((file, index) => {
                                    return <span key={index} style={{overflowWrap: "break-word"}}>{index + 1 + ". " + file}<br /></span>;
                                })
                                : "No files required"
                            }
                    </div>
    
                    <hr></hr>
    
                    <div>
                        <h5><b>Professor:</b></h5>
                        <p style={{overflowWrap: "break-word"}}>{thesis.professor_email}</p>
                    </div>
    
                    <hr></hr>
                            
                    <div>
                        <h5><b>Thesis Files:</b></h5>
                        {
                            thesis.thesis_files[0].length>0 ? 
                    
                                thesis.thesis_files.map((file) => {
                                    return(
                                    <span 
                                        className='thesisFile' 
                                        type='button' 
                                        style={{display: "block"}, {overflowWrap: "break-word"}}  
                                        onClick={() => downloadFile(file)}
                                    >
                                        {file}
                                        <br>
                                        </br>
                                    </span> 

                                    )
                                })

                            : 
                            'No files'
                        }
                    </div>
                    
                </Modal.Body>
            </Modal>
        )
        
    }

    function loadingProps(){
        return (<div></div>)
    }
    
    return(
            loading ? loadingProps() : render()
    )
    
    
    
}

export default ThesisInfoModal
