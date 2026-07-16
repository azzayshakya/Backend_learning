import React, { useState ,useEffect} from 'react';

const UseEffectHook = () => {
  const [resourceType, setResourceType] = useState('posts');
  
const [items, setitems] = useState([])
  const handlePostClick = () => {
    setResourceType('posts');
  };

  const handleUsersClick = () => {
    setResourceType('users');
  };

  const handleCommentsClick = () => {
    setResourceType('comments');
  };

  // useEffect(()=>{
  //   console.log("hey it's me")
  // } ,[resourceType])



  useEffect(()=>{
    fetch(`https://jsonplaceholder.typicode.com/${resourceType}`)
      .then(response => response.json())
      .then(json =>setitems(json))
  } ,[resourceType])

  return (
    <div>
      <h1>You are using React useEffect Hooks BABY</h1>

      <button onClick={handlePostClick}>POSTs</button>
      <button onClick={handleUsersClick}>Users</button>
      <button onClick={handleCommentsClick}>Comments</button>
      
      <h1>Resource Type: {resourceType}</h1>
      {items.map((item)=>{
        return <pre>{JSON.stringify(item)}</pre>
      })}

    </div>
  );
};

export default UseEffectHook;
