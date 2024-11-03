import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import './style.css';

export default function GradingModal({ title, userId, completedData, onCompleted, show, onShow }) {

    const initialUpdate = {
        title_greek: "",
        title_english: "",
        grade: ""
    };

    const [update, setUpdate] = useState(initialUpdate);
    const [isGraded, setGraded] = useState(false);

    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('');

    const componentIsMounted = useRef(true)
    useEffect(() => {
        return () => {
            componentIsMounted.current = true
            // componentIsMounted.current = false
        }
    }, []);

    useEffect(() => {
        if (completedData.length > 0) {
            const index = completedData.findIndex(data => data.userId === userId);
            if (index > -1) {
                // console.log("Completed Data: ", completedData);
                const data = {
                    title_greek: completedData[index].title_greek,
                    title_english: completedData[index].title_english,
                    grade: completedData[index].grade
                } 

                setUpdate(data);
                setGraded(true);
            }
        }
        
    }, [userId, completedData]);

    function handleChange(target) {
        setUpdate((prevState) => ({
            ...prevState,
            [target.name]: target.value,
        }));
    }

    function submitGrade(e) {
        e.preventDefault();
        const updateData = async () => {
            // console.log(update);
            await axios.patch('/api/assigned_theses/thesis/' + userId, {
                title_greek: update.title_greek,
                title_english: update.title_english,
                grade: update.grade
            })
                .then(res => {
                    notifyStudent();
                    // console.log("Thesis updated successfully!");
                    axios.patch('/api/assigned_theses/' + userId, 
                    { 
                        attr: "status",
                        value: "graded" 
                    });

                    if (completedData.length > 0) {
                        const index = completedData.findIndex(data => data.userId === userId);
                        if (index > -1) {
                            let tempData = [...completedData]; 
                            tempData[index] = update;
                            onCompleted(tempData);
                            setGraded(true);
                        }
                        else {
                            update.userId = userId;
                            onCompleted(previousData => [...previousData, update])
                            setGraded(true);
                        }
                    }
                    else {
                        update.userId = userId;
                        onCompleted(previousData => [...previousData, update])
                        setGraded(true);
                    }

                    setVariant('success');
                    setMessage('Thesis grade submitted!');
                    setShowAlert(true);
                })
                .catch(err => {
                    console.log('Thesis failed to update!');
                });
        }

        
        const notifyStudent = async () => {
            await axios.post('/notifications', {
                title: "Your Thesis was graded.",
                message: "Your Thesis grade is: " + update.grade,
                receiver: userId,
                type: "info"
            })
            .then(res => {
                console.log("Notification sent successfully!");
            })
            .catch(err => {
                console.log("Notification failed to send!");
            });
        }

        updateData();
        
    }

    return (
        <Modal show={show} onHide={(e) => onShow(false)} animation={false}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {title}
                    {/* {isGraded ? " [ Graded ]" : null} */}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="grade-report-wrapper">
                    {
                        showAlert ?
                            <Alert className='upload-alert' key={'alert-message'} variant={variant} onClose={() => setShowAlert(false)} dismissible>
                                {
                                    message
                                }
                            </Alert>
                            : null
                    }
                    <h5 className="grading-header">Grading Form</h5>
                    <Form className="grading-form" onSubmit={(e) => submitGrade(e)}>
                        <Form.Group controlId="formTitleGr">
                            <Form.Label>Thesis Title in Greek</Form.Label>
                            <Form.Control
                                //size="sm"
                                type="text"
                                onChange={(e) => handleChange(e.target)}
                                value={update.title_greek}
                                placeholder="Greek Title"
                                name="title_greek"
                                required={true}
                                readOnly={isGraded}
                            />
                        </Form.Group>

                        <Form.Group controlId="formTitleEn">
                            <Form.Label size="sm">Thesis Title in English</Form.Label>
                            <Form.Control
                                //size="sm"
                                type="text"
                                onChange={(e) => handleChange(e.target)}
                                value={update.title_english}
                                placeholder="English Title"
                                name="title_english"
                                required={true}
                                readOnly={isGraded}
                            />
                        </Form.Group>

                        <Form.Group controlId="formGrade">
                            <Form.Label>Thesis Final Grade</Form.Label>
                            <Form.Control
                                //size="sm"
                                type="text"
                                onChange={(e) => handleChange(e.target)}
                                value={update.grade}
                                placeholder="Grade"
                                name="grade"
                                required={true}
                                readOnly={isGraded}
                            />
                            <Form.Text className="text-muted">
                                Caution : Grade must be from 1 to 10 and up to 2 decimals.
                        </Form.Text>
                        </Form.Group>

                        <Button style={{ fontSize: "1rem", padding: "0.15rem", marginBottom: "1rem" }}
                            className="grading-btn"
                            // variant="primary"
                            type="submit"
                            disabled={isGraded}
                            block
                        >
                            Submit Grade
                    </Button>
                    </Form>
                </div>
            </Modal.Body>
        </Modal>
    )
}
