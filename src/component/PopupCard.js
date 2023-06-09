import { DesktopAccessDisabled, ScreenshotMonitor, NoCell, Smartphone, InfoOutlined } from "@mui/icons-material";
import { useState } from "react";
import { Card, Stack, Button, Overlay} from "react-bootstrap";
import ModalDeleteAlert from "./ModalDeleteAlert";
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ViewPopupModal from "./ViewPopupModal";

export default function PopupCard({data, deletePopup}) {
  const [popupDelete, setPopupDelete]=useState(false)
  const [popupUpdate, setPopupUpdate]=useState(false)

  function handleDelete(){
    deletePopup(data.ref)
  }
  function handleClose(){
    setPopupUpdate(false)
    setPopupDelete(false)
  }




  return (
        <Card border={data.ref === "default" ? "danger": null}>
            <Card.Body>
                <Card.Title className="d-flex justify-content-between" >
                  <div className='d-flex align-items-center card-title'>
                      <div className="fs-4">{data.id}</div>
                      {data.id === "default"
                        ?
                        <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={<Tooltip>This popup will trigger as the last option if other rules are present. It can be edited but not deleted</Tooltip>}>
                          <InfoOutlined style={{fontSize:"1rem", color:"gray", marginLeft:"5px"}}/>
                        </OverlayTrigger>
                        :null
                      }
                  </div>
                  <div className="d-flex align-items-center">
                    {(data.mobile === "true")
                    ?<OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Mobile enabled</Tooltip>}><Smartphone style={{color: "#000000c5", fontSize:"1.75rem" ,marginRight:"0.5rem"}}/></OverlayTrigger>
                    :<OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Mobile disabled</Tooltip>}><NoCell style={{color: "#0000004c", marginRight:"0.5rem", fontSize:"1.75rem"}} /></OverlayTrigger>}
                    {(data.desktop === "true")
                    ?
                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Desktop enabled</Tooltip>}><ScreenshotMonitor style={{color: "#000000c5", fontSize:"1.75rem" }}/></OverlayTrigger>
                    :
                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Desktop disabled</Tooltip>}><DesktopAccessDisabled style={{color: "#0000004c", fontSize:"1.75rem"}}/></OverlayTrigger>}
                  </div>
                </Card.Title>
                <Stack direction="horizontal" gap='2' className="mt-4">
                    <Button onClick={(e)=>{setPopupUpdate(!popupUpdate); e.target.blur()}} variant="light" className="ms-auto">Edit</Button>
                    <Button hidden={data.id === "default"} onClick={()=>{setPopupDelete(!popupDelete)}} variant='outline-danger'>Delete</Button>
                </Stack>        
                
                <ViewPopupModal data={data} show={popupUpdate} handleClose={handleClose}/>
                <ModalDeleteAlert show={popupDelete} id={data.id} handleClose={handleClose} handleDelete={handleDelete}/>
            </Card.Body>
        </Card>
      )
}
