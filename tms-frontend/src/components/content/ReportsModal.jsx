import React from "react";
import { Modal } from "react-bootstrap";
import MyReports from "../content/MyReports";

export default function ReportsModal({ title, userId, show, email, onShow }) {
  return (
    <Modal show={show} onHide={(e) => onShow(false)} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ marginTop: "-1.75rem" }}>
          <MyReports userId={userId} email={email} user="professor" />
        </div>
      </Modal.Body>
    </Modal>
  );
}
