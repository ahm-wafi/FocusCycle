import './App.css'
import Task  from './components/Task'
import Timer  from './components/Timer'
import Modal from 'react-modal'

function App() {
  return (
    <>
      <div className='d-flex flex-grow flex-col w-100 h-100'>
        <div className='m-3 flex flex-1 flex-col gap-3 w-100'>
          <div className='d-flex w-100 gap-3 h-100'>
            <div id="task" className='flex-fill h-100' style={{ width: '35%' }}>
              <div className='w-100 h-100 rounded-3 d-flex justify-content-center align-items-center card-background' >
                <Task />
              </div>
            </div>
            <div id="timer" className='flex-fill h-100' style={{ width: '65%' }}>
              <div className='w-100 h-100 rounded-3 d-flex justify-content-center align-items-center card-background' style={{ position: 'relative', top: '50%', transform: 'translateY(-50%)' }}  >
                <Timer />
              </div>
            </div>
          </div>
        </div>
    </div>
    </>
  )
}

export default App

Modal.setAppElement('#root')