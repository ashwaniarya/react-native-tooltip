import React, {  useEffect, useRef, useState, forwardRef, memo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Button } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import { setTooltip } from './../store'

const Clamp =  function(min, value,  max) {
  return Math.min(Math.max(value, min), max);
};

const calculateBodyPosition = (x,y, width, height, position = 'top') => {
  const leftMinX = width
  const leftMaxX = Dimensions.get('window').width - width
  let xC = Clamp(leftMinX, x, leftMaxX);
  if(position === 'bottom') return [xC-width, y]
  return [xC-width, y-height];
}

const Area = function(height,width){return height*width};
const getDiadonalLength = function(height,width){
  return Math.sqrt( Math.pow(width,2)+Math.pow(height,2))
}

const POINTER_SIZE = 16;
const DEFAULT_DIM_HEIGHT = -Dimensions.get('window').height*2;
const DEFAULT_DIM_WIDTH = -Dimensions.get('window').width*2;
const POINTER_DIM_DIAGONAL = getDiadonalLength(POINTER_SIZE,POINTER_SIZE)


const TooltipContainer = ({children,borderRadius = 8, pointerMinDistanceFromEdge = 12 }) => {

  // Hide the tooltip by moving it outside of view
  const dispatch = useDispatch();

  const [ rect, setRect ] = useState({
    top: DEFAULT_DIM_HEIGHT,
    left: DEFAULT_DIM_WIDTH,
    pointerTop: DEFAULT_DIM_HEIGHT,
    pointerLeft: DEFAULT_DIM_WIDTH,
    actualX: DEFAULT_DIM_WIDTH,
    actualY: DEFAULT_DIM_HEIGHT
  })

  // const [show, setShow] = useState(false);

  const target = useSelector(({tooltip})=>{
    return tooltip?.target || null
  })
  const show = useSelector(({tooltip})=>{
    return tooltip?.show || false
  })
  const uid = useSelector(({tooltip})=>{
    return tooltip?.uid || ''
  })
  const text = useSelector(({tooltip})=>{
    return tooltip?.text || ''
  })
  const x = useSelector(({tooltip})=>{
    return tooltip?.x || 0
  })
  const y = useSelector(({tooltip})=>{
    return tooltip?.y || 0
  })
  const rootRef = useRef();

  useEffect(()=>{
    if(uid){  
      moveToTargetNode((nodeX, nodeY,pointOptions)=>{
        if(nodeX && nodeY || pointOptions) {
          moveTo(nodeX, nodeY,0,0,pointOptions)
        }
        else {
          moveTo(x,y);
        }
      })
      
    }
    else {
      reset();
    }

  },[uid])

  //Use this to hide the tooltip
  const reset = () =>{
    setRect({
      top: DEFAULT_DIM_HEIGHT,
      left: DEFAULT_DIM_WIDTH,
      pointerTop: DEFAULT_DIM_HEIGHT,
      pointerLeft: DEFAULT_DIM_WIDTH,
      actualX: DEFAULT_DIM_WIDTH,
      actualY: DEFAULT_DIM_HEIGHT
    }) 
  }
  // console.log('Render:', text, rect);

  const moveToTargetNode = (callback) => {
    if(!target) {
      callback && callback()
      return
    }
    else {
      target.measure(function(c_x,c_y,c_width,c_height,c_pageX,c_pageY){
        console.log('Target Node Rect:',c_x,c_y,c_width,c_height,c_pageX,c_pageY);
  
        const top = {
          x: c_pageX+c_width/2,
          y: c_pageY
        }
        const bottom = {
          x: c_pageX+c_width/2,
          y: c_pageY+c_height
        }
        callback && callback(0,0, {
          top,
          bottom
        });
      });
    }
    
  }
  const moveTo=(pageX,pageY, offsetX = 0, offsetY =0, pointOptions = null)=>{
    // Get the point where tooltip is required to be show.
    // Calculate tooltip rect using the ref
    // Move the position based on the screen feasiblity 
    // console.log('move to Called:',pageX, pageY, rootRef);

    
    rootRef.current.measure(function(containerX, containerY, width, height) {
      // alert('move to Called:'+width+height+rootRef);

      if(width === 0 || height === 0){
        reset();
        return;
      }
      let position= 'top'
      let finalOffsetX = offsetX;
      let finalOffsetY = offsetY
      let pointerX = 0;
      let pointerY = 0;

      console.log('Available Point to show tooltip:', pointOptions);

      let modifiedY = pointOptions ? pointOptions.top.y : pageY
      let modifiedX = pointOptions ? pointOptions.top.x : pageX;
      
      if(modifiedY>height){
        // Can be rendered on the top
        finalOffsetY = finalOffsetX - POINTER_DIM_DIAGONAL/2
      }
      else {
        // Can be rendered on the bottom
        position = 'bottom'
        finalOffsetY = finalOffsetX + POINTER_DIM_DIAGONAL/2
        modifiedY = pointOptions ? pointOptions.bottom.y : pageY
        modifiedX = pointOptions ? pointOptions.bottom.x : pageX;
      }

      const [toolTipX, toolTipY] = calculateBodyPosition(modifiedX+finalOffsetX,modifiedY+finalOffsetY,width/2, height, position);
      console.log('tooltip Width:', width);
      // caclulation of pointer position
      if(position === 'top'){
        pointerY =  height - POINTER_SIZE/2;
        pointerX = Clamp( POINTER_DIM_DIAGONAL/2 -POINTER_SIZE/2 + pointerMinDistanceFromEdge, (modifiedX - toolTipX - POINTER_SIZE/2),(width - (POINTER_DIM_DIAGONAL/2 +POINTER_SIZE/2 + pointerMinDistanceFromEdge)));
      }
      else {
        pointerY = - (POINTER_SIZE)/2;
        pointerX = Clamp( POINTER_DIM_DIAGONAL/2 -POINTER_SIZE/2 + pointerMinDistanceFromEdge, (modifiedX - toolTipX - POINTER_SIZE/2),(width - (POINTER_DIM_DIAGONAL/2 +POINTER_SIZE/2 + pointerMinDistanceFromEdge)));
      }
      console.log('Pointer',pointerX, pointerY);
      setRect({
        top: toolTipY,
        left: toolTipX,
        pointerTop: pointerY,
        pointerLeft: pointerX,
        actualX: modifiedX,
        actualY: modifiedY
      })

    })
    
  }
  // const onLayout = (e)=>{
  //     // const layout = e.nativeEvent.layout
  //     node && node.measure(function(x,y,width,height,pageX,pageY){
  //       moveTo(pageX,pageY);
  //     });
  // }

  console.log('Render',);
  const Wrapper = ({children}) => {
    // Add animaton here
    return <>{show && <View style={{ backgroundColor: 'red', height: 4, width: 4, position: 'absolute',elevation:10, top: rect.actualY -2, left: rect.actualX-2, borderRadius: 2 }}/>}
    { show && <TouchableOpacity 
      key={'tooltip'}
      ref={rootRef}
      collapsable={false}
      activeOpacity={0.9}
      style={[styles.tooltipContainer, { top: rect.top , left: rect.left, borderRadius}]}>
      <View style={{ backgroundColor: 'cyan', height: POINTER_SIZE, width: POINTER_SIZE, position: 'absolute', top: rect.pointerTop, left: rect.pointerLeft, transform: [{ rotateZ: '45deg'}]}}/>
      {children}
    </TouchableOpacity>}
    </>
  
  }
  // All the content inside the tooltip
  const renderTooltipBody = () => {
    return (<View>
    <Text>{text}</Text>
  </View>)
  }

  return (
    <>
      {children}
      <Wrapper>
      {renderTooltipBody()}
      </Wrapper>
    </>
  )
}

const styles = StyleSheet.create({
  box:{
    borderWidth: 1,
    width: 128,
    height:64,
    marginTop: 12,
    backgroundColor: 'blue',
    left: (Dimensions.get('window').width/2)- 64
  },
  tooltipContainer: {
    minWidth: 90,
    maxWidth: 276, 
    backgroundColor: 'cyan', 
    elevation:5 , 
    position: 'absolute', 
    padding: 16
  },  
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});

const MemoisedTooltipContainer = memo(TooltipContainer)

const ToolTip = {
  View: forwardRef(({children}, ref) => {
    return <View ref={ref} collapsable={false} style={styles.box}>
      {children}
    </View>
  }),
  Container: (props)=> (<MemoisedTooltipContainer {...props}/>)
}


export default ToolTip