import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import { createContext } from "react";
import Loader from "../components/loader.component";
import axios from 'axios';

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const Editor = ({ loading }) => {

  let { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const { userAuth } = useContext(UserContext);
  const [editorState, seteditorState] = useState("editor");
  const [textEditor, settextEditor] = useState({isReady: false})
  const [loadingg, setLoading] = useState(true);

  useEffect(() =>{
    if(!blog_id){
      return setLoading(false);
    }

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {blog_id, draft: true, mode: 'edit'})
    .then(({data: {blog}}) =>{
      setBlog(blog);
      setLoading(false);
    })
    .catch(err =>{
      setBlog(null);
      setLoading(false);
    })
  },[])
  
  if (loading) return <div>Loading...</div>;
  if (!userAuth.access_token) return <Navigate to="/signin" />;

  return (
    <EditorContext.Provider value={{blog, setBlog, editorState, seteditorState, textEditor, settextEditor}}>
      {
      loadingg ? <Loader /> :
      editorState === "editor" ? <BlogEditor /> : <PublishForm />}
    </EditorContext.Provider>
  );
};

export default Editor;

