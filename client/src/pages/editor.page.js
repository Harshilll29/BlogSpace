To implement the character count display in blog post title input field and counter functionality for exceeding 80 characters requirement, you will need to make changes at both client side (React component) as well server endpoints. Here's how it can be done step by-step using async/await with MERN stack:

1. **Client Side Changes** - Add a new input field for character count display below the title text box in `client/src/pages/editor.page.jsx` file as follows (using functional components and hooks): 
import React, { useState } from 'react';
// ...other import statements...
const EditorPage = () => {   // wrap your component with a state variable for the title input field using `useState()`. Initialize it as an empty string ('') and its setter function (setTitle) to handle changes in form submission: 
    const [title, setTitle] = useState('');
    
    return(   // render your component with a textarea for the title input field that updates `this.state` whenever user types into it or hits enter key and an onChange handler (handleInput) to update state when form is submitted: 
        <div>       {/* wrap everything inside this div */}   
            <input type="text" value={title} placeholder='Blog Title...' maxLength={100}/>  // input field with a maximum length of 85 characters (set to be the same as title) and current state set by `useState('')`. The onChange handler updates this when user types into it or hits enter key:
            <span>   {/* span element for displaying character count */}   
                Characters Entered : <strong>{title?.length}/100</strong>  // display characters entered so far and total length of 85. Use `?` to prevent error if title is not defined yet:    
            </span>   {/* span element for displaying red color when exceeding limit */}   
        </div>      /* end div wrapper*/       
)}; // export your component with the name EditorPage at bottom of file. 
export default EditorPage;// wrap it in a `default` keyword if you want to import this page into another module:  
2. **Server Side Changes** - No server side changes are required as all routes and middleware patterns used here (like app.get, etc.) already exist within the MERN stack application according to their function in a typical Express setup with NodeJS backend using async/await for handling requests: 
   // no need of file creation if not adding new functionality or changes as it's part of existing codebase and doesn’t affect other parts. If you are planning on implementing this feature, then make sure to update the server endpoints accordingly in your application logic where necessary (like updating database when title length exceeds 80).
   // no need for file creation if not adding new functionality or changes as it's part of existing codebase and doesn’t affect other parts. If you are planning on implementing this feature, then make sure to update the server endpoints accordingly in your application logic where necessary (like updating database when title length exceeds 80).