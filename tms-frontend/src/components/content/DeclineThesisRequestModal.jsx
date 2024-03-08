import React, { useState } from 'react'
import axios from 'axios';
import { Modal } from 'react-bootstrap';

function DeclineThesisRequestModal({ title, thesisId, studentId, show, setShow, setRequestsAnswered, onShow }) {
    const [comment, setComment] = useState('')

    async function decline(target){
      const newData = { 
        id: thesisId,
        status: "declined"
      };

      formTheMessageAndNotify(target) //kanonika meta to await alla kati den paei kala
      await axios.patch('/theses_requests/' + thesisId, { status: "declined" })
      .then(() => {
        console.log("Thesis declined successfully!")
        setRequestsAnswered(previousData => [...previousData, newData]);
      })
      .catch(() => console.log("Something went wrong!"))

    }
    

    function formTheMessageAndNotify(target){

      const studentId = target.getAttribute('data-key');
      const notifyStudent = async (message) => {
        await axios.post('/notifications', {
          title: "Request Reply arrived!",
          message: message,
          receiver: studentId,
          type: "info"
        })
          .then(res => {
            console.log("Notification sent successfully!");
            setShow(false)
          })
          .catch(err => {
            console.log("Notification failed to send!");
          });
      }

      var message="Request for "+target.name+" declined";
      var checkedBoxes = document.querySelectorAll('input:checked');

      if(checkedBoxes) {
        message += ' for the following reasons: \n'
        checkedBoxes.forEach((element) => {
          console.log(element.value)
          message += element.value.concat('\n')
        })
      }

      if(comment!=='') 
        message += '\nProfessor\'s comment: \n'+comment

      notifyStudent(message)

    }

    return (
        <Modal show={show} onHide={(e) => onShow(false) } animation={false}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Decline request for: <br></br> <span style={{fontWeight: 'bold'}}>{title}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="-Thesis is no longer available" id="flexCheckDefault" />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Thesis is no longer available
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="-Requirements for this thesis are not met" id="flexCheckChecked" />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        Requirements for this thesis are not met
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="-There is no suitable cognitive background" id="flexCheckChecked" />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        There is no suitable cognitive background
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="-Requirements for this thesis are not met" id="flexCheckChecked" />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                      Requirements for this thesis are not met
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="-Please contact me" id="flexCheckChecked" />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        Please contact me
                    </label>
                </div>

                <br></br>

                <label>Comments:</label>
                <br></br>
                <textarea id="comment" style={{"width": "80%"}} rows={5} onChange={(e) => {setComment(e.target.value)}}>

                </textarea>
                <br></br>

                
                <button type="button" className="btn btn-danger" data-key={studentId} id={thesisId} name={title} onClick={(e) => { decline(e.target)}}>Decline</button>
            </Modal.Body>
        </Modal>
    )
}

export default DeclineThesisRequestModal
