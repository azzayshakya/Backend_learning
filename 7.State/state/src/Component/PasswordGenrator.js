import React, { useCallback, useEffect, useState } from 'react';

const PasswordGenrator = () => {

    const [length,setlength]=useState(8);
    const [numberAllowed,setnumberAllowed]=useState(false)
    const [charAllowed,setcharAllowed]=useState(false)
    const [Password, setPassword] = useState("")

    const PasswordGenrator=useCallback(() => {
        let pass=""
        let str="akljdjoifwejofjemfcoih34hoofjpojewfj9j4993hfqneoifJSOIFDJOGJSOJFJSPJFD"
        if(numberAllowed) str+="0123456789";
        if(charAllowed) str+="!!@#$%^&*()_}{:"
        for (let i = 1;  i <+length; i++) {
            let char=Math.floor(Math.random()*str.length+1)
            pass+=str.charAt(char);
        }
        setPassword(pass)   
        },
        [length,charAllowed,numberAllowed]

    )
    useEffect(()=>{
        PasswordGenrator();
    },[length,numberAllowed,charAllowed,PasswordGenrator])



    return <div>

<div className="body">

        <h1 className='honetag'>Password Generotor</h1>
    <div className="pg">

        <div className="firstline nm">
        <input className='nm  firstlineinput inputtext' type="text" value={Password} readOnly/><button className='nm firstlineinputbutton firstlineinput'>copy</button>
        </div>
        

        <div className='secline nm'>

            <div className="passwordlengthline nm">
                <p className=' nm'><input type="range" min={8}max={100} value={length} onChange={(e)=>{setlength(e.target.value
                    )}} /></p>
                <p className=' nm'>Password Length ({length})</p>
            </div>
        <div className="radiosection nm"> 

        {/* <div className='radiofirst nm' >
          <input type="radio" id="dewey" name="drone nm" value="" />
          <label for="dewey"></label>
        </div>
  
        <div className='radiosecound nm'>
          <input type="radio" id="louie" name="drone nm" value="" />
          <label for="louie">x</label>
        </div> */}
        <div>
            <input type="checkbox"  defaultChecked={numberAllowed} onChange={()=>{
                setnumberAllowed((prev)=>!prev)
            }}/>
            <label htmlFor="">numberAllowed</label>
        </div>

        </div>   
        </div>

    </div>



</div>



    </div>;
}

export default PasswordGenrator;