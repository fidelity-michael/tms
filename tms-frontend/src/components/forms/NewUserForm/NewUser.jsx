import React, { useState } from "react";
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

export default function NewUser() {

    const initialUser = {
        first_name: "",
        last_name: "",
        role: "professor",
        group: "Professor",
        email: "",
        password: ""
    };

    const [user, setUser] = useState(initialUser);

    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('');

    function uploadUser() {
        // console.log("New User: ", user);
        const uploadData = async () => {
            await axios.post('/api/users', user)
                .then(res => {
                    setVariant('success');
                    setMessage('User submitted successfully!');
                    setShowAlert(true);

                    setTimeout(() => { 
                        setVariant("")
                        setMessage("");
                        setShowAlert(false);
                    }, 2500)

                    window.scroll({ top: 0, left: 0, behavior: 'smooth' });

                    resetForm();
                })
                .catch(err => {
                    setVariant('danger');
                    if (err.response.status === 400) {
                        // console.log(err.response.data.message);
                        setMessage(err.response.data.message);
                    }
                    else setMessage('User failed to submit!');
                    setShowAlert(true);

                    setTimeout(() => { 
                        setVariant("")
                        setMessage("");
                        setShowAlert(false);
                    }, 2500)

                    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
                    
                    resetForm();
                });
        }

        uploadData();
    }

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        if(!re.test(String(email).toLowerCase())){
            document.getElementById("emailValidity").innerHTML = "Not a valid email address."
            
            document.getElementById("emailValidity").style = "color: red"
            return false
        } else {
            document.getElementById("emailValidity").innerHTML = ""
            return true
        }
    }
    

    function submitForm(e){
        var validEmail;
        var validPassword;

        e.preventDefault();

        validEmail = validateEmail(user.email);
        validPassword = validatePassword(user.password);

        console.log(validEmail && validPassword)
        if(validEmail && validPassword) uploadUser()
    }

    function resetForm() {
        // user.first_name = "";
        // user.last_name = "";
        // user.email = "";
        // user.password = "";
        setUser(initialUser);
    }

    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    //validate password's requirements
    function validatePassword(password){
        const upperCase= new RegExp('[A-Z]');
        const lowerCase= new RegExp('[a-z]');
        const numbers = new RegExp('[0-9]');

        if((password.length >= 8) && (password.length <= 20) && upperCase.test(password) && lowerCase.test(password) && numbers.test(password)){
            document.getElementById("passwordValidity").innerHTML = ""
            return true;
        } else {
            document.getElementById("passwordValidity").innerHTML = 
            "Your password has to be at least 8 characters long and contain at least one uppercase letter, one lowercase letter and a number (English letters)"
            
            document.getElementById("passwordValidity").style = "color: red"

            return false;
        }
    }

    function toggleEye(bool){
        var eye = document.getElementById("eye")
        var eyeSlash = document.getElementById("eyeSlash")
        var passwordInput = document.getElementById("formPassword")

        console.log(bool)

        if(!bool){
            eye.style.display="none"
            eyeSlash.style.display="block"
            eyeSlash.style.marginLeft="1rem"
            passwordInput.type="text"
        } else {
            eye.style.display="block"
            eyeSlash.style.display="none"
            passwordInput.type="password"
        }
    }

    function handleChange(target) {
        // console.log("Target: ", target.name, " Value: ", target.value);
        if (target.name === "role") {
            const value = target.value.toLowerCase();
            setUser((prevState) => ({
                ...prevState,
                [target.name]: value
            }));

            if (value === "administrator") {
                setUser((prevState) => ({
                    ...prevState,
                    "group": "Administrator"
                }));
            }
            else if (value === "professor") {
                setUser((prevState) => ({
                    ...prevState,
                    "group": "Professor"
                }));
            }
            else if (value === "secretariat") {
                setUser((prevState) => ({
                    ...prevState,
                    "group": "Secretariat"
                }));
            }
            else {
                setUser((prevState) => ({
                    ...prevState,
                    "group": "BSc"
                }));
            }
        }
        else {
            setUser((prevState) => ({
                ...prevState,
                [target.name]: target.value,
            }));
        }
    }

    return (
        <Form className='new-user-form' onSubmit={(e) => { submitForm(e) }}>
            <h5>New User</h5> <hr />
            {
                showAlert ?
                    <Alert className='upload-alert' key={'alert-message'} variant={variant} onClose={() => setShowAlert(false)} dismissible>
                        {
                            message
                        }
                    </Alert>
                    : null
            }
            <Form.Group controlId="formFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                    type="text"
                    name='first_name'
                    onChange={(e) => handleChange(e.target)}
                    value={user.first_name}
                />
            </Form.Group>

            <Form.Group controlId="formLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                    type="text"
                    name='last_name'
                    onChange={(e) => handleChange(e.target)}
                    value={user.last_name}
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Role*</Form.Label>
                <Form.Control as="select" name="role" className='role-dropdown' value={capitalize(user.role)} onChange={(e) => handleChange(e.target)} >
                    <option key={0}>Professor</option>
                    <option key={1}>Student</option>
                    <option key={2}>Secretariat</option>
                    <option key={3}>Administrator</option>
                </Form.Control>
            </Form.Group>

            {
                user.role === "student" &&
                <Form.Group>
                    <Form.Label>Group*</Form.Label>
                    <Form.Control as="select" name="group" className='group-dropdown' onChange={(e) => handleChange(e.target)} >
                        <option key={0}>BSc</option>
                        <option key={1}>MSc</option>
                        <option key={2}>PhD</option>
                    </Form.Control>
                </Form.Group>
            }

            <Form.Group controlId="formEmail">
                <Form.Label>Email*</Form.Label>
                <Form.Control
                    type="text"
                    name='email'
                    onChange={(e) => handleChange(e.target)}
                    value={user.email}
                    required={true}
                />
                <small id="emailValidity"></small>
            </Form.Group>

            <Form.Group controlId="formPassword">
                <Form.Label>Password*</Form.Label>
                <div id="eyeIcons" style={{display: "inline-block"}}>
                    <i 
                        className="fa fa-eye" type="button" id="eye"
                        style={{marginLeft: "1rem"}} aria-hidden="true" 
                        onClick={() => toggleEye(false)} >
                    </i>
                    <i 
                        className="fa fa-eye-slash" type="button" id="eyeSlash"
                        style={{display: "none"}} aria-hidden="true"
                        onClick={() => toggleEye(true)} >
                    </i>
                </div>
                
                <Form.Control
                    type="password"
                    name='password'
                    onChange={(e) => handleChange(e.target)}
                    value={user.password}
                    required={true}
                />
                <small id="passwordValidity"></small>
            </Form.Group>

            <Button type='submit' className='btn-grad submit-thesis-form'>
                Submit
            </Button>
        </Form>
    );
}
