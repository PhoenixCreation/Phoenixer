import React, { useState, useEffect } from 'react';
import firebase from 'firebase'
import date from 'date-and-time'
import './Post.css'
import Avatar from '@material-ui/core/avatar'
import {Button, Input, IconButton} from '@material-ui/core';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import SendIcon from '@material-ui/icons/Send';
import { db } from './firebase'
import { Link } from 'react-router-dom'


function Post({postID, user }) {
  const [postInfo,setPostInfo] = useState(null)
  const [commentText,setCommentText] = useState('')
  const [liked,setLiked] = useState(false)
  const [likeCount,setLikeCount] = useState(0)
  const [likeState,setLikeState] = useState(false)

  useEffect(() => {
    if(liked){
      setLikeState(true)
    }
    else{
      setLikeState(false)
    }
  },[liked])

  useEffect(() => {
    db.collection('posts').doc(postID).onSnapshot((doc) => {
      setPostInfo(doc.data())
      // console.log(doc.data().timestamp.toDate());
      var data = doc.data().likes

      setLikeCount(data.length)
      if(user){
      if(data.includes(user.displayName)){
        setLiked(true)
      }else{
        setLiked(false)
      }
    }
    })
  },[])

  const toggleLike = (e) => {
    e.preventDefault()
    db.collection('posts').doc(postID).get().then((doc) => {
      var data = doc.data().likes
      if(data.includes(user.displayName)){
        //Unliked
        db.collection('posts').doc(postID).update({
          likes: firebase.firestore.FieldValue.arrayRemove(user.displayName)
        })
      }
      else{
        //liked
        db.collection('posts').doc(postID).update({
          likes: firebase.firestore.FieldValue.arrayUnion(user.displayName)
        })

      }
    })
  }

  const addComment = (e) =>{
    e.preventDefault()
    if(commentText !== ''){
    db.collection('posts').doc(postID).update({
      comments: firebase.firestore.FieldValue.arrayUnion({
        username: user.displayName,
        commenttext: commentText
      })
    })
    }
    else{
      alert("Please write something before you send it....")
    }
    setCommentText('')
  }
  if (!postInfo){
    return (
      <div className="post">
        <div className="post__header">
          <Avatar src="https://google.com" className="post__headerAvatar dummy" />
          <h3 className="dummy">Dummy</h3>
        </div>
        <img className="post__image dummy dummyImage" src="https://google.com" />
        <div className="post__likesection dummy">
        <FavoriteBorderIcon />

        <div className="post__likestotal dummy">0</div>
        </div>
        <div className="post__footer dummy"><strong>Dummy : </strong>Dummy caption</div>
         <div className="post__time dummy">ddd, MMM DD YYYY HH:mm</div>

        <div className="post__commentbox dummy">
          Dummy: Dummy comment
        </div>
      </div>
    );
  }

  return (
    <div className="post">
      <div className="post__header">
        <Avatar src={postInfo.userAvatar} alt={postInfo.username} className="post__headerAvatar" />
        <Link to={"user/"+postInfo.username} ><h3>{postInfo.username}</h3></Link>
      </div>
      <div className="post__imageSection">
        <img className="post__image" src={postInfo.imageURL} alt="Some beautiful movements" onDoubleClick={toggleLike} />
        <div className={
          `
          post__imageLikeAnimation
          ${likeState ? "animate_like" : ""}
          `
        }><svg class="heart" viewBox="0 0 32 29.6">
  <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
	c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
</svg>
</div>
      </div>
      <div className="post__likesection">
      {user?.displayName && liked ? (
        <IconButton onClick={toggleLike}>
          <FavoriteIcon color="secondary"/>
        </IconButton>
      ) : user?.displayName && !liked ? (
        <IconButton onClick={toggleLike}>
          <FavoriteBorderIcon color="secondary"/>
        </IconButton>      ) : (
        <p></p>
      )
      }
      <div className="post__likestotal">{likeCount}</div>
      </div>
      <div className="post__footer"><strong>{postInfo.username}: </strong>{postInfo.caption}</div>
       <div className="post__time">{date.format(postInfo.timestamp.toDate(),'ddd, MMM DD YYYY HH:mm')}</div>

      <div className="post__commentbox">
        {
          postInfo.comments.map(comment => (
          <div className="post__comment"><strong>{comment.username}</strong> : {comment.commenttext}</div>
          ))
        }
        { user?.displayName ? (
          <form className="post__commentadder">
          <Input
          type="text"
          placeholder="share your thoughs..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="post__commentadderinput"
          />
          <IconButton type="submit" onClick={addComment} >
            <SendIcon />
          </IconButton>
          </form>
        ) : (
          <p>Login to comment</p>
        )
        }
      </div>
    </div>
  )
}

export default Post
