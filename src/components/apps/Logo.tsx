import Image from "next/image";
import React from "react";

const Logo = ({
  width = 200,
  height = 100,
}: {
  width?: number;
  height?: number;
}) => {
  return (
    <div>
      <Image src={"/logo-nobg.png"} alt="logo" className="sm:w-35 2xl:w-[22rem] 2xl:h-[5.8rem] lg:w-[12rem] lg:ml-[1rem] lg:h-[3.5rem] sm:h-10" width={width} height={height} />
    </div>
  );
};

export default Logo;
