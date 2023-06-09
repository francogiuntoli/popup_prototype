import {useState} from 'react'
import { Container, Stack, Button } from "react-bootstrap";
import { usePopups } from "./context/PopupsContext";

import AddPopupModal from "./component/AddPopupModal";
import PopupCard from "./component/PopupCard";

import './App.css';

function App() {
 const [showAddPopupModal, setShowAddPopupModal] = useState(false)

const {getPopups, deletePopup} = usePopups()
function handleAddPopupModal(e){
  e.target.blur()
  setShowAddPopupModal(true)
}

  return (
    <>
    <Container style={{ width:"60%", maxWidth:"600px"}}>
      <Stack direction="horizontal" gap='2' className='mb-4'>
        <h1 className="me-auto font-face-gt">Popups</h1>
        <Button variant='danger' onClick={(e)=>{handleAddPopupModal(e)}}>Add Popup</Button>
      </Stack>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, mixmax(300px,1fr))', gap:'1rem', alignItems:'flex-start'}}>
        {
        getPopups.map(data=>(
          <PopupCard key={data.ref} data={data} deletePopup={deletePopup} />
        ))
        }
      </div>
    </Container>
    <AddPopupModal show={showAddPopupModal} handleClose={()=>{setShowAddPopupModal(false)}}/>
  </>
  );
}

export default App;
