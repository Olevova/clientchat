import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CommentsForm } from "../CommentsForm/CommentsForm";
import { CommentsList } from "../CommentsList/CommentsList";
import io from "socket.io-client";
const socket = io.connect("http://localhost:5050");

export const Chat = () => {
  const [userParams, setUserParams] = useState(null);
  const { search } = useLocation();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const searchParams = Object.fromEntries(new URLSearchParams(search));
    setUserParams(searchParams);
    socket.emit("join", { chat: searchParams.name, userParams: searchParams }); // Додайте userParams тут
  }, [search]);

  useEffect(() => {
    socket.emit("getComments");

    const handleUpdateComments = (data) => {
      if (data && data.comments) {
        setComments(data.comments[0].comments);
      } else {
        console.log("No comments");
      }
    };

    socket.on("updateComments", handleUpdateComments);

    return () => {
      socket.off("updateComments", handleUpdateComments);
    };
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setCommentText(text);
    localStorage.setItem("commentText", text);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (commentText.trim() !== "") {
      socket.emit("addComment", { commentText, userParams });
      setCommentText("");
      localStorage.removeItem("commentText");
    }
  };

  const handleDelete = (commentId) => {
    socket.emit("deleteComment", { commentId, userParams });
  };

  return (
    <>
      <CommentsList comments={comments} onDelete={handleDelete} />
      <CommentsForm
        commentText={commentText}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </>
  );
};
