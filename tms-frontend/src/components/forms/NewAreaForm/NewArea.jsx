import React, { useState } from "react";
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

export default function NewArea() {

    const initialArea = {
        area_name: "",
        description: ""
    }

    const [area, setArea] = useState(initialArea);

    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('');

    function uploadArea() {
        const uploadData = async () => {
            await axios.post('/api/areas', area)
                .then(res => {
                    setVariant('success');
                    setMessage('Area submitted successfully!');
                    setShowAlert(true);
                    resetForm();
                })
                .catch(err => {
                    setVariant('danger');
                    setMessage('Area failed to submit!');
                    setShowAlert(true);
                    resetForm();
                });
        }

        uploadData();
    }

    function submitForm(e) {
        e.preventDefault();
        uploadArea();
    }

    function resetForm() {
        setArea(initialArea);
    }
    function handleChange(target) {
        setArea((prevState) => ({
            ...prevState,
            [target.name]: target.value,
        }));
    }

    return (
        <Form className='new-area-form' onSubmit={(e) => { submitForm(e) }}>
            <h5>New Area</h5> <hr />
            {
                showAlert ?
                    <Alert className='upload-alert' key={'alert-message'} variant={variant} onClose={() => setShowAlert(false)} dismissible>
                        {
                            message
                        }
                    </Alert>
                    : null
            }
            <Form.Group controlId="formName">
                <Form.Label>Area Name</Form.Label>
                <Form.Control
                    type="text"
                    name='area_name'
                    onChange={(e) => handleChange(e.target)}
                    value={area.area_name}
                />
            </Form.Group>

            <Form.Group controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows="3"
                    name="description"
                    onChange={(e) => handleChange(e.target)}
                    value={area.description}
                />
            </Form.Group>

            <Button type='submit' className='btn-grad submit-thesis-form'>
                Submit
            </Button>
        </Form>
    );
}
