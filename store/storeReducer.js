import { aType } from './storeActions'
const initialState= {
  tootlip: 'some'
}
const data = (state = initialState, action)=>{
  switch(action.type){
    case aType.SET_TOOLTIP: 
    return { ...state, tooltip: action.payload } 
    default: return state
  }
}

export { data }