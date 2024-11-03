import React from "react";
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';

export default function ConfirmationModal({ show, setShow, path, setResponse, message }) {

    function cancel(target) {
        setResponse("canceled");
        setShow(false);
    }

    function confirm(e) {
        // console.log("Delete: " + path);
        axios.delete(path)
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
        <Modal
            show={show}
            onHide={(e) => setShow(false)}
            animation={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Confirm Action</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    message ?
                        <p>{message}</p>
                    :
                        <p>This can't be undone</p>
                }
                
            </Modal.Body>
            <Modal.Footer>
                <Button className="cancel-modal" variant="light" onClick={(e) => cancel(e.target)}>
                    Cancel
          </Button>
                <Button className="confirm-modal btn-danger" variant="light" onClick={(e) => confirm(e.target)}>
                    Delete
          </Button>
            </Modal.Footer>
        </Modal>
    )
}
