import { useState } from 'react'
import Modal from 'react-modal'
import TaskUpdateModal from './Modals/TaskUpdateModal'

export default function TaskView({ task, dispatch }) {
    const [openUpdateTask, setOpenUpdateTask] = useState(false)
    const [updateTaskValue, setUpdateTaskValue] = useState(task.text)
    const [hoverItem, setHoverItem] = useState(false)
    const [error, setError] = useState(false)    

    const handleCheckboxChange = () => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        dispatch({ 
            type: newStatus === 'completed' ? 'COMPLETE_TASK' : 'PENDING_TASK', 
            payload: { id: task.id } 
        });
    };

    const handleDelete = () => {
        dispatch({ type: 'REMOVE_TASK', payload: task.id });
    };


    return (
        <div className='w-100 mx-3'>
            <div className={`d-flex px-3 align-items-center py-2 justify-content-between ${hoverItem ? 'hover-bg-light' : ''}`} onMouseEnter={() => setHoverItem(true)} onMouseLeave={() => setHoverItem(false)}>
                <div className="d-flex form-check gap-2 align-items-center justify-content-center">
                    <input className='form-check-input card-background my-1' type="checkbox" checked={task.status === 'completed'} onChange={handleCheckboxChange} />
                    <label className={task.status === 'completed' ? 'text-decoration-line-through secondary-color form-check-label' : 'text-white form-check-label'}>
                        {task.text}
                    </label>
                </div>
                <div className="d-flex gap-1">                
                    <button className="btn p-0" onClick={() => {setOpenUpdateTask(true)}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="hover-stroke-light">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button >
                    <Modal
                        isOpen={openUpdateTask}
                        onRequestClose={() => {
                            if (!error) {
                                setOpenUpdateTask(false)
                            }
                            dispatch({ type: 'UPDATE_TASK', payload: { ...task, text: updateTaskValue } })
                        }}
                        style={ error ? modalStyleError : modalStyle}
                    >
                        <TaskUpdateModal updateTaskValue={updateTaskValue} setUpdateTaskValue={setUpdateTaskValue} setError={setError} error={error}/>
                    </Modal>
                    <button className="btn p-0" onClick={handleDelete}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="hover-stroke-light">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V6M8,6V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V6"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}



const modalStyle = {
  overlay: {
    backgroundColor: 'rgba(51, 74, 109, 0.9)',
  },
  content: {
    backgroundColor: "#0f172a",
    border: '1px solid #0f172a',
    borderRadius: '12px',
    position: 'absolute',
    height: 'fit-content',
    width: '365px',
    top: '10.9vh',
    left: 'calc(50% - 182.5px)',
    outline: 'none'
  },
}

const modalStyleError = {
  ...modalStyle,
  content: {
    ...modalStyle.content,
    border: '1px solid #ef4444'
  }
}