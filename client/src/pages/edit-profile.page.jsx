import { useContext } from "react";
import { useEffect } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { useState } from "react";
import { profileDataStructure } from "./profile.page";
import Animation from "../common/page-animation";
import Loader from "../components/loader.component";
import InputBox from "../components/input.component";
import { useRef } from "react";
import toast from "react-hot-toast";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  let {
    userAuth,
    userAuth: { access_token },
    setUserAuth
  } = useContext(UserContext);

  let bioLimit = 150;
  let profileImgEle = useRef();
  let editProfileForm = useRef();

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);
 
  let { personal_info: {fullname, username: profile_username, profile_img, email, bio}, social_links } = profile;

  useEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
        })
    }
  }, [access_token]);

  const handleCharacterChange = (e) => {
     setCharactersLeft(bioLimit - e.target.value.length)
  }

  const handleImagePreview = (e) => {
    let img = e.target.files[0];
    
    if (img) {
      // Validate file size (limit to 5MB)
      if (img.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!img.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }

      // Show preview
      profileImgEle.current.src = URL.createObjectURL(img);
      setUpdatedProfileImg(img);
    }
  }

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (updatedProfileImg) {
      let loadingToast = toast.loading("Uploading...");
      e.target.setAttribute("disabled", true);

      try {
        // Convert image to base64
        const base64Image = await convertToBase64(updatedProfileImg);
        
        // Send to backend
        const response = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img", 
          { imageData: base64Image }, 
          {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          }
        );

        const { data } = response;
        
        // Update user context and session
        let newUserAuth = { ...userAuth, profile_img: data.profile_img };
        storeInSession("user", JSON.stringify(newUserAuth));
        setUserAuth(newUserAuth);

        // Update profile state
        setProfile(prev => ({
          ...prev,
          personal_info: {
            ...prev.personal_info,
            profile_img: data.profile_img
          }
        }));

        setUpdatedProfileImg(null);
        toast.dismiss(loadingToast);
        toast.success('Profile picture updated successfully! 👍');
        
      } catch (error) {
        toast.dismiss(loadingToast);
        console.error('Upload error:', error);
        toast.error(error.response?.data?.error || "Failed to upload image");
      } finally {
        e.target.removeAttribute("disabled");
      }
    } else {
      toast.error("Please select an image first");
    }
  }


  const handleSubmit = (e) =>{
    e.preventDefault();

    let form = new FormData(editProfileForm.current);
    let formData = { };

    for(let [key,value] of form.entries()){
      formData[key] = value;
    }
    let { username, bio, youtube, facebook, twitter, github, instagram, website} = formData;

    if(username.length < 3){
      return toast.error("Username should be atleast 3 letters long")
    }
    if(bio.length > bioLimit){
      return toast.error(`Bio should not be more than ${bioLimit}`)
    }

    let loadingToast = toast.loading("Updating...");
    e.target.setAttribute("disabled", true);

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", {
      username, bio, social_links: { youtube, facebook, twitter, github, instagram, website }
    }, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    })
    .then(({data}) =>{
      if(userAuth.username != data.username){

        let newUserAuth = { ...userAuth, username: data.username };

        storeInSession("user", JSON.stringify(newUserAuth));
        setUserAuth(newUserAuth);
      }
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      toast.success("Profile Updated✅")
    })
    .catch(({response})=>{
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      toast.error(response.data.error)
    })

  }

 
  return (
    <div>
      <Animation>
        {
          loading ? <Loader/> :
          <form ref={editProfileForm}>
            <h1 className="max-md:hidden">Edit Profile</h1>
            <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
              <div className="max-lg:center mb-5">
                <label 
                  htmlFor="uploadImg" 
                  className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden cursor-pointer" 
                  id="profileImageLabel"
                >
                  <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer transition-opacity duration-200">
                    <span className="text-sm font-medium">Upload Image</span>
                  </div>
                  <img 
                    ref={profileImgEle} 
                    src={profile_img} 
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </label>
                <input 
                  type="file" 
                  id="uploadImg" 
                  accept=".jpeg,.png,.jpg,.webp" 
                  hidden 
                  onChange={handleImagePreview}
                />
                <button 
                  className="btn-light mt-5 max-lg:center lg:w-full px-10" 
                  onClick={handleImageUpload}
                  type="button"
                  disabled={!updatedProfileImg}
                >
                  {updatedProfileImg ? 'Upload' : 'Select Image'}
                </button>
              </div>
              
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                  <div>
                    <InputBox 
                      name="fullname" 
                      type="text" 
                      value={fullname} 
                      placeholder="Full Name" 
                      disable={true} 
                      icon="fi-rr-user"
                    />
                  </div>
                  <div>
                    <InputBox 
                      name="email" 
                      type="email" 
                      value={email} 
                      placeholder="Email" 
                      disable={true} 
                      icon="fi-rr-envelope"
                    />
                  </div>
                </div>
                
                <InputBox 
                  type="text" 
                  name="username" 
                  value={profile_username} 
                  placeholder="Username" 
                  icon="fi-rr-at"
                />
                <p className="text-dark-grey text-sm mt-1">
                  Username will be used to search user and will be visible to all users
                </p>
                
                <textarea 
                  name="bio" 
                  maxLength={bioLimit} 
                  defaultValue={bio} 
                  className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5" 
                  placeholder="Bio" 
                  onChange={handleCharacterChange}
                />
                <p className="mt-1 text-dark-grey">{charactersLeft} characters left</p>
                
                <p className="my-6 text-dark-grey">Add your social handles below</p>
                <div className="md:grid md:grid-cols-2 gap-x-6">
                  {
                    Object.keys(social_links).map((key, i) => {
                      let link = social_links[key];
                      return (
                        <InputBox 
                          key={i} 
                          name={key} 
                          type="text" 
                          value={link} 
                          placeholder="https://" 
                          icon={'fi ' + (key != 'website' ? 'fi-brands-' + key : 'fi-rr-globe')}
                        />
                      )
                    })
                  }
                </div>
                
                <button className="btn-dark w-auto px-10" type="submit" onClick={handleSubmit}>
                  Update
                </button>
              </div>
            </div>
          </form>
        }
      </Animation>
    </div>
  )
}

export default EditProfile;