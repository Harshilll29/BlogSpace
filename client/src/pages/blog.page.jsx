import { Link, useParams } from 'react-router-dom'
import { useEffect, useState, createContext } from 'react';
import axios from "axios";
import Animation from '../common/page-animation';
import Loader from '../components/loader.component';
import { getDay } from '../common/date';
import BlogInteraction from '../components/blog-interaction.component';
import BlogPostCard from '../components/blog-post.component';
import BlogContent from '../components/blog-content.component';
import CommentsContainer, { fetchCommnts } from '../components/comments.component';




export const blogStructure = {
  title: '',
  des: '',
  content: [],
  activity: {},
  author: { personal_info: {} },
  banner: '',
  publishedAt: '',
};

export const BlogContext = createContext({});

const BlogPage = () => {
  let { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilarBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [islikedByUser, setLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  const {
    title,
    content,
    banner,
    author = {},
    publishedAt,
  } = blog;

  const {
    personal_info: {
      fullname = '',
      username: author_username = '',
      profile_img = ''
    } = {}
  } = author;

  const fetchBlog = () => {
    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
      .then(async({ data: { blog } }) => {

        blog.comments = await fetchCommnts({blog_id: blog._id, setParentCommentCountFun: setTotalParentCommentsLoaded})

        const tags = blog.tags || []; // Ensure tags exists
        setBlog(blog);

        if (tags.length) {
          axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
            tag: tags[0],
            limit: 6,
            eliminate_blog: blog_id
          })
          .then(({ data }) => {
            setSimilarBlogs(data.blogs);
          })
          .catch(console.error);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching blog:", err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetStates();
    fetchBlog();
  }, [blog_id]);

  const resetStates = () => {
    setBlog(blogStructure);
    setSimilarBlogs(null);
    setLoading(true);
    setLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
  };

  return (
    <div className='pr-16'>
      <Animation>
        {
          loading ? <Loader /> :
            <BlogContext.Provider value={{ blog, setBlog, islikedByUser, setLikedByUser, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded,setTotalParentCommentsLoaded }}>


            <CommentsContainer/>


              <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
                <img src={`http://localhost:3000/image/${banner}`} className='aspect-video' />

                <div className='mt-12'>
                  <h2>{title}</h2>
                  <div className='flex max-sm:flex-col justify-between my-8'>
                    <div className='flex gap-5 items-start'>
                      <img src={profile_img} className='w-12 h-12 rounded-full' />

                      <p className='capitalize'>
                        {fullname}
                        <br />
                        @
                        <Link to={`/user/${author_username}`} className='underline'>
                          {author_username}
                        </Link>
                      </p>
                    </div>
                    <p className='text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5'>
                      Published on {publishedAt ? getDay(publishedAt) : "Unknown"}
                    </p>
                  </div>
                </div>

                <BlogInteraction />

                <div className='my-12 font-galasio blog-page-content'>
                  {
                    content[0].blocks.map((block, i)=>{
                      return <div key={i} className='my-4 md:my-8'>
                        <BlogContent block={block}/>
                      </div>
                    })
                  }
                </div>

                <BlogInteraction />

                {
                  similarBlogs != null && similarBlogs.length ?
                    <div>
                      <h1 className='text-2xl mt-14 mb-10 font-medium'>Similar Blogs</h1>
                      {
                        similarBlogs.map((blog, i) => {
                          let { author: { personal_info } } = blog;
                          return (
                            <Animation key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                              <BlogPostCard content={blog} author={personal_info} />
                            </Animation>
                          );
                        })
                      }
                    </div> : null
                }
              </div>
            </BlogContext.Provider>
        }
      </Animation>
    </div>
  );
};

export default BlogPage;
