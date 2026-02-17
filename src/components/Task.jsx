import { useState, useReducer } from 'react'
import TaskView from './TaskView'


const ACTIONS = {
  ADD_TASK: 'ADD_TASK',
  REMOVE_TASK: 'REMOVE_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  COMPLETE_TASK: 'COMPLETE_TASK',
  PENDING_TASK: 'PENDING_TASK'
}

const initial_state = {
  tasks: localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : [],
}

const taskReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_TASK:{
      localStorage.setItem('tasks', JSON.stringify([...state.tasks, action.payload]))
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };
    }
      
    case ACTIONS.REMOVE_TASK:
      localStorage.setItem('tasks', JSON.stringify(state.tasks.filter(task => task.id !== action.payload)))
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case ACTIONS.UPDATE_TASK: {
      const update_tasks = state.tasks.map(task => task.id === action.payload.id ? action.payload : task)
      localStorage.setItem('tasks', JSON.stringify(update_tasks))
      return {
        ...state,
        tasks: update_tasks
      };
    }
    case ACTIONS.COMPLETE_TASK: {
      const completedTasks = state.tasks.map(task => task.id === action.payload.id ? { ...task, status: 'completed' } : task)
      localStorage.setItem('tasks', JSON.stringify(completedTasks))
      return {
        ...state,
        tasks: completedTasks
      };
    }

    case ACTIONS.PENDING_TASK:{
      const pendingTasks = state.tasks.map(task => task.id === action.payload.id ? { ...task, status: 'pending' } : task)
      localStorage.setItem('tasks', JSON.stringify(pendingTasks))
      return {
        ...state,
        tasks: pendingTasks
      };
    }
    default:
      return state;
  }
};

function Task() {

  const [state, dispatch] = useReducer(taskReducer, initial_state);
  const [showInputTask, setShowInputTask] = useState(false)
  const [showCompletedTask, setShowCompletedTask] = useState(false)

  return (
    <div className={`position-relative d-flex flex-column card-background w-100 h-100 rounded-3 ${!showInputTask && state.tasks.filter(task => task.status === 'pending').length <= 0 || showCompletedTask && state.tasks.filter(task => task.status === 'completed').length <= 0 ? 'justify-content-center' : ''}`}>      
      {/* header */}
      <div className='d-flex w-100 mb-2'>
        <div className=' position-absolute d-flex flex-row gap-2 top-0 start-0 p-3 ' >
          <div className=' d-flex gap-2'>
            <button 
              className={`btn btn-sm primary-button-hover card-background ${!showCompletedTask ? 'primary-button text-white' : ''}`}
              onClick={() => {setShowCompletedTask(false);}}
            >
              Ongoing
            </button>
            <button 
              className={`btn btn-sm primary-button-hover card-background ${showCompletedTask ? 'primary-button text-white' : ''}`}
              onClick={() => {setShowCompletedTask(true); setShowInputTask(false);}}
            >
              Completed
            </button>
          </div>
        </div>
      </div>
      {/* tasks */}
      
      { (showCompletedTask && state.tasks.filter(task => task.status === 'completed').length === 0) || (!showCompletedTask && !showInputTask && state.tasks.filter(task => task.status === 'pending').length === 0) ? (
        <div className="w-100 d-flex justify-content-center align-items-center flex-column">
          <div className=''>
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 16 16" fill="none" stroke='#9CA3AF' strokeWidth='0.6'  style={{opacity: 0.3}}>
              <path fillRule="evenodd" d="M4,4 L9,4 C9.55228,4 10,3.55228 10,3 C10,2.44772 9.55228,2 9,2 L4,2 C2.89543,2 2,2.89543 2,4 L2,12 C2,13.1046 2.89543,14 4,14 L12,14 C13.1046,14 14,13.1046 14,12 L14,10 C14,9.44771 13.5523,9 13,9 C12.4477,9 12,9.44771 12,10 L12,12 L4,12 L4,4 Z M15.2071,2.29289 C14.8166,1.90237 14.1834,1.90237 13.7929,2.29289 L8.5,7.58579 L7.70711,6.79289 C7.31658,6.40237 6.68342,6.40237 6.29289,6.79289 C5.90237,7.18342 5.90237,7.81658 6.29289,8.20711 L7.79289,9.70711 C7.98043,9.89464 8.23478,10 8.5,10 C8.76522,10 9.01957,9.89464 9.20711,9.70711 L15.2071,3.70711 C15.5976,3.31658 15.5976,2.68342 15.2071,2.29289 Z"/>
            </svg>
          </div>

          <div className='secondary-color' style={{opacity: 0.8}}> No tasks found </div>
          <button onClick={() => {setShowCompletedTask(false); setShowInputTask(true)}} className="btn secondary-color text-decoration-underline">Add a new task</button>
        </div>
      ) : (
        <div className='d-flex flex-column h-100 justify-content-between' style={{ marginTop: '45px'}}>
          <div className={`w-100 custom-scroll ${showCompletedTask ? 'd-flex flex-column flex-grow-1' : ''}`} style={{ height: 'calc(100vh - 195px)' }}>
            {!showCompletedTask && state.tasks.filter(task => task.status !== 'completed').length === 0 ? (
              <div className='w-100 d-flex justify-content-center align-items-center flex-column py-2'>
                <div className='secondary-color' style={{opacity: 0.8}}> No tasks found </div>
              </div>            
            ) : null}
            {state.tasks
              .filter(task => showCompletedTask ? task.status === 'completed' : task.status !== 'completed')
              .sort((a, b) => b.id - a.id)
              .map(task => (
                <TaskView key={task.id} task={task} state={state} dispatch={dispatch} />
              ))}
          </div>
          
          { showCompletedTask ? null : (
            <div className='position-absolute start-0 bottom-0 w-100 border-top border-secondary-color p-3'>
              <div className='d-flex gap-2 w-100 '>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const taskText = formData.get('task');
                  if (taskText && taskText.trim()) {
                    dispatch({ type: ACTIONS.ADD_TASK, payload: { id: Date.now(), text: taskText.trim(), status: 'pending' } });
                    e.target.reset();
                  }
                }} className="d-flex flex-column align-items-start gap-3 w-100">
                  <input className="form-control-sm bg-white text-black w-100 no-spinner rounded-3 no-outline border" type="text" name="task" placeholder="Add a new task"></input>
                  <button type="submit" className="btn btn-sm secondary-color-button primary-button-hover">Save</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Task
