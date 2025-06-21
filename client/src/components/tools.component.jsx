import React from 'react'
import Embed from '@editorjs/embed';
import List from '@editorjs/list';
import Header from '@editorjs/header';
import Image from '@editorjs/image';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';


const uploadImageByURL = async (e) =>{
    let link = new Promise((resolve, reject) =>{
        try{
            resolve(e)
        }catch(err){
            reject(err)
        }
    })

    const url = await link;
  return {
    success: 1,
    file: { url }
  };
}

const uploadByFile = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(import.meta.env.VITE_SERVER_DOMAIN + "/upload-blog-image", {
    method: "POST",
    body: formData
  });
  const data = await res.json();
  if (!data.filename) {
    throw new Error(data.error || "Image upload failed");
  }
  return {
    success: 1,
    file: { url: import.meta.env.VITE_SERVER_DOMAIN + "/media/" + data.filename }
  };
};


export const tools  = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true
  },
  header: {
    class: Header,
    config: {
        placeholder: "Write Heading...",
        levels: [2,3],
        defaultLevel: 2
    }
  },
   image: {
  class: Image,
  config: {
    uploader: {
      uploadByUrl: uploadImageByURL,
      uploadByFile: uploadByFile,
    }
  }
},
  quote: {
    class: Quote,
    inlineToolbar: true
  },
  marker: Marker,
  inlinecode: InlineCode
}
