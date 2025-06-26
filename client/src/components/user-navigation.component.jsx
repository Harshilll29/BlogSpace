import React, { useContext } from "react";
import Animation from "../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
import { useNavigate } from "react-router-dom";

const UserNavigationPanel = () => {

  const navigate = useNavigate();

  const {
    userAuth: { username },
    setUserAuth,
  } = useContext(UserContext);

  const signOutUser = () => {
    removeFromSession("user");
    setUserAuth({ });
    navigate("/");
  };

  return (
    <div>
      <Animation
        className="absolute right-0 z-50"
        transition={{ duration: 0.2 }}
      >
        <div className="bg-white absolute right-0 border-grey w-60 duration-200">
          <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
            <i className="fi fi-rr-file-edit"></i>
            <p>Write</p>
          </Link>

          <Link to={`/user/${username}`} className="link pl-8 py-4">
            Profile
          </Link>

          <Link to="/dashboard/blogs" className="link pl-8 py-4">
            Dashboard
          </Link>

          <Link to="/settings/edit-profile" className="link pl-8 py-4">
            Settings
          </Link>

          <span className="block border-t border-grey w-full my-2"></span>

          <button
            className="hover:bg-grey w-full pl-8 py-2 text-left"
            onClick={signOutUser}
          >
            <h1 className="font-bold text-xl mb-1">Sign Out</h1>
            <p className="text-dark-grey">@{username}</p>
          </button>
        </div>
      </Animation>
    </div>
  );
};

export default UserNavigationPanel;
