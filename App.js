import { StatusBar } from 'expo-status-bar';
import React, {  useEffect, useRef, useState, forwardRef, memo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Button, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import { store, Provider, aType } from './store'
import DragBox from './DragBox'
{/* One idea could be to create a wrapper for the tooltip and then use this collapable properly added overit. */}
{/* We can use HOC or just create a simple wrapper */}



/**
 * 
 * 
 *   |        |
 *          \|  right and left pointer extream is 12px   
 */
const setTooltip = ({ show= true,text, x,y}) => {
  return (dispatch)=>{
    if(show){
      dispatch({ type: aType.SET_TOOLTIP, payload: { show:false }});
      setTimeout(()=>dispatch({ type: aType.SET_TOOLTIP, payload: { text,x,y, show:true }}),100);
    }
    else {
      dispatch({ type: aType.SET_TOOLTIP, payload: { show:false, title: '' }});
    }
    
  }
}

const ToolTip = {
  View: forwardRef(({children}, ref) => {
    return <View ref={ref} collapsable={false} style={styles.box}>
      {children}
    </View>
  }),
  Container: (props)=> (<MemoisedTooltipContainer {...props}/>)
}

export default function App() {
  const dispatch = store.dispatch;
  const [node, setNode] = useState(null);
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const tootipRef = useRef()

  const setData = (text,x,y) => {
    dispatch(setTooltip({show: true, text,x,y}));
  }

  return (
    <Provider store={store}>
      <View style={styles.container}>
        <View style={{ height: 64, backgroundColor: 'black'}}/>
        <View>
          {/* <DragBox><ToolTip.View ref={tootipRef} title={"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make"}>
            <Text style={{ color: '#fff'}}>Set tooltp 2</Text>
          </ToolTip.View></DragBox> */}
          <TextInput 
          onChangeText={setInput}/>
          <Button
            onPress={setData.bind(null, 'hello i am a tooltip',50,50)}
            title="Show Tooltip (50,50)"
            color="#841584"
            accessibilityLabel="Show tooltip"
          />
          <Button
            onPress={setData.bind(null, "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make",200,50)}
            title="Show Tooltip (200,50)"
            color="#841584"
            accessibilityLabel="Show tooltip"
          />
          <Button
            onPress={setData.bind(null, "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make",200,500)}
            title="Show Tooltip (200, 500)"
            color="#841584"
            accessibilityLabel="Show tooltip"
          />
          <Button
            onPress={setData.bind(null, "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",20,500)}
            title="Show Tooltip (20, 500)"
            color="#841584"
            accessibilityLabel="Show tooltip"
          />
          <Button
            onPress={()=>{
              dispatch(setTooltip({ show: false }))
            }}
            title="Hide"
            color="#841584"
            accessibilityLabel="Show tooltip"
          />
        </View>
        
        <StatusBar style="auto" />
      </View>
      <ToolTip.Container/>
    </Provider>
  );
}

const POINTER_SIZE = 16;
const DEFAULT_DIM_HEIGHT = -Dimensions.get('window').height*2;
const DEFAULT_DIM_WIDTH = -Dimensions.get('window').width*2;
const TooltipProvider = ({children, node = null}) => {

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
  const show = useSelector(({tooltip})=>{
    return tooltip?.show || false
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
    if(text){  
      moveTo(x,y);
    }
    else {
      reset();
    }

  },[text,x,y])

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
  const moveTo=(pageX,pageY, offsetX = 0, offsetY =0)=>{
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

      if(pageY>height){
        // Can be rendered on the top
        finalOffsetY = finalOffsetX - getDiadonalLength(POINTER_SIZE,POINTER_SIZE)/2
      }
      else {
        // Can be rendered on the bottom
        position = 'bottom'
        finalOffsetY = finalOffsetX + getDiadonalLength(POINTER_SIZE,POINTER_SIZE)/2
      }

      const [toolTipX, toolTipY] = calculateBodyPosition(pageX+finalOffsetX,pageY+finalOffsetY,width/2, height, position);

      // caclulation of pointer position
      if(position === 'top'){
        pointerY =  height - POINTER_SIZE/2;
        pointerX = pageX - toolTipX - POINTER_SIZE/2;
      }
      else {
        pointerY = - (POINTER_SIZE)/2;
        pointerX = pageX - toolTipX - POINTER_SIZE/2;
      }
      setRect({
        top: toolTipY,
        left: toolTipX,
        pointerTop: pointerY,
        pointerLeft: pointerX,
        actualX: pageX,
        actualY: pageY
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
      style={[styles.tooltipContainer, { top: rect.top , left: rect.left}]}>
      <View style={{ backgroundColor: 'cyan', height: POINTER_SIZE, width: POINTER_SIZE, position: 'absolute', top: rect.pointerTop, left: rect.pointerLeft, transform: [{ rotateZ: '45deg'}]}}/>
      {children}
    </TouchableOpacity>}
    </>
  
  }
  const renderTooltipBody = () => {
    return (<View>
    <Text>{text}</Text>
    <Button
            onPress={()=>{
              dispatch(setTooltip({ show: false }))
            }}
            title="Hide"
            color="#841584"
            accessibilityLabel="Show tooltip"
          />
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

const MemoisedTooltipContainer = memo(TooltipProvider)

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
    maxWidth: Dimensions.get('window').width - 128, backgroundColor: 'cyan', elevation:5 , position: 'absolute', padding: 16, borderRadius: 8
  },  
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
