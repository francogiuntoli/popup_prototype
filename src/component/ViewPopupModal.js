import React, {useState, useCallback, useEffect, useRef} from 'react'
import {InfoOutlined, Cancel, AddOutlined, LocalSeeOutlined} from '@mui/icons-material';

import { Form, Modal, Button, Col, Row, InputGroup, Card, OverlayTrigger, Tooltip, Overlay, CloseButton} from "react-bootstrap"
import RangeSlider from 'react-bootstrap-range-slider';
import { usePopups } from '../context/PopupsContext';
import {popover} from "../utils/popovers"


export default function ViewPopupModal({show, handleClose, data, handleCancel}) {
    const {getPopups, editPopup} = usePopups()
    
    const [popupId, setPopupId] = useState(`${data?.id}`)
    const [trigger, setTrigger] = useState(`${data?.trigger}`)
    const [delay, setDelay] = useState(Number(data?.delay))
    const [repeatAfter, setRepeatAfter] = useState(Number(data?.repeat_after))
    const [mobile, setMobile] = useState(data?.mobile==="true")
    const [desktop, setDesktop] = useState(data?.desktop==="true")
    const [event, setEvent] = useState('path')
    const [logic, setLogic] = useState('exactly-matches')
    const [conditionValue, setConditionValue] = useState("")
    const [popupText, setPopupText] = useState('')
    const [popupLang, setPopupLang] = useState('')
    
    const [duplicateLang, setDuplicateLang ] = useState([])
    const [duplicatedId, setDuplicatedId ] = useState(false)

    
    const bottomRef = useRef(null)
    const idRef = useRef(null)

    
      
    const [popupMessages, setPopupMessages] = useState(data.messages.map((e)=> e))
    const [backupPopup, setBackupPopup] = useState(data.messages.map((e)=> e))
    

    useEffect(()=>{

        updateFormValues(data)
    }, [])


    const findDuplicateLanguages = (arr)=> {
        const languageIndices = {};
        const duplicates = [];
        for (let i = 0; i < arr.length; i++) {
            const language = arr[i].language;
            if (languageIndices[language]) {
            duplicates.push(i);
            } else {
            languageIndices[language] = 1;
            }
        }
        return setDuplicateLang(duplicates)
    }
    
    const findDuplicateId = (arr, oldId, newId)=> {
        for (const item of arr) {
            if (item.id === newId && newId !== oldId) {
            return true;
            }
        }
        return false;
    }
    
    useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior: 'smooth'})
        findDuplicateLanguages(popupMessages)
    },[popupMessages, popupLang])


    function handleCancel(){
        setPopupMessages(backupPopup)
    }

                                  
    const updateFormValues = (obj) =>{
        if(obj?.condition?.split(' ')[1] !== undefined){
            setConditionValue(JSON.parse(obj?.condition?.split(' ')[2]))
        }else if(obj?.condition?.split('(')[1]?.split(')')[0]){
            setConditionValue(JSON.parse(obj?.condition?.split("(")[1].split(")")[0]))
        }

        switch(true){
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="window")):
                setEvent("path")
                break;
            case (obj?.condition?.split(' ').some(e=> e==="window")):
                setEvent("path")
                break;
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="shopify_product_title")):
                setEvent("product-name")
                break;
            case (obj?.condition?.split(' ').some(e=> e==="shopify_product_title")):
                setEvent("product-name")
                break;    
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="shopify_current_page")):
                setEvent("page-request")
                break;
            case (obj?.condition?.split(' ').some(e=> e==="shopify_current_page")):
                setEvent("page-request")
                break;
        }
                            
        switch(true){
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="includes") && (obj?.condition?.startsWith('!'))):
                setLogic("does-not-contain")    
                break;
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="includes" )):
                setLogic("contains")
                break;    
            case (obj?.condition?.split(' ').some(e=>e === "===")):
                setLogic(`exactly-matches`)
                break;
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="startsWith") && (obj?.condition?.startsWith('!'))):
                setLogic("does-not-start-with")
                break;
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="startsWith")):
                setLogic("starts")
                break;
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="endsWith") && (obj?.condition?.startsWith('!'))):
                setLogic("does-not-end-with")
                break;
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="endsWith")):
                setLogic(`ends`)
                break;
            case (obj?.condition?.split('(')[0].split(".").some(e=> e==="match")):
                setLogic(`match-regex`)
                break;
            case (obj?.condition?.split(' ').some(e=>e === "!==")):
                setLogic(`does-not-exactly-match`)
                break;
        }
    }
    
    function createPopover(reference){
        return(
            <Tooltip id={reference}>{popover[reference]}</Tooltip>
        )
    }
                                            
    const handleSubmit = (e)=> {
        e.preventDefault()
        
        let popupObjs= popupMessages.map(popup => {
            return {
              language: popup.language,
              texts: popup.texts.filter(text => text !== '')
            }
          });
    
        let messagesObj=popupObjs
        
        let conditionEvent = (event === "path") ? "window.location.href" : (event === "product-name") ? "shopify_product_title": "shopify_current_page"
        let conditionFinal;

        switch(logic){
            case "exactly-matches":
                conditionFinal = `${conditionEvent} === "${conditionValue}"`
                break;
            case "contains":
                conditionFinal = `${conditionEvent}.includes("${conditionValue}")`
                break;
            case "starts":
                conditionFinal = `${conditionEvent}.startsWith("${conditionValue}")`
                break;
            case "ends":
                conditionFinal = `${conditionEvent}.endsWith("${conditionValue}")`
                break;
            case "match-regex":
                conditionFinal = `${conditionEvent}.match("${conditionValue}")`
                break;
            case "does-not-exactly-match":
                conditionFinal = `${conditionEvent} !== "${conditionValue}"`
                break;
            case "does-not-contain":
                conditionFinal = `!${conditionEvent}.includes("${conditionValue}")`
                break;
            case "does-not-start-with":
                conditionFinal = `!${conditionEvent}.startsWith("${conditionValue}")`
                break;
            case "does-not-end-with":
                conditionFinal = `!${conditionEvent}.endsWith("${conditionValue}")`
                break;
        }

    const formData = {
        ref:data.ref,
        id:popupId,
        trigger:trigger,
        condition:`${conditionFinal}`,
        delay:delay,
        desktop:`${desktop}`,
        mobile:`${mobile}`,
        repeat_after:repeatAfter,
        messages:messagesObj,
        start_from_module:""
    };


    editPopup(formData)
    handleClose()

}

    const handleDeletePopupText = (event ,pIndex, pTIndex) => {
        const popupIndex = pIndex
        const popupTextIndex = pTIndex
        const currentPopups = [].concat(popupMessages)
        const newPopups = currentPopups;
        newPopups[popupIndex].texts.splice(popupTextIndex, 1);
        setPopupMessages([...newPopups])
        }

    const handleDeletePopupBox = useCallback((event,pIndex) => {
        const popupIndex = pIndex
        const currentPopups = [].concat(popupMessages)
        currentPopups.splice(popupIndex, 1);
        setPopupMessages([...currentPopups])
        },[popupMessages],
    )

    const handleChangeId = useCallback((e)=>{
        setPopupId(e.target.value)
        setDuplicatedId(findDuplicateId(getPopups, data.id, idRef.current.value))
    },[])

    const handleChangeTrigger =(e)=>{
        setTrigger(e.target.value)
    }

    const handleChangeDelay =(e)=>{
        setDelay(e.target.value)
    }

    const handleChangeRepeatAfter =(e)=>{
        setRepeatAfter(e.target.value)
    }

    const handleSwitchMobile= () => {
        setMobile(!mobile)
    }

    const handleSwitchDesktop =()=>{
        setDesktop(!desktop)
    }

    const handleChangeEventCondition=(e)=>{
        setEvent(e.target.value)
    }

    const handleChangeLogicCondition=(e)=>{
        setLogic(e.target.value)
    }

    const handleChangeConditionValue=(e)=>{
        setConditionValue(e.target.value)
    }

    const updateLanguage = (event) => {
            findDuplicateLanguages(popupMessages)
            const popupIndex = event.currentTarget.dataset.popupindex
            const currentPopups = [...popupMessages]
            setPopupLang(currentPopups[popupIndex].language = event.currentTarget.value)
            setPopupMessages(currentPopups)
    }

    const updateText = (event) => {
        const popupIndex = event.currentTarget.dataset.popupindex
        const popupTextIndex = event.currentTarget.dataset.popuptextindex
        const currentPopups = [...popupMessages]
        currentPopups[popupIndex] = {
            ...currentPopups[popupIndex], 
            texts: currentPopups[popupIndex].texts.map((text, index)=> index === Number(popupTextIndex) ? event.currentTarget.value : text)

        }
        setPopupMessages(currentPopups)
    }

    const handleAddPopup = (event) => {
        event.target.blur()
        const currentPopups = [].concat(popupMessages)
        setPopupMessages([...currentPopups, { language: '', texts: [''] }])
        }

    const handleAddPopupText = (event,pIndex) => {
        event.target.blur()
        const popupIndex = pIndex
        const currentPopups = [].concat(popupMessages)
        currentPopups[popupIndex].texts.push('')
        setPopupMessages(currentPopups)
        }
        

    return (
        <Modal keyboard={false} show={show} onHide={handleClose} backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header   >
                    <Modal.Title>Edit Popup</Modal.Title>
                    <CloseButton className='close-button' onMouseOutCapture={(e)=>{e.target.blur()}} onClick={()=>{handleClose(); handleCancel()}}/>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className='mb-3 d-flex justify-content-between' as={Row}>
                        <Col xs='8'>
                        <Form.Label>ID</Form.Label>

                        <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("id")}>
                                <InfoOutlined style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                        </OverlayTrigger>
                        <Form.Control ref={idRef} type="text" value={popupId} isInvalid={duplicatedId} disabled={popupId === "default" && !duplicatedId} readOnly={popupId === "default" && !duplicatedId} required onChange={handleChangeId}/>
                        {
                            duplicatedId?
                            <Overlay target={idRef} show={duplicatedId} placement="bottom" >
                            <Tooltip>ID already used</Tooltip>
                        </Overlay>
                        :null
                        }
                        </Col>
                        <Col xs='4'>
                        <Form.Label >Enable for:</Form.Label>
                        <OverlayTrigger trigger={['hover', 'focus']} placement="left" overlay={createPopover("enabled")}>
                                <InfoOutlined style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                        </OverlayTrigger>
                        <Form.Check label='Mobile' type="switch" isInvalid={!mobile} isValid={mobile} id="mobile" checked={Boolean(mobile)} onChange={handleSwitchMobile}/>
                        <Form.Check label='Desktop' type="switch" isInvalid={!desktop} isValid={desktop} id="desktop" checked={Boolean(desktop)} onChange={handleSwitchDesktop}/>
                        </Col>
                    </Form.Group>

                    <Form.Group className='mb-3'controlId="trigger" as={Row}>
                        <Col xs="6">
                            <Form.Label>Trigger</Form.Label>
                            <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("trigger")}>
                                <InfoOutlined style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                            </OverlayTrigger>
                            <Form.Select aria-label="trigger" value={trigger} disabled={popupId === "default" && !duplicatedId} onChange={handleChangeTrigger}>
                                <option value="page_load">Page load</option>
                                <option value="inactivity">Inactivity</option>
                                <option value="chat_minimized">Chat minimized</option>
                            </Form.Select>
                        </Col>
                        <Col xs='6' >
                        <Form.Label>Repeat after</Form.Label>
                        <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" overlay={createPopover("repeat")}>
                            <InfoOutlined style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                        </OverlayTrigger>
                        <InputGroup>
                            <InputGroup.Text>Every</InputGroup.Text>
                            <Form.Control type="number" defaultValue={repeatAfter} required min={0} max={15} step={1} onChange={handleChangeRepeatAfter} />
                            <InputGroup.Text>times</InputGroup.Text>
                        </InputGroup>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <div>

                        <Form.Label>Delay</Form.Label>
                        <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("delay")}>
                                <InfoOutlined style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                            </OverlayTrigger>                
                        </div>
                        <Col xs='8'>
                            <RangeSlider variant="primary" value={delay} step={500} min={0} max={15000} onChange={handleChangeDelay}></RangeSlider>
                        </Col>
                        <Col xs='4' >
                            <InputGroup className="d-flex">
                            <Form.Control type='number' step={500} min={0} max={15000}value={delay} onChange={handleChangeDelay}/>
                            <InputGroup.Text>ms</InputGroup.Text>
                            </InputGroup>                        
                        </Col>
                    </Form.Group>
                    <Form.Group className='mb-2'controlId="event" as={Row}>
                        <Col xs="5">
                            <Form.Label>Event condition</Form.Label>
                            <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("event_condition")}>
                                <InfoOutlined style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                            </OverlayTrigger> 
                            <Form.Select aria-label="event-condition"  value={event} disabled={popupId === "default" && !duplicatedId} onChange={handleChangeEventCondition}>
                                <option value="path">URL</option>
                                <option value="product-name">Product title</option>
                                <option value="page-request">Page request</option>
                            </Form.Select>
                        
                            
                        </Col>
                        <Col xs="7">
                            <Form.Label>Logic condition</Form.Label>
                            <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" overlay={createPopover("event_logic")}>
                                <InfoOutlined style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                            </OverlayTrigger> 
                            <Form.Select aria-label="logic-condition" value={logic} disabled={popupId === "default" && !duplicatedId} onChange={handleChangeLogicCondition}>
                                <option value="exactly-matches">exactly matches</option>
                                <option value="contains">contains</option>
                                <option value="starts">starts with</option>
                                <option value="ends">ends with</option>
                                <option value="match-regex">match regex</option>
                                <option value="does-not-exactly-match">does NOT exactly match</option>
                                <option value="does-not-contain">does NOT contain</option>
                                <option value="does-not-start">does NOT start with</option>
                                <option value="does-not-end">does NOT end with</option>
                                </Form.Select>
                        </Col>
                    </Form.Group>     
                    <Form.Group className='mb-3'controlId="condition-value">
                        <Form.Label>Condition value</Form.Label>
                        <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("condition_value")}>
                            <InfoOutlined style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                        </OverlayTrigger> 
                        <Form.Control type="text" value={conditionValue} disabled={popupId === "default" && !duplicatedId} readOnly={popupId === "default" && !duplicatedId} required onChange={handleChangeConditionValue}/>
                    </Form.Group>           
                    <Form.Group className='mb-3'controlId="messages">

                        <Form.Label>Messages</Form.Label>
                        <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("messages")}>
                        <InfoOutlined style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                    </OverlayTrigger> 
                    {/* {console.log(getPopups.filter(u=>u == data )[0].messages.map(e=>e))} */}
                    {
                        
                    popupMessages.map((popup, popupIndex) => (
                        <div key={popupIndex}>
                            <Card className="mb-2">
                                <Card.Header className="d-flex justify-content-between align-items-baseline">
                                    <Col xs='5' className='mb-1 mt-2'>
                                        <InputGroup hasValidation >
                                            <InputGroup.Text>Language</InputGroup.Text>
                                            <Form.Control 
                                                isInvalid={duplicateLang.includes(popupIndex)}
                                                required
                                                data-popupindex={popupIndex}
                                                onChange={(e)=>updateLanguage(e, popupIndex)}
                                                placeholder='es'
                                                value={popup.language} 
                                                maxLength={2}
                                                />
                                            <Form.Control.Feedback type="invalid">Duplicated languages</Form.Control.Feedback>
                                        </InputGroup>
                                    </Col>
                                    <Button hidden={(popupMessages.length===1)} variant="outline-danger" size='sm' onClick={(e, pIndex)=>{handleDeletePopupBox(e, popupIndex)}}>Delete</Button>
                                </Card.Header>
                            <Card.Body>
                            {popup.texts.map((text, popupTextIndex) => (
                                <div key={popupTextIndex}>
                                <Col  className="d-flex justify-content-center align-items-center gap-1">
                                    <InputGroup  className='mb-1'>
                                        <InputGroup.Text>Text</InputGroup.Text>
                                        <Form.Control 
                                            required={popupTextIndex === 0}
                                            data-popupindex={popupIndex}
                                            data-popuptextindex={popupTextIndex}
                                            key={popupTextIndex}
                                            onChange={updateText}
                                            value={text}
                                            maxLength={100}
                                            />
                                    </InputGroup>
                                    
                                    <Cancel className='remove-button' hidden={(popupTextIndex === 0 && (popup.texts[popupTextIndex+1]?.length === 0)) || popup.texts.length <= 1} onClick={(e, pIndex, pTIndex)=>{handleDeletePopupText(e, popupIndex, popupTextIndex)}}/> 
                                            
                                </Col>
                                <Col className="d-flex flex-column align-items-end mt-2 me-1 justify-content-center">
                                {
                                    (popup.texts.length -1  ===  popupTextIndex )
                                    ?                                    
                                    <Button className='edit-button' size={"sm"} disabled={(popupTextIndex == 2 || (popup.texts[popupIndex+1]?.length === 0))} onClick={(e, pIndex)=>{handleAddPopupText(e, popupIndex)}}><AddOutlined fontSize={"small"} />Add line</Button>
                                    :
                                    null
                                }
                                </Col>
                                </div>
                                ))}
                                
                            </Card.Body>
                            </Card>
                        </div>
                    ))}
                    </Form.Group>          



                <div  className="d-flex justify-content-between flex-column gap-4" >
                    <Button className="d-flex align-items-center justify-content-center edit-button" size="sm" disabled={(popupMessages.length === 4) || duplicateLang.length>0} style={{width:"auto", margin:"auto"}} onClick={(e)=>{handleAddPopup(e)}}><AddOutlined fontSize="small"/>Add language</Button>
                </div>

                </Modal.Body>
                <Modal.Footer ref={bottomRef} className="me-2 gap-4">
                    <Button  className="cancel-button" variant='outline-secondary' onClick={(event)=>{handleClose(); handleCancel(); event.preventDefault()}}>Cancel</Button>
                    <Button  disabled={duplicateLang.length>0 || duplicatedId} variant='primary' type='submit'>Save</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}   