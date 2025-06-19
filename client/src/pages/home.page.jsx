import React, { useState } from "react";
import Animation from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect } from "react";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTab } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { FilterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");

  let categories = [
    "informative",
    "social media",
    "food",
    "tech",
    "finance",
    "travel",
    "bollywood",
    "health and fitness",
    "lifestyle",
    "fashion and beauty",
    "photography",
    "music",
    "sports",
    "political",
    "religion"
  ];

  const fetchLatestBlogs = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
      .then(async ({ data }) => {
        let formatedData = await FilterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/all-latest-blogs-count",
        });
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState, page
      })
      .then(async ({ data }) => {
        let formatedData = await FilterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: {tag: pageState}
        });
        setBlogs(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();

    setBlogs(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }
    setPageState(category);
  };

  useEffect(() => {
    activeTab.current.click();

    if (pageState == "home") {
      fetchLatestBlogs({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }
    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <div>
      <Animation>
        <section className="h-cover flex justify-center gap-10">
          {/* latest blogs */}
          <div className="w-full mr-20 pr-10">
            <InPageNavigation
              routes={[pageState, "Trending Blogs"]}
              defaultHidden={"Trending Blogs"}
            >
              <div>
                {blogs == null ? (
                  <Loader />
                ) : (blogs.results.length ?
                  blogs.results.map((blog, i) => {
                    return (
                      <Animation
                        transaction={{ duration: 1, delay: i * 0.1 }}
                        key={i}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author?.personal_info}
                        />
                      </Animation>
                    );
                  })
                 : 
                  <NoDataMessage message="No Blogs Published" />
                )}
                <LoadMoreDataBtn
                 state={blogs} fetchDataFun={( pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory)}
                />
              </div>
              

              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <Animation
                      transaction={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </Animation>
                  );
                })
              ) : (
                <NoDataMessage message="No Trending Blogs" />
              )}
            </InPageNavigation>
          </div>
          {/* filters and trending blogs */}
          <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
            <div className="flex flex-col gap-10">
              <div>
                <h1 className="font-medium text-xl mb-8">
                  Stories from all interests
                </h1>
                <div className="flex gap-3 flex-wrap">
                  {categories.map((category, i) => {
                    return (
                      <button
                        onClick={loadBlogByCategory}
                        className={
                          "tag " +
                          (pageState == category ? "bg-black text-white" : " ")
                        }
                        key={i}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h1 className="font-medium text-xl mb-8">
                  Trending <i className="fi fi-rr-arrow-trend-up"></i>
                </h1>
                {trendingBlogs == null ? (
                  <Loader />
                ) : trendingBlogs.length ? (
                  trendingBlogs.map((blog, i) => {
                    return (
                      <Animation
                        transaction={{ duration: 1, delay: i * 0.1 }}
                        key={i}
                      >
                        <MinimalBlogPost blog={blog} index={i} />
                      </Animation>
                    );
                  })
                ) : (
                  <NoDataMessage message="No Trending Blogs" />
                )}
              </div>
            </div>
          </div>
        </section>
      </Animation>
    </div>
  );
};

export default HomePage;
