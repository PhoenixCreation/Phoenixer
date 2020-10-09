import React, { useEffect, useState } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"
import { db, auth, storage } from './firebase'
import User from './user'
import UserProfile from './UserProfile'
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/avatar'
import {Button, Input} from '@material-ui/core';


function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #aa4488',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));


function App() {
  const [user,setUser] = useState(null)
  const [openSignIn,setOpenSignIn] = useState(false)
  const [openSignUp,setOpenSignUp] = useState(false)
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [email,setEmail] = useState('')
  const [userImage,setUserImage] = useState(null)
  const [avatarURL,setAvatarURL] = useState(null)


  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);


    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((authUser) => {
        if(authUser){
          //USer has logged in
          //console.log(authUser)
          setUser(authUser)
          if(authUser.photoURL != null){
            setAvatarURL(authUser.photoURL)
          }

        }
        else{
          //logged out
          setUser(null)
        }

      })

      return () => {
        unsubscribe()
      }
    },[user,username])

  const handleChange = (e) => {
    if(e.target.files[0]){
      setUserImage(e.target.files[0])
    }
  }

  const signUp = (event) => {
    event.preventDefault()

    auth.createUserWithEmailAndPassword(email,password)
    .then((authUser) => {
      authUser.user.updateProfile({
        displayName: username
      })
      const uploadTask = storage.ref(`ProfileImages/${username}`).put(userImage)
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log(snapshot.bytesTransferred / snapshot.totalBytes )
        },
        (error) => {alert(error.message)},
        () => {
          storage
            .ref('ProfileImages')
            .child(username)
            .getDownloadURL()
            .then((url => {
              setAvatarURL(url)
              authUser.user.updateProfile({
                photoURL: url
              })

          db.collection('userinfo').doc(username).set({
            email: email,
            username: username,
            photoURL: url,
            description: "",
            followers: [],
            following: [],
            posts: []
          })
          setOpenSignUp(false)

          alert("user created successfully")
            }))
        }
      )

    })
    .catch((error) => alert(error.message))

  }

  const signIn = (event) => {
    event.preventDefault()

    auth.signInWithEmailAndPassword(email,password)
    .then((authUser) => {
      setUser(authUser)
      setAvatarURL(authUser.user.photoURL)
      console.log(authUser)
    })
    .catch((error) => alert(error.message))

    setOpenSignIn(false)
  }




  return (
    <div className="App">
    <Router>
      <div className="app__header">
        <div className="app__headerLogo">
          Phoenixer
        </div>
        <div className="app__headerMenu">
        {user ? (
          <div className="app__headerMenuAuth">
          <Link to="/user">
          <Avatar src={avatarURL} alt={username} />
          </Link>
          <Button variant="outlined" color="secondary" onClick={() => auth.signOut()} >Log Out</Button>
          </div>
        ) : (
          <div className="app__headerMenuAuth">
            <Button variant="outlined" color="primary" onClick={() => setOpenSignIn(true)} className="authButton" >Sign In</Button>
            <Button variant="outlined" color="primary" onClick={() => setOpenSignUp(true)} className="authButton" >Sign Up</Button>
          </div>
        )
        }

        </div>
      </div>


      <Modal //Sgn UP model
        open={openSignUp}
        onClose={() => setOpenSignUp(false)}
      >
      <div style={modalStyle} className={classes.paper}>
        <div id="simple-modal-description">
          <center>
          Phoenixer
          </center>
          <form className="app_signUp">
            <Input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input type="file" name="image" onChange={handleChange} />

            <Button  type="submit" onClick={signUp}>SIgn Up</Button>
          </form>
        </div>

      </div>
      </Modal>

      <Modal //Sign in model
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
      <div style={modalStyle} className={classes.paper}>
        <div id="simple-modal-description">
          <center>
          Phoenixer
          </center>
          <form className="app_signUp">

            <Input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button  type="submit" onClick={signIn}>SIgn In</Button>
          </form>
        </div>

      </div>
      </Modal>



        <Switch>
          <Route path="/post" exact>
            <div>post</div>
          </Route>
          <Route path="/user" exact>
            <User user={user} />
          </Route>
          <Route path="/user/:profile" exact>
            <UserProfile crntuser={user} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
