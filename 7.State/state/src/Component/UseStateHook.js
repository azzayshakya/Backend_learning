import React , {useState} from 'react';

const UseStateHook = () => {

    const [count, setcount] = useState(6)
    const decrementthecount = () => {
       setcount(prevcount=>prevcount-1)
   
    }
    const incrementthecount = () => {
        setcount(prevcount=>prevcount+1)
     }




    return <div>
        <h1>You are using React useState Hooks BABY</h1>
    
        <button onClick={decrementthecount}>-</button> 
        <p>{count}</p>
        <button onClick={incrementthecount}>+</button>

    </div>;
}


export default UseStateHook;