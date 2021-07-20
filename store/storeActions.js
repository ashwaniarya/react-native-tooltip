const aType = {
  SET_TOOLTIP: 'SET_TOOLTIP'
}

const setTooltip = ({ show= true,text, x = 0,y = 0, target}) => {
  return (dispatch)=>{
    if(show){
      dispatch({ type: aType.SET_TOOLTIP, payload: { show:false }});
      const uid = Math.random + ''
      setTimeout(()=>dispatch({ type: aType.SET_TOOLTIP, payload: { target, uid,text,x,y, show:true }}),100);
    }
    else {
      dispatch({ type: aType.SET_TOOLTIP, payload: { show:false, node: null, title: '' }});
    }
    
  }
}

export { aType, setTooltip }