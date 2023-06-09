import React from 'react'
import { Modal , Button} from 'react-bootstrap'

export default function ModalDeleteAlert({show, id, handleClose, handleDelete}) {
    
  return (
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton >
            <Modal.Title>Delete popup</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-grid justify-content-center">
            <h6>Are you sure you want to delete <strong>"{id}"</strong></h6>
            <div className="d-flex justify-content-between m-1">
                <Button onClick={handleClose} variant="outline-secondary">Cancel</Button>
                <Button onClick={()=>{handleDelete(id)}} variant="danger">Delete</Button>
            </div>
        </Modal.Body>
    </Modal>
  )
}
