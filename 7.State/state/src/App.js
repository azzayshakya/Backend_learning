import logo from './logo.svg';
import './App.css'
import MyUseStateComponent from "./Component/UseStateHook";
import UseEffectHook from './Component/UseEffectHook';
import PasswordGenrator from './Component/PasswordGenrator';
import Datafatch from './Datafatch/Datafatch';
function App() {
  
  return (
    <div className="App">
     {/* <MyUseStateComponent/> */}
     {/* <UseEffectHook/> */}
     {/* <PasswordGenrator/> */}
     <Datafatch/>
    </div>
  );
}

export default App;
