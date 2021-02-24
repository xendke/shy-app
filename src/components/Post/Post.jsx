import React from 'react'
import { Link } from 'react-router-dom'
import { withEffects, toProps } from 'refract-xstream'
import { formatDistanceToNowStrict } from 'date-fns'
import xs from 'xstream'
import { connect } from 'react-redux'
import { compose } from '~/utils'
import { withFirebase } from '~/components/firebase'
import { setLikedPosts } from '~/redux/actions/user'

import './Post.scss'

const Post = ({
  userFullName,
  username,
  userId,
  content,
  createdAt,
  likeCount,
  onLike,
  liked,
  didLikeAction = 0,
}) => {
  const timePosted = formatDistanceToNowStrict(createdAt)
  const userRoute = `/shy/${userId}`
  const author = (
    <>
      <strong className="is-capitalized has-text-grey-darker">
        {userFullName}
      </strong>
      <small className="has-text-grey-dark"> @{username}</small>
    </>
  )

  return (
    <div className="Post box">
      <article className="media">
        <div className="media-content">
          <div className="content">
            <p>
              {userId ? <Link to={userRoute}>{author}</Link> : author}
              <small className="has-text-grey-light"> {timePosted} ago</small>
              <br />
              {content}
            </p>
          </div>
          <nav className="level is-mobile">
            <div className="level-left">
              <div className="field has-addons">
                <p className="control">
                  <button
                    type="button"
                    className="button is-small is-text has-text-primary"
                  >
                    <span className="icon">
                      <i className="fas fa-retweet" />
                    </span>
                  </button>
                </p>
                <p className="control">
                  <button
                    type="button"
                    className="button is-small is-text has-text-primary"
                  >
                    <span className="icon">
                      <i className="fas fa-comment" />
                    </span>
                  </button>
                </p>
                <p className="control">
                  <button
                    type="button"
                    onClick={() => onLike(true)}
                    className={`button is-small is-text ${
                      liked ? 'has-text-danger' : 'has-text-primary'
                    }`}
                  >
                    <span className="icon">
                      <i className="fas fa-heart" />
                    </span>
                    <span>{likeCount + didLikeAction}</span>
                  </button>
                </p>
              </div>
            </div>
          </nav>
        </div>
      </article>
    </div>
  )
}

// const directions = {
//   INCREASE: 1,
//   DECREASE: -1,
//   NONE: 0,
// }

const aperture = (
  component,
  { likeCount, firebase, postId, user, dispatch }
) => {
  const [postLiked$, onLike] = component.useEvent('likePost')
  const { uid } = user.auth

  return xs
    .merge(
      postLiked$
        .filter((value) => value && postId)
        .map(() => xs.fromPromise(firebase.doPostLikeToggle(postId, uid)))
        .flatten()
        .debug('compose')
        .map(({ liked, likedPosts }) => {
          dispatch(setLikedPosts(likedPosts))
          return { liked }
        })
        .fold(
          (next, liked) => ({
            likeCount: liked ? next.likeCount + 1 : next.likeCount - 1,
            liked,
          }),
          likeCount
        )
        .debug(),
      postLiked$.mapTo({
        onLike,
        likeCount,
      })
    )
    .map(toProps)
}

export default compose(
  // withState(0),
  connect((state) => ({ user: state.user })),
  withFirebase,
  withEffects(aperture, { mergeProps: true })
)(Post)
