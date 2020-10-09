import React, { useEffect, useState } from 'react'
import { db } from './firebase'
import Avatar from '@material-ui/core/avatar'
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import './user.css'



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


function User({ user }) {

  const [userinfo,setUserInfo] = useState(null)
  const [openFollowers,setOpenFollowers] = useState(false)
  const [openFollowing,setOpenFollowing] = useState(false)

  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);

  useEffect(() => {
    if(user && user.displayName){

      db.collection('userinfo').doc(user.displayName).onSnapshot((doc) => {
        setUserInfo(doc.data())
      })
    }
  },[user])

  return (
    <div className="temp">
    {
      userinfo ? (
        <div className="User">
          <div className="User__upper">
            <div className="User__upperLeft">
              <Avatar src={userinfo.photoURL} alt={userinfo.username}/>
            </div>
            <div className="User__upperRight">
              <div className="User__upperRightUsername">
                {userinfo.username}
              </div>
              <div className="User__upperRightMeta">
                <div className="postcount"><strong>{userinfo.posts.length}</strong> posts</div>
                <div className="followerscount" onClick={() => setOpenFollowers(true)}><strong>{userinfo.followers.length}</strong> followers</div>
                <div className="followingcount" onClick={() => setOpenFollowing(true)}><strong>{userinfo.following.length}</strong> following</div>
              </div>
              <div className="User__upperRightDescription">
                {userinfo.description}
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
              <img src="https://source.unsplash.com/random/200x200?sig=1" />
              <img src="https://source.unsplash.com/random/200x200?sig=2" />
              <img src="https://source.unsplash.com/random/200x200?sig=3" />
              <img src="https://source.unsplash.com/random/200x200?sig=3" />
              <img src="https://source.unsplash.com/random/200x200?sig=3" />
            </div>
          </div>


          <Modal //Followers
            open={openFollowers}
            onClose={() => setOpenFollowers(false)}
          >
          <div style={modalStyle} className={classes.paper}>
          {
            userinfo.followers.map((follower) => (
              follower
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
            userinfo.following.map((following) => (
              following
            ))
          }
          </div>
          </Modal>
        </div>
      ) : (
        <>Loading.......</>
      )
    }

    </div>
  )
}

export default User
