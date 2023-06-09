import React, {useState, useCallback, useRef, useEffect} from 'react'
import {HelpOutline, Delete, AddCircleOutline} from '@mui/icons-material';

import { Form, Modal, Button, Col, Row, InputGroup, Card, Popover, OverlayTrigger, Tooltip, Overlay, CloseButton} from "react-bootstrap"
import RangeSlider from 'react-bootstrap-range-slider';
import { usePopups } from '../context/PopupsContext';
import {popover} from "../utils/popovers"

export default function AddPopupModal({show, handleClose}) {

    const [popupId, setPopupId] = useState('')
    const [trigger, setTrigger] = useState('page-load')
    const [delay, setDelay] = useState(3000)
    const [repeatAfter, setRepeatAfter] = useState(0)
    const [mobile, setMobile] = useState(true)
    const [desktop, setDesktop] = useState(true)
    const [event, setEvent] = useState('path')
    const [logic, setLogic] = useState('exactly-matches')
    const [conditionValue, setConditionValue] = useState('')

    const [popupText, setPopupText] = useState('')
    const [popupLang, setPopupLang] = useState('')
    
    const [duplicateLang, setDuplicateLang ] = useState([])
    const [duplicatedId, setDuplicatedId] = useState(false)
    
    const defaultPopups = [{language: "en",texts:[""]}]

    const [popups, setPopups] = useState(defaultPopups)
    
    const {getPopups, addPopup} = usePopups()
    
    const bottomRef = useRef(null)
    const idRef = useRef(null)
    

    useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior: 'smooth'})
        findDuplicateLanguages(popups)
        findDuplicateId(getPopups, popupId)
    },[popups, popupId])


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

    const findDuplicateId = (arr, newId)=> {
        for (const item of arr) {
            if (item.id === newId) {
                return (setDuplicatedId(true))
            }
        }
        return setDuplicatedId(false);
    }

    const createPopover = (reference) => {
        return(<Tooltip id={reference} >{popover[reference]}</Tooltip>)
    }

    function handleReset(){
        setPopups(defaultPopups)
        setPopupId(``)
        setTrigger('page_load')
        setDelay(3000)
        setRepeatAfter(0)
        setMobile(true)
        setDesktop(true)
        setEvent('path')
        setLogic('exactly-matches')
        setConditionValue('')
    }

    const handleSubmit = (e) =>{
        e.preventDefault()
        
        let popupObjs= popups.filter(popup => popup.language !=='').map(popup => {
            return {
            language: popup.language ,
            texts: popup.texts.filter(text => text !== '')
            }
        });

        let messagesObj=popupObjs

        let conditionEvent = (event === "path") ? "window.location.href" : (event === "product-name") ? "shopify_product_title": "shopify_current_page"
        console.log(conditionEvent, logic, conditionValue)
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
    
        addPopup(formData)
        handleClose()
        handleReset()
    }

    const handleChangeId = (e)=>{
        setPopupId(e.target.value)
    }

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

    const handleUpdatePopupLanguage = useCallback((event) => {
            const popupIndex = event.currentTarget.dataset.popupindex
            const currentPopups = popups
            setPopupLang(currentPopups[popupIndex].language = event.currentTarget.value)
            setPopups(currentPopups)
            findDuplicateLanguages(popups)
    },[popups])
        
    const handleUpdatePopupText = useCallback((event) => {
        const popupIndex = event.currentTarget.dataset.popupindex
        const popupTextIndex = event.currentTarget.dataset.popuptextindex
        const currentPopups = popups
        const currentPopupText = popups[popupIndex].texts[popupTextIndex]
        setPopupText([...currentPopups, currentPopupText])
        currentPopups[popupIndex].texts[popupTextIndex] = event.currentTarget.value
        setPopups(currentPopups)
    },[popups])

    const handleAddPopup = useCallback((event) => {
        event.target.blur()
        const currentPopups = popups
        setPopups([...currentPopups, { language:'', texts: [''] }])
        },[popups],
    )

    const handleAddPopupText = useCallback((event,pIndex) => {
        event.target.blur()
        const popupIndex = pIndex
        const currentPopups = popups
        currentPopups[popupIndex].texts.push('')
        setPopups([...currentPopups])
        },[popups],
    )

    const handleDeletePopupText = useCallback((event ,pIndex, pTIndex) => {
        const popupIndex = pIndex
        const popupTextIndex = pTIndex
        const currentPopups = popups
        const newPopups = currentPopups;
        newPopups[popupIndex].texts.splice(popupTextIndex, 1);
        setPopups([...newPopups])
        },[popups]);

    const handleDeletePopupBox = useCallback((event,pIndex) => {
        const popupIndex = pIndex
        const currentPopups = popups
        currentPopups.splice(popupIndex, 1);
        setPopups([...currentPopups])
        },[popups],
    )


    return (
        <Modal keyboard={false} show={show} onHide={()=>{handleClose(); handleReset()}} backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header >
                    <Modal.Title>New Popup</Modal.Title>
                    <CloseButton onClick={()=>{handleClose(); handleReset()}}/>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group  className='mb-3 d-flex justify-content-between'  as={Row}>
                        <Col xs='8'>
                        
                            <Form.Label >ID</Form.Label>
                            
                            <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("id")}>
                                <HelpOutline style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                            </OverlayTrigger>
                        
                        <Form.Control ref={idRef} isInvalid={duplicatedId} type="text" required onChange={handleChangeId}/>
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
                        <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("enabled")}>
                                <HelpOutline style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                        </OverlayTrigger>
                        <Form.Check label='Mobile' type="switch" isInvalid={!mobile} isValid={mobile} id="mobile" checked={mobile} onChange={handleSwitchMobile}/>
                        <Form.Check label='Desktop' type="switch" isInvalid={!desktop} isValid={desktop} id="desktop" checked={desktop} onChange={handleSwitchDesktop}/>
                        </Col>
                    </Form.Group>
                    <Form.Group className='mb-3'controlId="trigger" as={Row}>
                        <Col xs="6">
                            <Form.Label>Trigger</Form.Label>
                            <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("trigger")}>
                                <HelpOutline style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                            </OverlayTrigger>
                            <Form.Select aria-label="trigger" onChange={handleChangeTrigger}>
                                <option value="page_load">Page load</option>
                                <option value="inactivity">Inactivity</option>
                                <option value="chat_minimized">Chat minimized</option>
                            </Form.Select>
                        </Col>
                        <Col xs='6' >
                        <Form.Label>Repeat after</Form.Label>
                        <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("repeat")}>
                            <HelpOutline style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                        </OverlayTrigger>
                        <InputGroup>
                            <InputGroup.Text>Every</InputGroup.Text>
                            <Form.Control type="number" defaultValue={repeatAfter} required min={0} step={1} onChange={handleChangeRepeatAfter} />
                            <InputGroup.Text>times</InputGroup.Text>
                        </InputGroup>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className='mb-3'>
                        <div>
                            <Form.Label>Delay</Form.Label>
                            <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("delay")}>
                                <HelpOutline style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                            </OverlayTrigger>                 
                        </div>
                        <Col xs='8'>
                        <RangeSlider variant="primary" value={delay} step={500} min={0} max={15000} onChange={handleChangeDelay}></RangeSlider>
                        </Col>
                        <Col xs='4' >
                            <InputGroup className="d-flex">
                            <Form.Control type='number' value={delay} onChange={handleChangeDelay}/>
                            <InputGroup.Text>ms</InputGroup.Text>
                            </InputGroup>                        
                        </Col>
                    </Form.Group>
                    <Form.Group className='mb-2'controlId="event" as={Row}>
                        <Col xs="5">
                            <Form.Label>Event condition</Form.Label>
                            <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("event_condition")}>
                                <HelpOutline style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                            </OverlayTrigger> 
                            <Form.Select aria-label="event-condition" onChange={handleChangeEventCondition}>
                                <option value="path">URL</option>
                                <option value="product-name">Product title</option>
                                <option value="page-request">Page request</option>
                            </Form.Select>
                        </Col>
                        <Col xs="7">
                            <Form.Label>Logic condition</Form.Label>
                            <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("event_logic")}>
                                <HelpOutline style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                            </OverlayTrigger> 
                            <Form.Select aria-label="logic-condition" onChange={handleChangeLogicCondition}>
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
                            <HelpOutline style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                        </OverlayTrigger> 
                        <Form.Control type="text" required onChange={handleChangeConditionValue}/>
                    </Form.Group>           
                    <Form.Label>Messages</Form.Label>
                    <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={createPopover("messages")}>
                        <HelpOutline style={{fontSize:"1rem", color:"gray", marginTop:"-4px", marginLeft:"5px"}}/>
                    </OverlayTrigger> 
                
                    {popups.map((popup, popupIndex) => (
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
                                                onChange={handleUpdatePopupLanguage}
                                                placeholder='es'
                                                value={popup.language} 
                                                maxLength={2}
                                                />
                                                <Form.Control.Feedback type="invalid">Duplicated languages</Form.Control.Feedback>
                                        </InputGroup>
                                    </Col>
                                    <Button hidden={(popups.length===1)} variant="outline-danger" size='sm' onClick={(e, pIndex)=>{handleDeletePopupBox(e, popupIndex)}}>Delete</Button>
                                </Card.Header>
                            <Card.Body>
                            {popup.texts.map((text, popupTextIndex) => (
                                <Col key={popupTextIndex} className="d-flex justify-content-center align-items-center gap-1">
                                    <InputGroup  className='mb-1'>
                                        <InputGroup.Text>Text</InputGroup.Text>
                                        <Form.Control 
                                            required={popupTextIndex === 0}
                                            data-popupindex={popupIndex}
                                            data-popuptextindex={popupTextIndex}
                                            key={popupTextIndex}
                                            onChange={handleUpdatePopupText}
                                            value={text}
                                            maxLength={100}
                                            />
                                    </InputGroup>
                                    {
                                        (popupTextIndex <=2 && popup.texts[popupTextIndex].length !== 0)
                                        ?
                                        <>
                                            <AddCircleOutline hidden={(popupTextIndex !== popup.texts.length-1 || popup.texts.length===3)} variant="outline-primary" onClick={(e, pIndex)=>{handleAddPopupText(e, popupIndex)}}/>
                                            <Delete hidden={(popupTextIndex === 0)} variant="outline-danger" onClick={(e, pIndex, pTIndex)=>{handleDeletePopupText(e, popupIndex, popupTextIndex)}}/> 
                                        </>
                                        :
                                        (popupTextIndex <=2 && popup.texts[popupTextIndex].length === 0)
                                        ?
                                        <Delete hidden={(popupTextIndex === 0)} variant="outline-danger" onClick={(e, pIndex, pTIndex)=>{handleDeletePopupText(e, popupIndex, popupTextIndex)}}/>  
                                        :
                                        (popupTextIndex === 3)
                                        ? 
                                        <AddCircleOutline hidden={(popupTextIndex !== popup.texts.length-1 || popup.texts.length===3)} variant="outline-primary" onClick={(e, pIndex)=>{handleAddPopupText(e, popupIndex)}}/>  
                                        :
                                        <Delete hidden={(popupTextIndex === 0)} variant="outline-danger" onClick={(e, pIndex, pTIndex)=>{handleDeletePopupText(e, popupIndex, popupTextIndex)}}/>  
                                        }
                                </Col>
                                ))}
                                </Card.Body>
                            </Card>
                        </div>
                    ))}


                    <div  className="d-flex justify-content-between flex-column gap-4" >
                        <Button className="d-flex align-items-center justify-content-center gap-1" size={"sm"} disabled={(popups.length === 4) || duplicateLang.length>0} style={{width:"auto", margin:"auto"}} variant={(popups.length === 4 || duplicateLang.length>0) ? 'outline-secondary':"outline-primary"} onClick={(e)=>{handleAddPopup(e)}}><AddCircleOutline/> Add popup</Button>
                    </div>

                </Modal.Body>
                <Modal.Footer ref={bottomRef} >
                    <Button  variant='light' onClick={()=>{handleClose(); handleReset()}}>Cancel</Button>
                    <Button  disabled={duplicateLang.length>0 || duplicatedId} variant='danger' type='submit'>Create</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}