import React, {useEffect, useState} from 'react'
import axios from 'axios';
import './content.css';

export default function MyThesis({ userId, thesisAssigned}) {
    const [supervisors, setSupervisors] = useState([])
    const [loadingSupervisors, setLoadingSupervisors] = useState(true)

    useEffect(() => {
        const getSupervisorsData = async () => {
            let supervisorsArray = []
            
            await thesisAssigned.supervisor.map(async (supervisorId) => {
                
               await axios.get('/api/users/'+supervisorId)
                    .then((res) => {
                        supervisorsArray.push(res.data.email)
                        setSupervisors(previous => [...previous, res.data.email]);
                    })
                    .catch(() => {
                        console.log('errooor')
                    })
            })
            setLoadingSupervisors(false)
        
        }

        getSupervisorsData()

    }, [thesisAssigned])


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
            await axios.get('/api/downloads/theses/' + target.name,
            {responseType: 'blob'})
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

    function renderDownloads() {
        // console.log("Thesis Assigned: ", thesisAssigned);
        return thesisAssigned.thesis.thesis_files.map((filename, index) => {
            return (
                <a
                    key={index}
                    name={filename}
                    href={"#" + filename}
                    onClick={(e) => downloadFile(e.target)}
                    style={{ marginRight: "0.5rem" }}
                >
                    {filename}
                </a>
            );
        })
    }

    function loading() {
        return (
          <p className='animated headShake infinite' style={{ marginBottom: '-0.1rem' }}>Loading Supervisors...</p>
          
        );
    }

    function renderSupervisors(){
        console.log('mphkeee', supervisors, supervisors.length)
        if(supervisors.length>0){
            return supervisors.map((supervisor, index) => {
                return(
                    <li key={supervisor}>{supervisor}</li>
                );
            })

        } else {
                return(
                    <div>-</div>
                );
        }
        
    }

    return (
        <div className='thesis-information' style={{ marginTop: "0.75rem" }}>
            {
                thesisAssigned.thesis ?
                    <div className="thesis-wrapper">
                        <p><b>Title : </b>{thesisAssigned.thesis.title}</p>
                        <p><b>Topic : </b>{thesisAssigned.thesis.topic}</p>
                        {/* <p><b>Group : </b>{thesisAssigned.thesis.group}</p> */}
                        <p><b>Area : </b>{thesisAssigned.thesis.area}</p>
                        <p><b>Professor : </b>{thesisAssigned.thesis.professor}</p>

                        
                        <b>Supervisors: </b>
                        <ul>
                            {loadingSupervisors ? loading() : renderSupervisors()}
                        </ul>

                        <p><b>Description : </b>
                            {thesisAssigned.thesis.description.length > 0 ? 
                                thesisAssigned.thesis.description :
                                "No description available!"
                            }
                        </p>
                        <p><b>Date Assigned : </b>{new Intl.DateTimeFormat("en-GB", {
                            year: "numeric",
                            month: "long",
                            day: "2-digit"
                            // hour: 'numeric', minute: 'numeric', second: 'numeric',
                            // hour12: false
                        }).format(new Date(thesisAssigned.date))}</p>

                        {
                            thesisAssigned.thesis.thesis_files[0] &&
                            <div className="download-files-list">
                                <p><b>Thesis Files : </b></p>
                                {
                                    renderDownloads()
                                }
                            </div>
                        }
                    </div>
                    : null
            }
        </div>
    )
}
