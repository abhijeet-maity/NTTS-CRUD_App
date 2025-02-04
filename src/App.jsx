import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [userDetails, setUserDetails] = useState({name:"",email:""});
  const [userList, setUserList] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [updateUserId, setUpdateUserId] = useState(null);
  
  const URL = "http://localhost:5000/users";

  const handleChange = (e) => {
    const {name, value} = e.target;
    setUserDetails((prev) => {
        return {
          ...prev,
          [name]:value,
        }
    })
  }

  const userNotExists = (name,email) => {
    console.log(name,email);
    let flag = true;
    for(let user of userList){
      if(name === user.name && email === user.email){
        alert(`Username ${name} with email as ${email} already exists`);
        return false;
      }
    }
    return true;
  }

  const addNewUser = async () => {
    if (!userDetails.name || !userDetails.email) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await fetch(URL,
        {
          method: "POST",
          headers: {"Content-type":"application/json"},
          body: JSON.stringify(userDetails)
        }
      );
      const newUser = await res.json();
      setUserList((prev) => {
        return [...prev, newUser];
      });
      setUserDetails({ name: "", email: "" });
    } catch (error) {
      console.log("Error occured in saving new user", error.message);
    } 
  }

  const updateUser = async () => {
    
    try {
      const res = await fetch(`${URL}/${updateUserId}`,{
        method: "PUT",
        headers: {"Content-type":"application/json"},
        body: JSON.stringify(userDetails)
      });
      const updatedUser = await res.json();

      setUserList((prev) => {
        return prev.map((user) => {
            return user.id === updateUserId ? {...user, ...updatedUser} : user;
        })
      })
      setUserDetails({ name: "", email: "" });
      setUpdating(false);
      setUpdateUserId(null);
    } catch (error) {
      console.log("Error in Update user", error.message);
    } 
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    let name = userDetails.name;
    let email = userDetails.email;
    console.log(name);
    console.log(email);
    if (updating) {
      updateUser();
      console.log(userDetails);
    } else {
      if(userNotExists(name,email)){
        addNewUser();
      }
      console.log(userDetails);
    }
  }

  const handleUpdate = (id) => {
    const user = userList.find((user) => user.id === id);
    if (user) {
      setUserDetails({ name: user.name, email: user.email });
      setUpdating(true);
      setUpdateUserId(id);
    }
  }

  //Optimistic update
  const handleDelete = async (id) => {
    console.log(id);
    const beforeDelete = [...userList];
    setUserList((prev) => {
      return prev.filter((user) => user.id !== id);
    })
    try {
      const res = await fetch(`${URL}/${id}`,{
        method:"DELETE",
      });

    } catch (error) {
      console.log("Error occurred in handleDelete", error.message);
      setUserList(beforeDelete);
    }
  }

  useEffect(()=>{

    const fetchingData = async () => {
      try {
        const res = await fetch(URL);
        const data = await res.json();
        console.log(data);
        setUserList(data);
      } catch (error) {
        console.log("Error occured", error);
      }
    }
    fetchingData();
  },[]);

  return (
      <div className='main'>
        <h1><span className='first-Letter'>C</span>reate <span className='first-Letter'>R</span>ead <span className='first-Letter'>U</span>pdate <span className='first-Letter'>D</span>elete</h1>
        <div className='app-section'>
          <form action="" onSubmit={handleSubmit}>
          <input type="text" name='name' placeholder='Enter name' value={userDetails.name} onChange={handleChange} />
          <input type="text" name='email' placeholder='Enter email' value={userDetails.email} onChange={handleChange} />
          <button id="create-btn" type='submit'>{updating ? "Update user" : "Add user"}</button>
          </form>
        <ul className='userList'>
          {userList.map((user)=> {
            return (
              <li className="row" key={user.id}>
                <div className='detail-section'>
                <p>{user.name}</p><p>{user.email}</p>
                </div>{'  '}
                <div className='btn-section'>
                <button id="update-btn" onClick={() => {handleUpdate(user.id)}}>Update</button>
                <button id="delete-btn" onClick={() => {handleDelete(user.id)}}>Delete</button>
                </div>
              </li>
            )
          })}
        </ul>
        </div>
      </div>
  )
}

export default App;
