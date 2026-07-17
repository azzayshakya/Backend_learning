import React, { useEffect, useState } from "react";

const UseEffect =()=>{
    const [Data,setData]=useState();
    const[Loading,setLoading]=useState(true);

    useEffect(()=>{
    const fetchdata =async()=>{
        try{
            setLoading(true)
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
     

            const result = await response.json()
            // console.log(result)
            // const result2 = await JSON.stringify(result,null,2)
            // console.log(result2)
            setData(result);
        }
        catch(error){
            console.log(error)
        }
        finally{
            setLoading(false)
        }
    }
    fetchdata();
    },[])

  
    return<>
   { Loading ?
   (   <h1>LOADING YOUR DATA............</h1>  )
   :(
    <div>
        <h1> Here Is Your Data :</h1>
        <pre>{JSON.stringify(Data,null, 2)}</pre>
    
    </div>
   )

   }
</>

}
export default UseEffect;