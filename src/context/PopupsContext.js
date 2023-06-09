import React, { useContext, useEffect } from "react"
import useLocalStorage from "../hooks/useLocalStorage"
import {v4 as uuidv4} from 'uuid'

const PopupsContext = React.createContext()

export function usePopups(){
    return useContext(PopupsContext)
}

export const PopupsProvider = ({children}) =>{
    let defaultCard = {
        ref:"default", id:"default", trigger:"page_load", condition:"window.location.href.includes(\"www\")", repeat_after:"0", delay:"3000", mobile:"true", desktop:"true", messages:[{language:"en", texts:[`Hey, there!`,"How can I help you?" ]}], start_from_module:""
    }

    const [getPopups, setGetPopups] = useLocalStorage("popups", [])

    useEffect(()=>{
        if(getPopups.length <= 0 ){
            setGetPopups([defaultCard])
        }   
    })


    function addPopup ({ref, id, trigger, condition, repeat_after, delay, mobile, desktop, messages, start_from_module}){
        console.log('add messages', messages)
        setGetPopups(prevPopups => {
            if(prevPopups.find(popup=>popup.ref === ref)){
                return prevPopups
            }
            return [{ref: uuidv4(), id, trigger, condition, repeat_after, delay, mobile, desktop, messages, start_from_module}, ...prevPopups]
        })
    }

    function editPopup  ({ref, id, trigger, condition, repeat_after, delay, mobile, desktop, messages, start_from_module}){
        console.log('edit messages', messages)
        setGetPopups(prevPopups => {
            return prevPopups.map(popup => {
              if (popup.ref === ref) {
                return {ref, id, trigger, condition, repeat_after, delay, mobile, desktop, messages, start_from_module};
              }
              return popup;
            });
          });
    }

    function deletePopup (ref){
        setGetPopups(prevPopups=>{return prevPopups.filter(popup => popup.ref !== ref)})
    }       
    

    return (<PopupsContext.Provider value={{
        getPopups,
        addPopup,
        editPopup,
        deletePopup        
    }}>{children}</PopupsContext.Provider>)
}