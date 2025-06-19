import React from 'react'
import Animation from '../common/page-animation'
import InputBox from '../components/input.component'
import { useRef } from 'react'
import toast from 'react-hot-toast'
import { useContext } from 'react'
import {UserContext} from '../App'
import axios from 'axios';

const ChangePassword = () => {

    let { userAuth: {access_token} } = useContext(UserContext);

    let changePasswordForm = useRef();

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    const handleSubmit = (e) =>{
            e.preventDefault();

            let form = new FormData(changePasswordForm.current);

            let formData = {  };

            for(let [key, value] of form.entries()){
                formData[key] = value
            }

            let { CurrentPassword, NewPassword } = formData;

            if(!CurrentPassword.length || !NewPassword.length){
                return toast.error("Fill all the inputs")
            }
            if(!passwordRegex.test(CurrentPassword) || !passwordRegex.test(NewPassword)){
                return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters")
            }

            e.target.setAttribute("disabled", true);

            let loadingToast = toast.loading("Updating...");

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/change-password', formData, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(()=>{
                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                return toast.success("Password Updated✅")
            })
            .catch(({response})=>{
                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                return toast.error(response.data.error)
            })
    }


  return (
    <div>
       <Animation>
        <form ref={changePasswordForm}>
            <h1 className='max-md:hidden'>Change Password</h1>

            <div className='py-10 w-full md:max-w-[400px]'>
                <InputBox name="CurrentPassword" type="password" className="profile-edit-input" placeholder="Current Password" icon="fi-rr-unlock"/>
                <InputBox name="NewPassword" type="password" className="profile-edit-input" placeholder="New Password" icon="fi-rr-unlock"/>

                <button onClick={handleSubmit} className='btn-dark px-10' type='submit'>Change Password</button>
            </div>
        </form>
       </Animation>
    </div>
  )
}

export default ChangePassword
