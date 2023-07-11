import React from 'react'

const Modal = ({setIsOpen,setPrivKey}) => {
  return (
    <div className='modal'>
        <button className='cross' onClick={()=>setIsOpen(false)}>X</button>
        <input onChange={(e)=>setPrivKey(e.target.value)} type="text" placeholder='Input your private key to sign message' className='privKeyInput' />
        <button type='submit' className='sign'>Sign</button>
        <p>Note:Only your signature gets sent to server not your private key</p>
    </div>
  )
}

export default Modal