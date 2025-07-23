import React, { FC } from "react";
import Link from "next/link";
import { headerData } from "../Header/Navigation/menuData";
import { Icon } from "@iconify/react";
import Logo from "../Header/Logo";

const Footer: FC = () => {
  return (
    <footer className="pt-16 bg-darkmode">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
        <div className="border-t border-grey/15 dark:border-white/15 py-10 flex justify-center items-center">
          <p className="text-sm text-black/70 dark:text-white/70">
            Doc to Code. Owned By{" "}
            <Link
              href="https://group.bureauveritas.com/"
              target="_blank"
              className="hover:text-primary"
            >
              Bureau Veritas
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
