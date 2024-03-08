import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from 'axios';
import "./style.css";

export default function NewThesisForm({ userId, email }) {
  const initialThesis = {
    title: "",
    topic: "",
    area: "Artificial intelligence",
    group: "BSc",
    prerequisites: "",
    description: "",
    professor: "",
    professor_email: "",
    required_files: "",
    thesis_files: ""
  }

  const [thesis, setThesis] = useState(initialThesis);
  const [thesisFiles, setThesisFiles] = useState([]);
  const [fileKey, setFileKey] = useState("fileKey");

  const [areas, setAreas] = useState("");

  const [requiredFilename, setRequiredFilename] = useState("");
  const [requiredFiles, setRequiredFiles] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');

  const componentIsMounted = useRef(true)

  useEffect(() => {
    axios.get('api/thesis/areas')
      .then((res) => {
        // console.log("Areas: ", res.data)
        if (componentIsMounted.current) setAreas(res.data);
      })
      .catch(() => {
        console.log('Server internal error occurred!');
      });

    return () => {
      componentIsMounted.current = false
    }
  }, []);

  useEffect(() => {
    // console.log("Professor ID: ", userId);
    if (userId.length > 0) {
      setThesis((prevState) => ({
        ...prevState,
        "professor": userId
      }));

      setThesis((prevState) => ({
        ...prevState,
        "professor_email": email
      }));
    }
    else window.location.forcereload(false);
  }, [userId, email]);

  useEffect(() => {
    if (requiredFiles.length > 0) {
      // console.log("Required Files found: ", requiredFiles.length);
      // console.log("Required Files: ", requiredFiles);

      let tempFiles = [];
      requiredFiles.map((file, index) => {
        tempFiles.push(file.filename);
        return index;
      })

      // console.log("Temp Files: ", tempFiles);
      setThesis((prevState) => ({
        ...prevState,
        "required_files": tempFiles
      }));
    }

  }, [requiredFiles]);

  useEffect(() => {
    console.log("fffffii", thesisFiles)
  }, [thesisFiles])

  function renderFiles() {
    return requiredFiles.map((file) => {
      const { id, filename } = file;
      return (
        <div className="new-file" key={id}>
          <i className='fa fa-trash-alt' type="button" id={id} onClick={(e) => removeRequiredFile(e)}></i>
          <Form.Label className="filename">{filename}</Form.Label>
        </div>
      )
    });
  }

  function renderThesisFiles() {
    
    return(
      thesisFiles.map((fileList, index) => {
        for(let i=0; i<fileList.length; i++){ //multiple
          return (
            <div className="newThesisFile" key={fileList[i].name+index}>
              <i className='fa fa-trash-alt' type="button" onClick={() => removeThesisFile(fileList[i].name)}></i>
              <Form.Label className="filename">{fileList[i].name}</Form.Label>
            </div>
          )
        }
        return null
      })
    )
  }

  function removeThesisFile(filename){
    setThesisFiles(thesisFiles.filter(file=> file[0].name !== filename))
  }


  function renderAreas() {
    if (areas.length) {
      return areas.map((area, index) => {
        const { _id, name } = area;
        return (
          <option key={_id}>{name}</option>
        )
      })
    }
    else {
      return (
        <option key={0}>No areas found</option>
      )
    }
  }

  function addRequiredFile(e) {
    // Store file if name is not empty
    if (requiredFilename.length) {
      const newFile = {
        id: requiredFilename + "_" + new Date().getTime().toString(),
        filename: requiredFilename,
      };

      setRequiredFiles([...requiredFiles, newFile]);
      setRequiredFilename("");
    } else {
      console.log("File name is empty!");
    }
  }

  function removeRequiredFile(e) {
    const remove_id = e.target.id;
    // copy current list of items
    const files_list = [...requiredFiles];
    const updated_list = files_list.filter(file => file.id !== remove_id);
    setRequiredFiles(updated_list);
  }

  function handleFileChange(target) {
    if(target.files.length>0){
      //setThesisFiles(target.files)
      setThesisFiles((prev) => [...prev, target.files]);
    }
      
  }

  function handleChange(target) {
    if (target.name === "group") {
      setThesis((prevState) => ({
        ...prevState,
        [target.name]: target.value.split(" ")[0],
      }));
    }
    else {
      setThesis((prevState) => ({
        ...prevState,
        [target.name]: target.value,
      }));
    }
  }

  function resetThesis() {
    setThesis(initialThesis);

    setThesis((prevState) => ({
      ...prevState,
      "professor": userId
    }));

    setThesis((prevState) => ({
      ...prevState,
      "professor_email": email
    }));

    setFileKey("file_" + Math.random().toString(32));
    setRequiredFiles([]);
    setRequiredFilename("");
    setThesisFiles([]);

    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
  }

  function uploadThesis() {
    // console.log("Upload Thesis: ", thesis);
    const uploadData = async () => {

      await axios.post('/theses', thesis)
        .then(res => {
          setVariant('success');
          setMessage('Thesis submitted successfully!');
          setShowAlert(true);
          resetThesis();

          //notify
          sendNotifications()
        })
        .catch(err => {
          setVariant('danger');
          setMessage('Thesis failed to submit!');
          setShowAlert(true);
          resetThesis();
        });
    }

    uploadData();
  }

  //notify all the students with this favorite area
  async function sendNotifications(area) {

    const notifyStudent = async (studentId) => {
      await axios.post('/notifications', {
        title: "New Thesis available!",
        message: "Thesis: " + thesis.title + ". Professor: " + email,
        receiver: studentId,
        type: "new"
      })
        .then(res => {
          console.log("Notification sent successfully!");
        })
        .catch(err => {
          console.log("Notification failed to send!");
        });
    }

    var studentIds = []
    //get all the studentIds with this favorite area
    await axios.get('/favourites/'+thesis.area)
    .then(async (res) => {
      await res.data.map((favourite) => {
        return studentIds.push(favourite.student)
      })

      //console.log('Students to notify:', studentIds)

      //notify all these students      
      studentIds.map(studentId => notifyStudent(studentId))

    })
    .catch(err => console.log("Server Internal error occured!"))
  }

  function uploadFiles() {
    if (thesisFiles.length > 0) {
      console.log("File Upload: ", thesisFiles);

      let formData = new FormData();
      for (let i = 0; i < thesisFiles.length; i++) {
        for(let j = 0; j < thesisFiles[i].length; j++){
          formData.append('files', thesisFiles[i][j]);
        }
      }

      const uploadData = async () => {
        await axios.post('/api/uploads/theses', formData)
          .then(res => {
            // console.log("Response: ", res.data);
            thesis.thesis_files = res.data.files_list;
            uploadThesis();
          })
          .catch(err => {
            setVariant('danger');
            setMessage('Thesis failed to submit!');
            setShowAlert(true);
            resetThesis();
          });
      }

      uploadData();
    }
    else {
      uploadThesis();
    }
  }

  function submitThesis(e) {
    e.preventDefault();
    uploadFiles();
    // console.log("Thesis upload: ", thesis);
  }

  return (
    <Form className="new-thesis-form" onSubmit={(e) => { submitThesis(e) }}>
      {
        showAlert ?
          <Alert className='upload-alert' key={'alert-message'} variant={variant} onClose={() => setShowAlert(false)} dismissible>
            {
              message
            }
          </Alert>
          : null
      }
      <Form.Group controlId="formTitle">
        <Form.Label>Thesis Title*</Form.Label>
        <Form.Control
          type="text"
          name="title"
          onChange={(e) => handleChange(e.target)}
          value={thesis.title}
          required={true}
        />
      </Form.Group>

      <Form.Group controlId="formTopic">
        <Form.Label>Topic*</Form.Label>
        <Form.Control
          type="text"
          name="topic"
          onChange={(e) => handleChange(e.target)}
          value={thesis.topic}
          required={true}
        />
      </Form.Group>

      <Form.Group controlId="formArea">
        <Form.Label>Area*</Form.Label>
        <Form.Control
          as="select"
          name="area"
          onChange={(e) => {handleChange(e.target)}}
          value={thesis.area}
          required={true}
        >
          {
            renderAreas()
          }
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="formGroup">
        <Form.Label>Group*</Form.Label>
        <Form.Control
          as="select"
          name="group"
          onChange={(e) => handleChange(e.target)}
          value={thesis.group}
          required={true}
        >
          <option name='group-item'>BSc</option>
          <option name='group-item'>MSc</option>
          <option name='group-item'>PhD</option>
        </Form.Control>
      </Form.Group>

      <Form.Group controlId="formPrerequisites">
        <Form.Label>Prerequisites</Form.Label>
        <Form.Control
          as="textarea"
          rows="1"
          name="prerequisites"
          onChange={(e) => handleChange(e.target)}
          value={thesis.prerequisites}
        />
      </Form.Group>

      <Form.Group controlId="formDescription">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows="3"
          name="description"
          onChange={(e) => handleChange(e.target)}
          value={thesis.description}
        />
      </Form.Group>

      <Form.Group controlId="formCheckbox">
        <Form.Group controlId="formStudentFiles">
          <Form.Label>Student files required :</Form.Label>
          <Form.Control
            type="text"
            name="required_filename"
            className="form-control input-sm new-filename"
            placeholder="New file required"
            value={requiredFilename}
            onChange={(e) => setRequiredFilename(e.target.value)}
          />
          <Button
            className="btn btn-block add-file-btn"
            onClick={(e) => addRequiredFile(e)}
          >
            Add New File
          </Button>
        </Form.Group>
        <div className="required-files">
          {
            renderFiles()
          }
        </div>
      </Form.Group>

      <Form.Group className="upload-files">
        <Form.Group>
          <Form.Label>Upload files (optional) :</Form.Label>
          <Form.File
            key={fileKey}
            id="formControlFile"
            name="thesis_files"
            className='file-input'
            onChange={(e) => handleFileChange(e.target)}
            accept=".zip,.pdf,.doc,.docx,.txt"
            multiple
          />
        </Form.Group>
        <div className="required-files">
          {
           renderThesisFiles()
          }
          
        </div>
      </Form.Group>

      <Button
        className="btn-grad submit-thesis-form"
        type="submit"
      >
        Submit Thesis
      </Button>
    </Form>
  );
}