import { StatusBar } from 'expo-status-bar';
import React, {  useEffect, useRef, useState, forwardRef, memo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Button, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import { store, Provider, setTooltip } from './store'

import ToolTip from './tooltip/index'
import DragBox from './DragBox'
{/* One idea could be to create a wrapper for the tooltip and then use this collapable properly added overit. */}
{/* We can use HOC or just create a simple wrapper */}



/**
 * 
 *   .--------.
 *   |        |
 *   '-----\/-'   right and left pointer extream is 12px   
 */

 
 const testCordinates = [
  {
    x: 0,
    y: 50,
    tooltipTitle: 'He'
  },
  {
    x: 200,
    y: 50,
    tooltipTitle: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make"
  },
  {
    x: 360,
    y: 50,
    tooltipTitle: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make"
  },
  {
    x: 200,
    y: 500,
    tooltipTitle: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make"
  },
  {
    x: Math.floor(Dimensions.get('window').width),
    y: 500,
    tooltipTitle: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make"
  },
  {
    x: 0,
    y: 500,
    tooltipTitle: "Lorem Ipsum is simply dummy text of the printing and typesetting industry."
  }
]

export default function App() {
  const dispatch = store.dispatch;
  const [node, setNode] = useState(null);
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const tootipRef = useRef()

  const setData = (text,x,y) => {
    dispatch(setTooltip({show: true, text,x,y }));
  }

  console.log('Ref:',tootipRef);
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <View style={{ height: 64, backgroundColor: 'black'}}/>
        <View>
          <DragBox><ToolTip.View ref={tootipRef}>
            <TouchableOpacity onPress={()=>{
              dispatch(setTooltip({show: true, text:'hello',target:tootipRef.current }));
            }}>
            <Text style={{ color: '#fff'}}>Set tooltp 2</Text>
            </TouchableOpacity>
          </ToolTip.View></DragBox>
          <TextInput 
          onChangeText={setInput}/>
          {testCordinates.map((item,index)=>{
            return <Button
            key={index+''}
            onPress={setData.bind(null, item.tooltipTitle, item.x, item.y)}
            title={`Show Tooltip (${item.x}, ${item.y})`}
            color="#841584"
            accessibilityLabel="Show tooltip"
          />
          })}          
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
    padding: 16, 
    borderRadius: 8
  },  
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
