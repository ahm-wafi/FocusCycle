import { WORK, SHORT_BREAK, LONG_BREAK, LONG_BREAK_AFTER } from '../../constants/time_sessions'
import { useState, useEffect } from 'react'

const TimerSettingsModal = ({ state, dispatch }) => {

    const [confirmResetWork, setConfirmResetWork] = useState(false)
    const [confirmResetSessions, setConfirmResetSessions] = useState(false)
    const showError = (session) => {
      if (session === LONG_BREAK_AFTER) {
        return (state.settings[session] === '' || state.settings[session] === 0 || state.settings[session] === '0')

      }
      return (state.settings[session] === '' || state.settings[session] === 0 || state.settings[session] === '0' || state.settings[session] > 60)
    }

    const update = (key, value) => {
      let stringValue = String(value)

      // Prevent non-numeric input
      stringValue = stringValue.replace(/\D/, '');

      // Parse and validate
      const numValue = Math.round(Number(stringValue));

      // setSettings(prev => ({ ...prev, [key]: numValue }));
      dispatch({type: 'UPDATE_SETTINGS', payload: {[key]: numValue}});
    };

    const resetCountWorkSessions = () => {
      if (!confirmResetWork){
        setConfirmResetWork(true);
        return;
      } 

      dispatch({type: 'RESET_COUNT_WORK_SESSIONS'});
      localStorage.removeItem('countWorkSessions');
      setConfirmResetWork(false);
    };

    const resetCountSessions = () => {
      if (!confirmResetSessions){
        setConfirmResetSessions(true);
        return;
      } 

      dispatch({type: 'RESET_COUNT_WORK_SESSIONS'});
      localStorage.removeItem('countWorkSessions');
      dispatch({type: 'RESET_ALL_COUNT_SESSIONS'});
      localStorage.removeItem('countSessions');
      setConfirmResetSessions(false);
    };

    useEffect(() => {
      if (!confirmResetSessions) return;

      const t = setTimeout(() => setConfirmResetSessions(false), 3000);
      return () => clearTimeout(t);
    }, [confirmResetSessions])

    useEffect(() => {
      if (!confirmResetWork) return;

      const t = setTimeout(() => setConfirmResetWork(false), 3000);
      return () => clearTimeout(t);
    }, [confirmResetWork])

    return (

      <>
          <div className="m-2 d-flex flex-column gap-2 text-sm" >
            <div className="d-flex flex-column gap-2">
              <label className={`${showError(WORK) ? 'text-danger' : 'text-white'}`}>Work duration (min) </label>
              <input className="form-control bg-white text-black no-spinner rounded-4 no-outline" inputMode="numeric" type="text" pattern='[0-9]*' value={state.settings[WORK]} onChange={(e) => update(WORK, e.target.value)}></input>
            </div>

            <div className="d-flex flex-row gap-3">
              <div className="d-flex flex-column gap-2">
                <label className={`${showError(SHORT_BREAK) ? 'text-danger' : 'text-white'}`}>Short break (min)</label>
                <input className="form-control bg-white text-black no-spinner rounded-4" inputMode="numeric" type="text" pattern='[0-9]*' value={state.settings[SHORT_BREAK]} onChange={(e) => update(SHORT_BREAK, e.target.value)}></input>
              </div>

              <div className="d-flex flex-column gap-2">
                <label className={`${showError(LONG_BREAK) ? 'text-danger' : 'text-white'}`}>Long break (min)</label>
                <input className="form-control bg-white text-black no-spinner rounded-4" inputMode="numeric" type="text" pattern='[0-9]*' value={state.settings[LONG_BREAK]} onChange={(e) => update(LONG_BREAK, e.target.value)}></input>
              </div>

            </div>        

            {/* Divider */}

            <hr className="my-4" style={{ opacity: 0.25 }} />

            <div className="d-flex flex-column gap-2">
              <div className='d-flex flex-column gap-2'>
                <div className="d-flex align-items-center gap-2 ">
                  <label
                    className={`mb-0 ${showError(LONG_BREAK_AFTER) ? 'text-danger' : 'text-white'}`}
                  >
                    Long break every:
                  </label>
                  <input
                    className="form-control bg-white text-black no-spinner rounded-2 text-center"
                    style={{ width: "69px", height: "32px" }}
                    inputMode="numeric" type="text" pattern='[0-9]*'
                    value={state.settings[LONG_BREAK_AFTER]}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        update(LONG_BREAK_AFTER, '');
                        return;
                      }
                      if (/^\d{1,5}$/.test(value)) {
                        update(LONG_BREAK_AFTER, value);
                      }
                    }}
                  />
                  <span className={`${showError(LONG_BREAK_AFTER) ? 'text-danger' : 'text-white'}`}> work sessions</span>                
                </div>
                
                <div style={{ height: '2.5em' }}>
                  <small className='secondary-color'>
                    { !showError(LONG_BREAK_AFTER) ? (
                      <>
                        A long break occurs on every {state.settings[LONG_BREAK_AFTER]}{
                          state.settings[LONG_BREAK_AFTER] === 1 ? 'st' : 
                          state.settings[LONG_BREAK_AFTER] === 2 ? 'nd' : 
                          state.settings[LONG_BREAK_AFTER] === 3 ? 'rd' : 'th'
                        } completed work session 
                        ({state.settings[LONG_BREAK_AFTER]}, {state.settings[LONG_BREAK_AFTER] * 2}, {state.settings[LONG_BREAK_AFTER] * 3}…)
                      </>
                    ) : (
                      <div className='text-danger'>
                        Please enter a valid number
                      </div>
                    ) }
                    </small>
                </div>
              </div>

              <div className="d-flex flex-row align-items-center gap-2 mt-2">
                <div style={{color: '#CBD5E1'}} className='mb-0' >Total Sessions: <strong style={{color: '#E5E7EB'}}>{state.countSessions}</strong> </div >
                <button 
                className={`btn btn-sm d-inline-flex btn-outline-secondary p-1 align-items-center justify-content-center ${confirmResetSessions ? 'w-25' : ''}` }
                onClick={resetCountSessions} 
                title="Reset total session count to 0"
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderColor:'#8FAADC',  
                  color: '#94A3B8', 
                }}
                >
                  {confirmResetSessions ? 'Confirm ?' : 
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                    </svg>
                  }
                </button>
              </div>

              <div className="d-flex flex-row align-items-center gap-2 mt-1">
                <div style={{color: '#CBD5E1'}} className='mb-0' >Work Sessions: <strong style={{color: '#E5E7EB'}}>{state.countWorkSessions}</strong> </div>
                <button 
                className={`btn btn-sm d-inline-flex btn-outline-secondary p-1 align-items-center justify-content-center ${confirmResetWork ? 'w-25' : ''}`}
                onClick={resetCountWorkSessions} 
                title="Reset work session count to 0"
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderColor:'#8FAADC',  
                  color: '#94A3B8', 
                }}
                >
                  {confirmResetWork ? 'Confirm ?' : 
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                    </svg>
                  }
                </button>
              </div>

              <div className='form-check mb-2'>
                <div className="d-flex flex-row align-items-center gap-2">
                  <input 
                    id="continuous"
                    className='form-check-input'
                    type="checkbox" 
                    checked={state.settings.isContinuousCycle}
                    onChange={(e) => {
                      dispatch({ type: 'UPDATE_SETTINGS', payload: { isContinuousCycle: e.target.checked } });
                    }}
                  />

                  <label className="form-check-label fw-semi-bold" htmlFor='continuous'>
                    Enable continuous cycle
                  </label>
                </div>
                <small className='secondary-color'>
                  Automatically start the next session when the current one ends. 
                  Stops after long break.
                </small>
              </div>
            </div>     

          </div>
      </>
    );

}

export default TimerSettingsModal