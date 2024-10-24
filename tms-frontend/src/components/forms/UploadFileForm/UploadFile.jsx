import React, { useState, useEffect } from 'react'
import { Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import axios from 'axios';
import './style.css';

export default function UploadFile({ onFilesChange }) {

    const [files, setFiles] = useState(null);
    const [fileKey, setFileKey] = useState("");
    const [progress, setProgess] = useState(0);
    const [uploaded, setUploaded] = useState([]);

    const [showProgress, setShowProgress] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('');

    useEffect(() => {
        if (!showAlert) {
            setShowProgress(false);
            setFileKey("file_" + Math.random().toString(32));
        }

    }, [showAlert]);

    function handleFileChange(target) {
        setShowAlert(false);
        setProgess(0);
        setFiles(target.files);
        onFilesChange(target.files);
    }

    function upload(e) {
        e.preventDefault();
        if (files) {
            console.log(files);

            let formData = new FormData();
            for (let index = 0; index < files.length; index++) {
                formData.append('files', files[index]);
            }

            setShowProgress(true);

            axios.post('/api/data/uploads', formData, {
                onUploadProgress: (progressEvent) => {
                    console.log(progressEvent.loaded / progressEvent.total * 100);
                    let status = Math.round(progressEvent.loaded / progressEvent.total * 100);
                    setProgess(status);
                }
            }).then(res => {
                setVariant('success');
                setMessage('Files uploaded successfully!');
                setShowAlert(true);
                // console.log("Response: ", res);

                for (let index = 0; index < files.length; index++) {
                    console.log("Filename: ", files[index].name);
                    setUploaded(previousFiles => [...previousFiles, files[index].name]);
                }
                // console.log(uploaded);

            }).catch(err => {
                setVariant('danger');
                setMessage('Files failed to upload!');
                setShowAlert(true);
                // console.log(err)
            });
        }
        else {
            console.log("Select files to upload!");
        }
    }

    function removeFile(e) {
        // TODO
        console.log("File removed!");
    }

    return (
        <div className='file-uploader'>
            {
                showAlert ?
                    <Alert className='upload-alert' key={'alert-message'} variant={variant} onClose={() => setShowAlert(false)} dismissible>
                        {
                            message
                        }
                    </Alert>
                    : null
            }
            <Form.Group className="upload-files">
                <Form.Group>
                    <Form.Label>Upload files (optional) :</Form.Label>
                    <Form.File
                        key={fileKey}
                        id="formControlFile"
                        name="thesis_files"
                        onChange={(e) => handleFileChange(e.target)}
                        multiple
                    />
                    {
                        showProgress ?
                            <ProgressBar className='progress-upload' variant="info" striped animated now={progress} label={`${progress}%`} />
                            : null
                    }
                    <Button type="button" className='button-upload' onClick={(e) => upload(e)}>Upload File</Button>
                </Form.Group>
                {
                    uploaded.length > 0 ?
                        <div className='files-list'>
                            <h5>Uploaded files :</h5>
                            {
                                uploaded.map((file, index) => {
                                    return (
                                        <div key={index}>
                                            <span> {index+1}. <i className='fa fa-trash-alt' onClick={(e) => removeFile(e)}></i> {file}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        : null
                }
            </Form.Group>
        </div>
    )
}
