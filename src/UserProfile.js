import React, { useState, useEffect } from 'react'
import { useParams, Redirect } from 'react-router-dom'
import {db} from './firebase'
import firebase from 'firebase'
import './UserProfile.css'
import Avatar from '@material-ui/core/avatar'
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import {Button, Input} from '@material-ui/core';
import { Link } from 'react-router-dom'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import CommentOutlinedIcon from '@material-ui/icons/CommentOutlined';

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


function UserProfile({ crntuser }) {
  const [profileInfo,setProfileInfo] = useState(null)
  const [openFollowers,setOpenFollowers] = useState(false)
  const [openFollowing,setOpenFollowing] = useState(false)
  const [sameUser,setSameUser] = useState(false)
  const [isFollowing,setIsFollowing] = useState(false)
  const [isFollowingMsg,setIsFollowingMsg] = useState("Follow")
  const [postsInfo,setPostsinfo] = useState([])

  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  let {profile} = useParams()

  useEffect(() => {
    if (crntuser && crntuser.displayName && crntuser.displayName === profile){
        setSameUser(true)
    }
    else{
      db.collection('userinfo').doc(profile).onSnapshot((doc) => {
        setPostsinfo([])
        setProfileInfo(doc.data())
      })
    }

  },[crntuser])

  useEffect(() => {
    if(crntuser && crntuser.displayName && profileInfo){
      if(profileInfo.followers.indexOf(crntuser.displayName) !== -1){
        setIsFollowing(true)
        setIsFollowingMsg("Unfollow")
      }
      else{
        setIsFollowing(false)
        setIsFollowingMsg("Follow")
      }
    }
  },[profileInfo])

  useEffect(() => {
    db.collection('userinfo').doc(profile).onSnapshot((doc) => {
      var postIDS = doc.data().posts
      for (var i = 0; i < postIDS.length; i++) {
        db.collection('posts').doc(postIDS[i]).get().then((doc) => {
          let postinfo = doc.data()
          // console.log(postinfo);
          setPostsinfo((currPostsInfo) => [...currPostsInfo,postinfo])
        })
      }
    })
  },[])

  if(sameUser){
    return <Redirect to="/user" />;
  }

  function toggleFollow() {
    if(isFollowing){
      db.collection("userinfo").doc(profile).update({
        followers: firebase.firestore.FieldValue.arrayRemove(crntuser.displayName)
      })
      db.collection("userinfo").doc(crntuser.displayName).update({
        following: firebase.firestore.FieldValue.arrayRemove(profile)
      })
    }
    else{
      db.collection("userinfo").doc(profile).update({
        followers: firebase.firestore.FieldValue.arrayUnion(crntuser.displayName)
      })
      db.collection("userinfo").doc(crntuser.displayName).update({
        following: firebase.firestore.FieldValue.arrayUnion(profile)
      })
    }
  }

  return (
    <div className="UserProfile temp">
      {
        profileInfo ? (
          <div className="User">
            <div className="User__upper">
              <div className="User__upperLeft">
                <Avatar src={profileInfo.photoURL} alt={profileInfo.username}/>
              </div>
              <div className="User__upperRight">
                <div className="User__upperRightUsername">
                  <div className="User__upperRightUsernameU">{profileInfo.username}</div>
                  <Button variant="contained" color="primary" onClick={toggleFollow}>{isFollowingMsg}</Button>
                </div>
                <div className="User__upperRightMeta">
                  <div className="postcount"><strong>{profileInfo.posts.length}</strong> posts</div>
                  <div className="followerscount" onClick={() => setOpenFollowers(true)}><strong>{profileInfo.followers.length}</strong> followers</div>
                  <div className="followingcount" onClick={() => setOpenFollowing(true)}><strong>{profileInfo.following.length}</strong> following</div>
                </div>
                <div className="User__upperRightDescription">
                  {profileInfo.description}
                </div>
              </div>
            </div>
            <div className="User__posts">
              <div className="User__postsHeading">
                <div className="User__postsHeadinOption active">Posts</div>
                <div className="User__postsHeadinOption">Videos</div>
                <div className="User__postsHeadinOption">Tagged</div>
              </div>
              <div className="User__postsInfo">
                {
                  postsInfo.map((postinfo) => (
                    <div className="User__postsInfoPost">
                      <img src={postinfo.imageURL} alt={profile} />
                      <div className="post__meta">
                        <div className="post__metaLike"><div>{postinfo.likes.length}</div><FavoriteBorderIcon /></div>
                        <div className="post__metaComments"><div>{postinfo.comments.length}</div><CommentOutlinedIcon /></div>
                      </div>
                    </div>
                  ))
                }




              </div>
            </div>


            <Modal //Followers
              open={openFollowers}
              onClose={() => setOpenFollowers(false)}
            >
            <div style={modalStyle} className={classes.paper}>
            {
              profileInfo.followers.map((follower) => (
                <Link to={"/user/"+follower} >
                <div className={"User__follower " +follower}>
                  <div className="User__followerAvatar">
                    <Avatar src="https://google.com" alt={follower} />
                  </div>
                  <div className="User__followerUserInfo">
                    <div className="User__followerUserInfoUsername">{follower}</div>
                  </div>
                </div>
                </Link>
              ))
            }
            </div>
            </Modal>

            <Modal //Followings
              open={openFollowing}
              onClose={() => setOpenFollowing(false)}
            >
            <div style={modalStyle} className={classes.paper}>
            {
              profileInfo.following.map((following) => (
                <Link to={"/user/"+following}>
                <div className={"User__follower " +following}>

                  <div className="User__followerAvatar">
                    <Avatar src="https://google.com" alt={following} />
                  </div>
                  <div className="User__followerUserInfo">
                    <div className="User__followerUserInfoUsername">{following}</div>
                  </div>
                </div>
                </Link>
              ))
            }
            </div>
            </Modal>
          </div>
        ) :
        (
          <div>
          Loading....
          </div>
        )
      }
    </div>
  )
}

export default UserProfile
