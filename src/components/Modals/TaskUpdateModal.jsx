
const TaskUpdateModal = ({ updateTaskValue, setUpdateTaskValue, setError, error }) => {

    function handleUpdateTask(value){
        if (hasError(value)) return
        setUpdateTaskValue(value)
    }

    const hasError = (text) => {
        setError(text.length === 0)
    }
    
    return (
    <>
        <div className="m-2 d-flex flex-column gap-2 text-sm" >
            <label className={error ? 'text-danger' : ''}>Task Name</label>
            <input className="form-control bg-white text-black no-spinner rounded-4 no-outline" 
            type="text" 
            value={updateTaskValue} 
            onChange={(e) => {handleUpdateTask(e.target.value)}}/>
            <div className="text-danger" style={{height: '15px'}}>
                {error ? 'Task name cannot be empty' : ''}
            </div>
        </div>
    </>
    )
}

export default TaskUpdateModal