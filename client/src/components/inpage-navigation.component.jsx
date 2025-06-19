import React, { useEffect, useRef, useState } from 'react';

export let activeTabLine;
export let activeTab;

const InPageNavigation = ({ routes, defaultHidden = [ ] ,defaultActiveIndex = 0, children }) => {
  activeTabLine = useRef();
  activeTab = useRef();

  const [inPageNavIndex, setInPageNavIndex] = useState(defaultActiveIndex);

  let [isResizeEventAdded, setIsResizeEventAdded] = useState(false);

  let [width, setWidth] = useState(window.innerWidth);

  const changePageState = (btn, i) => {
    if (!btn) return;
    const { offsetWidth, offsetLeft } = btn;
    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";
    setInPageNavIndex(i);
  };

  useEffect(() => {

    if(width > 766 && inPageNavIndex != defaultActiveIndex){
      changePageState(activeTab.current, defaultActiveIndex);
    }

    if(!isResizeEventAdded){
      window.addEventListener('resize', () =>{
        if(!isResizeEventAdded){
          setIsResizeEventAdded(true);
        }
        setWidth(window.innerWidth);
      })
    }
  }, [width]);



  return (
    <div>
      <div className='relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto'>
        {
          routes.map((route, i) => (
            <button
              ref={i === defaultActiveIndex ? activeTab : null}
              key={i}
              className={'p-4 px-5 capitalize ' + (inPageNavIndex === i ? "text-black " : "text-dark-grey ") + (defaultHidden.includes(route) ? " md:hidden " : " ")}
              onClick={(e) => changePageState(e.target, i)}
            >
              {route}
            </button>
          ))
        }
        <hr ref={activeTabLine} className='absolute bottom-0 duration-300 border-dark-grey' />
      </div>

      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </div>
  );
};

export default InPageNavigation;
