import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import lightlogo from '../imgs/logo-light.png';
import darklogo from '../imgs/logo-dark.png';
import Animation from "../common/page-animation";
import lightBanner from '../imgs/blog banner light.png';
import darkBanner from '../imgs/blog banner dark.png';
import axios from "axios";
import { ThemeContext, UserContext } from "../App";
import toast from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";

const BlogEditor = () => {
  const context = useContext(EditorContext);

  
  if (!context || !context.blog) {
    return <div className="text-center p-10">Loading editor...</div>;
  }

  const {
    blog,
    setBlog,
    textEditor,
    settextEditor,
    seteditorState,
  } = context;

  const {
    title = "",
    banner = "",
    content = {},
    tags = [],
    des = "",
  } = blog;

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const { theme } = useContext(ThemeContext);

  let { blog_id } = useParams();

  const navigate = useNavigate();
 const [bannerUrl, setBannerUrl] = useState(theme === 'light' ? lightBanner : darkBanner);


 useEffect(() => {
  if (blog.banner) {
    setBannerUrl(`${import.meta.env.VITE_SERVER_DOMAIN}/media/${blog.banner}`);
  } else {
    setBannerUrl(theme === 'light' ? lightBanner : darkBanner);
  }
}, [blog.banner, theme]);


  useEffect(() => {
    if (!textEditor?.isReady) {
      const editorInstance = new EditorJS({
        holder: "textEditor",
        data: Array.isArray(content) ? content[0] : content,
        tools: tools,
        placeholder: "Let's write a blog..",
      });
      settextEditor(editorInstance);
    }
  }, []);

  const handleBannerUpload = async (e) => {
    const img = e.target.files[0];
    if (!img) return;

    const formData = new FormData();
    formData.append("image", img);

    const toastId = toast.loading("Uploading image...");
    try {
      const res = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/upload-banner",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      setBannerUrl(import.meta.env.VITE_SERVER_DOMAIN + "/media/" + res.data.filename);
      setBlog({ ...blog, banner: res.data.filename });
      toast.success("Image uploaded!", { id: toastId });
    } catch (err) {
      toast.error("Upload failed", { id: toastId });
      console.error("Upload failed", err);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    const input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload blog banner to publish it!");
    }
    if (!title.length) {
      return toast.error("Write blog title to publish it!");
    }

    if (textEditor?.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            seteditorState("publish");
          } else {
            toast.error("Write something in your blog to publish it!");
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) return;

    if (!title.length) {
      return toast.error("Write blog title before saving it as a draft");
    }

    const loadingToast = toast.loading("Saving Draft...");
    e.target.classList.add("disable");

    if (textEditor?.isReady) {
      textEditor.save().then((content) => {
        const blogObj = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        };

        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogObj, id: blog_id}, {
            headers: { Authorization: `Bearer ${access_token}` },
          })
          .then(() => {
            e.target.classList.remove("disable");

            toast.dismiss(loadingToast);
            toast.success("Saved To Draft👍");
            setTimeout(() => {
              navigate("/dashboard/blogs?tab=draft");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.error(response.data.error || "Failed to save draft");
          });
      });
    }
  };


  const handleError = (e) =>{
    let img = e.target;

    img.src = theme == 'light' ? lightBanner : darkBanner;
  }

  return (
    <div>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={theme == 'light' ? darklogo : lightlogo} />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>

      <Animation>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img src={bannerUrl} className="z-20" onError={handleError} />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>
            <hr className="w-full my-5 opacity-10" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </Animation>
    </div>
  );
};

export default BlogEditor;

