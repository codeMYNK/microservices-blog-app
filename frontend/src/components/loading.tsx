import React from "react";
import { TrophySpin } from "react-loading-indicators";

const Loading = () => {
  return (
    // <div className='text-2xl text-blue-500 font-bold text-center mt-200'>Loading....</div>
    <div className="w-[200px] m-auto mt-[200px]">
      <div className="text-2xl text-black-500 font-bold text-center items-center">
        <TrophySpin color="#000000" size="medium" text="" textColor="" />
        <p>Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
