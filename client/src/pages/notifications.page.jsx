import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import {UserContext} from '../App';
import { FilterPaginationData } from '../common/filter-pagination-data';
import axios from 'axios';
import Loader from '../components/loader.component';
import Animation from '../common/page-animation';
import NoDataMessage from '../components/nodata.component';
import NotificationCard from '../components/notification-card.component';
import LoadMoreDataBtn from '../components/load-more.component';

const Notifications = () => {
  
    let {userAuth, userAuth: {access_token, new_notification_available}, setUserAuth } = useContext(UserContext)

    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState(null);

    let filters = ['all', 'like', 'comment', 'reply'];

    const fetchNotification = ({page, deleteDocCount = 0}) =>{

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications", { page, filter, deleteDocCount }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(async({data: {notifications: data}})=>{

            if(new_notification_available){
                setUserAuth({...userAuth, new_notification_available: false})
            }

            let formatedData = await FilterPaginationData(
                {
                    state: notifications,
                    data, page,
                    countRoute: "/all-notification-count",
                    data_to_send: { filter },
                    user: access_token
                }
            );
            setNotifications(formatedData)
            

        })
        .catch(err =>{
            console.log(err);
        })
    }

    useEffect(() =>{
        if(access_token){
            fetchNotification({page: 1})
        }
    }, [access_token, filter])

    const handleFilter = (e) =>{
        let btn = e.target;

        setFilter(btn.innerHTML);

        setNotifications(null);
    }




    return (
    <div>
        
        <h1 className='max-md:hidden'>Recent Notifications</h1>
        <div className='my-8 flex gap-6'>
                {
                    filters.map((filterName, i)=>{
                        return <button key={i} className={'py-2 ' + (filter == filterName ? "btn-dark" : 'btn-light')} onClick={handleFilter}>{filterName}</button>
                    })
                }
        </div>
        {
            notifications == null ? <Loader/> : 
            <div>
                {
                    notifications.results.length ?
                    notifications.results.map((notification, i) =>{
                        return <Animation key={i} transition={{delay: i*0.08}}>
                            <NotificationCard data={notification} index={i} notificationState={{notifications, setNotifications}}/>
                        </Animation>
                    })
                    : <NoDataMessage message="Nothing Available"/>
                }
                
                <LoadMoreDataBtn state={notifications} fetchDataFun={fetchNotification} additionalParam={{deletedDocCount: notifications.deletedDocCount}}/>
            </div>
        }
    </div>
  )
}

export default Notifications
