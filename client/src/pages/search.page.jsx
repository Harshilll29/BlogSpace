import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import InPageNavigation from '../components/inpage-navigation.component';
import { useState } from 'react';
import Loader from '../components/loader.component';
import Animation from '../common/page-animation';
import BlogPostCard from '../components/blog-post.component';
import NoDataMessage from '../components/nodata.component';
import LoadMoreDataBtn from '../components/load-more.component';
import axios from 'axios';
import { FilterPaginationData } from '../common/filter-pagination-data';
import UserCard from '../components/usercard.component';


const SearchPage = () => {

    let { query } = useParams(); 
    let [blogs, setBlogs] = useState(null);
    let [users, setUsers] = useState(null);

    const searchBlogs = ({ page = 1, create_new_arr = false}) =>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {tag: query, page})
        .then(async ({ data }) => {
                let formatedData = await FilterPaginationData({
                  state: blogs,
                  data: data.blogs,
                  page,
                  countRoute: "/search-blogs-count",
                  data_to_send: {query},
                  create_new_arr
                });
                setBlogs(formatedData);
              })
              .catch((err) => {
                console.log(err);
              });
    }

    const fetchUsers = () =>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", {query})
      .then(({data: {users}})=>{
        setUsers(users);
      })
      
    }

    useEffect(() =>{
        resetState();
        searchBlogs({page:1, create_new_arr: true});
        fetchUsers();
    }, [query])

    const resetState = () =>{
        setBlogs(null);
        setUsers(null);
    }

    const UserCardWrapper = () =>{
      return(
        <div>
            {
              users == null ? <Loader/> : users.length ? users.map((user, i)=>{
                return <Animation key={i} transition={{duration: 1, delay: i*0.08}}>
                   <UserCard user={user}/>
                </Animation>
              }) 
              : <NoDataMessage message="No User Found"/>
            }
        </div>
      )
    }


  return (
    <div>
   <section className='h-cover flex justify-center gap-10'>
        <div className='w-full'>
            <InPageNavigation routes={[`Search Results from "${query}"`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]}>

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
                          author={blog.author.personal_info}
                        />
                      </Animation>
                    );
                  })
                 : 
                  <NoDataMessage message="No Blogs Published" />
                )}
                <LoadMoreDataBtn
                 state={blogs} fetchDataFun={searchBlogs}
                />
                
            </div>

            <UserCardWrapper/>
            </InPageNavigation>
        </div>
        <div className='min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden'>
                <h1 className='font-medium text-xl mb-8'>
                  User related to search <i className='fi fi-rr-user mt-1 '></i>
                </h1>
                <UserCardWrapper/>
        </div>
    </section> 
    </div>
  )
}

export default SearchPage
