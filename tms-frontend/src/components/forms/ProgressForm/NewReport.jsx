import { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import "./style.css";

export default function NewReport({
  userId,
  thesisCompleted,
  onSubmitThesis,
  thesisData,
  email,
}) {
  const initialReport = {
    userId: userId,
    title: "",
    description: "",
    isFinal: false,
    report_files: "",
  };

  const [report, setReport] = useState(initialReport);
  const [reportFiles, setReportFiles] = useState([]);
  const [fileKey, setFileKey] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");

  useEffect(() => {
    setReport((prevState) => ({
      ...prevState,
      userId: userId,
    }));
  }, [userId]);

  function resetReport() {
    setReport(initialReport);
    setFileKey("file_" + Math.random().toString(32));
    setReportFiles([]);
  }

  //notify all the supervisors for the new report
  async function sendNotifications() {
    const notifySupervisor = async (supervisorId) => {
      await axios
        .post("/notifications", {
          title: "New Report! " + report.title,
          message: "Thesis: " + thesisData.thesis.title + ". Student: " + email,
          receiver: supervisorId,
          type: "new",
        })
        .then(() => {
          console.log("Notification sent successfully!");
        })
        .catch(() => {
          console.log("Notification failed to send!");
        });
    };

    thesisData.supervisor.map((supervisorId) => {
      notifySupervisor(supervisorId);
    });
  }

  function uploadReport() {
    // console.log("Upload Report: ", report);
    const uploadData = async () => {
      await axios
        .post("/api/theses_reports", report)
        .then((res) => {
          sendNotifications();

          setVariant("success");
          setMessage("Report submitted successfully!");
          setShowAlert(true);
        })
        .catch((err) => {
          setVariant("danger");
          setMessage("Report failed to submit!");
          setShowAlert(true);
        });

      if (report.isFinal) {
        await axios.patch("/api/assigned_theses/" + userId, {
          attr: "status",
          value: "completed",
        });
        onSubmitThesis(true);
      }

      resetReport();
    };

    uploadData();
  }

  function uploadFiles() {
    if (reportFiles.length > 0) {
      // console.log("File Upload: ", reportFiles);
      let formData = new FormData();
      for (let i = 0; i < reportFiles.length; i++) {
        for (let j = 0; j < reportFiles[i].length; j++) {
          formData.append("files", reportFiles[i][j]);
        }
      }

      const uploadData = async () => {
        await axios
          .post("/api/data/uploads/reports", formData)
          .then((res) => {
            // console.log("Response: ", res.data);
            report.report_files = res.data.files_list;
            uploadReport();
          })
          .catch(() => {
            setVariant("danger");
            setMessage("Report failed to submit!");
            setShowAlert(true);
            resetReport();
          });
      };

      uploadData();
    } else {
      uploadReport();
    }
  }

  function handleFileChange(target) {
    if (target.files.length > 0) {
      setReportFiles((prev) => [...prev, target.files]);
      setReport((prevState) => ({
        ...prevState,
        report_files: target.files,
      }));
    }
  }

  function removeReportFile(filename) {
    setReportFiles(reportFiles.filter((file) => file[0].name !== filename));
  }

  function renderReportFiles() {
    return reportFiles.map((fileList, index) => {
      for (let i = 0; i < fileList.length; i++) {
        //multiple
        return (
          <div className="newThesisFile" key={fileList[i].name + index}>
            <i
              className="fa fa-trash-alt"
              // type="button"
              onClick={() => removeReportFile(fileList[i].name)}
            ></i>
            <Form.Label className="filename">{fileList[i].name}</Form.Label>
          </div>
        );
      }
    });
  }

  function handleChange(target) {
    setReport((prevState) => ({
      ...prevState,
      [target.name]: target.value,
    }));
  }

  function submitReport(e) {
    e.preventDefault();
    console.log("Report: ", report);

    if (report.isFinal) {
      if (report.report_files[0]) {
        uploadFiles();
      } else {
        setVariant("warning");
        setMessage("Warning! Final Report must contain at least one file.");
        setShowAlert(true);
      }
    } else {
      uploadFiles();
    }
  }

  return (
    <div className="tw-flex tw-flex-1 tw-align-middle tw-justify-center">
      <Form
        onSubmit={(e) => submitReport(e)}
        className="tw-w-full tw-max-w-4xl tw-bg-white tw-px-4 tw-py-6 tw-rounded-2xl"
      >
        {showAlert ? (
          <Alert
            className="upload-alert"
            key={"alert-message"}
            variant={variant}
            onClose={() => setShowAlert(false)}
            dismissible
          >
            {message}
          </Alert>
        ) : null}
        <Form.Group controlId="formDescription" className="mb-4">
          <Form.Label className="tw-text-dark-sky-blue tw-text-sm tw-font-bold">
            Report Title
          </Form.Label>
          <Form.Control
            name="title"
            type="text"
            value={report.title}
            onChange={(e) => handleChange(e.target)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formDescription" className="mb-4">
          <Form.Label className="tw-text-dark-sky-blue tw-text-sm tw-font-bold">
            Description
          </Form.Label>
          <Form.Control
            name="description"
            as="textarea"
            rows={4}
            value={report.description}
            onChange={(e) => handleChange(e.target)}
            required
          />
        </Form.Group>
        <Form.Group className="tw-mb-4 tw-py-3 tw-px-6 tw-bg-light-pale-blue-white tw-rounded-lg">
          <Form.Group>
            <Form.Label>Upload files (optional) :</Form.Label>
            <Form.Control
              key={fileKey}
              id="formControlFile"
              name="thesis_files"
              className="file-input"
              type="file"
              onChange={(e) => handleFileChange(e.target)}
              accept=".zip,.pdf,.doc,.docx,.txt"
              multiple
            />
          </Form.Group>
          <div className="required-files">{renderReportFiles()}</div>
        </Form.Group>
        <Form.Group controlId="formCheckbox" className="tw-mb-4 tw-select-none">
          <Form.Check
            className="tw-m-0"
            inline
            label={"Submit Thesis"}
            name="isFinal"
            type="checkbox"
            id="isFinalCheck"
            checked={report.isFinal}
            onChange={(e) => {
              // console.log("Checkbox: ", report.isFinal);
              setReport((prevState) => ({
                ...prevState,
                isFinal: !report.isFinal,
              }));
            }}
          />
        </Form.Group>
        <div className="tw-flex tw-justify-between tw-items-center">
          {report.isFinal ? (
            <span className="tw-inline-block tw-text-red-incorrect tw-align-middle">
              Caution: If you submit thesis you will not be able to upload more
              reports!
            </span>
          ) : (
            <span className="tw-inline-block tw-text-red-incorrect tw-align-middle"></span>
          )}
          <button
            className="tw-bg-transparent hover:tw-bg-mid-pale-blue tw-text-dark-sky-blue tw-font-semibold hover:tw-text-white tw-py-2 tw-px-4 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
            type="submit"
            disabled={thesisCompleted}
          >
            {thesisCompleted ? "Submit Thesis" : "Submit Report"}
          </button>
        </div>
      </Form>
    </div>
  );
}
