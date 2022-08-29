import React from "react";
import { Link } from "react-router-dom";

// displays a page header

export default function Header({link, title, subTitle}) {
  return (
    <div>
      <Link to={link}>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
      </Link>
      <p className="text-sm font-normal italic text-gray-500 dark:text-slate-100 tracking-wide">
        {subTitle}
      </p>
    </div>
  );
}


Header.defaultProps = {
  link: "/",
  title: "Social Grazing",
  subTitle: "",
}
