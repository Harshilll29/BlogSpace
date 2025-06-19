import React, { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  const {
    commented_by: {
      personal_info: { profile_img, fullname, username: commented_by_username },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;

  const {
    blog,
    blog: {
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_parent_comments },
      author: {
        personal_info: { username: blog_author },
      },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);

  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentsArr[startingPoint] &&
        commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }
    return startingPoint;
  };

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint] &&
        commentsArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);
      }
    }


    if (isDelete) {
  const parentIndex = getParentIndex();
  if (parentIndex !== undefined && commentsArr[parentIndex]) {
    commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(
      (child) => child !== _id
    );
    if (commentsArr[parentIndex].children.length) {
      commentsArr[parentIndex].isReplyLoaded = false;
    }
  }

  commentsArr.splice(index, 1);
}


    if (commentData.childrenLevel === 0 && isDelete) {
      setTotalParentCommentsLoaded((prev) => prev - 1);
    }

    setBlog({
      ...blog,
      comments: { ...comments, results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel === 0 && isDelete ? 1 : 0),
      },
    });
  };

  const loadReplies = ({ skip = 0, currentIndex = index }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
        _id: commentsArr[currentIndex]._id,
        skip,
      })
      .then(({ data: { replies } }) => {
        commentsArr[currentIndex].isReplyLoaded = true;

        for (let i = 0; i < replies.length; i++) {
          replies[i].childrenLevel =
            commentsArr[currentIndex].childrenLevel + 1;

          commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
        }

        setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
      })
      .catch((err) => {
        console.error("Failed to load replies:", err);
      });
  };

  const deleteComments = (e) => {
    e.target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentsCards(index + 1, true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCards(index + 1);
  };

  const handleReply = () => {
    if (!access_token) {
      return toast.error("Login first to leave a reply");
    }
    setReplying((prev) => !prev);
  };

  const LoadMoreRepliesButton = () => {
    const parentIndex = index;

    const loadedChildrenCount = commentsArr.filter(
      (c, i) =>
        i > index &&
        c.childrenLevel === commentData.childrenLevel + 1
    ).length;

    if (
      commentData.isReplyLoaded &&
      loadedChildrenCount < (commentData.children?.length || 0)
    ) {
      return (
        <button
          onClick={() =>
            loadReplies({
              skip: loadedChildrenCount,
              currentIndex: parentIndex,
            })
          }
          className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2 ml-4"
        >
          Load More Replies
        </button>
      );
    }

    return null;
  };

  return (
    <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullname} @{commented_by_username}
          </p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>
        <p className="font-gelasio text-xl ml-3">{comment}</p>
        <div className="flex gap-5 items-center mt-5">
          {commentData.isReplyLoaded ? (
            <button
              onClick={hideReplies}
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
            >
              <i className="fi fi-rs-comment"></i>Hide Replies
            </button>
          ) : (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
              onClick={() =>
                loadReplies({ skip: 0, currentIndex: index })
              }
            >
              <i className="fi fi-rs-comment"></i>
              {children.length} Reply
            </button>
          )}
          <button className="underline" onClick={handleReply}>
            Reply
          </button>
        </div>
        {(username === commented_by_username || username === blog_author) && (
          <button
            onClick={deleteComments}
            className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
          >
            <i className="fi fi-rr-trash pointer-events-none"></i>
          </button>
        )}
        {isReplying && (
          <div className="mt-8">
            <CommentField
              action="reply"
              index={index}
              replyingTo={_id}
              setReplying={setReplying}
            />
          </div>
        )}
        <LoadMoreRepliesButton />
      </div>
    </div>
  );
};

export default CommentCard;
