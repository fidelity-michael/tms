import React from "react";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";

export default function ConfirmationModal({
  show,
  setShow,
  path,
  setResponse,
  message,
}) {
  function cancel(target) {
    setResponse("canceled");
    setShow(false);
  }

  function confirm(e) {
    // console.log("Delete: " + path);
    axios
      .delete(path)
      .then((data) => {
        setResponse("deleted");
      })
      .catch((err) => {
        setResponse("failed");
        console.log(err);
      });

    setShow(false);
  }

  return (
    <Modal show={show} onHide={(e) => setShow(false)} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Action</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message ? <p>{message}</p> : <p>This can't be undone</p>}
      </Modal.Body>
      <Modal.Footer>

        <div className="tw-flex tw-gap-1">
          <button
            onClick={(e) => cancel(e.target)}
            className="tw-bg-transparent hover:tw-bg-dark-sky-blue tw-text-dark-sky-blue tw-font-semibold hover:tw-text-white tw-py-2 tw-px-4 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
          >
            Cancel
          </button>
          <button
            onClick={(e) => confirm(e.target)}
            className="tw-font-semibold tw-text-white tw-bg-red-incorrect tw-py-2 tw-px-4 tw-border-dark-sky-blue hover:tw-opacity-95 hover:tw-text-dark-sky-blue hover:tw-border-dark-sky-blue tw-rounded"
          >
            Delete
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
