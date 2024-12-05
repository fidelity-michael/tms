import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

export default function NewArea() {
  const initialArea = {
    area_name: "",
    description: "",
  };

  const [area, setArea] = useState(initialArea);

  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");

  function uploadArea() {
    const uploadData = async () => {
      await axios
        .post("/api/areas", area)
        .then((res) => {
          setVariant("success");
          setMessage("Area submitted successfully!");
          setShowAlert(true);
          resetForm();
        })
        .catch((err) => {
          setVariant("danger");
          setMessage("Area failed to submit!");
          setShowAlert(true);
          resetForm();
        });
    };

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
    <Form
      className=" tw-bg-white tw-min-w-96 tw-shadow-md tw-rounded tw-px-8 tw-pt-6 tw-pb-8 tw-mb-4"
      onSubmit={(e) => {
        submitForm(e);
      }}
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
      <Form.Group controlId="formName" className="mb-4">
        <Form.Label className="tw-block tw-text-dark-sky-blue tw-text-sm tw-font-bold tw-mb-2">
          Category Name
        </Form.Label>
        <Form.Control
          type="text"
          name="area_name"
          onChange={(e) => handleChange(e.target)}
          value={area.area_name}
        />
      </Form.Group>
      <Form.Group controlId="formDescription" className="mb-4">
        <Form.Label className="tw-block tw-text-dark-sky-blue tw-text-sm tw-font-bold tw-mb-2">
          Description
        </Form.Label>
        <Form.Control
          as="textarea"
          rows="3"
          name="description"
          onChange={(e) => handleChange(e.target)}
          value={area.description}
        />
      </Form.Group>
      <div className="tw-flex tw-justify-end">
        <button
          type="submit"
          className="flex-row-reverse tw-justify-end tw-bg-dark-sky-blue hover:tw-bg-mid-pale-blue tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded focus:tw-outline-none focus:tw-shadow-outline"
        >
          Add Category
        </button>
      </div>
    </Form>
  );
}
