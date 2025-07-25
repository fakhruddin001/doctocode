import React, { FC } from "react";

interface HeroSubProps {
    title: string;
}

const HeroSub: FC<HeroSubProps> = ({ title }) => {

    return (
        <>
            <section className="py-15 bg-herosub-bg bg-no-repeat bg-cover ">
               
            </section>
        </>
    );
};

export default HeroSub;