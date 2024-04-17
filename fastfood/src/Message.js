import React, { useState } from 'react';
import { Modal, Button, Form } from "react-bootstrap";
import './css/fastfood.css'

function Message({ children, show, setShow }) {
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const title = children[0]
  const body = children.slice(1)
  return (
    <>
      <Modal show={show}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {body}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose} variant="secondary">Close Modal</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Message;
