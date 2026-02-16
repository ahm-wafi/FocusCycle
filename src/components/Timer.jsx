import { useState, useEffect, useRef , useReducer} from 'react'
import TimerSettingsModal from './Modals/TimerSettingsModal'
import Modal from 'react-modal'
import { WORK, SHORT_BREAK, LONG_BREAK, LONG_BREAK_AFTER } from '../constants/time_sessions'
import { TIMER_ACTIONS } from '../constants/timer_actions'

function timerReducer(state, action) {
  switch (action.type) {
    case TIMER_ACTIONS.IDLE:
      return {
        ...state,
        status: 'idle',
      };

    case TIMER_ACTIONS.START:
      return {
        ...state,
        status: 'running'
      };
    case TIMER_ACTIONS.PAUSE:
      return {
        ...state,
        status: 'paused'
      };
    case TIMER_ACTIONS.RESET:
      return {
        ...state,
        status: 'idle',
        time: state.settings[state.session] * 60
      };
    case TIMER_ACTIONS.RESTART:
      return {
        ...state,
        status: 'running',
        shouldPlayAlarm: false,
        time: state.settings[state.session] * 60
      };
    case TIMER_ACTIONS.TICK:{
      if (state.time <= 0) {
        return {
          ...state,
          status: 'idle',
          shouldPlayAlarm: true
        };
      }
      return {
        ...state,
        time: state.time - 1
      };
    }
    case TIMER_ACTIONS.STOP_ALARM:
      return {
        ...state,
        shouldPlayAlarm:false
      }
    case TIMER_ACTIONS.COUNT_SESSIONS:
      return countSessions(state)
    case TIMER_ACTIONS.SESSION_COMPLETE:{
      return onSessionComplete(state)
    }
    case TIMER_ACTIONS.ADD_MINUTES:
      return {
        ...state,
        time: state.time + Number(action.additional_time)
      };
    case TIMER_ACTIONS.CHANGE_SESSION:
      return {
        ...state,
        status: 'idle',
        session: action.session,
        time: state.settings[action.session] * 60,
        shouldPlayAlarm: false
      };
    
    case TIMER_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    case TIMER_ACTIONS.RESET_COUNT_WORK_SESSIONS:{
        const remainingCountSessions = state.countSessions - state.countWorkSessions
        localStorage.setItem('countSessions', remainingCountSessions)
        return {
          ...state,
          countSessions: remainingCountSessions,
          countWorkSessions: 0
        }
      };

    case TIMER_ACTIONS.RESET_ALL_COUNT_SESSIONS:
      return {
        ...state,
        countSessions: 0,
        countWorkSessions: 0
      }
    default:
      return state;
  }
}

const nextSession = (session, countWorkSessions, settings, isContinuousCycle) => {
  if (!isContinuousCycle || session === LONG_BREAK) return session;

  if (session === WORK && countWorkSessions > 0 && countWorkSessions % settings[LONG_BREAK_AFTER] === 0) {
    return LONG_BREAK;
  }
  return session === WORK ? SHORT_BREAK : WORK;
};

function countSessions(state){
  const workCount = state.session === WORK ? state.countWorkSessions + 1 : state.countWorkSessions;
  const SessionCount = state.countSessions + 1;
  localStorage.setItem('countWorkSessions', Number(workCount));
  localStorage.setItem('countSessions', Number(SessionCount));
  
  return {
    ...state,
    countSessions: SessionCount,
    countWorkSessions: workCount
  }
}

function onSessionComplete(state) {

  const status = state.settings.isContinuousCycle && state.session !== LONG_BREAK ? 'running' : 'idle';
  const nextSessionAfterEnd = nextSession(state.session, state.countWorkSessions, state.settings, state.settings.isContinuousCycle);

  return {
    ...state,
    status: status,
    session: nextSessionAfterEnd,
    time: state.settings.isContinuousCycle && state.session !== LONG_BREAK ? state.settings[nextSessionAfterEnd] * 60 : 0,
    shouldPlayAlarm:false,
  };
};


function Timer() {
  const [openSettings, setOpenSettings] = useState(false);
  const audioAlarmRef = useRef(new Audio('./freesound_community-alarm-clock-short-6402-[AudioTrimmer.com].mp3'));

  const settings = {
    [WORK]: 0.1,
    [SHORT_BREAK]: 0.2,
    [LONG_BREAK]: 0.3,
    [LONG_BREAK_AFTER]: 2,
    isContinuousCycle: true
  };

  const initialState = {
    status: 'idle',
    session: WORK,
    time: settings[WORK] * 60,
    countSessions: Number(localStorage.getItem('countSessions')) || 0,
    countWorkSessions: Number(localStorage.getItem('countWorkSessions')) || 0,
    settings: settings,
    shouldPlayAlarm: false,
  };

  const [state, dispatch] = useReducer(timerReducer, initialState);

  const hasError = () => {
    return !state.settings[WORK] || !state.settings[SHORT_BREAK] || !state.settings[LONG_BREAK] || !state.settings[LONG_BREAK_AFTER] ||
            state.settings[WORK] === String(0) || state.settings[SHORT_BREAK] === String(0) || state.settings[LONG_BREAK] === String(0) || 
            state.settings[LONG_BREAK_AFTER] === String(0) ||
            state.settings[WORK] > 60 || state.settings[SHORT_BREAK] > 60 || state.settings[LONG_BREAK] > 60
  };

  // works on tick of the time
  useEffect(() => {
    if (state.status !== 'running') return;
    const id = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    // clean up
    return () => {
      clearInterval(id);
    };
  }, [state.status]);

  useEffect(() => {
    if (!state.shouldPlayAlarm) return;
    
    const audioElement = audioAlarmRef.current;
    audioElement.play();

    return () => {
      dispatch({type: 'STOP_ALARM'});
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  }, [state.shouldPlayAlarm]);

  useEffect(() => {
    if (state.time !== 0) return;

    dispatch({type: 'COUNT_SESSIONS'})
    const timerTimeout = setTimeout(() => {
        dispatch({type: 'STOP_ALARM'});
        dispatch({ type: 'SESSION_COMPLETE' });
    },5000);
    return () => clearTimeout(timerTimeout);
  }, [state.time])
  

  return (
    <div className='position-relative d-flex card-background justify-content-center align-items-center w-100 h-100 rounded-3'>      
      <div className='position-absolute top-0 end-0 p-3'>
        <button onClick={() => setOpenSettings(true)} className='btn card-background btn-sm focus:shadow-none focus:outline-none border-0'>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover-stroke-light">
            <path d="M20 7h-9"></path>
            <path d="M14 17H5"></path>
            <circle cx="17" cy="17" r="3"></circle>
            <circle cx="7" cy="7" r="3"></circle>
          </svg>
        </button>
      <Modal
        isOpen={openSettings}
        onRequestClose={() => {
          if (!hasError()){
            if (state.session === WORK) {
              dispatch({session: WORK, type: 'CHANGE_SESSION' });
            } else if (state.session === SHORT_BREAK) {
              dispatch({session: SHORT_BREAK, type: 'CHANGE_SESSION' });
            } else if (state.session === LONG_BREAK) {
              dispatch({session: LONG_BREAK, type: 'CHANGE_SESSION' });
            }
            setOpenSettings(false);
          }
        }}
        style={hasError() ? modalStyleError : modalStyle}
      >
        <TimerSettingsModal state={state} dispatch={dispatch} />
      </Modal>

      </div>
      
      <div className='d-flex flex-column justify-content-center align-items-center' style={{ marginBottom: '26px' }}>
        <div className='d-flex flex-row gap-2 '>
          <button id="work-session" className={`btn primary-button-hover card-background ${ state.session === WORK ? 'primary-button text-white' : ''}`} onClick={() => dispatch({ session: WORK, type: 'CHANGE_SESSION' })}>
            Work
          </button>

          <button id="short-break" className={`btn primary-button-hover card-background ${state.session === SHORT_BREAK ? 'primary-button text-white' : ''}`} onClick={() => dispatch({session: SHORT_BREAK, type: 'CHANGE_SESSION'})}>
            Short Break
          </button>

          <button id="long-break" className={`btn primary-button-hover card-background ${state.session === LONG_BREAK ? 'primary-button text-white' : ''}`} onClick={() => dispatch({session: LONG_BREAK, type: 'CHANGE_SESSION'})}>
            Long Break
          </button>
        </div>

        <div className='mt-2 mb-4 pb-3'>
          <div className='fw-bold' style={{ fontSize: '8.5rem', lineHeight: 1  }}>
            {Math.floor(state.time / 3600) > 0 ? `${String(Math.floor(state.time / 3600)).padStart(2, '0')}:` : ''}
            {Math.floor((state.time % 3600) / 60) >= 0 && Math.floor(state.time) > 59 ? `${String(Math.floor((state.time % 3600) / 60)).padStart(2, '0')}:` : ''}
            {String(Math.floor(state.time % 60)).padStart(2, '0')}
          </div>
        </div>


        <div className='w-100 mb-4 d-flex flex-column align-items-center gap-2'>
          <div className="h-1 w-100 overflow-hidden rounded-full bg-zinc-800 d-flex align-items-center justify-content-center">
            <div className="border-bottom border-2 border-zinc-600" style={{ width: '100%' }}></div>
          </div>
          <div className='d-flex flex-row gap-3'>
            <button className='btn btn-sm primary-button-hover card-background' onClick={() => dispatch({additional_time: 1500, type: 'ADD_MINUTES'})}>
              + 25 min
            </button>
            <button className='btn btn-sm primary-button-hover card-background' onClick={() => dispatch({additional_time: 600 , type: 'ADD_MINUTES'})}>
              + 10 min
            </button>
            <button className='btn btn-sm primary-button-hover card-background' onClick={() => dispatch({additional_time: 300, type: 'ADD_MINUTES'})}>
              + 5 min
            </button>
            <button className='btn btn-sm primary-button-hover card-background' onClick={() => dispatch({additional_time: 60, type: 'ADD_MINUTES'})}>
              + 1 min
            </button>
          </div>
        </div>


        <div className='d-flex align-content-center gap-3 justify-content-center'>
          {state.status !== 'running' && state.status !== 'paused' && state.time !== 0 && (
            <button onClick={() => dispatch({ type: TIMER_ACTIONS.START })} className='btn btn-md primary-button primary-button-hover card-background' style={{ boxShadow: '0 8px 20px rgba(91,140,255,0.35)' }}>
              Start
            </button> 
          )}
          {state.time === 0 && (
            <button onClick={() => dispatch({ type: TIMER_ACTIONS.RESTART })} className='btn btn-md primary-button primary-button-hover card-background'>
              Restart
            </button> 
          )}
          {(state.status === 'running' || state.status === 'paused') && state.time !== 0 && (
            <>
              <button onClick={() => {
                if (state.status === 'paused'){
                  dispatch({type: TIMER_ACTIONS.START})
                } else {
                  dispatch({type: TIMER_ACTIONS.PAUSE})
                }
                }} className='btn btn-md primary-button primary-button-hover card-background'>
                {state.status === 'paused' ? 'Resume' : 'Pause'}
              </button>
              <button onClick={() => dispatch({type: TIMER_ACTIONS.RESET})} className='btn btn-md primary-button primary-button-hover card-background'>
                Reset
              </button>
            </>
          )}
        </div>

        <small className="secondary-color card-background mt-2" style={{ opacity: 0.7, height: '0.2em' }}>
          {state.settings.isContinuousCycle && state.session !== LONG_BREAK && state.time === 0 ? 
            'Ready for next session - timer will start automatically' : ''
          }
        </small>
      </div>

      <div className='position-absolute bottom-0 p-3'>
        <div className='d-flex align-items-center flex-column'>
          <div className='d-flex align-items-center gap-2 d-inline-flex secondary-color card-background' style={{ opacity: 0.9 }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
            <span>
            {state.countSessions === 0 ? "Ready to focus" : 
            state.countSessions === 1 ? "1 session completed" : 
            `${state.countSessions} sessions completed`
            }
            </span>
          </div>

          {state.countWorkSessions > 0 ? 
            <small className='secondary-color card-background' style={{ opacity: 0.5 }}>
              {state.countWorkSessions === 1 ? "(1 work session)" : 
              `(${state.countWorkSessions} work sessions)`}
            </small>
          : ""}
        </div>

      </div>

    </div>
  )
}

export default Timer


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