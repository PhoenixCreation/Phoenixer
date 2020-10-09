import React, { useState, useEffect } from 'react';
import firebase from 'firebase'
//import './ImageUpload.css'
import {Button, Input} from '@material-ui/core';
import { storage, db } from './firebase'


function ImageUpload({user}) {
  const [caption,setCaption] = useState('')
  const [image,setImage] = useState(null)
  const [progress,setProgress] = useState(0)

  const handleChange = (e) => {
    if(e.target.files[0]){
      setImage(e.target.files[0])
    }
  }

  const handleUpload = () =>{
    const uploadTask = storage.ref(`Images/${user.displayName}/${image.name}`).put(image)
    uploadTask.on("state_changed",(snapshot) => {
      const pgrs = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      )
      setProgress(pgrs)
      console.log(snapshot.bytesTransferred / snapshot.totalBytes )
    },(error) => {
      console.log(error);
    },
    () =>{
      storage
        .ref(`Images/${user.displayName}`)
        .child(image.name)
        .getDownloadURL()
        .then((url) => {
          db.collection('posts').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            caption: caption,
            imageURL: url,
            username: user.displayName,
            userAvatar: user.photoURL,
            comments: [],
            likes: []
          }).then((postinfo) => {
            console.log(postinfo.id);
            db.collection('userinfo').doc(user.displayName).update({
              posts: firebase.firestore.FieldValue.arrayUnion(postinfo.id)
            })
          })

          alert("Posted...")
          setProgress(0)
          setCaption("")
          setImage(null)
        })
    }
  )
  }

  return (
    <div className="ImageUpload">
      <Input type="text" name="caption" onChange={event => setCaption(event.target.value)} value={caption} placeholder="Enter your caption" />
      <progress value={progress} max="100" />
      <Input type="file" name="image" onChange={handleChange} />
      <Button onClick={handleUpload}>
        Upload
      </Button>
    </div>
  )
}

export default ImageUpload
