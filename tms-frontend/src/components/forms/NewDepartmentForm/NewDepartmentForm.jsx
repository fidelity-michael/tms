import React, { useState, useEffect } from 'react'
import { Form, Button, Alert } from "react-bootstrap";
import Select from "react-select";
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

function NewDepartmentForm() {

    const [name, setName] = useState('')
    const [university, setUniversity] = useState('')
    const [phone, setPhone] = useState('30')
    const [email, setEmail] = useState('')

    const [showAlert, setShowAlert] = useState(false)
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('');

    const [universities, setUniversities] = useState([]);


    useEffect(() => {
        const getUniversities = async () => {
            await axios.get('/api/universities')
            .then((res) => {
                res.data.map((university) => {
                    var newOption = {
                        value: university.name,
                        label: university.name
                    }
                    setUniversities((prev) => [...prev, newOption])
                })
            })
            .catch((err) => console.log("Server Internal error occured!"))
        }

        getUniversities()
    }, [])

    useEffect(() => {
        console.log('ggg', phone)
    }, [phone])

    async function submitDepartment(e){
        e.preventDefault()

        if(validatePhone() && validateEmail() && validateUniversity()){
            var phoneNumber = "+";
            phoneNumber = phoneNumber.concat(phone)

            await axios.post('/api/departments', {
                name: name,
                university: university,
                phone: phoneNumber,
                email: email
            })
            .then((res) =>{
                console.log('Department added successfully!')

                //reset
                setName('')
                setUniversity('')
                setPhone('+30')
                setEmail('')
                document.getElementById("phoneValidity").innerHTML = ""
                document.getElementById("universityValidity").innerHTML = ""
                document.getElementById("emailValidity").innerHTML = ""
                
                //alert
                setVariant('success');
                setMessage('Department added successfully!');
                setShowAlert(true);
            })
            .catch((err) => {
                console.log('Failed to add new university!')
                setVariant('danger');
                setMessage('Department failed to submit!');
                setShowAlert(true);
            });
        } 
    }

    function validatePhone(){
        if(phone.length>7){
            return true;
        } else {
            document.getElementById("phoneValidity").innerHTML = "Please fill in the phone field"
            document.getElementById("phoneValidity").style = "color: red"
            return false;
        }
    }

    function validateUniversity(){
        if(university.length>0){
            return true
        } else {
            document.getElementById("universityValidity").innerHTML = "Please select a university"
            document.getElementById("universityValidity").style = "color: red"
            return false
        }
    }

    function validateEmail() {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        if(!re.test(String(email).toLowerCase())){
            document.getElementById("emailValidity").innerHTML = "Not a valid email address"
            document.getElementById("emailValidity").style = "color: red"
            return false
        } else {
            document.getElementById("emailValidity").innerHTML = ""
            return true
        }
    }

    return (

        <Form className="new-thesis-form" onSubmit={(e) => { submitDepartment(e) }}>
            {
                showAlert ?
                <Alert className='upload-alert' key={'alert-message'} variant={variant} onClose={() => setShowAlert(false)} dismissible>
                    {
                    message
                    }
                </Alert>
                : null
            }
            <Form.Group>
                <Form.Label>Department Name*</Form.Label>
                <Form.Control
                    id="departmentName"
                    type="text"
                    name="title"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    required={true}
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>University*</Form.Label>
                <Select 
                    defaultValue={university}
                    options={universities} 
                    onChange={(e) =>  setUniversity(e.value)}
                />
                <span id="universityValidity"><p></p></span>
            </Form.Group>
            
            <Form.Group>
                <Form.Label>Phone*</Form.Label>
                <PhoneInput
                    country={'gr'}
                    defaultValue={phone}
                    value={phone}
                    required={true}
                    onChange={(value) => setPhone(value)}
                />
                <span id="phoneValidity"><p></p></span>
            </Form.Group>
            
            <Form.Group>
                <Form.Label>Email*</Form.Label>
                <Form.Control
                    type="text"
                    name="title"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required={true}
                />
                <span id="emailValidity"><p></p></span>
            </Form.Group>
            

            

            <Button
                className="btn-grad submit-thesis-form"
                type="submit"
            >
                Submit
            </Button>
            
        </Form>
    )
}

export default NewDepartmentForm
