import React from 'react';

const Img = ({ url, caption }) => {
  if (!url) {
    return <p className="text-red-500">Error: Image URL missing</p>;
  }

  return (
    <div>
      <img src={url} alt={caption || 'Blog image'} />
      {caption?.length ? (
        <p className='w-full text-center my-3 md:mb-12 text-base text-dark-grey'>{caption}</p>
      ) : null}
    </div>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <div className='bg-purple/10 p-3 pl-5 border-l-4 border-purple'>
      <p className='text-xl leading-10 md:text-2xl'>{quote}</p>
      {caption?.length ? <p className='w-full text-purple text-base'>{caption}</p> : ""}
    </div>
  )
}

const List = ({ style, items }) => {
  return (
    <ol className={`pl-5 ${style == "ordered" ? "list-decimal" : "list-disc"}`}>
      {
        items.map((listItem, i) => {
          // Handle different item formats
          let content;
          if (typeof listItem === 'string') {
            content = listItem;
          } else if (typeof listItem === 'object' && listItem !== null) {
            // Try common properties that might contain the text
            content = listItem.content || listItem.text || listItem.value || JSON.stringify(listItem);
          } else {
            content = String(listItem);
          }
          
          return <li key={i} className='my-4' dangerouslySetInnerHTML={{ __html: content }}></li>
        })
      }
    </ol>
  )
}

const BlogContent = ({ block }) => {
  // Handle missing or invalid block data
  if (!block || !block.type) {
    console.warn('Invalid block data:', block);
    return null;
  }

  const { type, data } = block;

  // Handle missing data
  if (!data) {
    console.warn('Missing data for block type:', type);
    return null;
  }

  switch (type) {
    case "paragraph":
      return <p dangerouslySetInnerHTML={{ __html: data.text || '' }}></p>;
    
    case "header":
      const Tag = data.level === 3 ? 'h3' : 'h2';
      return (
        <Tag 
          className={`font-bold ${data.level === 3 ? 'text-3xl' : 'text-4xl'}`} 
          dangerouslySetInnerHTML={{ __html: data.text || '' }}
        ></Tag>
      );
    
    case "image":
      return <Img url={data?.file?.url} caption={data.caption} />;
    
    case "quote":
      return <Quote quote={data.text || ''} caption={data.caption || ''} />;
    
    case "list":
      return <List style={data.style} items={data.items || []} />;
    
    default:
      // Handle unknown block types
      console.warn('Unknown block type:', type, data);
      return (
        <div className="p-2 bg-gray-100 border border-gray-300 rounded">
          <p className="text-sm text-gray-600">Unsupported content type: {type}</p>
        </div>
      );
  }
};

export default BlogContent;