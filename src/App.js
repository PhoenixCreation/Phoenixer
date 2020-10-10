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
import ImageUpload from './ImageUpload'
import Post from './Post'
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/avatar'
import {Button, Input, IconButton} from '@material-ui/core';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';


// TODO: followers and following with links....
// TODO: Search for users .... IF successed: Search for posts...
// TODO: Sort the posts as per their time...PROBLEM: Each post is rendered individualy so how to track of that?
// TODO: Add a dummy post before its loaded...
// TODO: Do something for uerAvatar at all levels... it can't be added statically to everywhere...
// TODO: Move the LOG OUT button to the "/user" Page and make it working properly
// TODO: What about videos and tags in POST? can you do that too?...
// TODO: DELETION of comment after making it....[LAST THING TO DO]
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
  const [openPost,setOpenPost] = useState(false)
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [email,setEmail] = useState('')
  const [searchText,setSearchText] = useState('')
  const [userImage,setUserImage] = useState(null)
  const [avatarURL,setAvatarURL] = useState(null)
  const [postIDS,setPostIDS] = useState([])
  const [searchResults,setSearchResults] = useState([])

  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);


    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((authUser) => {
        if(authUser){
          //USer has logged in
          //console.log(authUser)
          setUser(authUser)
          setPostIDS([])

          if(authUser.photoURL != null){
            setAvatarURL(authUser.photoURL)
          }

        }
        else{
          //logged out
          setUser(null)
          setPostIDS([])
        }

      })

      return () => {
        unsubscribe()
      }
    },[user,username])

  useEffect(() =>{
    if(user && user.displayName){
      db.collection('userinfo').doc(user.displayName).onSnapshot((doc) => {
        let tempPOSTS = []
        let following = doc.data().following
        for (var i = 0; i < following.length; i++) {
          db.collection('userinfo').doc(following[i]).onSnapshot((uinfo) => {
            let tpost = uinfo.data().posts;

            // TODO: DELETION IS NOT WORKING......

            setPostIDS((currPostIDS) => [...new Set([...currPostIDS,...tpost])])

          })
        }

      })

    }
  },[user])

  // useEffect(() => {
  //   console.log(searchResults);
  // },[searchResults])

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


  const handleSearch = (event) => {
    // setSearchResults([])
    setSearchText(event.target.value)
    let s = event.target.value;
    db.collection('userinfo').get().then((query) => {
      query.forEach((item, i) => {
        if (item.id.match(s) !== null || s.match(item.id) !== null){
          console.log(item.data().username);
        }
      });
    })
  }



  return (
    <div className="App">
    <Router>
      <div className="app__header">
        <div className="app__headerLogo">
          <Link to="/">Phoenixer</Link>
        </div>
        <div className="app__headerSearch">
          <Input
            type="text"
            value={searchText}
            onChange={handleSearch}
            placeholder="Search..."
          />
          <div className="app__headerSearchresult"></div>
        </div>
        <div className="app__headerMenu">
        {user ? (
          <div className="app__headerMenuAuth">
          <IconButton onClick={() => setOpenPost(true)} >
            <CloudUploadIcon />
          </IconButton>
          <Link to="/user">
          <Avatar src={avatarURL} alt={username} />
          </Link>
          <Button variant="outlined" color="secondary" onClick={() => {auth.signOut();setUser(null)}} >Log Out</Button>
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
      <Modal
        open={openPost}
        onClose={() => setOpenPost(false)}
      >
      <div style={modalStyle} className={classes.paper}>
      <ImageUpload user={user} />
      </div>
      </Modal>



        <Switch>
          <Route path="/" exact>
            <div className="app__posts">
            {
              postIDS.map((postID) => (
                <Post postID={postID} user={user} />
              ))
            }
            </div>
          </Route>
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
